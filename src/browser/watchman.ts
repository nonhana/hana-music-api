export interface WatchmanOptions {
  /** 官方 Watchman 的产品编号，用于标识接入产品，默认沿用网易云配置。 */
  readonly productNumber?: string;
  /** 传给官方初始化接口的通信协议，默认为 https，脚本仍从 HTTPS 地址加载。 */
  readonly protocol?: 'http' | 'https';
  /** 每次调用官方 getToken 时传入的业务标识，默认沿用网易云配置。 */
  readonly businessKey?: string;
  /** 官方脚本标签使用的 CSP nonce，须与页面的内容安全策略匹配。 */
  readonly nonce?: string;
  /** 脚本加载和官方初始化的总等待期限，单位毫秒，默认 10000。 */
  readonly timeoutMs?: number;
  /** 每次调用 getToken 的独立等待期限，单位毫秒，默认 10000。 */
  readonly tokenTimeoutMs?: number;
}

export interface WatchmanClient {
  getToken(): Promise<string>;
}

export type WatchmanErrorCode =
  | 'environment'
  | 'configuration'
  | 'script-load'
  | 'initialization'
  | 'initialization-timeout'
  | 'token'
  | 'token-timeout';

export class WatchmanError extends Error {
  constructor(readonly code: WatchmanErrorCode) {
    super(`Watchman ${code}`);
    this.name = 'WatchmanError';
  }
}

interface OfficialWatchman {
  getToken(key: string, callback: (token: unknown) => void): void;
}

type WatchmanWindow = Window & {
  initWatchman?: (options: {
    auto: boolean;
    productNumber: string;
    protocol: string;
    onload: (instance: OfficialWatchman) => void;
    onerror: () => void;
  }) => void;
};

type Initialization = {
  key: string;
  promise: Promise<WatchmanClient>;
};
const initializationKey = Symbol.for('hana-music-api.watchman.v1');

export const initializeWatchman = (
  options: WatchmanOptions = {},
): Promise<WatchmanClient> => {
  if (typeof window === 'undefined' || typeof document === 'undefined')
    return Promise.reject(new WatchmanError('environment'));

  const browser = window as WatchmanWindow;
  const page = document;

  const config = {
    productNumber: options.productNumber ?? 'YD00000558929251',
    protocol: options.protocol ?? 'https',
    businessKey: options.businessKey ?? 'bd5d2f973ef74cd2a61325a412ae54d9',
    nonce: options.nonce ?? '',
    timeoutMs: options.timeoutMs ?? 10_000,
    tokenTimeoutMs: options.tokenTimeoutMs ?? 10_000,
  };

  if (
    !['http', 'https'].includes(config.protocol) ||
    [config.productNumber, config.businessKey].some(
      (value) => typeof value !== 'string' || !value.trim(),
    ) ||
    typeof config.nonce !== 'string' ||
    [config.timeoutMs, config.tokenTimeoutMs].some(
      (value) => !Number.isFinite(value) || value <= 0 || value > 2_147_483_647,
    )
  )
    return Promise.reject(new WatchmanError('configuration'));

  const key = JSON.stringify(config);
  const existing = Reflect.get(page, initializationKey) as
    | Initialization
    | undefined;

  if (existing)
    return existing.key === key
      ? existing.promise
      : Promise.reject(new WatchmanError('configuration'));

  const {
    promise: pending,
    resolve: resolveInitialization,
    reject: rejectInitialization,
  } = Promise.withResolvers<WatchmanClient>();

  Object.defineProperty(page, initializationKey, {
    configurable: true,
    value: { key, promise: pending },
  });

  let completed = false;
  let script: HTMLScriptElement | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cleanup = () => {
    if (timer !== undefined) clearTimeout(timer);
    script?.removeEventListener('load', loaded);
    script?.removeEventListener('error', scriptFailed);
  };

  const fail = (code: WatchmanErrorCode) => {
    if (completed) return;
    completed = true;
    cleanup();
    script?.remove();
    Reflect.deleteProperty(page, initializationKey);
    rejectInitialization(new WatchmanError(code));
  };

  const loaded = () => {
    if (completed) return;
    try {
      const initialize = browser.initWatchman;

      if (typeof initialize !== 'function') {
        fail('initialization');
        return;
      }

      initialize.call(browser, {
        auto: true,
        productNumber: config.productNumber,
        protocol: config.protocol,
        onload: (instance) => {
          if (completed) return;
          if (typeof instance?.getToken !== 'function') {
            fail('initialization');
            return;
          }
          completed = true;
          cleanup();
          resolveInitialization({
            getToken: () =>
              new Promise((resolveToken, rejectToken) => {
                let tokenCompleted = false;
                const tokenTimer = setTimeout(
                  () => settle(undefined, 'token-timeout'),
                  config.tokenTimeoutMs,
                );
                const settle = (
                  token?: unknown,
                  failure?: WatchmanErrorCode,
                ) => {
                  if (tokenCompleted) return;
                  tokenCompleted = true;
                  clearTimeout(tokenTimer);
                  if (failure || typeof token !== 'string' || !token.trim())
                    rejectToken(new WatchmanError(failure ?? 'token'));
                  else resolveToken(token);
                };
                try {
                  instance.getToken(config.businessKey, settle);
                } catch {
                  settle(undefined, 'token');
                }
              }),
          });
        },
        onerror: () => fail('initialization'),
      });
    } catch {
      fail('initialization');
    }
  };
  const scriptFailed = () => fail('script-load');
  try {
    timer = setTimeout(() => fail('initialization-timeout'), config.timeoutMs);
    script = page.createElement('script');
    script.addEventListener('load', loaded);
    script.addEventListener('error', scriptFailed);
    script.src = 'https://acstatic-dun.126.net/tool.min.js';
    script.async = true;
    if (config.nonce) script.nonce = config.nonce;
    page.head.appendChild(script);
  } catch {
    fail('script-load');
  }
  return pending;
};
