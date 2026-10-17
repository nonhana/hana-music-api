import { afterEach, expect, test } from 'bun:test';

import {
  createWatchman,
  PLAYLIST_CHECK_TOKEN_BUSINESS_KEY,
  WatchmanTokenError,
  WatchmanUnavailableError,
} from '../../src/watchman/index.ts';

const globals = globalThis as Record<string, unknown>;
const originalWindow = globals.window;
const originalDocument = globals.document;

afterEach(() => {
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globals, 'window');
  } else {
    globals.window = originalWindow;
  }
  if (originalDocument === undefined) {
    Reflect.deleteProperty(globals, 'document');
  } else {
    globals.document = originalDocument;
  }
});

const fakeDocument = (onAppend?: (script: unknown) => void) => {
  const appended: Array<unknown> = [];
  return {
    appended,
    cookie: 'WM_TID=tid; WM_NI=x%2Fy',
    createElement: () => {
      const listeners = new Map<string, () => void>();
      return {
        async: false,
        nonce: undefined as string | undefined,
        src: '',
        addEventListener: (type: string, listener: () => void) => {
          listeners.set(type, listener);
        },
        fireLoad: () => listeners.get('load')?.(),
        remove: () => undefined,
      };
    },
    head: {
      appendChild: (script: unknown) => {
        appended.push(script);
        onAppend?.(script);
      },
    },
  };
};

const initWatchman = (options: {
  productNumber: string;
  protocol: 'http' | 'https';
  onload: (instance: unknown) => void;
}) => {
  options.onload({
    getToken: (_businessKey: string, callback: (token: string) => void) => {
      callback('loaded-token');
    },
  });
};

test('createWatchman rejects outside a browser environment', async () => {
  const failure = await createWatchman({ productNumber: 'test-ssr' }).then(
    () => undefined,
    (error: unknown) => error,
  );
  expect(failure).toBeInstanceOf(WatchmanUnavailableError);
});

test('createWatchman reuses initWatchman and reads device metadata', async () => {
  const document = fakeDocument();
  globals.document = document;
  globals.window = {
    location: { protocol: 'https:' },
    initWatchman: (options: {
      productNumber: string;
      onload: (instance: unknown) => void;
    }) => {
      options.onload({
        getToken: (businessKey: string, callback: (token: string) => void) => {
          callback(`token-${businessKey}`);
        },
      });
    },
  };

  const watchman = await createWatchman({ productNumber: 'test-reuse' });

  expect(watchman.productNumber).toBe('test-reuse');
  expect(document.appended).toHaveLength(0);
  expect(await watchman.getToken()).toBe(
    `token-${PLAYLIST_CHECK_TOKEN_BUSINESS_KEY}`,
  );
  expect(await watchman.getToken('business-key')).toBe('token-business-key');
  expect(watchman.getDeviceMetadata()).toEqual({
    WM_TID: 'tid',
    WM_DID: undefined,
    WM_NI: 'x/y',
    WM_NIKE: undefined,
  });
});

test('createWatchman loads tool.min.js once with the CSP nonce', async () => {
  const document = fakeDocument((script) => {
    const target = script as {
      fireLoad: () => void;
      nonce?: string;
      src: string;
    };
    globals.window = {
      ...(globals.window as object),
      initWatchman,
    };
    target.fireLoad();
  });
  globals.document = document;
  globals.window = {
    location: { protocol: 'https:' },
  };

  const watchman = await createWatchman({
    productNumber: 'test-script',
    nonce: 'nonce-123',
    scriptUrl: 'https://example.com/tool.min.js',
  });

  expect(document.appended).toHaveLength(1);
  const script = document.appended[0] as {
    nonce?: string;
    src: string;
  };
  expect(script.src).toBe('https://example.com/tool.min.js');
  expect(script.nonce).toBe('nonce-123');
  expect(await watchman.getToken()).toBe('loaded-token');
});

test('createWatchman reuses a page-owned window.WM instance', async () => {
  const document = fakeDocument();
  globals.document = document;
  globals.window = {
    WM: {
      getToken: (_businessKey: string, callback: (token: string) => void) => {
        callback('page-token');
      },
    },
  };

  const watchman = await createWatchman({ productNumber: 'test-page-wm' });

  expect(await watchman.getToken()).toBe('page-token');
  expect(document.appended).toHaveLength(0);
});

test('getToken rejects an empty token', async () => {
  globals.document = fakeDocument();
  globals.window = {
    location: { protocol: 'https:' },
    initWatchman: (options: { onload: (instance: unknown) => void }) => {
      options.onload({
        getToken: (_businessKey: string, callback: (token: string) => void) => {
          callback('');
        },
      });
    },
  };

  const watchman = await createWatchman({ productNumber: 'test-empty' });

  const failure = await watchman.getToken().then(
    () => undefined,
    (error: unknown) => error,
  );
  expect(failure).toBeInstanceOf(WatchmanTokenError);
});
