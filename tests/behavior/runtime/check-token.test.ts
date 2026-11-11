import { expect, test } from 'bun:test';
import { createDecipheriv } from 'node:crypto';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import type { HanaMusicApiClient, ModuleCallConfig } from '../../../index.ts';
import {
  createHanaMusicApi,
  createRequest,
  getUserids,
  invokeModule,
} from '../../../index.ts';
import {
  ExecutionScope,
  resolveExecutionScope,
} from '../../../src/core/call-context.ts';
import { buildCallServices, runCall } from '../../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../../src/core/identity.ts';
import { decodeLegacyModuleInput } from '../../../src/core/module-input.ts';
import { requestProfiles } from '../../../src/core/request-profiles.ts';
import { requestEffect } from '../../../src/core/request.ts';
import { toModuleResponse } from '../../../src/core/response.ts';
import { getRuntimeState, setRuntimeState } from '../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../src/sdk/generated/client-factory.generated.ts';
import { settle } from '../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../_kit/harness/sdk.ts';
import { runEffect } from '../../_kit/it.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../_kit/upstream/wire.ts';
import { songFile, tokenBody } from '../../fixtures/synthetic/upload.ts';

test.each(['weapi', 'eapi', 'api', 'linuxapi'] as const)(
  'optional checkToken uses the final %s protocol envelope',
  async (crypto) => {
    const action = {
      profile: crypto === 'weapi' ? ('web' as const) : crypto,
      target: '/api/token/probe',
      semantic: 'read',
      cache: 'none',
      retry: 'never',
    } as const;
    const url =
      crypto === 'weapi'
        ? 'https://music.163.com/weapi/token/probe'
        : crypto === 'linuxapi'
          ? 'https://music.163.com/api/linux/forward'
          : `https://interface.music.163.com/${crypto}/token/probe`;
    await withScenario(
      [
        {
          url,
          method: 'POST',
          headers: { 'X-antiCheatToken': 'protocol-token' },
          check: (wire) => {
            expect(wire.headers.get('cookie')).not.toContain('protocol-token');
            if (crypto === 'weapi') {
              expect(readWebBody(wire.body)).toMatchObject({
                checkToken: 'protocol-token',
              });
            } else if (crypto === 'eapi') {
              expect(readEapiBody(wire.body)).toMatchObject({
                path: '/api/token/probe',
                data: {
                  checkToken: 'protocol-token',
                  header: { 'X-antiCheatToken': 'protocol-token' },
                },
              });
            } else if (crypto === 'api') {
              expect(new URLSearchParams(wire.body).get('checkToken')).toBe(
                'protocol-token',
              );
            } else {
              const decipher = createDecipheriv(
                'aes-128-ecb',
                Buffer.from('rFgB&h#%2?^eDg:Q'),
                null,
              );
              const encoded = new URLSearchParams(wire.body).get('eparams')!;
              const decoded = JSON.parse(
                Buffer.concat([
                  decipher.update(Buffer.from(encoded, 'hex')),
                  decipher.final(),
                ]).toString(),
              );
              expect(decoded).toMatchObject({
                params: { checkToken: 'protocol-token' },
              });
            }
          },
          response: () => Response.json({ code: 200, nicknames: {} }),
        },
      ],
      async (scenario) => {
        const config = {
          cookie: 'MUSIC_U=protocol-account',
          checkToken: 'protocol-token',
        };
        const result = await runCall(
          { identifier: 'protocol_probe', input: { sample: 'probe' }, config },
          buildCallServices(config, false, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
          {
            identifier: 'protocol_probe',
            actions: { probe: action },
            route: '/protocol/probe',
            decodeInput: decodeLegacyModuleInput,
            execute: (query, request) =>
              request('probe', { data: query }).pipe(
                Effect.map(toModuleResponse),
              ),
          },
        );
        expect(result.status).toBe(200);
        expect(scenario.entries).toHaveLength(1);
      },
    );
  },
);

for (const tokenKind of ['string', 'provider'] as const) {
  test.each([
    {
      name: 'search normal',
      path: 'search/get',
      web: false,
      call: (client: HanaMusicApiClient) => client.search({ keywords: 'same' }),
    },
    {
      name: 'search voice',
      path: 'search/voice/get',
      web: false,
      call: (client: HanaMusicApiClient) =>
        client.search({ keywords: 'same', type: 2000 }),
    },
    {
      name: 'lyric',
      path: 'song/lyric',
      web: false,
      call: (client: HanaMusicApiClient) => client.lyric({ id: 7 }),
    },
    {
      name: 'songDetail',
      path: 'v3/song/detail',
      web: true,
      call: (client: HanaMusicApiClient) => client.songDetail({ ids: [7] }),
    },
    {
      name: 'playlistDetail',
      path: 'v6/playlist/detail',
      web: false,
      call: (client: HanaMusicApiClient) => client.playlistDetail({ id: 7 }),
    },
  ])(
    `$name transmits an explicit ${tokenKind} token with its declared protocol`,
    async ({ path, web, call }) => {
      let providers = 0;
      await withScenario(
        [
          {
            url: web
              ? `https://music.163.com/weapi/${path}`
              : `https://interface.music.163.com/eapi/${path}`,
            method: 'POST',
            headers: { 'X-antiCheatToken': 'shared-read-token' },
            check: (wire) => {
              const decoded = web
                ? readWebBody(wire.body)
                : readEapiBody(wire.body).data;
              expect(decoded).toMatchObject({
                checkToken: 'shared-read-token',
              });
              if (!web)
                expect(decoded).toMatchObject({
                  header: { 'X-antiCheatToken': 'shared-read-token' },
                });
              expect(wire.headers.get('cookie')).not.toContain(
                'shared-read-token',
              );
            },
            response: () =>
              Response.json({
                code: 200,
                result: { songs: [] },
                data: [],
                lrc: { lyric: 'sample' },
                songs: [],
                privileges: [],
                playlist: { id: 7, trackIds: [] },
              }),
          },
        ],
        async (scenario) => {
          const config = {
            cookie: 'MUSIC_U=reader',
            checkToken:
              tokenKind === 'string'
                ? 'shared-read-token'
                : async () => {
                    providers++;
                    return 'shared-read-token';
                  },
          };
          const client = createClientFromContext(
            config,
            buildCallServices(config, false, {
              fetcher: scenario.fetcher,
              entropy: testEntropy,
            }),
          );
          expect(await settle<unknown>(call(client))).toMatchObject({
            resolved: { status: 200 },
          });
          expect(providers).toBe(tokenKind === 'string' ? 0 : 1);
          expect(scenario.entries).toHaveLength(1);
        },
      );
    },
  );
}

test('explicit tokens on reads bypass existing cache and never merge concurrent calls', async () => {
  let providers = 0;
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/search/get',
        method: 'POST',
        times: 4,
        check: (wire) => {
          const token = wire.headers.get('X-antiCheatToken');
          expect(readEapiBody(wire.body).data).toMatchObject(
            token ? { checkToken: token } : { s: 'same' },
          );
        },
        response: () => Response.json({ code: 200, result: { songs: [] } }),
      },
    ],
    async (scenario) => {
      const config = { cookie: 'MUSIC_U=reader', cache: { ttlMs: 120000 } };
      const client = createClientFromContext(
        config,
        buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      await client.search({ keywords: 'same' });
      await client.search({ keywords: 'same' });
      const token = { checkToken: async () => `read-token-${++providers}` };
      await client.search({ keywords: 'same' }, token);
      await Promise.all([
        client.search({ keywords: 'same' }, token),
        client.search({ keywords: 'same' }, token),
      ]);
      expect(providers).toBe(3);
      expect(scenario.sent).toHaveLength(4);
      expect(
        scenario.sent
          .slice(1)
          .map((wire) => wire.headers.get('X-antiCheatToken')),
      ).toEqual(['read-token-1', 'read-token-2', 'read-token-3']);
    },
  );
});

test('a token-bearing read never automatically retries a failed send', async () => {
  let providers = 0;
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/search/get',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'once' },
        reject: new Error('EAI_AGAIN'),
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=reader',
        fetcher: scenario.fetcher,
        retry: { backoffMs: 0, retryNonIdempotent: true },
        checkToken: async () => {
          providers++;
          return 'once';
        },
      });
      expect(await settle(client.search({ keywords: 'one' }))).toHaveProperty(
        'rejected',
      );
      expect(providers).toBe(1);
      expect(scenario.entries).toHaveLength(1);
    },
  );
});

test.each(['string', 'provider'] as const)(
  'multi-request modules use a %s token without replaying a resolved value',
  async (kind) => {
    let providers = 0;
    const expected = [
      {
        url: 'https://interface.music.163.com/eapi/v6/playlist/detail',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'multi-1' },
        response: () =>
          Response.json({ code: 200, playlist: { trackIds: [{ id: 7 }] } }),
      },
    ];
    if (kind === 'provider')
      expected.push({
        url: 'https://interface.music.163.com/eapi/v3/song/detail',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'multi-2' },
        response: () => Response.json({ code: 200, songs: [], privileges: [] }),
      });
    await withScenario(expected, async (scenario) => {
      const checkToken =
        kind === 'string' ? 'multi-1' : async () => `multi-${++providers}`;
      const result = await settle(
        createHanaMusicApi({
          cookie: 'MUSIC_U=reader',
          fetcher: scenario.fetcher,
          checkToken,
        }).playlistTrackAll({ id: 7 }),
      );
      expect(result).toHaveProperty(
        kind === 'string' ? 'rejected' : 'resolved',
      );
      expect(scenario.entries).toHaveLength(kind === 'string' ? 1 : 2);
      expect(providers).toBe(kind === 'string' ? 0 : 2);
    });
  },
);

test.each([
  '',
  '  ',
  async () => '',
  async () => '  ',
  async () => {
    throw new Error('secret-provider-cookie');
  },
])(
  'an invalid optional read token fails before sending: %p',
  async (checkToken) => {
    await withScenario([], async (scenario) => {
      const result = await settle(
        createHanaMusicApi({
          cookie: 'MUSIC_U=reader',
          fetcher: scenario.fetcher,
          checkToken,
        }).search({ keywords: 'none' }),
      );
      expect(result).toHaveProperty('rejected');
      expect(JSON.stringify(result)).not.toContain('secret-provider-cookie');
      expect(scenario.entries).toHaveLength(0);
    });
  },
);

test('all public module entry forms pass strings and providers to a declared action module', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/user/getUserIds',
        method: 'POST',
        times: 3,
        headers: { 'X-antiCheatToken': 'entry-token' },
        response: () => Response.json({ code: 200, nicknames: {} }),
      },
    ],
    async (scenario) => {
      const config: ModuleCallConfig = {
        cookie: 'MUSIC_U=reader',
        fetcher: scenario.fetcher,
        checkToken: async () => 'entry-token',
      };
      await createHanaMusicApi(config).getUserids({ nicknames: 'one' });
      await getUserids(
        { nicknames: 'two' },
        { ...config, checkToken: 'entry-token' },
      );
      await invokeModule('get_userids', { nicknames: 'three' }, config);
      expect(scenario.entries).toHaveLength(3);
    },
  );
});

test('pure local modules never resolve a configured token', async () => {
  let calls = 0;
  await withScenario([], async (scenario) => {
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=local',
      fetcher: scenario.fetcher,
      checkToken: async () => {
        calls++;
        throw new Error('unused');
      },
    });
    await client.loginQrCreate({ key: 'local-key' });
    expect(calls).toBe(0);
    expect(scenario.entries).toHaveLength(0);
  });
});

test('provider cancellation ignores a late value before any API send', async () => {
  await withScenario([], async (scenario) => {
    const controller = new AbortController();
    const stage = createStage('read token');
    let finish!: (value: string) => void;
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=reader',
      fetcher: scenario.fetcher,
      signal: controller.signal,
      checkToken: () =>
        new Promise<string>((resolve) => {
          finish = resolve;
          stage.reach();
        }),
    });
    const pending = settle(client.search({ keywords: 'cancel' }));
    await stage.wait(pending);
    controller.abort();
    finish('late-token');
    expect(await pending).toMatchObject({ rejected: { status: 499 } });
    await Promise.resolve();
    expect(scenario.entries).toHaveLength(0);
  });
});

test('a read token provider uses the total call deadline', async () => {
  await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const clock = yield* TestClock.make();
        const stage = createStage('read deadline');
        let finish!: (value: string) => void;
        yield* Effect.promise(() =>
          withScenario([], async (scenario) => {
            const config = {
              cookie: 'MUSIC_U=reader',
              timeoutMs: 100,
              checkToken: () =>
                new Promise<string>((resolve) => {
                  finish = resolve;
                  stage.reach();
                }),
            };
            const client = createClientFromContext(
              config,
              buildCallServices(config, false, {
                clock,
                fetcher: scenario.fetcher,
              }),
            );
            const pending = settle(client.search({ keywords: 'deadline' }));
            await stage.wait(pending);
            await runEffect(clock.adjust(100));
            expect(await pending).toMatchObject({ rejected: { status: 504 } });
            finish('late-token');
            await Promise.resolve();
            expect(scenario.entries).toHaveLength(0);
          }),
        );
      }),
    ),
  );
});

test('a multi-request provider failure stops before the next send and redacts its error', async () => {
  let calls = 0;
  const events: Array<unknown> = [];
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/v6/playlist/detail',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'first-token' },
        response: () =>
          Response.json({ code: 200, playlist: { trackIds: [] } }),
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=reader',
        fetcher: scenario.fetcher,
        onRequestEvent: (event) => events.push(event),
        checkToken: async () => {
          if (++calls === 2) throw new Error('secret-check-token');
          return 'first-token';
        },
      });
      const result = await settle(client.playlistTrackAll({ id: 7 }));
      expect(result).toMatchObject({
        rejected: { status: 400, body: { msg: 'checkToken provider failed' } },
      });
      expect(calls).toBe(2);
      expect(scenario.entries).toHaveLength(1);
      expect(JSON.stringify([result, events])).not.toContain(
        'secret-check-token',
      );
      expect(JSON.stringify(events)).not.toContain('first-token');
    },
  );
});

test('upload API stages take fresh tokens while external NOS receives no SDK credentials', async () => {
  let calls = 0;
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/nos/token/alloc',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'upload-token-1' },
        response: () => Response.json(tokenBody),
      },
      {
        url: 'https://nosup-hz1.127.net/yyimgs/voice/demo?offset=0&complete=true&version=1.0',
        method: 'POST',
        headers: { 'X-antiCheatToken': null, cookie: null },
        check: (wire) => {
          expect(
            wire.url + JSON.stringify([...wire.headers]) + wire.body,
          ).not.toContain('upload-token-');
          expect(wire.url + JSON.stringify([...wire.headers])).not.toContain(
            'upload-session',
          );
        },
        response: () => Response.json({ code: 200 }),
      },
      {
        url: 'https://music.163.com/weapi/playlist/cover/update',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'upload-token-2' },
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=upload-session',

        fetcher: scenario.fetcher,
        checkToken: async () => `upload-token-${++calls}`,
      });
      expect(
        (
          await client.playlistCoverUpdate({
            id: 7,
            imgFile: { ...songFile, name: 'cover.jpg', mimetype: 'image/jpeg' },
          })
        ).status,
      ).toBe(200);
      expect(calls).toBe(2);
      expect(scenario.entries).toHaveLength(3);
    },
  );
});

test('transport failures and request events redact the configured token', async () => {
  const events: Array<unknown> = [];
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/search/get',
        method: 'POST',
        reject: new Error('socket rejected secret-transport-token'),
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        cookie: 'MUSIC_U=reader',
        fetcher: scenario.fetcher,
        checkToken: 'secret-transport-token',
        onRequestEvent: (event) => events.push(event),
      });
      const result = await settle(client.search({ keywords: 'redacted' }));
      expect(result).toMatchObject({ rejected: { status: 502 } });
      expect(JSON.stringify([result, events])).not.toContain(
        'secret-transport-token',
      );
    },
  );
});

test('implicit anonymous initialization never consumes or forwards the module token', async () => {
  const previous = getRuntimeState();
  setRuntimeState({ anonymousToken: '' });
  let providers = 0;
  try {
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          headers: { 'X-antiCheatToken': null },
          response: () =>
            Response.json(
              { code: 200 },
              { headers: { 'set-cookie': 'MUSIC_A=new-anonymous; Path=/' } },
            ),
        },
        {
          url: 'https://interface.music.163.com/eapi/search/get',
          method: 'POST',
          headers: { 'X-antiCheatToken': 'business-only' },
          response: () => Response.json({ code: 200, result: { songs: [] } }),
        },
      ],
      async (scenario) => {
        const client = createHanaMusicApi({
          fetcher: scenario.fetcher,
          checkToken: async () => {
            providers++;
            return 'business-only';
          },
        });
        expect((await client.search({ keywords: 'anonymous' })).status).toBe(
          200,
        );
        expect(providers).toBe(1);
        expect(scenario.entries).toHaveLength(2);
      },
    );
  } finally {
    setRuntimeState(previous);
  }
});

test('low-level createRequest preserves explicit raw token body and headers', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/api/example/read',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'raw-token' },
        check: (wire) =>
          expect(new URLSearchParams(wire.body).get('checkToken')).toBe(
            'raw-token',
          ),
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      await createRequest(
        '/api/example/read',
        { checkToken: 'raw-token' },
        {
          crypto: 'api',
          cookie: 'MUSIC_U=low-level',
          fetcher: scenario.fetcher,
          headers: { 'X-antiCheatToken': 'raw-token' },
        },
      );
      expect(scenario.entries).toHaveLength(1);
    },
  );
});

test.each([
  {
    name: 'audioMatch',
    url: 'https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=1&rawdata=sample&times=1&decrypt=1',
    call: (client: HanaMusicApiClient) =>
      client.audioMatch({ audioFP: 'sample', duration: 1 }),
    response: () => Response.json({ code: 200, data: { result: [] } }),
  },
  {
    name: 'relatedPlaylist',
    url: 'https://music.163.com/playlist?id=7',
    call: (client: HanaMusicApiClient) => client.relatedPlaylist({ id: 7 }),
    response: () => new Response(''),
  },
])(
  'approved plain $name requests forward an explicit token only in the header',
  async ({ url, call, response }) => {
    let providers = 0;
    await withScenario(
      [
        {
          url,
          method: 'GET',
          headers: { 'X-antiCheatToken': 'plain-token' },
          check: (wire) => {
            expect(wire.url).not.toContain('plain-token');
            expect(wire.body).not.toContain('plain-token');
            expect(wire.headers.get('cookie')).toBeNull();
          },
          response,
        },
      ],
      async (scenario) => {
        const client = createHanaMusicApi({
          cookie: 'MUSIC_U=plain-account',
          fetcher: scenario.fetcher,
          checkToken: async () => {
            providers++;
            return 'plain-token';
          },
        });
        expect(await settle<unknown>(call(client))).toMatchObject({
          resolved: { status: 200 },
        });
        expect(providers).toBe(1);
        expect(scenario.entries).toHaveLength(1);
      },
    );
  },
);

test.each([
  'https://external.example',
  'http://music.163.com',
  'https://music.163.com:444',
])(
  'a configured token cannot leave through %s even without account cookies',
  async (domain) => {
    await withScenario([], async (scenario) => {
      const identity = resolveIdentitySnapshot(
        { state: { anonymousToken: '' } },
        { ...getRuntimeState(), anonymousToken: '' },
      );
      const work = requestEffect({
        protocol: 'eapi',
        target: '/api/token/probe',
        method: 'POST',
        response: 'json',
        data: { sample: 'probe' },
        headers: {},
        identity,
        ip: undefined,
        expectedUrl: null,
        policy: { semantic: 'read', retry: 'never' },
        retry: undefined,
        token: { source: 'cannot-leave', uses: undefined, managed: true },
        client: {
          domain,
          userAgent: requestProfiles.eapi.userAgent,
          cookie: requestProfiles.eapi.cookie,
          controlledCookies: [],
          controlledHeaders: [],
          encryptResponse: false,
          acceptGzip: false,
        },
      }).pipe(
        Effect.provideService(
          ExecutionScope,
          resolveExecutionScope(
            { fetcher: scenario.fetcher },
            undefined,
            Date.now(),
            8_000,
          ),
        ),
      );
      const result = await work.pipe(runEffect, settle);
      expect(result).toMatchObject({ rejected: { _tag: 'TargetRejected' } });
      expect(scenario.entries).toHaveLength(0);
    });
  },
);

for (const kind of ['string', 'provider'] as const) {
  test.each([
    ' padded-token',
    'padded-token ',
    '\tpadded-token\t',
    'line\r\nbreak',
  ])(
    `a ${kind} token must have an unchanged valid HTTP header value: %p`,
    async (value) => {
      await withScenario([], async (scenario) => {
        const checkToken = kind === 'string' ? value : async () => value;
        const client = createHanaMusicApi({
          cookie: 'MUSIC_U=reader',
          fetcher: scenario.fetcher,
          checkToken,
        });
        expect(await settle(client.songDetail({ ids: [7] }))).toMatchObject({
          rejected: { status: 400 },
        });
        expect(scenario.entries).toHaveLength(0);
      });
    },
  );
}
