import { afterEach, describe, expect, test } from 'bun:test';

import { initializeWatchman } from '../../src/browser/watchman.ts';

type OfficialWatchman = {
  getToken: (business: string, callback: (token: string) => void) => void;
};
type Initialization = {
  auto: boolean;
  productNumber: string;
  protocol: string;
  onload: (instance?: OfficialWatchman) => void;
  onerror: (error: unknown) => void;
};
type Script = {
  src: string;
  async: boolean;
  nonce: string;
  addEventListener: (event: 'load' | 'error', listener: () => void) => void;
  removeEventListener: (event: 'load' | 'error', listener: () => void) => void;
  dispatch: (event: 'load' | 'error') => void;
  remove: () => void;
};

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  'document',
);

afterEach(() => {
  for (const [name, descriptor] of [
    ['window', originalWindow],
    ['document', originalDocument],
  ] as const) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});

const browser = () => {
  const scripts: Array<Script> = [];
  const window: {
    initWatchman?: (options: Initialization) => void;
    WM?: OfficialWatchman;
  } = {};
  const document = {
    createElement: () => {
      const listeners = new Map<string, () => void>();
      const script: Script = {
        src: '',
        async: false,
        nonce: '',
        addEventListener: (event, listener) => {
          listeners.set(event, listener);
        },
        removeEventListener: (event) => {
          listeners.delete(event);
        },
        dispatch: (event) => {
          listeners.get(event)?.();
        },
        remove: () => scripts.splice(scripts.indexOf(script), 1),
      };
      return script;
    },
    head: { appendChild: (script: Script) => scripts.push(script) },
  };
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: window,
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: document,
  });
  return { scripts, window };
};

const rejection = (promise: Promise<unknown>) =>
  promise.then(
    () => null,
    (error: unknown) => error,
  );

describe('browser Watchman', () => {
  test('reuses page initialization but obtains a fresh token on every call', async () => {
    const page = browser();
    const businesses: Array<string> = [];
    let initializations = 0;
    const first = initializeWatchman();
    const second = initializeWatchman();
    expect(page.scripts).toHaveLength(1);
    page.window.initWatchman = (options) => {
      initializations++;
      expect(options.productNumber).toBe('YD00000558929251');
      expect(options.protocol).toBe('https');
      expect(options.auto).toBe(true);
      options.onload({
        getToken: (business, callback) => {
          businesses.push(business);
          callback(`token-${businesses.length}`);
        },
      });
    };
    expect(page.scripts[0]!.src).toBe(
      'https://acstatic-dun.126.net/tool.min.js',
    );
    page.scripts[0]!.dispatch('load');
    const [firstClient, secondClient] = await Promise.all([first, second]);
    expect(await firstClient.getToken()).toBe('token-1');
    expect(await secondClient.getToken()).toBe('token-2');
    expect(businesses).toEqual([
      'bd5d2f973ef74cd2a61325a412ae54d9',
      'bd5d2f973ef74cd2a61325a412ae54d9',
    ]);
    expect(initializations).toBe(1);
  });

  test('a failed script can be loaded again by the next explicit attempt', async () => {
    const page = browser();
    const failed = initializeWatchman();
    page.scripts[0]!.dispatch('error');
    expect(await rejection(failed)).toMatchObject({ code: 'SCRIPT_FAILED' });
    expect(page.scripts).toHaveLength(0);

    const retry = initializeWatchman();
    expect(page.scripts).toHaveLength(1);
    page.window.initWatchman = ({ onload }) =>
      onload({
        getToken: (_business, callback) => callback('recovered'),
      });
    page.scripts[0]!.dispatch('load');
    expect(await (await retry).getToken()).toBe('recovered');
  });

  test('a script timeout removes the stalled script and allows another attempt', async () => {
    const page = browser();
    expect(
      await rejection(
        Promise.race([
          initializeWatchman({ timeoutMs: 5 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('No script deadline')), 50),
          ),
        ]),
      ),
    ).toMatchObject({
      code: 'SCRIPT_TIMEOUT',
    });
    expect(page.scripts).toHaveLength(0);
    const retry = initializeWatchman();
    page.window.initWatchman = ({ onload }) =>
      onload({
        getToken: (_business, callback) => callback('after-timeout'),
      });
    page.scripts[0]!.dispatch('load');
    expect(await (await retry).getToken()).toBe('after-timeout');
  }, 200);

  test('an initialization failure permits the next explicit initialization', async () => {
    const page = browser();
    page.window.initWatchman = ({ onerror }) =>
      onerror(new Error('upstream rejection'));
    const failed = initializeWatchman();
    page.scripts[0]?.dispatch('load');
    expect(await rejection(failed)).toMatchObject({
      code: 'INITIALIZATION_FAILED',
    });
    page.window.initWatchman = ({ onload }) =>
      onload({
        getToken: (_business, callback) => callback('reinitialized'),
      });
    const retry = initializeWatchman();
    page.scripts[0]?.dispatch('load');
    expect(await (await retry).getToken()).toBe('reinitialized');
  });

  test('initialization has a deadline and a late callback cannot settle the next attempt', async () => {
    const page = browser();
    let stale: Initialization | undefined;
    page.window.initWatchman = (options) => {
      stale = options;
    };
    expect(
      await rejection(
        Promise.race([
          initializeWatchman({ timeoutMs: 5 }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('No initializer deadline')), 50),
          ),
        ]),
      ),
    ).toMatchObject({ code: 'INITIALIZATION_TIMEOUT' });
    page.window.initWatchman = ({ onload }) =>
      onload({
        getToken: (_business, callback) => callback('new-attempt'),
      });
    const recovered = await initializeWatchman();
    stale!.onload({ getToken: (_business, callback) => callback('stale') });
    expect(await recovered.getToken()).toBe('new-attempt');
  });

  test('a later initializer observes its own deadline without failing another waiter', async () => {
    const page = browser();
    let initializations = 0;
    page.window.initWatchman = ({ onload }) => {
      initializations++;
      setTimeout(
        () =>
          onload({
            getToken: (_business, callback) => callback('shared-instance'),
          }),
        70,
      );
    };
    const patient = initializeWatchman({ timeoutMs: 200 });
    const impatient = initializeWatchman({ timeoutMs: 5 });
    expect(await rejection(impatient)).toMatchObject({
      code: 'INITIALIZATION_TIMEOUT',
    });
    expect(await (await patient).getToken()).toBe('shared-instance');
    expect(initializations).toBe(1);
  });

  test('an earlier short deadline does not fail a later patient initializer', async () => {
    const page = browser();
    let initializations = 0;
    page.window.initWatchman = ({ onload }) => {
      initializations++;
      setTimeout(
        () =>
          onload({
            getToken: (_business, callback) => callback('shared-instance'),
          }),
        70,
      );
    };
    const impatient = rejection(initializeWatchman({ timeoutMs: 5 }));
    const patient = initializeWatchman({ timeoutMs: 200 }).then(
      (watchman) => watchman.getToken(),
      (error: unknown) => error,
    );
    expect(await impatient).toMatchObject({ code: 'INITIALIZATION_TIMEOUT' });
    expect(await patient).toBe('shared-instance');
    expect(initializations).toBe(1);
  });

  test('a timed-out script waiter leaves the single script available to another waiter', async () => {
    const page = browser();
    const impatient = rejection(initializeWatchman({ timeoutMs: 5 }));
    const patient = initializeWatchman({ timeoutMs: 200 });
    setTimeout(() => {
      page.window.initWatchman = ({ onload }) =>
        onload({
          getToken: (_business, callback) => callback('loaded-once'),
        });
      page.scripts[0]!.dispatch('load');
    }, 70);
    expect(await impatient).toMatchObject({ code: 'SCRIPT_TIMEOUT' });
    expect(page.scripts).toHaveLength(1);
    expect(await (await patient).getToken()).toBe('loaded-once');
    expect(page.scripts).toHaveLength(1);
  });

  test('an empty token rejects and the next call asks the same instance again', async () => {
    const page = browser();
    let calls = 0;
    page.window.WM = {
      getToken: (_business, callback) => callback(++calls === 1 ? '' : 'fresh'),
    };
    const watchman = await initializeWatchman();
    expect(await rejection(watchman.getToken())).toMatchObject({
      code: 'EMPTY_TOKEN',
    });
    expect(await watchman.getToken()).toBe('fresh');
    expect(calls).toBe(2);
  });

  test('concurrent token calls stay independent when one reaches its deadline', async () => {
    const page = browser();
    const callbacks: Array<(token: string) => void> = [];
    page.window.WM = {
      getToken: (_business, callback) => {
        callbacks.push(callback);
      },
    };
    const watchman = await initializeWatchman();
    const timedOut = watchman.getToken({ timeoutMs: 5 });
    const successful = watchman.getToken();
    callbacks[1]!('second-call');
    expect(await successful).toBe('second-call');
    expect(
      await rejection(
        Promise.race([
          timedOut,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('No token deadline')), 50),
          ),
        ]),
      ),
    ).toMatchObject({ code: 'TOKEN_TIMEOUT' });
    callbacks[0]!('too-late');
    expect(callbacks).toHaveLength(2);
  });

  test('applies CSP nonce and approved product, protocol, and business options', async () => {
    const page = browser();
    const ready = initializeWatchman({
      nonce: 'csp-example',
      productNumber: 'approved-product',
      protocol: 'http',
    });
    expect(page.scripts[0]!.nonce).toBe('csp-example');
    page.window.initWatchman = (options) => {
      expect(options.productNumber).toBe('approved-product');
      expect(options.protocol).toBe('http');
      options.onload({
        getToken: (business, callback) => {
          expect(business).toBe('approved-business');
          callback('configured');
        },
      });
    };
    page.scripts[0]!.dispatch('load');
    expect(
      await (await ready).getToken({ business: 'approved-business' }),
    ).toBe('configured');
  });

  test('does not silently reuse a page instance for a different product', async () => {
    const page = browser();
    page.window.WM = { getToken: (_business, callback) => callback('ready') };
    await initializeWatchman();
    expect(
      await rejection(initializeWatchman({ productNumber: 'another-product' })),
    ).toMatchObject({ code: 'CONFIGURATION_CONFLICT' });
  });

  test('Node or SSR invocation reports that browser initialization is required', async () => {
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'document');
    expect(await rejection(initializeWatchman())).toMatchObject({
      code: 'BROWSER_REQUIRED',
    });
  });

  test('invalid timeouts fail before contacting Watchman', async () => {
    const page = browser();
    expect(await rejection(initializeWatchman({ timeoutMs: 0 }))).toMatchObject(
      {
        code: 'INVALID_OPTIONS',
      },
    );
    expect(page.scripts).toHaveLength(0);
    let requested = false;
    page.window.WM = {
      getToken: () => {
        requested = true;
      },
    };
    const watchman = await initializeWatchman();
    expect(
      await rejection(watchman.getToken({ timeoutMs: Infinity })),
    ).toMatchObject({ code: 'INVALID_OPTIONS' });
    expect(requested).toBe(false);
  });

  test('empty business identifiers fail before asking for a token', async () => {
    const page = browser();
    let requested = false;
    page.window.WM = {
      getToken: () => {
        requested = true;
      },
    };
    const watchman = await initializeWatchman();
    expect(await rejection(watchman.getToken({ business: ' ' }))).toMatchObject(
      { code: 'INVALID_OPTIONS' },
    );
    expect(requested).toBe(false);
  });
});
