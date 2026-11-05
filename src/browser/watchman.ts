export interface WatchmanOptions {
  readonly productNumber?: string;
  readonly protocol?: 'https' | 'http';
  readonly nonce?: string;
  readonly timeoutMs?: number;
}

export interface WatchmanTokenOptions {
  readonly business?: string;
  readonly timeoutMs?: number;
}

export interface Watchman {
  readonly getToken: (options?: WatchmanTokenOptions) => Promise<string>;
}

export class WatchmanError extends Error {
  override readonly name = 'WatchmanError';

  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

interface OfficialWatchman {
  readonly getToken: (
    business: string,
    callback: (token: string) => void,
  ) => void;
}

interface BrowserScript {
  src: string;
  async: boolean;
  nonce: string;
  addEventListener: (event: 'load' | 'error', listener: () => void) => void;
  removeEventListener: (event: 'load' | 'error', listener: () => void) => void;
  remove: () => void;
}

interface BrowserDocument {
  readonly createElement: (tag: 'script') => BrowserScript;
  readonly head: { readonly appendChild: (script: BrowserScript) => unknown };
}

const pages = new WeakMap<
  BrowserDocument,
  {
    productNumber: string;
    protocol: string;
    nonce: string | undefined;
    initialized: Promise<OfficialWatchman>;
    timing: {
      deadline: number;
      phase: 'script' | 'initialization';
      expire: (() => void) | undefined;
    };
  }
>();

export const initializeWatchman = (
  options: WatchmanOptions = {},
): Promise<Watchman> => {
  const { window, document } = globalThis as {
    window?: {
      readonly initWatchman?: (options: {
        auto: boolean;
        productNumber: string;
        protocol: string;
        onload: (instance?: OfficialWatchman) => void;
        onerror: (error: unknown) => void;
      }) => void;
      readonly WM?: OfficialWatchman;
    };
    document?: BrowserDocument;
  };
  if (!window || !document) {
    return Promise.reject(
      new WatchmanError(
        'BROWSER_REQUIRED',
        'Watchman initialization requires a browser.',
      ),
    );
  }
  const timeoutMs = options.timeoutMs ?? 10_000;
  if (
    !Number.isFinite(timeoutMs) ||
    timeoutMs <= 0 ||
    timeoutMs > 2_147_483_647
  ) {
    return Promise.reject(
      new WatchmanError(
        'INVALID_OPTIONS',
        'timeoutMs must be a finite positive timer duration.',
      ),
    );
  }
  const productNumber = options.productNumber ?? 'YD00000558929251';
  const protocol = options.protocol ?? 'https';
  if (
    typeof productNumber !== 'string' ||
    !productNumber.trim() ||
    (protocol !== 'https' && protocol !== 'http')
  ) {
    return Promise.reject(
      new WatchmanError(
        'INVALID_OPTIONS',
        'Provide a nonempty productNumber and an http or https protocol.',
      ),
    );
  }
  const page = pages.get(document);
  if (
    page &&
    (page.productNumber !== productNumber ||
      page.protocol !== protocol ||
      (options.nonce !== undefined && options.nonce !== page.nonce))
  ) {
    return Promise.reject(
      new WatchmanError(
        'CONFIGURATION_CONFLICT',
        'Watchman is already initialized with different page options.',
      ),
    );
  }
  const deadline = Date.now() + timeoutMs;
  const timing = page?.timing ?? {
    deadline,
    phase: 'script' as 'script' | 'initialization',
    expire: undefined as (() => void) | undefined,
  };
  timing.deadline = Math.max(timing.deadline, deadline);
  let initialized = page?.initialized;
  if (!initialized) {
    initialized = new Promise<void>((resolve, reject) => {
      if (window.initWatchman || window.WM) {
        timing.phase = 'initialization';
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://acstatic-dun.126.net/tool.min.js';
      script.async = true;
      if (options.nonce !== undefined) script.nonce = options.nonce;
      const expire = () => {
        const remaining = timing.deadline - Date.now();
        if (remaining > 0) {
          timer = setTimeout(expire, remaining);
          return;
        }
        clearTimeout(timer);
        script.removeEventListener('load', loaded);
        script.removeEventListener('error', failed);
        script.remove();
        reject(
          new WatchmanError(
            'SCRIPT_TIMEOUT',
            'Watchman script loading timed out.',
          ),
        );
      };
      let timer = setTimeout(expire, timeoutMs);
      timing.expire = expire;
      const loaded = () => {
        clearTimeout(timer);
        timing.phase = 'initialization';
        resolve();
      };
      const failed = () => {
        clearTimeout(timer);
        script.remove();
        reject(
          new WatchmanError('SCRIPT_FAILED', 'Watchman script failed to load.'),
        );
      };
      script.addEventListener('load', loaded);
      script.addEventListener('error', failed);
      document.head.appendChild(script);
    })
      .then(
        () =>
          new Promise<OfficialWatchman>((resolve, reject) => {
            if (window.WM) {
              resolve(window.WM);
              return;
            }
            const expire = () => {
              const remaining = timing.deadline - Date.now();
              if (remaining > 0) {
                timer = setTimeout(expire, remaining);
                return;
              }
              clearTimeout(timer);
              reject(
                new WatchmanError(
                  'INITIALIZATION_TIMEOUT',
                  'Watchman initialization timed out.',
                ),
              );
            };
            let timer = setTimeout(
              expire,
              Math.max(0, timing.deadline - Date.now()),
            );
            timing.expire = expire;
            if (window.initWatchman) {
              try {
                window.initWatchman({
                  auto: true,
                  productNumber,
                  protocol,
                  onload: (instance) => {
                    clearTimeout(timer);
                    const ready = instance ?? window.WM;
                    if (ready) resolve(ready);
                    else
                      reject(
                        new WatchmanError(
                          'INITIALIZATION_FAILED',
                          'Watchman did not provide an instance.',
                        ),
                      );
                  },
                  onerror: () => {
                    clearTimeout(timer);
                    reject(
                      new WatchmanError(
                        'INITIALIZATION_FAILED',
                        'Watchman initialization failed.',
                      ),
                    );
                  },
                });
              } catch {
                clearTimeout(timer);
                reject(
                  new WatchmanError(
                    'INITIALIZATION_FAILED',
                    'Watchman initialization failed.',
                  ),
                );
              }
            } else {
              clearTimeout(timer);
              reject(
                new WatchmanError(
                  'INITIALIZATION_FAILED',
                  'The script did not provide initWatchman.',
                ),
              );
            }
          }),
      )
      .catch((error: unknown) => {
        if (pages.get(document)?.timing === timing) pages.delete(document);
        throw error;
      });
    pages.set(document, {
      productNumber,
      protocol,
      nonce: options.nonce,
      initialized,
      timing,
    });
  }
  const ready = new Promise<OfficialWatchman>((resolve, reject) => {
    const timer = setTimeout(
      () => {
        // Only the latest waiting deadline may end the shared initialization.
        if (deadline >= timing.deadline) {
          timing.deadline = 0;
          timing.expire?.();
          if (pages.get(document)?.timing === timing) pages.delete(document);
        }
        reject(
          new WatchmanError(
            timing.phase === 'script'
              ? 'SCRIPT_TIMEOUT'
              : 'INITIALIZATION_TIMEOUT',
            'Watchman initialization timed out.',
          ),
        );
      },
      Math.max(0, deadline - Date.now()),
    );
    initialized.then(
      (instance) => {
        clearTimeout(timer);
        resolve(instance);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
  return ready.then((instance) => ({
    getToken: (tokenOptions = {}) =>
      new Promise<string>((resolve, reject) => {
        const tokenTimeoutMs = tokenOptions.timeoutMs ?? timeoutMs;
        const business =
          tokenOptions.business ?? 'bd5d2f973ef74cd2a61325a412ae54d9';
        if (typeof business !== 'string' || !business.trim()) {
          reject(
            new WatchmanError(
              'INVALID_OPTIONS',
              'business must be a nonempty identifier.',
            ),
          );
          return;
        }
        if (
          !Number.isFinite(tokenTimeoutMs) ||
          tokenTimeoutMs <= 0 ||
          tokenTimeoutMs > 2_147_483_647
        ) {
          reject(
            new WatchmanError(
              'INVALID_OPTIONS',
              'timeoutMs must be a finite positive timer duration.',
            ),
          );
          return;
        }
        const timer = setTimeout(
          () =>
            reject(
              new WatchmanError(
                'TOKEN_TIMEOUT',
                'Watchman token acquisition timed out.',
              ),
            ),
          tokenTimeoutMs,
        );
        try {
          instance.getToken(business, (token) => {
            clearTimeout(timer);
            if (typeof token === 'string' && token.trim()) resolve(token);
            else
              reject(
                new WatchmanError(
                  'EMPTY_TOKEN',
                  'Watchman returned an empty token.',
                ),
              );
          });
        } catch {
          clearTimeout(timer);
          reject(
            new WatchmanError(
              'TOKEN_FAILED',
              'Watchman token acquisition failed.',
            ),
          );
        }
      }),
  }));
};
