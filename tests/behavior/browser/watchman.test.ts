import { afterAll, afterEach, beforeAll, expect, test } from 'bun:test';

import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page, Route } from 'playwright';

let browser: Browser;
let bundle: string;
const contexts: Array<BrowserContext> = [];
const unexpected: Array<string> = [];
const leaks: Array<string> = [];

beforeAll(async () => {
  const result = await Bun.build({
    entrypoints: ['./src/browser/watchman.ts'],
    target: 'browser',
    format: 'esm',
  });
  expect(result.success).toBe(true);
  bundle = await result.outputs[0]!.text();
  browser = await chromium.launch();
}, 30_000);

afterEach(async () => {
  await Promise.all(contexts.splice(0).map((context) => context.close()));
  expect(unexpected.splice(0)).toEqual([]);
  expect(leaks.splice(0)).toEqual([]);
});
afterAll(async () => {
  await browser?.close();
});

const openPage = async (mode = 'success'): Promise<Page> => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  contexts.push(context);
  let failScript = mode === 'script-failure';
  let holdScript = mode === 'hold-script';
  let heldScript: Route | undefined;
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    if (url === 'http://127.0.0.1:31807/') {
      await route.fulfill({
        contentType: 'text/html',
        headers:
          mode === 'trusted-types-rejection'
            ? {
                'Content-Security-Policy':
                  "require-trusted-types-for 'script'; trusted-types default",
              }
            : {},
        body: '<script type="module" src="/entry.js"></script>',
      });
    } else if (url.startsWith('http://127.0.0.1:31807/entry.js')) {
      await route.fulfill({
        contentType: 'text/javascript',
        body: `${bundle}\nwindow.api = { initializeWatchman, WatchmanError };`,
      });
    } else if (url === 'https://acstatic-dun.126.net/tool.min.js') {
      if (holdScript) {
        holdScript = false;
        heldScript = route;
        return;
      }
      if (failScript) {
        failScript = false;
        await route.abort();
        return;
      }
      await route.fulfill({
        contentType: 'text/javascript',
        body: `
          if (window.fixture.mode !== 'missing-initializer') {
            window.initWatchman = (options) => {
              const state = window.fixture;
              state.initializations.push(options);
              if (state.mode === 'throw-initialization') throw new Error('sensitive-upstream-message');
              if (state.mode === 'invalid-instance') { options.onload({}); return; }
              if (state.mode === 'initialization-failure') {
                options.onerror(new Error('sensitive-upstream-message'));
                return;
              }
              if (state.mode === 'hold-initialization') return;
              options.onload({ getToken(key, callback) {
                state.keys.push(key);
                state.callbacks.push(callback);
                if (state.mode === 'throw-token') throw new Error('sensitive-token');
                if (state.mode === 'hold-token') return;
                callback(state.mode === 'empty-token' ? '  ' : 'test-token-' + state.keys.length);
              }});
            };
          }
        `,
      });
    } else {
      unexpected.push(url);
      await route.abort();
    }
  });
  const page = await context.newPage();
  await page.exposeFunction('restoreScript', async () => {
    await heldScript?.abort();
    heldScript = undefined;
  });
  page.on('console', (message) => {
    if (/test-token|sensitive-|stale-value|second-value/.test(message.text()))
      leaks.push(message.text());
  });
  page.on('pageerror', (error) => leaks.push(error.message));
  await page.addInitScript({
    content: `
    window.fixture = { mode: ${JSON.stringify(mode)}, initializations: [], keys: [], callbacks: [], listeners: 0 };
    const registered = new WeakMap();
    const originalAdd = EventTarget.prototype.addEventListener;
    const originalRemove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (this instanceof HTMLScriptElement) {
        let entries = registered.get(this);
        if (!entries) { entries = new Map(); registered.set(this, entries); }
        let handlers = entries.get(type);
        if (!handlers) { handlers = new Set(); entries.set(type, handlers); }
        if (!handlers.has(listener)) { handlers.add(listener); window.fixture.listeners++; }
      }
      return originalAdd.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      if (registered.get(this)?.get(type)?.delete(listener)) window.fixture.listeners--;
      return originalRemove.call(this, type, listener, options);
    };
  `,
  });
  await page.goto('http://127.0.0.1:31807/');
  await page.waitForFunction('Boolean(window.api)');
  return page;
};

test('parallel initialization reuses one script and one official instance', async () => {
  const page = await openPage();
  const result = await page.evaluate(`(async () => {
    const results = await Promise.allSettled([
      window.api.initializeWatchman(), window.api.initializeWatchman()
    ]);
    return { statuses: results.map(result => result.status),
      scripts: [...document.scripts].filter(script => script.src === 'https://acstatic-dun.126.net/tool.min.js').length,
      calls: window.fixture.initializations.length,
      same: results[0].value === results[1].value };
  })()`);
  expect(result).toEqual({
    statuses: ['fulfilled', 'fulfilled'],
    scripts: 1,
    calls: 1,
    same: true,
  });
});

test('each token call forwards official defaults and returns its own fresh result', async () => {
  const page = await openPage();
  const result = await page.evaluate(`(async () => {
    const client = await window.api.initializeWatchman();
    const first = await client.getToken().catch(error => error.code);
    const second = await client.getToken().catch(error => error.code);
    const repeated = await window.api.initializeWatchman();
    const { auto, productNumber, protocol } = window.fixture.initializations[0];
    return { first, second, same: client === repeated,
      calls: window.fixture.initializations.length,
      keys: window.fixture.keys, auto, productNumber, protocol };
  })()`);
  expect(result).toEqual({
    first: 'test-token-1',
    second: 'test-token-2',
    same: true,
    calls: 1,
    keys: [
      'bd5d2f973ef74cd2a61325a412ae54d9',
      'bd5d2f973ef74cd2a61325a412ae54d9',
    ],
    auto: true,
    productNumber: 'YD00000558929251',
    protocol: 'https',
  });
});

test('token failures are bounded and sanitized without poisoning the instance', async () => {
  const page = await openPage();
  const result = await page.evaluate(`(async () => {
    const client = await window.api.initializeWatchman({ tokenTimeoutMs: 100 });
    const outcomes = [];
    for (const mode of ['empty-token', 'throw-token', 'hold-token']) {
      window.fixture.mode = mode;
      const result = await Promise.race([
        client.getToken().then(value => ({ value }), error => ({
          code: error.code, message: error.message, typed: error instanceof window.api.WatchmanError
        })),
        new Promise(resolve => setTimeout(() => resolve({ code: 'unbounded' }), 750))
      ]);
      outcomes.push(result);
    }
    window.fixture.mode = 'success';
    const token = await client.getToken();
    return { outcomes, token, initializations: window.fixture.initializations.length,
      calls: window.fixture.keys.length, storage: [localStorage.length, sessionStorage.length], cookie: document.cookie };
  })()`);
  expect(result).toEqual({
    outcomes: [
      { code: 'token', message: 'Watchman token', typed: true },
      { code: 'token', message: 'Watchman token', typed: true },
      { code: 'token-timeout', message: 'Watchman token-timeout', typed: true },
    ],
    token: 'test-token-4',
    initializations: 1,
    calls: 4,
    storage: [0, 0],
    cookie: '',
  });
});

test('concurrent token callbacks stay independent including a late timed out result', async () => {
  const page = await openPage('hold-token');
  const result = await page.evaluate(`(async () => {
    const client = await window.api.initializeWatchman({ tokenTimeoutMs: 100 });
    const first = client.getToken().catch(error => error.code);
    const second = client.getToken();
    window.fixture.callbacks[1]('second-value');
    const values = [await first, await second];
    window.fixture.callbacks[0]('stale-value');
    window.fixture.mode = 'success';
    return { values, next: await client.getToken(), calls: window.fixture.keys.length };
  })()`);
  expect(result).toEqual({
    values: ['token-timeout', 'second-value'],
    next: 'test-token-3',
    calls: 3,
  });
});

test.each([
  'script-failure',
  'hold-script',
  'missing-initializer',
  'initialization-failure',
  'throw-initialization',
  'invalid-instance',
  'hold-initialization',
])(
  'initialization recovers from %s on the next explicit call',
  async (mode) => {
    const page = await openPage(mode);
    const result = await page.evaluate(`(async () => {
      const initialize = () => window.api.initializeWatchman({ timeoutMs: 100 });
      const errors = await Promise.all([initialize(), initialize()].map(promise => Promise.race([
        promise.then(() => 'unexpected-success', error => error.code),
        new Promise(resolve => setTimeout(() => resolve('unbounded'), 750))
      ])));
      const failedScripts = [...document.scripts].filter(script => script.src.endsWith('/tool.min.js')).length;
      await window.restoreScript();
      window.fixture.mode = 'success';
      const recovered = await Promise.race([
        initialize().then(() => true, () => false),
        new Promise(resolve => setTimeout(() => resolve(false), 750))
      ]);
      return { errors, failedScripts, recovered, listeners: window.fixture.listeners };
    })()`);
    const code =
      mode === 'script-failure'
        ? 'script-load'
        : ['hold-initialization', 'hold-script'].includes(mode)
          ? 'initialization-timeout'
          : 'initialization';
    expect(result).toEqual({
      errors: [code, code],
      failedScripts: 0,
      recovered: true,
      listeners: 0,
    });
  },
);

test('explicit configuration reaches the script and cannot silently change a live instance', async () => {
  const page = await openPage();
  const result = await page.evaluate(`(async () => {
    const options = { productNumber: 'custom-product', protocol: 'http', businessKey: 'custom-key', nonce: 'nonce-107' };
    const pending = window.api.initializeWatchman(options);
    options.businessKey = 'mutated-key';
    const client = await pending;
    const token = await client.getToken();
    const conflict = await window.api.initializeWatchman().then(() => 'accepted', error => error.code);
    const script = [...document.scripts].find(script => script.src.endsWith('/tool.min.js'));
    const { productNumber, protocol } = window.fixture.initializations[0];
    return { token, conflict, nonce: script.nonce, productNumber, protocol, keys: window.fixture.keys };
  })()`);
  expect(result).toEqual({
    token: 'test-token-1',
    conflict: 'configuration',
    nonce: 'nonce-107',
    productNumber: 'custom-product',
    protocol: 'http',
    keys: ['custom-key'],
  });
});

test('late initialization callbacks cannot replace a recovered instance', async () => {
  const page = await openPage('hold-initialization');
  const result = await page.evaluate(`(async () => {
    const first = window.api.initializeWatchman({ timeoutMs: 100 }).catch(error => error.code);
    const oldScript = [...document.scripts].find(script => script.src.endsWith('/tool.min.js'));
    const failure = await first;
    const old = window.fixture.initializations[0];
    window.fixture.mode = 'success';
    const current = await window.api.initializeWatchman({ timeoutMs: 100 });
    old.onload({ getToken: (_, callback) => callback('stale-value') });
    old.onerror();
    const repeated = await window.api.initializeWatchman({ timeoutMs: 100 });
    return { failure, same: repeated === current, token: await repeated.getToken(),
      removed: !oldScript.isConnected, listeners: window.fixture.listeners,
      calls: window.fixture.initializations.length };
  })()`);
  expect(result).toEqual({
    failure: 'initialization-timeout',
    same: true,
    token: 'test-token-1',
    removed: true,
    listeners: 0,
    calls: 2,
  });
});

test('invalid configuration rejects before loading the official script', async () => {
  const page = await openPage();
  const result = await page.evaluate(`(async () => {
    const codes = [];
    for (const options of [{ timeoutMs: 0 }, { timeoutMs: Infinity }, { timeoutMs: 2147483648 },
      { tokenTimeoutMs: -1 }, { productNumber: ' ' }, { businessKey: '' }, { protocol: 'ftp' }]) {
      codes.push(await window.api.initializeWatchman(options).then(() => 'accepted', error => error.code));
    }
    return { codes, calls: window.fixture.initializations.length,
      scripts: [...document.scripts].filter(script => script.src.endsWith('/tool.min.js')).length };
  })()`);
  expect(result).toEqual({
    codes: Array.from({ length: 7 }, () => 'configuration'),
    calls: 0,
    scripts: 0,
  });
});

test('separate module copies reuse the same page initialization', async () => {
  const page = await openPage();
  const result = await page.evaluate(`(async () => {
    const first = await window.api.initializeWatchman();
    const copy = await import('/entry.js?copy');
    const second = await copy.initializeWatchman();
    return { same: first === second, calls: window.fixture.initializations.length,
      scripts: [...document.scripts].filter(script => script.src.endsWith('/tool.min.js')).length };
  })()`);
  expect(result).toEqual({ same: true, calls: 1, scripts: 1 });
});

test('Trusted Types script rejection is asynchronous and recovers after the host allows the sink', async () => {
  const page = await openPage('trusted-types-rejection');
  const result = await page.evaluate(`(async () => {
    const options = { nonce: 'nonce-107', timeoutMs: 100 };
    let first;
    try {
      first = await window.api.initializeWatchman(options).then(() => 'accepted', error => ({
        code: error.code, typed: error instanceof window.api.WatchmanError, message: error.message
      }));
    } catch { first = 'synchronous'; }
    trustedTypes.createPolicy('default', { createScriptURL(value) {
      if (value !== 'https://acstatic-dun.126.net/tool.min.js') throw new Error('unapproved script');
      return value;
    }});
    const recovered = await Promise.race([
      window.api.initializeWatchman(options).then(client => client.getToken(), error => error.code),
      new Promise(resolve => setTimeout(() => resolve('unbounded'), 750))
    ]);
    return { first, recovered, listeners: window.fixture.listeners,
      calls: window.fixture.initializations.length };
  })()`);
  expect(result).toEqual({
    first: {
      code: 'script-load',
      typed: true,
      message: 'Watchman script-load',
    },
    recovered: 'test-token-1',
    listeners: 0,
    calls: 1,
  });
});
