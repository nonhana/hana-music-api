import { describe, expect, spyOn, test } from 'bun:test';

import { Effect } from 'effect';

import { createHanaMusicApi, invokeModule } from '../../index.ts';
import { invokeModule as invokeProgrammatic } from '../../src/app/module-api.ts';
import { Call } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { ProtocolFailed, TransportFailed } from '../../src/core/errors.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { getRuntimeState } from '../../src/core/runtime.ts';
import lyric from '../../src/modules/lyric.ts';
import playlistDetail from '../../src/modules/playlist_detail.ts';
import search from '../../src/modules/search.ts';
import songDetail from '../../src/modules/song_detail.ts';
import { createServer } from '../../src/server/create-server.ts';
import type {
  ModuleCallConfig,
  ModuleQuery,
  RequestCapability,
  RequestIntent,
} from '../../src/types/index.ts';
import { runEffect } from '../_kit/it.ts';

// song_detail 和 playlist_detail 会校验返回体，共用的假返回体带上它们声明的字段。
const extraBody = {
  code: 200,
  songs: [],
  playlist: {
    id: 12,
    name: 'playlist',
    coverImgUrl: 'https://p1.music.126.net/cover.jpg',
    trackCount: 0,
    trackIds: [],
    creator: { userId: 1, nickname: 'listener' },
    subscribed: false,
    updateTime: 0,
    trackUpdateTime: 0,
    description: null,
  },
  future: { nested: [null, 'kept', { enabled: true }] },
};
const scenarios = [
  {
    identifier: 'search',
    input: { keywords: 'hello' },
    target: '/api/search/get',
  },
  { identifier: 'lyric', input: { id: '12' }, target: '/api/song/lyric' },
  {
    identifier: 'song_detail',
    input: { ids: '12, 34' },
    target: '/api/v3/song/detail',
  },
  {
    identifier: 'playlist_detail',
    input: { id: 12 },
    target: '/api/v6/playlist/detail',
  },
] as const;

describe('ordinary read Effect modules', () => {
  test.each([
    {
      module: search,
      input: { keywords: 'hello' },
      target: '/api/search/get',
      body: { s: 'hello', type: 1, limit: 30, offset: 0 },
      protocol: 'eapi',
    },
    {
      module: search,
      input: { keywords: 'voice', type: '2000', limit: '5', offset: '2' },
      target: '/api/search/voice/get',
      body: { keyword: 'voice', scene: 'normal', limit: '5', offset: '2' },
      protocol: 'eapi',
    },
    {
      module: search,
      input: { keywords: 'hello', type: '9999', limit: 0, offset: 0 },
      target: '/api/search/get',
      body: { s: 'hello', type: '9999', limit: 30, offset: 0 },
      protocol: 'eapi',
    },
    {
      module: lyric,
      input: { id: '12' },
      target: '/api/song/lyric',
      body: { id: '12', tv: -1, lv: -1, rv: -1, kv: -1, _nmclfl: 1 },
      protocol: 'eapi',
    },
    {
      module: songDetail,
      input: { ids: '12, 34' },
      target: '/api/v3/song/detail',
      body: { c: '[{"id":12},{"id":34}]' },
      protocol: 'weapi',
    },
    {
      module: songDetail,
      input: { ids: 12 },
      target: '/api/v3/song/detail',
      body: { c: '[{"id":12}]' },
      protocol: 'weapi',
    },
    {
      module: playlistDetail,
      input: { id: 12 },
      target: '/api/v6/playlist/detail',
      body: { id: 12, n: 100000, s: 8 },
      protocol: 'eapi',
    },
    {
      module: playlistDetail,
      input: { id: '12', s: '0' },
      target: '/api/v6/playlist/detail',
      body: { id: '12', n: 100000, s: '0' },
      protocol: 'eapi',
    },
  ])('emits an Effect request for $target with $input', async (scenario) => {
    const intents: Array<RequestIntent> = [];
    const request: RequestCapability = (intent) => {
      intents.push(intent);
      return Effect.succeed({
        status: 200,
        cookie: [],
        headers: new Headers(),
        body: extraBody,
      });
    };
    const invoke = scenario.module as (
      input: ModuleQuery,
      request: RequestCapability,
    ) => ReturnType<typeof search>;
    const result = invoke(scenario.input, request);
    if (result instanceof Promise) {
      await result.catch(() => undefined);
    }
    expect(Effect.isEffect(result)).toBe(true);
    if (!Effect.isEffect(result)) {
      return;
    }
    const config: ModuleCallConfig = { cookie: 'MUSIC_U=module-reader' };
    const call: CallShape = {
      identifier: 'read-test',
      input: scenario.input,
      config,
      identity: resolveIdentitySnapshot(config, getRuntimeState()),
      policy: { read: true, upload: false },
      startedAt: Date.now(),
    };
    const response = await runEffect(
      result.pipe(Effect.provideService(Call, call)),
    );
    expect(intents).toEqual([
      {
        target: scenario.target,
        protocol: scenario.protocol,
        method: 'POST',
        headers: {},
        body: JSON.stringify(scenario.body),
        response: 'json',
        semantic: 'read',
      },
    ]);
    expect(response).toEqual({ status: 200, cookie: [], body: extraBody });
  });

  test.each([...scenarios])(
    '$identifier runs through the SDK through the shared Call',
    async (scenario) => {
      const response = await invokeModule(scenario.identifier, scenario.input, {
        cookie: 'MUSIC_U=sdk-effect',
        crypto: 'api',
        fetcher: async (url) =>
          Response.json({ ...extraBody, target: requestUrl(url) }),
      });
      expect(response.body).toEqual({
        ...extraBody,
        target: `https://interface.music.163.com${scenario.target}`,
      });
    },
  );

  test.each([...scenarios])(
    '$identifier runs through the programmatic entry through the shared Call',
    async (scenario) => {
      const response = await invokeProgrammatic(scenario.identifier, {
        ...scenario.input,
        cookie: 'MUSIC_U=programmatic-effect',
        crypto: 'api',
        fetcher: async (url: Request | URL | string) =>
          Response.json({ ...extraBody, target: requestUrl(url) }),
      });
      expect(response.body).toEqual({
        ...extraBody,
        target: `https://interface.music.163.com${scenario.target}`,
      });
    },
  );

  test.each([...scenarios])(
    '$identifier runs through Hono and the real request capability',
    async (scenario) => {
      const upstream = spyOn(globalThis, 'fetch').mockImplementation((async (
        url,
      ) =>
        Response.json({
          ...extraBody,
          target: requestUrl(url),
        })) as typeof fetch);
      try {
        const app = await createServer();
        const response = await app.request(
          `http://localhost/${scenario.identifier.replaceAll('_', '/')}?${new URLSearchParams(Object.entries(scenario.input).map(([key, value]): [string, string] => [key, String(value)])).toString()}`,
          { headers: { cookie: 'MUSIC_U=http-effect' } },
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
          ...extraBody,
          target:
            scenario.identifier === 'song_detail'
              ? 'https://music.163.com/weapi/v3/song/detail'
              : `https://interface.music.163.com/eapi/${scenario.target.slice(5)}`,
        });
      } finally {
        upstream.mockRestore();
      }
    },
  );

  test.each([
    {
      name: 'response envelope without cookies',
      rejection: {
        status: 401,
        body: { code: 301, msg: 'fixture-auth-failure', extra: { keep: true } },
      },
      expected: {
        status: 401,
        cookie: [],
        body: { code: 301, msg: 'fixture-auth-failure', extra: { keep: true } },
      },
    },
    {
      name: 'ordinary Error',
      rejection: new Error('fixture-handler-error'),
      expected: {
        status: 502,
        cookie: [],
        body: { code: 502, msg: 'fixture-handler-error' },
      },
    },
  ])(
    'maps custom request $name at the programmatic Effect ingress',
    async (scenario) => {
      const failure = await invokeProgrammatic(
        'search',
        { keywords: 'failure', cookie: 'MUSIC_U=effect-handler-failure' },
        {
          requestHandler: (intent) =>
            Effect.sync(() =>
              expect(intent.target).toBe('/api/search/get'),
            ).pipe(
              Effect.andThen(
                Effect.fail(
                  scenario.rejection instanceof Error
                    ? new TransportFailed({
                        message: scenario.rejection.message,
                      })
                    : new ProtocolFailed({
                        message: 'fixture-auth-failure',
                        response: {
                          ...scenario.rejection,
                          cookie: [],
                          headers: new Headers(),
                        },
                      }),
                ),
              ),
            ),
        },
      ).catch((error: unknown) => error);
      expect(failure).toEqual(scenario.expected);
    },
  );

  test('all generated client methods remain available from the Effect registry', () => {
    const client = createHanaMusicApi({ cookie: 'MUSIC_U=method-surface' });
    expect(Object.keys(client)).toHaveLength(352);
    for (const name of [
      'search',
      'lyric',
      'songDetail',
      'playlistDetail',
      'banner',
    ] as const) {
      expect(client[name]).toBeFunction();
    }
  });

  test.each(['cancel', 'timeout'] as const)(
    'one Effect waiter can %s while another completes',
    async (mode) => {
      let requests = 0;
      let aborts = 0;
      let started!: () => void;
      let release!: () => void;
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      const responseReady = new Promise<void>((resolve) => {
        release = resolve;
      });
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=effect-waiters',
        fetcher: async (_url, init) => {
          requests += 1;
          init?.signal?.addEventListener('abort', () => {
            aborts += 1;
          });
          started();
          await responseReady;
          return Response.json(extraBody);
        },
      });
      const controller = new AbortController();
      const first = client
        .search(
          { keywords: 'shared' },
          {
            signal: controller.signal,
            timeoutMs: mode === 'timeout' ? 20 : 500,
          },
        )
        .catch((error: unknown) => error);
      const second = client.search({ keywords: 'shared' }, { timeoutMs: 500 });
      await ready;
      if (mode === 'cancel') {
        controller.abort();
      }
      expect(await first).toMatchObject({
        status: mode === 'cancel' ? 499 : 504,
      });
      expect(aborts).toBe(0);
      release();
      expect((await second).body).toEqual(extraBody);
      expect(requests).toBe(1);
    },
  );

  test('the final Effect waiter aborts the actual upstream', async () => {
    let started!: () => void;
    let aborted = false;
    const ready = new Promise<void>((resolve) => {
      started = resolve;
    });
    const controller = new AbortController();
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=effect-cancel',
      fetcher: async (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            aborted = true;
            reject(init.signal?.reason);
          });
          started();
        }),
    });
    const pending = client
      .lyric({ id: 12 }, { signal: controller.signal })
      .catch((error: unknown) => error);
    await ready;
    controller.abort();
    expect(await pending).toMatchObject({ status: 499 });
    expect(aborted).toBe(true);
  });
});

const requestUrl = (target: Request | URL | string): string =>
  typeof target === 'string'
    ? target
    : target instanceof URL
      ? target.href
      : target.url;
