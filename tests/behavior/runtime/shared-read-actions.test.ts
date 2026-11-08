import { expect, test } from 'bun:test';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { createHanaMusicApi, invokeModule, lyric } from '../../../index.ts';
import { buildCallServices, runCall } from '../../../src/core/call.ts';
import { decodeLegacyModuleInput } from '../../../src/core/module-input.ts';
import type { ModuleActions } from '../../../src/core/request-actions.ts';
import { createClientFromContext } from '../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../src/server/create-server.ts';
import type { ModuleEffect, ModuleQuery } from '../../../src/types/index.ts';
import { settle } from '../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../_kit/harness/sdk.ts';
import { runEffect } from '../../_kit/it.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../_kit/upstream/wire.ts';

const declaredRead: ModuleEffect<ModuleQuery> = (_input, request) =>
  Effect.gen(function* () {
    const response = yield* request('read', { data: {} });
    return {
      status: response.status,
      body: response.body,
      cookie: [...response.cookie],
    };
  });

test('declared search profile owns the final request despite conflicting config', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/search/get',
        method: 'POST',
        headers: { 'x-aeapi': null, 'X-antiCheatToken': null },
        check: (wire) => {
          expect(wire.headers.get('user-agent')).toBe(
            'NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)',
          );
          expect(wire.headers.get('cookie')).toContain('os=iPhone%20OS');
          expect(wire.headers.get('cookie')).toContain('MUSIC_U=reader');
        },
        response: () => Response.json({ code: 200, result: { songs: [] } }),
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=reader; os=android',
        fetcher: scenario.fetcher,
      });
      expect((await client.search({ keywords: 'same' })).status).toBe(200);
      expect(scenario.entries).toHaveLength(1);
    },
  );
});

test('five declared read branches preserve wire payloads and share only matching requests', async () => {
  const cases = [
    {
      module: 'search',
      query: { keywords: 'same' },
      path: '/api/search/get',
      data: { s: 'same', type: 1, limit: 30, offset: 0 },
      body: { code: 200, result: { songs: [] } },
    },
    {
      module: 'search',
      query: { keywords: 'same', type: 2000 },
      path: '/api/search/voice/get',
      data: { keyword: 'same', scene: 'normal', limit: 30, offset: 0 },
      body: { code: 200, data: [] },
    },
    {
      module: 'lyric',
      query: { id: 7 },
      path: '/api/song/lyric',
      data: { id: 7, tv: -1, lv: -1, rv: -1, kv: -1, _nmclfl: 1 },
      body: { code: 200, lrc: { lyric: 'sample' } },
    },
    {
      module: 'song_detail',
      query: { ids: '7, 8' },
      path: '/api/v3/song/detail',
      data: { c: '[{"id":7},{"id":8}]' },
      body: { code: 200, songs: [], privileges: [] },
    },
    {
      module: 'playlist_detail',
      query: { id: 7 },
      path: '/api/v6/playlist/detail',
      data: { id: 7, n: 100000, s: 8 },
      body: { code: 200, playlist: { id: 7, trackIds: [] } },
    },
  ] as const;
  for (const entry of cases) {
    const web = entry.module === 'song_detail';
    const began = createStage('read sent');
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await withScenario(
      [
        {
          url: `${web ? 'https://music.163.com/weapi' : 'https://interface.music.163.com/eapi'}/${entry.path.slice(5)}`,
          method: 'POST',
          check: (wire) => {
            const decoded = web
              ? readWebBody(wire.body)
              : readEapiBody(wire.body).data;
            expect(decoded).toMatchObject({ ...entry.data, e_r: false });
            if (!web) {
              expect(readEapiBody(wire.body).path).toBe(entry.path);
              expect(decoded).toMatchObject({
                header: {
                  os: 'iPhone OS',
                  appver: '9.0.90',
                  channel: 'distribution',
                  MUSIC_U: 'reader',
                  MUSIC_A: 'anonymous-reader',
                },
              });
            }
            expect(wire.headers.get('cookie')).toContain(
              web ? 'os=web' : 'os=iPhone%20OS',
            );
            expect(wire.headers.get('X-antiCheatToken')).toBeNull();
          },
          response: async () => {
            began.reach();
            await held;
            return Response.json(entry.body);
          },
        },
      ],
      async (scenario) => {
        const config = {
          cookie: 'MUSIC_U=reader; MUSIC_A=anonymous-reader',
          cache: { ttlMs: 120000 },
        };
        const services = buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        });
        const client = createClientFromContext(config, services);
        const invoke = () =>
          entry.module === 'search'
            ? client.search(entry.query)
            : entry.module === 'lyric'
              ? client.lyric(entry.query)
              : entry.module === 'song_detail'
                ? client.songDetail(entry.query)
                : client.playlistDetail(entry.query);
        const first = invoke();
        const second = invoke();
        await began.wait(Promise.all([first, second]));
        release();
        const [left, right] = await Promise.all([first, second]);
        expect(left).toEqual(right);
        expect(left.body).not.toBe(right.body);
        left.cookie.push('local-change');
        expect(right.cookie).not.toContain('local-change');
        expect(await invoke()).toEqual(right);
        expect(scenario.entries).toHaveLength(1);
        expect(services.reads.snapshot).toMatchObject({
          inflight: 0,
          cacheHits: 1,
        });
      },
      release,
    );
  }
});

test('public reads isolate identity, business parameters, and transport and do not cache by default', async () => {
  const expected = {
    url: 'https://interface.music.163.com/eapi/search/get',
    method: 'POST',
    times: 6,
    response: () => Response.json({ code: 200, result: { songs: [] } }),
  };
  await withScenario([expected], async (scenario) => {
    const config = {
      cookie: 'MUSIC_U=one',
      fetcher: scenario.fetcher,
      cache: { ttlMs: 1000 },
    };
    const client = createHanaMusicApi(config);
    await client.search({ keywords: 'same' });
    await client.search({ keywords: 'same' });
    expect(scenario.entries).toHaveLength(1);
    await client.search({ keywords: 'same' }, { cookie: 'MUSIC_U=two' });
    await client.search({ keywords: 'different' });
    await client.search(
      { keywords: 'same' },
      { fetcher: (input, init) => scenario.fetcher(input, init) },
    );
    const uncached = createHanaMusicApi({
      cookie: config.cookie,
      fetcher: scenario.fetcher,
    });
    await uncached.search({ keywords: 'same' });
    await uncached.search({ keywords: 'same' });
    expect(scenario.entries).toHaveLength(6);
  });
});

test('effective action profiles and targets isolate the same account in one ReadStore', async () => {
  const actions = [
    { profile: 'web', target: '/api/search/get' },
    { profile: 'eapi', target: '/api/search/get' },
    { profile: 'eapi', target: '/api/search/voice/get' },
  ] as const;
  const sources: Array<unknown> = [];
  const urls: Array<string> = [];
  const fetcher = async (input: Request | URL | string) => {
    const url = input instanceof Request ? input.url : String(input);
    urls.push(url);
    return Response.json({ code: 200, source: url });
  };
  const services = buildCallServices({ cache: { ttlMs: 1000 } }, false);
  for (const action of actions) {
    const result = await runCall(
      {
        identifier: 'search',
        input: {},
        config: { cookie: 'MUSIC_U=same', fetcher },
      },
      services,
      {
        identifier: 'search',
        route: '/search',
        decodeInput: decodeLegacyModuleInput,
        execute: declaredRead,
        actions: {
          read: {
            ...action,
            semantic: 'read',
            cache: 'shared',
            retry: 'read',
          },
        } satisfies ModuleActions,
      },
    );
    sources.push(result.body);
  }
  expect(urls).toEqual([
    'https://music.163.com/weapi/search/get',
    'https://interface.music.163.com/eapi/search/get',
    'https://interface.music.163.com/eapi/search/voice/get',
  ]);
  expect(new Set(sources.map((body) => JSON.stringify(body))).size).toBe(3);
});

test('read semantic alone grants neither shared cache nor wider retries', async () => {
  const services = buildCallServices({ cache: { ttlMs: 1000 } }, false);
  let sends = 0;
  const action = {
    profile: 'web',
    target: '/api/custom/read',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  } as const;
  let fail = false;
  const fetcher = async () => {
    sends += 1;
    if (fail) throw new Error('fetch failed');
    return Response.json({ code: 200 });
  };
  const invoke = () =>
    runCall(
      {
        identifier: 'unclassified',
        input: {},
        config: {
          cookie: 'MUSIC_U=one',
          retry: { retryNonIdempotent: true, backoffMs: 0 },
          fetcher,
        },
      },
      services,
      {
        identifier: 'unclassified',
        route: '/custom',
        decodeInput: decodeLegacyModuleInput,
        actions: { read: action },
        execute: declaredRead,
      },
    );
  await Promise.all([invoke(), invoke()]);
  await invoke();
  expect(sends).toBe(3);
  fail = true;
  expect(await settle(invoke())).toMatchObject({ rejected: { status: 502 } });
  expect(sends).toBe(4);
  expect(services.reads.snapshot).toMatchObject({
    cacheHits: 0,
    merged: 0,
    inflight: 0,
  });
});

test.each([
  { failure: 'EAI_AGAIN', retry: undefined, attempts: 3, success: true },
  { failure: 'fetch failed', retry: undefined, attempts: 1, success: false },
  {
    failure: 'fetch failed',
    retry: { retryNonIdempotent: true, retries: 1 },
    attempts: 2,
    success: true,
  },
])(
  'declared reads retain $failure retry boundary with $attempts attempts',
  async ({ failure, retry, attempts, success }) => {
    let sends = 0;
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=reader',
      retry: { ...retry, backoffMs: 0, jitter: false },
      fetcher: async () => {
        sends += 1;
        if (sends < attempts || !success) throw new Error(failure);
        return Response.json({ code: 200, result: { songs: [] } });
      },
    });
    expect(await settle(client.search({ keywords: 'same' }))).toMatchObject(
      success ? { resolved: { status: 200 } } : { rejected: { status: 502 } },
    );
    expect(sends).toBe(attempts);
  },
);

test.each([400, 429, 503])(
  'declared reads neither retry nor cache business %i failures',
  async (code) => {
    await withScenario(
      [
        {
          url: 'https://interface.music.163.com/eapi/search/get',
          method: 'POST',
          times: 2,
          response: () => Response.json({ code, msg: 'rejected' }),
        },
      ],
      async (scenario) => {
        const client = createHanaMusicApi({
          cookie: 'MUSIC_U=reader',
          cache: { ttlMs: 1000 },
          fetcher: scenario.fetcher,
          retry: {
            retryNonIdempotent: true,
            retries: 5,
            statusCodes: [400, 429, 503],
            backoffMs: 0,
          },
        });
        for (let index = 0; index < 2; index += 1)
          expect(
            await settle(client.search({ keywords: 'same' })),
          ).toMatchObject({ rejected: { status: code, body: { code } } });
        expect(scenario.entries).toHaveLength(2);
      },
    );
  },
);

test('named, dynamic and real HTTP loader entries execute the declared profiles', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/song/lyric',
        method: 'POST',
        times: 2,
        check: (wire) =>
          expect(
            String((readEapiBody(wire.body).data as { id: unknown }).id),
          ).toBe('7'),
        response: () => Response.json({ code: 200, lrc: { lyric: 'sample' } }),
      },
      {
        url: 'https://music.163.com/weapi/v3/song/detail',
        method: 'POST',
        response: () => Response.json({ code: 200, songs: [], privileges: [] }),
      },
      {
        url: 'https://interface.music.163.com/eapi/v6/playlist/detail',
        method: 'POST',
        response: () =>
          Response.json({ code: 200, playlist: { id: 7, trackIds: [] } }),
      },
    ],
    async (scenario) => {
      const config = { cookie: 'MUSIC_U=reader', fetcher: scenario.fetcher };
      expect((await lyric({ id: 7 }, config)).status).toBe(200);
      expect(
        (await invokeModule('song_detail', { ids: 7 }, config)).status,
      ).toBe(200);
      const server = await createServer(
        {},
        { execution: { fetcher: scenario.fetcher } },
      );
      expect(
        (
          await server.request('/lyric?id=7', {
            headers: { cookie: 'MUSIC_U=reader' },
          })
        ).status,
      ).toBe(200);
      expect(
        (
          await server.request('/playlist/detail?id=7', {
            headers: { cookie: 'MUSIC_U=reader' },
          })
        ).status,
      ).toBe(200);
    },
  );
});

test('shared body readers keep independent cancellation and deadlines until the last waiter leaves', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        const reading = createStage('body read');
        const finalReading = createStage('final body read');
        let bodyController!: ReadableStreamDefaultController<Uint8Array>;
        let cancelled = 0;
        let aborted = 0;
        let sends = 0;
        const services = buildCallServices({}, false, {
          clock,
          fetcher: async (_input, init) => {
            sends += 1;
            init?.signal?.addEventListener(
              'abort',
              () => {
                aborted += 1;
              },
              { once: true },
            );
            return new Response(
              new ReadableStream<Uint8Array>(
                {
                  start: (controller) => {
                    bodyController = controller;
                  },
                  pull: () => {
                    if (sends === 1) reading.reach();
                    else finalReading.reach();
                  },
                  cancel: () => {
                    cancelled += 1;
                  },
                },
                { highWaterMark: 0 },
              ),
            );
          },
        });
        const client = createClientFromContext(
          { cookie: 'MUSIC_U=reader' },
          services,
        );
        const controller = new AbortController();
        const first = settle(
          client.search(
            { keywords: 'body' },
            { signal: controller.signal, timeoutMs: 1000 },
          ),
        );
        const short = settle(
          client.search({ keywords: 'body' }, { timeoutMs: 100 }),
        );
        const survivor = client.search(
          { keywords: 'body' },
          { timeoutMs: 1000 },
        );
        yield* Effect.promise(() =>
          reading.wait(Promise.all([first, short, survivor])),
        );
        controller.abort();
        const firstResult = yield* Effect.promise(() => first);
        expect(firstResult).toMatchObject({
          rejected: { status: 499 },
        });
        yield* clock.adjust(100);
        const shortResult = yield* Effect.promise(() => short);
        expect(shortResult).toMatchObject({
          rejected: { status: 504 },
        });
        expect(cancelled).toBe(0);
        bodyController.enqueue(
          new TextEncoder().encode('{"code":200,"result":{"songs":[]}}'),
        );
        bodyController.close();
        const survivorResult = yield* Effect.promise(() => survivor);
        expect(survivorResult.status).toBe(200);
        expect(sends).toBe(1);
        expect(services.reads.snapshot.inflight).toBe(0);

        const final = new AbortController();
        const pending = settle(
          client.search({ keywords: 'last' }, { signal: final.signal }),
        );
        yield* Effect.promise(() => finalReading.wait(pending));
        final.abort();
        const finalResult = yield* Effect.promise(() => pending);
        expect(finalResult).toMatchObject({
          rejected: { status: 499 },
        });
        expect(cancelled).toBe(1);
        expect(aborted).toBe(1);
        expect(services.reads.snapshot.inflight).toBe(0);
      }),
    ),
  );
});
