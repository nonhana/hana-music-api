export const DEFAULT_WATCHMAN_PRODUCT_NUMBER = 'YD00000558929251';
export const DEFAULT_WATCHMAN_SCRIPT_URL =
  'https://acstatic-dun.126.net/tool.min.js';
export const PLAYLIST_CHECK_TOKEN_BUSINESS_KEY =
  'bd5d2f973ef74cd2a61325a412ae54d9';

const DEFAULT_TIMEOUT_MS = 10_000;

export class WatchmanUnavailableError extends Error {
  override readonly name = 'WatchmanUnavailableError';
}

export class WatchmanTimeoutError extends Error {
  override readonly name = 'WatchmanTimeoutError';
}

export class WatchmanTokenError extends Error {
  override readonly name = 'WatchmanTokenError';
}

export interface CreateWatchmanOptions {
  /** 易盾产品号；默认值来自官方现代 web player。 */
  readonly productNumber?: string;
  readonly protocol?: 'http' | 'https';
  /** 官方加载器地址；测试或私有部署时可以覆盖。 */
  readonly scriptUrl?: string;
  /** 注入 script 时使用的 CSP nonce；只在首次加载脚本时生效。 */
  readonly nonce?: string;
  readonly timeoutMs?: number;
}

export interface WatchmanDeviceMetadata {
  readonly WM_TID?: string;
  readonly WM_DID?: string;
  readonly WM_NI?: string;
  readonly WM_NIKE?: string;
}

export interface Watchman {
  readonly productNumber: string;
  /** 每次调用都向当前 Watchman 实例现取令牌，不缓存、不重放。 */
  getToken(businessKey?: string): Promise<string>;
  /** 读取 Watchman 自己维护的设备 Cookie，只作为元数据暴露。 */
  getDeviceMetadata(): WatchmanDeviceMetadata;
}

interface RawWatchman {
  getToken(businessKey: string, callback: (token: unknown) => void): unknown;
}

interface InitWatchmanOptions {
  readonly productNumber: string;
  readonly protocol: 'http' | 'https';
  readonly onload: (instance: RawWatchman) => void;
  readonly onerror?: (error: unknown) => void;
}

type InitWatchman = ((options: InitWatchmanOptions) => void) & {
  readonly __instances__?: Record<string, unknown>;
};

interface WatchmanScript {
  async: boolean;
  nonce?: string;
  src: string;
  addEventListener(type: 'error', listener: () => void): void;
  addEventListener(type: 'load', listener: () => void): void;
  remove?: () => void;
}

interface WatchmanDocument {
  cookie: string;
  head?: { appendChild(node: WatchmanScript): void };
  body?: { appendChild(node: WatchmanScript): void };
  createElement(tagName: 'script'): WatchmanScript;
}

interface BrowserGlobals {
  readonly document?: WatchmanDocument;
  readonly window?: {
    readonly WM?: RawWatchman;
    readonly initWatchman?: InitWatchman;
    readonly location?: { readonly protocol?: string };
  };
  readonly initWatchman?: InitWatchman;
}

const watchmanInstances = new Map<string, Promise<Watchman>>();

const browserGlobals = (): BrowserGlobals =>
  globalThis as unknown as BrowserGlobals;

const requireBrowser = (): {
  readonly document: WatchmanDocument;
  readonly window: NonNullable<BrowserGlobals['window']>;
} => {
  const globals = browserGlobals();
  if (!globals.window || !globals.document) {
    throw new WatchmanUnavailableError(
      'createWatchman requires a browser environment',
    );
  }
  return { document: globals.document, window: globals.window };
};

const resolveProtocol = (
  requested: CreateWatchmanOptions['protocol'],
  locationProtocol: string | undefined,
): 'http' | 'https' => {
  if (requested) {
    return requested;
  }
  return locationProtocol === 'http:' ? 'http' : 'https';
};

const resolveTimeout = (value: number | undefined): number => {
  if (value === undefined) {
    return DEFAULT_TIMEOUT_MS;
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError('timeoutMs must be a positive finite number');
  }
  return value;
};

const loadToolScript = async (
  document: WatchmanDocument,
  url: string,
  nonce: string | undefined,
  timeoutMs: number,
): Promise<void> => {
  const parent = document.head ?? document.body;
  if (!parent) {
    throw new WatchmanUnavailableError(
      'document has no head or body to load the Watchman script',
    );
  }
  const script = document.createElement('script');
  script.src = url;
  script.async = true;
  if (nonce) {
    script.nonce = nonce;
  }
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      script.remove?.();
      reject(
        new WatchmanTimeoutError(
          `Watchman script did not load within ${timeoutMs}ms`,
        ),
      );
    }, timeoutMs);
    script.addEventListener('load', () => {
      clearTimeout(timer);
      resolve();
    });
    script.addEventListener('error', () => {
      clearTimeout(timer);
      script.remove?.();
      reject(new WatchmanUnavailableError('Watchman script failed to load'));
    });
    parent.appendChild(script);
  });
};

const resolveInitWatchman = (
  window: NonNullable<BrowserGlobals['window']>,
  timeoutMs: number,
): Promise<InitWatchman> =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const poll = () => {
      const init =
        window.initWatchman ??
        browserGlobals().window?.initWatchman ??
        browserGlobals().initWatchman;
      if (init) {
        resolve(init);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        reject(
          new WatchmanTimeoutError(
            'Watchman loader did not expose initWatchman',
          ),
        );
        return;
      }
      setTimeout(poll, 20);
    };
    poll();
  });

const wrapWatchman = (
  instance: RawWatchman,
  productNumber: string,
  timeoutMs: number,
  document: WatchmanDocument,
): Watchman => {
  const readCookie = (name: string): string | undefined => {
    const prefix = `${name}=`;
    for (const pair of document.cookie.split('; ')) {
      if (pair.startsWith(prefix)) {
        const value = pair.slice(prefix.length);
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      }
    }
    return undefined;
  };

  return {
    productNumber,
    getDeviceMetadata: () => ({
      WM_TID: readCookie('WM_TID'),
      WM_DID: readCookie('WM_DID'),
      WM_NI: readCookie('WM_NI'),
      WM_NIKE: readCookie('WM_NIKE'),
    }),
    getToken: (businessKey = PLAYLIST_CHECK_TOKEN_BUSINESS_KEY) =>
      new Promise<string>((resolve, reject) => {
        let settled = false;
        const finish = (token: unknown) => {
          if (settled) {
            return;
          }
          settled = true;
          clearTimeout(timer);
          if (typeof token === 'string' && token.length > 0) {
            resolve(token);
          } else {
            reject(new WatchmanTokenError('Watchman returned an empty token'));
          }
        };
        const timer = setTimeout(() => {
          if (settled) {
            return;
          }
          settled = true;
          reject(
            new WatchmanTimeoutError(
              `Watchman did not return a token within ${timeoutMs}ms`,
            ),
          );
        }, timeoutMs);
        try {
          const result = instance.getToken(businessKey, finish);
          if (result instanceof Promise) {
            result.then(finish, (error: unknown) => {
              if (settled) {
                return;
              }
              settled = true;
              clearTimeout(timer);
              reject(
                error instanceof Error
                  ? error
                  : new WatchmanTokenError('Watchman token request failed'),
              );
            });
          }
        } catch (error) {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            reject(
              error instanceof Error
                ? error
                : new WatchmanTokenError('Watchman token request failed'),
            );
          }
        }
      }),
  };
};

const initialize = async (
  options: Required<
    Pick<CreateWatchmanOptions, 'productNumber' | 'protocol' | 'scriptUrl'>
  > & { readonly nonce?: string; readonly timeoutMs: number },
): Promise<Watchman> => {
  const { document, window } = requireBrowser();
  const pageInstance = window.WM;
  if (pageInstance) {
    return wrapWatchman(
      pageInstance,
      options.productNumber,
      options.timeoutMs,
      document,
    );
  }
  let init = window.initWatchman ?? browserGlobals().initWatchman;
  if (!init) {
    await loadToolScript(
      document,
      options.scriptUrl,
      options.nonce,
      options.timeoutMs,
    );
    init = await resolveInitWatchman(window, options.timeoutMs);
  }

  const instance = await new Promise<RawWatchman>((resolve, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new WatchmanTimeoutError(
            `Watchman initialization did not complete within ${options.timeoutMs}ms`,
          ),
        ),
      options.timeoutMs,
    );
    const onload = (created: RawWatchman) => {
      clearTimeout(timer);
      resolve(created);
    };
    const onerror = (error: unknown) => {
      clearTimeout(timer);
      reject(
        error instanceof Error
          ? error
          : new WatchmanUnavailableError('Watchman initialization failed'),
      );
    };
    try {
      init({
        productNumber: options.productNumber,
        protocol: options.protocol,
        onload,
        onerror,
      });
    } catch (error) {
      clearTimeout(timer);
      reject(
        error instanceof Error
          ? error
          : new WatchmanUnavailableError('Watchman initialization failed'),
      );
    }
  });

  return wrapWatchman(
    instance,
    options.productNumber,
    options.timeoutMs,
    document,
  );
};

/**
 * 初始化并复用官方 Watchman 实例。浏览器专用；SSR/Node 直接抛出
 * `WatchmanUnavailableError`。`getToken` 每次现取，不缓存。
 */
export const createWatchman = async (
  options: CreateWatchmanOptions = {},
): Promise<Watchman> => {
  const { window } = requireBrowser();
  const productNumber =
    options.productNumber ?? DEFAULT_WATCHMAN_PRODUCT_NUMBER;
  if (!productNumber) {
    throw new TypeError('productNumber must not be empty');
  }
  const protocol = resolveProtocol(options.protocol, window.location?.protocol);
  const scriptUrl = options.scriptUrl ?? DEFAULT_WATCHMAN_SCRIPT_URL;
  const timeoutMs = resolveTimeout(options.timeoutMs);
  const key = `${productNumber}|${protocol}|${scriptUrl}|${timeoutMs}`;
  const existing = watchmanInstances.get(key);
  if (existing) {
    return existing;
  }
  const created = initialize({
    productNumber,
    protocol,
    scriptUrl,
    timeoutMs,
    ...(options.nonce === undefined ? {} : { nonce: options.nonce }),
  }).catch((error: unknown) => {
    watchmanInstances.delete(key);
    throw error;
  });
  watchmanInstances.set(key, created);
  return created;
};
