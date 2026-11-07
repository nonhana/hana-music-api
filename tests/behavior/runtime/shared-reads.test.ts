import { describe, expect, test } from 'bun:test';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi } from '../../../index.ts';
import { buildCallServices, Call, runCall } from '../../../src/core/call.ts';
import { ReadStore } from '../../../src/core/read-store.ts';
import search, {
  decodeModuleInput as decodeSearchInput,
  moduleActions as searchActions,
} from '../../../src/modules/search.ts';
import { createClientFromContext } from '../../../src/sdk/generated/client-factory.generated.ts';
import type {
  FetchLike,
  ModuleQuery,
  RequestCapability,
} from '../../../src/types/index.ts';
import { settle } from '../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../_kit/harness/sdk.ts';
import { runEffect } from '../../_kit/it.ts';
import {
  moduleResponse,
  moduleRuntime,
  testRequest,
} from '../../_kit/module.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readEapiBody } from '../../_kit/upstream/wire.ts';

const searchImplementation = (
  _query: Record<string, unknown>,
  request: RequestCapability,
) => testRequest(request, '/api/search/get', {}, { crypto: 'api' });

describe('module ownership', () => {
  test('a real Effect read shares transport and isolates identity, target, and protocol', async () => {
    const services = buildCallServices({ cache: { ttlMs: 120_000 } }, false);
    let calls = 0;
    const fetcher: FetchLike = async (url, init) => {
      calls += 1;
      await Bun.sleep(10);
      return Response.json({
        code: 200,
        target:
          typeof url === 'string'
            ? url
            : url instanceof URL
              ? url.href
              : url.url,
        cookie: new Headers(init?.headers).get('cookie'),
      });
    };
    const definition = {
      identifier: 'search',
      route: '/search',
      decodeInput: decodeSearchInput,
      execute: search,
      actions: searchActions,
    };
    const invoke = (config = {}) =>
      runCall(
        {
          identifier: 'search',
          input: { keywords: 'same' },
          config: {
            cookie: 'MUSIC_U=effect-first',
            crypto: 'api',
            fetcher,
            ...config,
          },
        },
        services,
        definition,
      );
    const [first, second] = await Promise.all([invoke(), invoke()]);
    expect(first).toEqual(second);
    expect(first.body).not.toBe(second.body);
    expect(calls).toBe(1);
    await invoke();
    expect(calls).toBe(1);
    expect(
      (await invoke({ cookie: 'MUSIC_U=effect-second' })).body,
    ).toMatchObject({
      cookie: expect.stringContaining('MUSIC_U=effect-second'),
    });
    expect(
      (await invoke({ domain: 'https://music.163.com' })).body,
    ).toMatchObject({
      target: 'https://interface.music.163.com/eapi/search/get',
    });
    expect((await invoke({ crypto: 'weapi' })).body).toMatchObject({
      target: 'https://interface.music.163.com/eapi/search/get',
    });
    expect(calls).toBe(4);
  });

  test('ReadStore shares an Effect and clones each waiter result', async () => {
    const store = new ReadStore<{ nested: { value: string } }, never>(120_000);
    let calls = 0;
    const effect = Effect.promise(async () => {
      calls += 1;
      await Bun.sleep(5);
      return { nested: { value: 'original' } };
    });

    const [first, second] = await Promise.all([
      runEffect(store.run('same', effect, { cache: true })),
      runEffect(store.run('same', effect, { cache: true })),
    ]);
    first.nested.value = 'changed';
    expect(second.nested.value).toBe('original');
    expect(calls).toBe(1);
  });

  test('ReadStore interrupts the upstream when its last Effect waiter leaves', async () => {
    const store = new ReadStore<number, Error>(null);
    let aborted = false;
    const effect = Effect.tryPromise({
      try: (signal) =>
        new Promise<number>((_resolve, _reject) => {
          signal.addEventListener(
            'abort',
            () => {
              aborted = true;
            },
            { once: true },
          );
        }),
      catch: (error) =>
        error instanceof Error ? error : new Error(String(error)),
    });
    const waiter = new AbortController();
    const pending = runEffect(store.run('cancel', effect), undefined, {
      signal: waiter.signal,
    });
    await Bun.sleep(1);
    waiter.abort();
    await pending.catch(() => undefined);
    expect(aborted).toBe(true);
    expect(store.snapshot.inflight).toBe(0);
  });

  test('ReadStore TTL follows the provided TestClock', async () => {
    const store = new ReadStore<{ value: number }, never>(1_000);
    let calls = 0;
    await runEffect(
      Effect.gen(function* () {
        const run = () =>
          store.run(
            'clock',
            Effect.sync(() => ({ value: ++calls })),
            {
              cache: true,
              cacheable: () => true,
            },
          );
        yield* run();
        yield* run();
        expect(calls).toBe(1);
        yield* TestClock.adjust('1 second');
        yield* run();
      }),
      TestClock.layer(),
    );
    expect(calls).toBe(2);
  });

  test.each([null, 120_000])(
    'shared reads return independent responses with TTL %j',
    async (ttl) => {
      const modules = moduleRuntime(ttl);
      let calls = 0;
      const implementation = () =>
        Effect.gen(function* () {
          calls += 1;
          yield* Effect.sleep(10);
          return {
            status: 200,
            cookie: ['original'],
            body: { code: 200, nested: { value: 'original' } },
          };
        }).pipe(Effect.map(moduleResponse));
      const [first, second] = await Promise.all([
        modules.invoke('search', implementation, {}),
        modules.invoke('search', implementation, {}),
      ]);
      (first.body as { nested: { value: string } }).nested.value = 'changed';
      first.cookie.push('changed');
      first.status = 400;
      expect(second).toEqual({
        status: 200,
        cookie: ['original'],
        body: { code: 200, nested: { value: 'original' } },
      });
      expect(calls).toBe(1);
      expect(modules.snapshot.inflight).toBe(0);
    },
  );

  test.each(['eapi', 'weapi'] as const)(
    '%s plaintext business 429 with e_r enabled never becomes a cached success',
    async (crypto) => {
      const modules = moduleRuntime();
      let calls = 0;
      const config = {
        crypto,
        e_r: true,
        cookie: 'MUSIC_U=limited-reader',
        fetcher: async () => {
          calls += 1;
          return Response.json({ code: 429, msg: 'limited' });
        },
      };
      const invoke = () =>
        modules
          .invoke(
            'search',
            (_query: ModuleQuery, request: RequestCapability) =>
              testRequest(request, '/api/search/get', {}).pipe(
                Effect.map(moduleResponse),
              ),
            {},
            config,
          )
          .catch((error: unknown) => error);

      expect(await invoke()).toMatchObject({
        status: 429,
        body: { code: 429, msg: 'limited' },
      });
      expect(await invoke()).toMatchObject({ status: 429 });
      expect(calls).toBe(2);
      expect(modules.snapshot.cacheHits).toBe(0);
    },
  );

  test('module headers survive absent ingress headers and retain caller headers', async () => {
    const modules = moduleRuntime();
    let headers: Headers | undefined;
    const fetcher: FetchLike = async (_url, init) => {
      headers = new Headers(init?.headers);
      return Response.json({ code: 200 });
    };
    await modules.invoke(
      'voice_upload',
      (_query: ModuleQuery, request: RequestCapability) =>
        testRequest(
          request,
          '/api/voice/workbench/voice/batch/upload/preCheck',
          {},
          {
            crypto: 'api',
            headers: { 'x-nos-token': 'stage-token' },
          },
        ).pipe(Effect.map(moduleResponse)),
      {},
      {
        cookie: 'MUSIC_A=test',
        fetcher,
        headers: {
          'x-client': 'client',
          'x-nos-token': 'older-token',
          'X-Nos-Token': 'old-token',
        },
      },
    );
    expect(headers?.get('x-client')).toBe('client');
    expect(headers?.get('x-nos-token')).toBe('stage-token');
    await modules.invoke(
      'voice_upload',
      (_query: ModuleQuery, request: RequestCapability) =>
        testRequest(
          request,
          '/api/voice/workbench/voice/batch/upload/v2',
          {},
          {
            crypto: 'api',
            headers: { 'x-nos-token': 'stage-token' },
          },
        ).pipe(Effect.map(moduleResponse)),
      {},
      { cookie: 'MUSIC_A=test', fetcher, headers: undefined },
    );
    expect(headers?.get('x-nos-token')).toBe('stage-token');
  });

  test('100 identical reads share one outbound attempt; keys isolate identity and transport', async () => {
    const modules = moduleRuntime();
    let calls = 0;
    const fetcher: FetchLike = async () => {
      calls += 1;
      await Bun.sleep(10);
      return Response.json({ code: 200, calls });
    };
    const invoke = (cookie = 'MUSIC_U=first', transport = fetcher) =>
      modules.invoke(
        'search',
        searchImplementation,
        { key: 'same' },
        { cookie, fetcher: transport },
      );
    await Promise.all(Array.from({ length: 100 }, () => invoke()));
    expect(calls).toBe(1);
    await invoke('MUSIC_U=second');
    await invoke('MUSIC_U=first', async () => {
      calls += 1;
      return Response.json({ code: 200 });
    });
    expect(calls).toBe(3);
    expect(modules.snapshot.inflight).toBe(0);
  });

  test('read keys isolate different module implementations', async () => {
    const modules = moduleRuntime(120_000);
    const first = await modules.invoke(
      'search',
      () =>
        Effect.sync(() => ({
          status: 200,
          cookie: [],
          body: { code: 200, value: 'first' },
        })).pipe(Effect.map(moduleResponse)),
      {},
    );
    const second = await modules.invoke(
      'search',
      () =>
        Effect.sync(() => ({
          status: 200,
          cookie: [],
          body: { code: 200, value: 'second' },
        })).pipe(Effect.map(moduleResponse)),
      {},
    );
    expect(first.body).toMatchObject({ value: 'first' });
    expect(second.body).toMatchObject({ value: 'second' });
  });

  test('read keys isolate explicit domains and protocols', async () => {
    const modules = moduleRuntime();
    let calls = 0;
    const fetcher: FetchLike = async (url) => {
      calls += 1;
      const target =
        typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
      return Response.json({ code: 200, target });
    };
    for (const config of [
      { domain: 'https://music.163.com', crypto: 'api' },
      { domain: 'https://interface.music.163.com', crypto: 'api' },
      { domain: 'https://music.163.com', crypto: 'weapi' },
    ] as const) {
      const response = await modules.invoke(
        'search',
        searchImplementation,
        {},
        { ...config, fetcher, cookie: 'MUSIC_U=test' },
      );
      expect(response.body).toMatchObject({
        target: `${config.domain}/${config.crypto === 'weapi' ? 'weapi' : 'api'}/search/get`,
      });
    }
    expect(calls).toBe(3);
  });

  test('cache keys distinguish keys containing separators', async () => {
    const modules = moduleRuntime();
    let calls = 0;
    const handler = (query: ModuleQuery) =>
      Effect.sync(() => {
        calls += 1;
        return { status: 200, cookie: [], body: { code: 200, query } };
      }).pipe(Effect.map(moduleResponse));
    await modules.invoke('search', handler, { keywords: 'demo', type: '1' });
    await modules.invoke('search', handler, { 'keywords:"demo",type': '1' });
    expect(calls).toBe(2);
  });

  test('one waiter can cancel; the final waiter interrupts the upstream', async () => {
    const modules = moduleRuntime();
    let aborts = 0;
    let calls = 0;
    const fetcher: FetchLike = async (_url, init) => {
      calls += 1;
      init?.signal?.addEventListener(
        'abort',
        () => {
          aborts += 1;
        },
        { once: true },
      );
      await Bun.sleep(30);
      return Response.json({ code: 200 });
    };
    const invoke = (key: string, signal: AbortSignal) =>
      modules.invoke(
        'search',
        searchImplementation,
        { key },
        { cookie: 'MUSIC_U=test', fetcher, signal },
      );
    const first = new AbortController();
    const second = new AbortController();
    const pendingFirst = invoke('one', first.signal);
    const pendingSecond = invoke('one', second.signal);
    first.abort();
    expect(pendingFirst).rejects.toMatchObject({ status: 499 });
    expect((await pendingSecond).status).toBe(200);
    expect(aborts).toBe(0);
    expect(calls).toBe(1);
    const last = new AbortController();
    const pendingLast = invoke('two', last.signal);
    await Bun.sleep(1);
    last.abort();
    expect(pendingLast).rejects.toMatchObject({ status: 499 });
    await Bun.sleep(1);
    expect(aborts).toBe(1);
    expect(modules.snapshot.inflight).toBe(0);
  });

  test('waiter timeouts are independent while the shared upstream continues', async () => {
    const modules = moduleRuntime();
    let calls = 0;
    const implementation = () =>
      Effect.gen(function* () {
        calls += 1;
        yield* Effect.sleep(35);
        return { status: 200, cookie: [], body: { code: 200 } };
      }).pipe(Effect.map(moduleResponse));
    const first = modules.invoke(
      'search',
      implementation,
      { key: 'timeout' },
      { timeoutMs: 10 },
    );
    await Bun.sleep(2);
    const second = modules.invoke(
      'search',
      implementation,
      { key: 'timeout' },
      { timeoutMs: 100 },
    );

    expect(first).rejects.toMatchObject({ status: 504, body: { code: 504 } });
    expect((await second).status).toBe(200);
    expect(calls).toBe(1);
    expect(modules.snapshot.inflight).toBe(0);
  });

  test('writes, polling and non-200 business codes are never cached', async () => {
    const modules = moduleRuntime();
    let calls = 0;
    const handler = () =>
      Effect.sync(() => {
        calls += 1;
        return { status: 200, cookie: [], body: { code: 200 } };
      }).pipe(Effect.map(moduleResponse));
    for (const like of [true, false, true]) {
      await modules.invoke('like', handler, { like });
    }
    for (let index = 0; index < 2; index += 1) {
      await modules.invoke('login_qr_check', handler, {});
    }
    for (const code of [400, 429]) {
      for (let index = 0; index < 2; index += 1) {
        await modules.invoke(
          'search',
          () =>
            Effect.sync(() => {
              calls += 1;
              return { status: 200, cookie: [], body: { code } };
            }).pipe(Effect.map(moduleResponse)),
          {},
        );
      }
    }
    expect(calls).toBe(9);
  });
});

test('strict shared public reads execute exactly one upstream request', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/search/get',
        method: 'POST',
        response: async () => {
          await Bun.sleep(5);
          return Response.json({ code: 200, result: { songs: [] } });
        },
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=strict-reader',
        crypto: 'api',
        fetcher: scenario.fetcher,
      });
      const [first, second] = await Promise.all([
        client.search({ keywords: 'same' }),
        client.search({ keywords: 'same' }),
      ]);
      expect(first).toEqual(second);
      expect(first.body).not.toBe(second.body);
      expect(scenario.entries).toHaveLength(1);
    },
  );
});

test('internal instance fetcher reaches the same request chain without public config', async () => {
  let sent = 0;
  const services = buildCallServices({}, false, {
    fetcher: async () => {
      sent += 1;
      return Response.json({ code: 200, result: { songs: [] } });
    },
  });
  const result = await runCall(
    {
      identifier: 'search',
      input: { keywords: 'internal' },
      config: { cookie: 'MUSIC_U=internal', crypto: 'api' },
    },
    services,
    {
      identifier: 'search',
      route: '/search',
      decodeInput: decodeSearchInput,
      execute: search,
      actions: searchActions,
    },
  ).catch((error: unknown) => error);
  expect(sent).toBe(1);
  expect(result).toMatchObject({ status: 200 });
});

test('internal instances isolate fetcher, clock, entropy and public config priority', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const firstClock = yield* TestClock.make();
        const secondClock = yield* TestClock.make();
        yield* firstClock.setTime(100);
        yield* secondClock.setTime(200);
        const requests: Array<{ owner: string; body: string; cookie: string }> =
          [];
        const make = (owner: string, clock: typeof firstClock) => {
          const config = {
            cookie: `MUSIC_U=${owner}`,
            crypto: 'weapi' as const,
            cache: { ttlMs: 1000 },
          };
          const execution = {
            clock,
            entropy: (now: number) => ({
              ...testEntropy(now),
              weapiSecret:
                owner === 'first' ? 'aaaaaaaaaaaaaaaa' : 'bbbbbbbbbbbbbbbb',
            }),
            fetcher: async (
              _input: Request | URL | string,
              init?: RequestInit,
            ) => {
              requests.push({
                owner,
                body: typeof init?.body === 'string' ? init.body : '',
                cookie: new Headers(init?.headers).get('cookie') ?? '',
              });
              return Response.json({ code: 200, result: { songs: [] } });
            },
          };
          return createClientFromContext(
            config,
            buildCallServices(config, false, execution),
          );
        };
        const first = make('first', firstClock);
        const second = make('second', secondClock);
        yield* Effect.promise(() =>
          Promise.all([
            first.search({ keywords: 'same' }),
            second.search({ keywords: 'same' }),
          ]),
        );
        expect(requests.map((request) => request.owner).toSorted()).toEqual([
          'first',
          'second',
        ]);
        expect(requests[0]!.body).not.toBe(requests[1]!.body);
        expect(
          readEapiBody(
            requests.find((request) => request.owner === 'first')!.body,
          ),
        ).toMatchObject({ data: { s: 'same' } });
        expect(
          readEapiBody(
            requests.find((request) => request.owner === 'second')!.body,
          ),
        ).toMatchObject({ data: { s: 'same' } });
        expect(
          requests.find((request) => request.owner === 'first')!.cookie,
        ).toContain('MUSIC_U=first');
        expect(
          requests.find((request) => request.owner === 'second')!.cookie,
        ).toContain('MUSIC_U=second');
        yield* firstClock.adjust(1000);
        yield* Effect.promise(() =>
          Promise.all([
            first.search({ keywords: 'same' }),
            second.search({ keywords: 'same' }),
          ]),
        );
        expect(
          requests.filter((request) => request.owner === 'first'),
        ).toHaveLength(2);
        expect(
          requests.filter((request) => request.owner === 'second'),
        ).toHaveLength(1);
        let overrides = 0;
        yield* Effect.promise(() =>
          first.search(
            { keywords: 'same' },
            {
              fetcher: async () => {
                overrides += 1;
                return Response.json({ code: 200, result: { songs: [] } });
              },
            },
          ),
        );
        expect(overrides).toBe(1);
      }),
    ),
  );
});

test('controlled shared waiters keep independent deadlines and cancel the last upstream', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        const began = createStage('shared transport');
        let aborted = false;
        let sends = 0;
        const config = {
          cookie: 'MUSIC_U=controlled-read',
          crypto: 'api' as const,
        };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, {
            clock,
            entropy: testEntropy,
            fetcher: async (_input, init) => {
              sends += 1;
              began.reach();
              return new Promise<Response>((_resolve, reject) => {
                init?.signal?.addEventListener(
                  'abort',
                  () => {
                    aborted = true;
                    reject(new DOMException('aborted', 'AbortError'));
                  },
                  { once: true },
                );
              });
            },
          }),
        );
        const controller = new AbortController();
        const first = settle(
          client.search({ keywords: 'same' }, { timeoutMs: 100 }),
        );
        const second = settle(
          client.search(
            { keywords: 'same' },
            { timeoutMs: 1000, signal: controller.signal },
          ),
        );
        yield* Effect.promise(() => began.wait(Promise.all([first, second])));
        yield* clock.adjust(100);
        const firstResult = yield* Effect.promise(() => first);
        expect(firstResult).toMatchObject({
          rejected: { status: 504 },
        });
        expect(aborted).toBe(false);
        controller.abort();
        const secondResult = yield* Effect.promise(() => second);
        expect(secondResult).toMatchObject({
          rejected: { status: 499 },
        });
        expect(aborted).toBe(true);
        expect(sends).toBe(1);
      }),
    ),
  );
});

test('explicit runCall clock takes precedence over the instance clock', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const instance = yield* TestClock.make();
        const explicit = yield* TestClock.make();
        yield* instance.setTime(100);
        yield* explicit.setTime(300);
        const result = yield* Effect.promise(() =>
          runCall(
            {
              identifier: 'clock-probe',
              input: { keywords: 'clock' },
              config: { cookie: 'MUSIC_U=clock' },
            },
            buildCallServices({}, false, { clock: instance }),
            {
              identifier: 'clock-probe',
              route: '/clock',
              decodeInput: decodeSearchInput,
              execute: () =>
                Effect.map(Call, (call) => ({
                  status: 200,
                  cookie: [],
                  body: { code: 200, now: call.startedAt },
                })),
            },
            undefined,
            explicit,
          ),
        );
        expect(result.body).toMatchObject({ now: 300 });
      }),
    ),
  );
});
