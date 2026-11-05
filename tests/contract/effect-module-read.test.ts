import { describe, expect, spyOn, test } from 'bun:test';
import { createDecipheriv } from 'node:crypto';

// cspell:ignore anticheattoken

import { Effect } from 'effect';

import { createHanaMusicApi, invokeModule } from '../../index.ts';
import { invokeModule as invokeProgrammatic } from '../../src/app/module-api.ts';
import { Call } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { ProtocolFailed, TransportFailed } from '../../src/core/errors.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { getRuntimeState, setRuntimeState } from '../../src/core/runtime.ts';
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

// song_detail、playlist_detail 和 lyric 会校验返回体，共用的假返回体带上它们声明的字段。
const extraBody = {
  code: 200 as const,
  songs: [],
  privileges: [],
  lrc: { lyric: '' },
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
    tags: [],
    playCount: 0,
    status: 0,
    privacy: 0,
    specialType: 0,
  },
  future: { nested: [null, 'kept', { enabled: true }] },
};
const scenarios = [
  {
    identifier: 'search',
    input: { keywords: 'hello' },
    target: '/api/search/get',
    url: 'https://interface.music.163.com/eapi/search/get',
  },
  {
    identifier: 'lyric',
    input: { id: '12' },
    target: '/api/song/lyric',
    url: 'https://interface.music.163.com/eapi/song/lyric',
  },
  {
    identifier: 'song_detail',
    input: { ids: '12, 34' },
    target: '/api/v3/song/detail',
    url: 'https://music.163.com/weapi/v3/song/detail',
  },
  {
    identifier: 'playlist_detail',
    input: { id: 12 },
    target: '/api/v6/playlist/detail',
    url: 'https://interface.music.163.com/eapi/v6/playlist/detail',
  },
] as const;

describe('ordinary read Effect modules', () => {
  test.each([...scenarios])(
    '$identifier shares only its in-flight default request',
    async (scenario) => {
      let requests = 0;
      const fetcher = async () => {
        requests += 1;
        await Bun.sleep(10);
        return Response.json(extraBody);
      };
      const config = { cookie: 'MUSIC_U=default-sharing', fetcher };
      const [first, second] = await Promise.all([
        invokeModule(scenario.identifier, scenario.input, config),
        invokeModule(scenario.identifier, scenario.input, config),
      ]);
      expect(requests).toBe(1);
      expect(first.body).not.toBe(second.body);
      first.cookie.push('local-only');
      expect(second.cookie).toEqual([]);
      await invokeModule(scenario.identifier, scenario.input, config);
      expect(requests).toBe(2);
    },
  );

  test.each(['cancel', 'timeout'] as const)(
    'a waiter can %s during the complete response body while its peer continues',
    async (mode) => {
      let body!: ReadableStreamDefaultController<Uint8Array>;
      let started!: () => void;
      let requests = 0;
      let aborts = 0;
      const ready = new Promise<void>((resolve) => {
        started = resolve;
      });
      const controller = new AbortController();
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=body-sharing',
        fetcher: async (_url, init) => {
          requests += 1;
          init?.signal?.addEventListener('abort', () => {
            aborts += 1;
          });
          return new Response(
            new ReadableStream<Uint8Array>({
              start(stream) {
                body = stream;
                started();
              },
            }),
            { headers: { 'content-type': 'application/json' } },
          );
        },
      });
      const first = client
        .search(
          { keywords: 'body' },
          {
            signal: controller.signal,
            timeoutMs: mode === 'timeout' ? 20 : 500,
          },
        )
        .catch((error: unknown) => error);
      const second = client.search({ keywords: 'body' }, { timeoutMs: 500 });
      await ready;
      if (mode === 'cancel') controller.abort();
      expect(await first).toMatchObject({
        status: mode === 'cancel' ? 499 : 504,
      });
      expect(aborts).toBe(0);
      body.enqueue(new TextEncoder().encode(JSON.stringify(extraBody)));
      body.close();
      expect((await second).body).toEqual(extraBody);
      expect(requests).toBe(1);
    },
  );

  test('completed reads isolate device snapshots even for the same session', async () => {
    const original = getRuntimeState();
    let requests = 0;
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=device-reader',
      cache: { ttlMs: 120_000 },
      fetcher: async (_url, init) => {
        requests += 1;
        const cookies = new Headers(init?.headers).get('cookie') ?? '';
        const device = cookies.match(/(?:^|; )deviceId=([^;]*)/)?.[1];
        return Response.json({ code: 200, wireDevice: device });
      },
    });
    try {
      setRuntimeState({ deviceId: 'first-device' });
      expect((await client.search({ keywords: 'device' })).body).toMatchObject({
        wireDevice: 'first-device',
      });
      setRuntimeState({ deviceId: 'second-device' });
      expect((await client.search({ keywords: 'device' })).body).toMatchObject({
        wireDevice: 'second-device',
      });
      expect(requests).toBe(2);
    } finally {
      setRuntimeState(original);
    }
  });

  test('the last waiter cancels a partially consumed body and releases the next call', async () => {
    let reading!: () => void;
    const ready = new Promise<void>((resolve) => {
      reading = resolve;
    });
    let requests = 0;
    let aborts = 0;
    let cancelled = 0;
    const controller = new AbortController();
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=partial-body',
      fetcher: async (_url, init) => {
        requests += 1;
        if (requests > 1) return Response.json(extraBody);
        init?.signal?.addEventListener('abort', () => {
          aborts += 1;
        });
        return new Response(
          new ReadableStream<Uint8Array>({
            start(stream) {
              stream.enqueue(new TextEncoder().encode('{"code":200'));
            },
            pull() {
              reading();
            },
            cancel() {
              cancelled += 1;
            },
          }),
          { headers: { 'content-type': 'application/json' } },
        );
      },
    });
    const pending = client
      .lyric({ id: 12 }, { signal: controller.signal })
      .catch((error: unknown) => error);
    await ready;
    controller.abort();
    expect(await pending).toMatchObject({ status: 499 });
    expect(aborts).toBe(1);
    expect(cancelled).toBe(1);
    expect((await client.lyric({ id: 12 })).body).toEqual(extraBody);
    expect(requests).toBe(2);
  });

  test.each([400, 429])(
    'a rejected read with business code %i is never cached or replayed',
    async (code) => {
      let requests = 0;
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=rejected-read',
        cache: { ttlMs: 120_000 },
        retry: {
          retryNonIdempotent: true,
          retries: 5,
          backoffMs: 0,
          statusCodes: [500],
        },
        fetcher: async () => {
          requests += 1;
          return Response.json({ code, msg: 'rejected' });
        },
      });
      for (let call = 0; call < 2; call += 1) {
        expect(
          await client
            .search({ keywords: 'rejected' })
            .catch((error: unknown) => error),
        ).toMatchObject({ status: code, body: { code } });
      }
      expect(requests).toBe(2);
    },
  );

  test.each([
    {
      identifier: 'search',
      input: { keywords: 'hello' },
      target: '/api/search/get',
      data: { s: 'hello', type: 1, limit: 30, offset: 0 },
    },
    {
      identifier: 'search',
      input: { keywords: 'voice', type: 2000 },
      target: '/api/search/voice/get',
      data: { keyword: 'voice', scene: 'normal', limit: 30, offset: 0 },
    },
    {
      identifier: 'lyric',
      input: { id: 12 },
      target: '/api/song/lyric',
      data: { id: 12, tv: -1, lv: -1, rv: -1, kv: -1, _nmclfl: 1 },
    },
    {
      identifier: 'playlist_detail',
      input: { id: 12 },
      target: '/api/v6/playlist/detail',
      data: { id: 12, n: 100000, s: 8 },
    },
  ] as const)(
    '$identifier sends its declared eapi request to $target',
    async (scenario) => {
      let sent: { target: string; headers: Headers; body: string } | undefined;
      let tokens = 0;
      await invokeModule(scenario.identifier, scenario.input, {
        cookie:
          'MUSIC_U=declared-reader; __csrf=csrf; os=android; appver=other; channel=other; osver=other',
        crypto: 'api',
        domain: 'https://music.163.com',
        ua: 'other-agent',
        e_r: true,
        headers: {
          'uSeR-aGeNt': 'another-agent',
          cOoKiE: 'MUSIC_U=other',
          'x-antiCheatToken': 'stale',
        },
        checkToken: async () => {
          tokens += 1;
          return 'unused';
        },
        fetcher: async (url, init) => {
          sent = {
            target: requestUrl(url),
            headers: new Headers(init?.headers),
            body: typeof init?.body === 'string' ? init.body : '',
          };
          return Response.json(extraBody);
        },
      });
      expect(sent?.target).toBe(
        `https://interface.music.163.com/eapi/${scenario.target.slice(5)}`,
      );
      expect(sent?.headers.get('user-agent')).toBe(
        'NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)',
      );
      expect(sent?.headers.has('x-anticheattoken')).toBe(false);
      const cookies = Object.fromEntries(
        (sent?.headers.get('cookie') ?? '').split('; ').map((entry) => {
          const [name = '', ...value] = entry.split('=');
          return [
            decodeURIComponent(name),
            decodeURIComponent(value.join('=')),
          ];
        }),
      );
      expect(cookies).toMatchObject({
        MUSIC_U: 'declared-reader',
        __csrf: 'csrf',
        os: 'pc',
        appver: '3.1.17.204416',
        channel: 'netease',
        osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
      });
      const encrypted = new URLSearchParams(sent?.body).get('params') ?? '';
      const decipher = createDecipheriv(
        'aes-128-ecb',
        Buffer.from('e82ckenh8dichen8'),
        null,
      );
      const plaintext = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'hex')),
        decipher.final(),
      ]).toString('utf8');
      const [target, body] = plaintext.split('-36cd479b6b5-');
      expect(target).toBe(scenario.target);
      const decoded: unknown = JSON.parse(body ?? '{}');
      expect(decoded).toMatchObject({
        ...scenario.data,
        e_r: false,
        header: {
          MUSIC_U: 'declared-reader',
          os: 'pc',
          appver: '3.1.17.204416',
        },
      });
      expect(decoded).not.toHaveProperty('checkToken');
      expect(tokens).toBe(0);
    },
  );

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
        action:
          scenario.target === '/api/search/voice/get'
            ? 'voice'
            : scenario.module === search
              ? 'search'
              : 'read',
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
        target: scenario.url,
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
        target: scenario.url,
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
          target: scenario.url,
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
                    ? TransportFailed.make({
                        message: scenario.rejection.message,
                      })
                    : ProtocolFailed.make({
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
