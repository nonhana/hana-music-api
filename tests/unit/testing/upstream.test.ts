import { expect, test } from 'bun:test';

import { createRequest } from '../../../src/core/request.ts';
import { createStage } from '../../_kit/harness/sdk.ts';
import {
  allowLoopback,
  installOfflineGuard,
} from '../../_kit/upstream/offline.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readWebBody, readWireRequest } from '../../_kit/upstream/wire.ts';

const url = 'https://interface.music.163.com/api/test';

test('strict upstream retains assertion failures even when the product maps them', async () => {
  expect(
    withScenario(
      [
        {
          url,
          method: 'POST',
          check: () => {
            throw new Error('independent assertion');
          },
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        await createRequest(
          '/api/test',
          {},
          { crypto: 'api', fetcher: scenario.fetcher },
        ).catch(() => undefined);
      },
    ),
  ).rejects.toThrow('independent assertion');
});

test.each(['url', 'method', 'extra', 'missing'] as const)(
  'strict upstream rejects %s',
  async (fault) => {
    expect(
      withScenario(
        [{ url, method: 'POST', response: () => Response.json({ code: 200 }) }],
        async (scenario) => {
          if (fault === 'missing') return;
          await scenario
            .fetcher(fault === 'url' ? `${url}/wrong` : url, {
              method: fault === 'method' ? 'GET' : 'POST',
            })
            .catch(() => undefined);
          if (fault === 'extra')
            await scenario
              .fetcher(url, { method: 'POST' })
              .catch(() => undefined);
        },
      ),
    ).rejects.toThrow();
  },
);

test('wire Request/init overrides preserve the source body and signal', async () => {
  const controller = new AbortController();
  const source = new Request(url, {
    method: 'POST',
    body: 'source',
    headers: { 'x-old': 'old' },
  });
  const wire = await readWireRequest(source, {
    method: 'PUT',
    body: 'override',
    headers: { 'x-new': 'new' },
    signal: controller.signal,
  });
  expect(wire.method).toBe('PUT');
  expect(wire.body).toBe('override');
  expect(wire.headers.get('x-old')).toBeNull();
  expect(wire.headers.get('x-new')).toBe('new');
  expect(await source.text()).toBe('source');
  expect(await wire.request.text()).toBe('override');
  controller.abort();
  expect(wire.signal.aborted).toBe(true);
});

test('cleanup retains both the original and dispose failures', async () => {
  try {
    await withScenario(
      [],
      async () => {
        throw new Error('original failure');
      },
      () => {
        throw new Error('cleanup failure');
      },
    );
    throw new Error('unexpected success');
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError);
    expect(
      (error as AggregateError).errors.map((failure: Error) => failure.message),
    ).toEqual(['original failure', 'cleanup failure']);
  }
});

test('a fake response that ignores an aborted signal cannot pass', async () => {
  const controller = new AbortController();
  expect(
    withScenario(
      [
        {
          url,
          method: 'POST',
          response: () => {
            controller.abort();
            return Response.json({ code: 200 });
          },
        },
      ],
      async (scenario) => {
        await scenario
          .fetcher(url, { method: 'POST', signal: controller.signal })
          .catch(() => undefined);
        expect(scenario.entries).toHaveLength(1);
      },
    ),
  ).rejects.toThrow('ignored cancellation');
});

test('native and Undici default paths reject unmatched targets in Node before dispatch', async () => {
  const child = Bun.spawn(
    ['node', 'tests/fixtures/consumers/offline-probe.mjs'],
    { stdout: 'pipe', stderr: 'pipe' },
  );
  const [code, output, errors] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect(code, errors).toBe(0);
  expect(JSON.parse(output)).toEqual({ rejected: 2 });
});

test('only a registered loopback origin can use the native adapter', async () => {
  const network = installOfflineGuard();
  const server = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    fetch: () => new Response('local'),
  });
  const origin = `http://127.0.0.1:${server.port}`;
  const disallow = allowLoopback(origin);
  try {
    expect(await (await fetch(origin)).text()).toBe('local');
    network.verify();
    disallow();
    expect(fetch(origin)).rejects.toThrow('Offline guard');
  } finally {
    disallow();
    await server.stop(true);
    network.dispose();
  }
});

test('independent weapi decoder reads a fixed double-AES vector', () => {
  const params =
    'v05SjrxRM5h5LdGQV7HBagCF8KpQMbBcNZfSqr4SygbKcNURbaWSYiuPIr4oeXKOiskpVBbwUx89A38Ekvrn4YsdRR+MHuBW/nnktO41qhY=';
  expect(readWebBody(new URLSearchParams({ params }).toString())).toEqual({
    id: 17,
    csrf_token: 'fixture',
    e_r: false,
  });
});

test('strict responses retain raw text and controlled body disposal', async () => {
  let cancelled = false;
  await withScenario(
    [
      {
        url,
        method: 'GET',
        response: () =>
          new Response(
            new ReadableStream({
              start: (controller) =>
                controller.enqueue(new TextEncoder().encode('raw-text')),
              cancel: () => {
                cancelled = true;
              },
            }),
          ),
      },
    ],
    async (scenario) => {
      const response = await scenario.fetcher(url);
      const reader = response.body!.getReader();
      expect(new TextDecoder().decode((await reader.read()).value)).toBe(
        'raw-text',
      );
      await reader.cancel();
      reader.releaseLock();
    },
  );
  expect(cancelled).toBe(true);
});

test('declared transport failures and cooperative aborts retain their intended meaning', async () => {
  const intentional = new Error('simulated network failure');
  await withScenario(
    [
      {
        url,
        method: 'GET',
        reject: intentional,
        response: () => {
          throw new Error('must not run');
        },
      },
    ],
    async (scenario) => {
      expect(await scenario.fetcher(url).catch((error: unknown) => error)).toBe(
        intentional,
      );
    },
  );
  const controller = new AbortController();
  await withScenario(
    [
      {
        url,
        method: 'GET',
        response: (wire) => {
          controller.abort();
          wire.signal.throwIfAborted();
          throw new Error('unreachable');
        },
      },
    ],
    async (scenario) => {
      expect(
        await scenario
          .fetcher(url, { signal: controller.signal })
          .catch((error: unknown) => error),
      ).toBeInstanceOf(DOMException);
    },
  );
});

test('stage wait fails immediately when the call completes before reaching the phase', async () => {
  const stage = createStage('provider');
  const failure = await stage
    .wait(Promise.resolve('ended'))
    .catch((error: unknown) => error);
  expect(failure).toMatchObject({
    message: 'Call ended before stage: provider',
  });
});

test('offline native fetch cannot follow a registered origin into an unregistered target', async () => {
  let targetCalls = 0;
  const target = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    fetch: () => {
      targetCalls++;
      return new Response('unexpected target');
    },
  });
  const origin = Bun.serve({
    hostname: '127.0.0.1',
    port: 0,
    fetch: () =>
      new Response(null, {
        status: 302,
        headers: { Location: `http://127.0.0.1:${target.port}/leak` },
      }),
  });
  const network = installOfflineGuard();
  const disallow = allowLoopback(`http://127.0.0.1:${origin.port}`);
  try {
    const result = await fetch(`http://127.0.0.1:${origin.port}`).then(
      (response) => response.text(),
      (error: unknown) => error,
    );
    expect(result).toBeInstanceOf(Error);
    expect(targetCalls).toBe(0);
    expect(() => network.verify()).toThrow('Unexpected native network');
  } finally {
    network.dispose();
    disallow();
    await origin.stop(true);
    await target.stop(true);
  }
});

test('strict expectations match the business body before consuming equal endpoint requests', async () => {
  await withScenario(
    [
      { url, method: 'POST', body: 'key=A', response: () => new Response('A') },
      { url, method: 'POST', body: 'key=B', response: () => new Response('B') },
    ],
    async ({ fetcher, sent }) => {
      expect(
        await (await fetcher(url, { method: 'POST', body: 'key=B' })).text(),
      ).toBe('B');
      expect(
        await (await fetcher(url, { method: 'POST', body: 'key=A' })).text(),
      ).toBe('A');
      expect(sent).toHaveLength(2);
    },
  );
});
