import { expect, test } from 'bun:test';

import type { Clock } from 'effect';
import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import type { ModuleCallConfig } from '../../../../index.ts';
import {
  createHanaMusicApi,
  invokeModule,
  playlistSubscribe,
} from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { settle } from '../../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readWebBody } from '../../../_kit/upstream/wire.ts';
import tokenSubscribed from '../../../fixtures/netease/playlist_subscribe/subscribe-token.json';

const createClient = (
  config: ModuleCallConfig,
  recorded: { status: number; body: unknown } = {
    status: 200,
    body: { code: 200 },
  },
  clock?: Clock.Clock,
) => {
  const sent: Array<{
    url: string;
    cookie: string;
    userAgent: string;
    headers: Headers;
    body: string;
    bodyKeys: Array<string>;
  }> = [];
  const execution = {
    entropy: testEntropy,
    clock,
    fetcher: async (input: Request | URL | string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const body = typeof init?.body === 'string' ? init.body : '';
      sent.push({
        url: input instanceof Request ? input.url : input.toString(),
        cookie: headers.get('cookie') ?? '',
        userAgent: headers.get('user-agent') ?? '',
        headers,
        body,
        bodyKeys: [...new URLSearchParams(body).keys()],
      });
      return Response.json(recorded.body, { status: recorded.status });
    },
  };
  const client = createClientFromContext(
    config,
    buildCallServices(config, true, execution),
  );
  return { client, sent };
};

test.each([
  { t: 1, path: 'subscribe' },
  { t: 0, path: 'unsubscribe' },
])(
  'playlistSubscribe t=$t sends a weapi web request, whatever client the caller set',
  async ({ t, path }) => {
    const { client, sent } = createClient({
      cookie: 'MUSIC_U=listener; os=pc; appver=3.1.17.204416',
      ua: 'Mozilla/5.0 (Windows NT 10.0) NeteaseMusicDesktop/3.1.29.205117',
      crypto: 'eapi',
    });

    await client.playlistSubscribe({ id: 2889745179, t });

    expect(sent).toHaveLength(1);
    const [request] = sent;
    expect(request?.url).toBe(`https://music.163.com/weapi/playlist/${path}`);
    const cookie = new Map(
      request?.cookie.split('; ').map((pair) => {
        const [name = '', value = ''] = pair.split('=');
        return [name, value];
      }),
    );
    expect(cookie.get('os')).toBe('web');
    expect(cookie.get('MUSIC_U')).toBe('listener');
    expect(request?.userAgent).toBe(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    );
    expect(request?.headers.get('referer')).toBe('https://music.163.com');
    // cspell:ignore anticheattoken
    expect(request?.headers.has('x-anticheattoken')).toBe(false);
    expect(request?.bodyKeys.toSorted()).toEqual(['encSecKey', 'params']);
  },
);

test('playlistSubscribe uses weapi with a configured checkToken', async () => {
  const token = 'fresh-check-token';
  const { client, sent } = createClient(
    {
      cookie: 'MUSIC_U=listener; os=iphone; appver=9.0.90',
      checkToken: token,
    },
    tokenSubscribed.response,
  );

  const result = await client.playlistSubscribe({ id: 2889745179, t: 1 });

  expect(result.status).toBe(200);
  expect(sent).toHaveLength(1);
  const [request] = sent;
  expect(request?.url).toBe('https://music.163.com/weapi/playlist/subscribe');
  expect(request?.headers.get('x-anticheattoken')).toBe(token);
  expect(request?.bodyKeys.toSorted()).toEqual(['encSecKey', 'params']);
  const cookie = new Map(
    request?.cookie.split('; ').map((pair) => {
      const [name = '', value = ''] = pair.split('=');
      return [name, value];
    }),
  );
  expect(cookie.get('os')).toBe('web');
  expect(cookie.get('MUSIC_U')).toBe('listener');
  expect(request?.userAgent).not.toContain('NeteaseMusicDesktop');
});

test('playlistSubscribe calls the checkToken provider for each subscribe and unsubscribe', async () => {
  let calls = 0;
  const { client, sent } = createClient({
    cookie: 'MUSIC_U=listener',
    checkToken: async () => `token-${(calls += 1)}`,
  });

  await client.playlistSubscribe({ id: 1, t: 1 });
  await client.playlistSubscribe({ id: 1, t: 1 });
  await client.playlistSubscribe({ id: 1, t: 0 });

  expect(calls).toBe(3);
  expect(sent).toHaveLength(3);
  expect(sent[0]?.url).toBe('https://music.163.com/weapi/playlist/subscribe');
  expect(sent[1]?.url).toBe('https://music.163.com/weapi/playlist/subscribe');
  expect(sent[0]?.headers.get('x-anticheattoken')).toBe('token-1');
  expect(sent[1]?.headers.get('x-anticheattoken')).toBe('token-2');
  expect(sent[2]?.url).toBe('https://music.163.com/weapi/playlist/unsubscribe');
  expect(sent[2]?.headers.get('x-anticheattoken')).toBe('token-3');
  expect(sent[2]?.bodyKeys.toSorted()).toEqual(['encSecKey', 'params']);
  const cookie = new Map(
    sent[2]?.cookie.split('; ').map((pair) => {
      const [name = '', value = ''] = pair.split('=');
      return [name, value];
    }),
  );
  expect(cookie.get('os')).toBe('web');
});

test('playlistSubscribe rejects when the checkToken provider fails', async () => {
  const { client, sent } = createClient({
    cookie: 'MUSIC_U=listener',
    checkToken: async () => {
      throw new Error('token unavailable');
    },
  });

  expect(await settle(client.playlistSubscribe({ id: 1, t: 1 }))).toEqual({
    rejected: {
      status: 400,
      body: { code: 400, msg: 'checkToken provider failed' },
      cookie: [],
    },
  });
  expect(sent).toHaveLength(0);
});

test.each(['', '   ', async () => '', async () => '   '])(
  'playlistSubscribe rejects an empty checkToken before sending: %p',
  async (checkToken) => {
    const { client, sent } = createClient({
      cookie: 'MUSIC_U=listener',
      checkToken,
    });

    expect(await settle(client.playlistSubscribe({ id: 1, t: 1 }))).toEqual({
      rejected: {
        status: 400,
        body: { code: 400, msg: 'checkToken must not be empty' },
        cookie: [],
      },
    });
    expect(sent).toHaveLength(0);
  },
);

test('playlistSubscribe sends a complete web identity and the same token in its encrypted body and HTTP header', async () => {
  {
    const { client, sent } = createClient({
      cookie:
        'MUSIC_U=listener; __csrf=csrf; os=pc; appver=desktop; osver=desktop-os; channel=desktop-channel; clientSign=desktop-sign; OS=iphone; APPVER=mobile; OsVer=mobile; Channel=mobile; ClientSign=mobile; buildver=1; mobilename=phone; versioncode=2; resolution=small; brand=mobile; mode=phone',
      crypto: 'eapi',
      domain: 'https://interface.music.163.com',
      ua: 'desktop-user-agent',
      e_r: true,
      headers: {
        'uSeR-aGeNt': 'mixed-agent',
        referer: 'https://other.example',
        'x-antiCheatToken': 'stale-token',
        cOoKiE: 'MUSIC_U=other-listener; os=iphone',
        'x-aeapi': 'true',
      },
      checkToken: async () => 'fresh-token',
    });
    await client.playlistSubscribe({ id: 17, t: 1 });
    const request = sent[0]!;
    const cookie = new Map(
      request.cookie.split('; ').map((entry) => {
        const [name = '', value = ''] = entry.split('=');
        return [name, value] as const;
      }),
    );
    expect(request.url).toBe('https://music.163.com/weapi/playlist/subscribe');
    expect(cookie.get('os')).toBe('web');
    expect(cookie.get('MUSIC_U')).toBe('listener');
    for (const name of [
      'appver',
      'osver',
      'channel',
      'clientSign',
      'OS',
      'APPVER',
      'OsVer',
      'Channel',
      'ClientSign',
      'buildver',
      'mobilename',
      'versioncode',
      'resolution',
      'brand',
      'mode',
    ]) {
      expect(cookie.has(name)).toBe(false);
    }
    expect(request.headers.get('x-aeapi')).toBeNull();
    expect(request.headers.get('x-anticheattoken')).toBe('fresh-token');
    expect(request.headers.get('referer')).toBe('https://music.163.com');
    expect(request.userAgent).toContain('Chrome/124.0.0.0');
    expect(readWebBody(request.body)).toEqual({
      id: 17,
      checkToken: 'fresh-token',
      csrf_token: 'csrf',
      e_r: false,
    });
    await client.playlistSubscribe({ id: 17, t: 0 });
    expect(sent[1]!.headers.get('x-anticheattoken')).toBe('fresh-token');
    expect(readWebBody(sent[1]!.body)).toEqual({
      id: 17,
      checkToken: 'fresh-token',
      csrf_token: 'csrf',
      e_r: false,
    });
  }
});

test('playlistSubscribe cancellation during token resolution prevents the business request', async () => {
  const controller = new AbortController();
  let finishToken!: (token: string) => void;
  const providerStage = createStage('token provider');
  const { client, sent } = createClient({
    cookie: 'MUSIC_U=listener',
    signal: controller.signal,
    checkToken: () =>
      new Promise<string>((resolve) => {
        finishToken = resolve;
        providerStage.reach();
      }),
  });
  const result = settle(client.playlistSubscribe({ id: 1, t: 1 }));
  await providerStage.wait(result);
  controller.abort();
  expect(await result).toMatchObject({ rejected: { status: 499 } });
  finishToken('too-late');
  await Promise.resolve();
  expect(sent).toHaveLength(0);
});

test('concurrent playlist subscriptions keep each account snapshot and token together', async () => {
  {
    let finishToken!: (token: string) => void;
    const providerStage = createStage('first account token');
    const cookie = {
      MUSIC_U: 'first-account',
      MUSIC_A: 'first-anonymous',
      os: 'pc',
    };
    const { client, sent } = createClient({ cookie: 'MUSIC_U=base-account' });
    const first = client.playlistSubscribe(
      { id: 31, t: 1 },
      {
        cookie,
        checkToken: () =>
          new Promise<string>((resolve) => {
            finishToken = resolve;
            providerStage.reach();
          }),
      },
    );
    await providerStage.wait(first);
    cookie.MUSIC_U = 'changed-after-snapshot';
    await client.playlistSubscribe(
      { id: 31, t: 1 },
      {
        cookie: 'MUSIC_U=second-account; MUSIC_A=second-anonymous',
        checkToken: 'second-token',
      },
    );
    finishToken('first-token');
    await first;
    expect(sent).toHaveLength(2);
    expect(sent[0]!.cookie).toContain('MUSIC_U=second-account');
    expect(sent[0]!.cookie).toContain('MUSIC_A=second-anonymous');
    expect(sent[0]!.headers.get('x-anticheattoken')).toBe('second-token');
    expect(readWebBody(sent[0]!.body)).toMatchObject({
      checkToken: 'second-token',
    });
    expect(sent[1]!.cookie).toContain('MUSIC_U=first-account');
    expect(sent[1]!.cookie).toContain('MUSIC_A=first-anonymous');
    expect(sent[1]!.headers.get('x-anticheattoken')).toBe('first-token');
    expect(readWebBody(sent[1]!.body)).toMatchObject({
      checkToken: 'first-token',
    });
  }
});

test('playlistSubscribe token resolution uses the call total deadline', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        const provider = createStage('token deadline');
        let finish!: (value: string) => void;
        const { client, sent } = createClient(
          {
            cookie: 'MUSIC_U=listener',
            timeoutMs: 100,
            checkToken: () =>
              new Promise<string>((resolve) => {
                finish = resolve;
                provider.reach();
              }),
          },
          undefined,
          clock,
        );
        const pending = settle(client.playlistSubscribe({ id: 1, t: 1 }));
        yield* Effect.promise(() => provider.wait(pending));
        yield* clock.adjust(100);
        const failure = yield* Effect.promise(() => pending);
        expect(failure).toMatchObject({
          rejected: { status: 504 },
        });
        finish('too-late');
        yield* Effect.promise(() => Promise.resolve());
        expect(sent).toHaveLength(0);
      }),
    ),
  );
});

test.each([
  { name: 'named function', invoke: playlistSubscribe },
  {
    name: 'invokeModule',
    invoke: (query: { id: number; t: number }, config: ModuleCallConfig) =>
      invokeModule('playlist_subscribe', query, config),
  },
])(
  '$name keeps the operation profile and account snapshot',
  async ({ invoke }) => {
    const sent: Array<{ url: string; cookie: string }> = [];
    await invoke(
      { id: 1, t: 0 },
      {
        cookie: 'MUSIC_U=own-account; os=iphone',
        domain: 'https://interface.music.163.com',
        crypto: 'eapi',
        fetcher: async (input, init) => {
          sent.push({
            url: input instanceof Request ? input.url : input.toString(),
            cookie: new Headers(init?.headers).get('cookie') ?? '',
          });
          return Response.json({ code: 200 });
        },
      },
    );
    expect(sent).toHaveLength(1);
    expect(sent[0]!.url).toBe(
      'https://music.163.com/weapi/playlist/unsubscribe',
    );
    expect(sent[0]!.cookie).toContain('MUSIC_U=own-account');
    expect(sent[0]!.cookie).toContain('os=web');
  },
);

test('an already cancelled playlistSubscribe neither resolves token nor sends the write', async () => {
  const controller = new AbortController();
  controller.abort();
  let resolutions = 0;
  const { client, sent } = createClient({
    cookie: 'MUSIC_U=listener',
    signal: controller.signal,
    checkToken: async () => {
      resolutions += 1;
      return 'unused';
    },
  });
  expect(await settle(client.playlistSubscribe({ id: 1, t: 1 }))).toMatchObject(
    { rejected: { status: 499 } },
  );
  expect(resolutions).toBe(0);
  expect(sent).toHaveLength(0);
});

test('strict public playlist request matches the URL, method and token header', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/playlist/subscribe',
        method: 'POST',
        headers: { 'x-anticheattoken': 'strict-token' },
        check: (wire) => {
          expect(wire.headers.get('cookie')).toContain(
            'MUSIC_U=strict-account',
          );
          expect(wire.headers.get('cookie')).toContain('os=web');
        },
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=strict-account',
        checkToken: 'strict-token',
        fetcher: scenario.fetcher,
      });
      expect((await client.playlistSubscribe({ id: 17, t: 1 })).body).toEqual({
        code: 200,
      });
      expect(scenario.entries).toHaveLength(1);
    },
  );
});
