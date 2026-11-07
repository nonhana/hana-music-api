import { expect, test } from 'bun:test';
import { createServer } from 'node:http';
import type { Socket } from 'node:net';

import { createRequest } from '../../../src/core/request.ts';
import { settle } from '../../_kit/assertions.ts';
import { createStage } from '../../_kit/harness/sdk.ts';
import { createFakeUpstream } from '../../_kit/upstream/loopback.ts';
import { allowLoopback } from '../../_kit/upstream/offline.ts';

test('strict loopback retains unknown route failures after response mapping', async () => {
  const upstream = createFakeUpstream(0);
  const response = await upstream.fetcher(
    'https://music.163.com/api/not-registered',
    { method: 'POST' },
  );
  await response.text();
  const failure = await upstream.stop().catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(AggregateError);
});

const withHttpServer = async (
  mode: 'headers' | 'body' | 'disconnect' | 'redirect',
  work: (fixture: {
    origin: string;
    started: ReturnType<typeof createStage>;
    calls: () => number;
  }) => Promise<void>,
) => {
  const started = createStage('physical HTTP request');
  const sockets = new Set<Socket>();
  const closed = Promise.withResolvers<void>();
  let closeDeadline: ReturnType<typeof setTimeout> | undefined;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let calls = 0;
  const server = createServer((request, response) => {
    calls += 1;
    request.resume();
    started.reach();
    if (mode === 'headers') {
      timers.add(setTimeout(() => response.end('{"code":200}'), 500));
    } else if (mode === 'redirect') {
      response.writeHead(302, { location: 'https://unmatched.invalid/leak' });
      response.end();
    } else {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.write('{');
      if (mode === 'disconnect')
        timers.add(setTimeout(() => response.destroy(), 15));
    }
  });
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => {
      sockets.delete(socket);
      if (!sockets.size) closed.resolve();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing loopback address');
  const origin = `http://127.0.0.1:${address.port}`;
  const disallow = allowLoopback(origin);
  try {
    await work({ origin, started, calls: () => calls });
    if (mode === 'body' || mode === 'headers') {
      await Promise.race([
        closed.promise,
        new Promise<never>((_resolve, reject) => {
          closeDeadline = setTimeout(
            () =>
              reject(
                new Error(
                  'Physical request socket stayed open after completion',
                ),
              ),
            1000,
          );
        }),
      ]);
      expect(sockets.size, 'socket must close before fixture cleanup').toBe(0);
    }
  } finally {
    clearTimeout(closeDeadline);
    for (const timer of timers) clearTimeout(timer);
    for (const socket of sockets) socket.destroy();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    disallow();
    expect(sockets.size).toBe(0);
  }
};

test.each(['headers', 'body'] as const)(
  'default adapter enforces a deadline across slow %s on a real socket',
  async (mode) => {
    await withHttpServer(mode, async ({ origin, started, calls }) => {
      const pending = settle(
        createRequest(
          '/api/test',
          {},
          {
            crypto: 'api',
            domain: origin,
            timeoutMs: 100,
            state: { anonymousToken: '' },
          },
        ),
      );
      await started.wait(pending);
      expect(await pending).toMatchObject({ rejected: { status: 504 } });
      expect(calls()).toBe(1);
    });
  },
);

test('default adapter reports a broken physical response body', async () => {
  await withHttpServer('disconnect', async ({ origin, started, calls }) => {
    const pending = settle(
      createRequest(
        '/api/test',
        {},
        {
          crypto: 'api',
          domain: origin,
          timeoutMs: 1000,
          retry: { retries: 0 },
          state: { anonymousToken: '' },
        },
      ),
    );
    await started.wait(pending);
    expect(await pending).toMatchObject({ rejected: { status: 502 } });
    expect(calls()).toBe(1);
  });
});

test('default adapter refuses a redirect without connecting to its target', async () => {
  await withHttpServer('redirect', async ({ origin, calls }) => {
    expect(
      await settle(
        createRequest(
          '/api/test',
          {},
          {
            crypto: 'api',
            domain: origin,
            timeoutMs: 1000,
            state: { anonymousToken: '' },
          },
        ),
      ),
    ).toMatchObject({ rejected: { status: 502 } });
    expect(calls()).toBe(1);
  });
});

test('default adapter cancellation closes a real stalled body', async () => {
  await withHttpServer('body', async ({ origin, started, calls }) => {
    const controller = new AbortController();
    const pending = settle(
      createRequest(
        '/api/test',
        {},
        {
          crypto: 'api',
          domain: origin,
          timeoutMs: 1000,
          signal: controller.signal,
          state: { anonymousToken: '' },
        },
      ),
    );
    await started.wait(pending);
    await Bun.sleep(10);
    controller.abort();
    expect(await pending).toMatchObject({ rejected: { status: 499 } });
    expect(calls()).toBe(1);
  });
});

test('loopback cleanup retains a business failure and its independent ledger failure', async () => {
  let failure: unknown;
  try {
    await using upstream = createFakeUpstream(0);
    await (
      await upstream.fetcher('https://music.163.com/api/not-registered', {
        method: 'POST',
      })
    ).text();
    throw new Error('original business assertion');
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(SuppressedError);
  const combined = failure as SuppressedError;
  expect(combined.suppressed).toMatchObject({
    message: 'original business assertion',
  });
  expect(combined.error).toBeInstanceOf(AggregateError);
});
