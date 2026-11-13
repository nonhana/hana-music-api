import { expect, test } from 'bun:test';

import * as sdk from '../../../index.ts';
import { createServer } from '../../../src/server/create-server.ts';
import { settle } from '../../_kit/assertions.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../_kit/upstream/wire.ts';

for (const [module, method, query, path, data] of [
  [
    'like',
    'like',
    { id: 7 },
    '/api/song/like',
    { trackId: 7, like: true, alg: 'itembased', time: '3' },
  ],
  [
    'like',
    'like',
    { id: 7, like: false },
    '/api/song/like',
    { trackId: 7, like: false, alg: 'itembased', time: '3' },
  ],
  [
    'comment',
    'comment',
    { t: 2, type: 0, id: 7, commentId: 8, content: 'reply' },
    '/api/v1/resource/comments/reply',
    { threadId: 'R_SO_4_7', commentId: 8, content: 'reply' },
  ],
] as const) {
  for (const entry of ['client', 'named', 'invoke', 'http'] as const) {
    test(`web endpoint ${module}/${JSON.stringify(query)} via ${entry} uses the modern target`, async () => {
      const random = Math.random;
      Math.random = () => 0;
      try {
        await withScenario(
          [
            {
              url: `https://music.163.com${path.replace('/api/', '/weapi/')}`,
              method: 'POST',
              check: (wire) => {
                expect(readWebBody(wire.body)).toMatchObject(data);
                expect(readWebBody(wire.body)).not.toHaveProperty('userid');
                expect(readWebBody(wire.body)).not.toHaveProperty('token');
              },
              response: () => Response.json({ code: -460, msg: 'risk' }),
            },
          ],
          async (scenario) => {
            const config = {
              cookie: 'MUSIC_U=modern; deviceId=modern-device',
              fetcher: scenario.fetcher,
            };
            const named = { like: sdk.like, comment: sdk.comment }[method] as (
              input: unknown,
              options: typeof config,
            ) => Promise<unknown>;
            const result =
              entry === 'http'
                ? await (
                    await (
                      await createServer(
                        {},
                        {
                          execution: {
                            fetcher: scenario.fetcher,
                            entropy: testEntropy,
                          },
                        },
                      )
                    ).request(`/${module}`, {
                      method: 'POST',
                      headers: {
                        'content-type': 'application/json',
                        cookie: config.cookie,
                      },
                      body: JSON.stringify(query),
                    })
                  ).json()
                : await settle(
                    entry === 'invoke'
                      ? sdk.invokeModule(module, query, config)
                      : entry === 'named'
                        ? named(query, config)
                        : (
                            sdk.createHanaMusicApi(config)[method] as (
                              input: unknown,
                            ) => Promise<unknown>
                          )(query),
                  );
            expect(result).toMatchObject(
              entry === 'http'
                ? { code: -460 }
                : {
                    rejected: {
                      body: { code: -460 },
                      failure: { kind: 'business', code: -460 },
                    },
                  },
            );
            expect(scenario.sent).toHaveLength(1);
          },
        );
      } finally {
        Math.random = random;
      }
    });
  }
}

test('web batch keeps object children and partial child failures in one request', async () => {
  const random = Math.random;
  Math.random = () => 0;
  const body = {
    code: 200,
    '/api/playlist/desc/update': { code: 200 },
    '/api/playlist/tags/update': { code: 405, message: 'denied' },
    '/api/playlist/update/name': { code: 200 },
  } as const;
  try {
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/batch',
          method: 'POST',
          check: (wire) =>
            expect(readWebBody(wire.body)).toMatchObject({
              '/api/playlist/desc/update': { id: '7', desc: 'description' },
              '/api/playlist/tags/update': { id: '7', tags: 'rock;pop' },
              '/api/playlist/update/name': { id: '7', name: 'name' },
            }),
          response: () => Response.json(body),
        },
      ],
      async (scenario) => {
        const response = await sdk.playlistUpdate(
          { id: '7', name: 'name', desc: 'description', tags: ['rock', 'pop'] },
          { cookie: 'MUSIC_U=modern', fetcher: scenario.fetcher },
        );
        expect(response.body).toEqual(body);
        expect(scenario.sent).toHaveLength(1);
      },
    );
  } finally {
    Math.random = random;
  }
});

for (const type of [undefined, 0, 1, 2, 3] as const) {
  test(`web banner type ${type} preserves the business client selection`, async () => {
    const random = Math.random;
    Math.random = () => 0;
    const web = type === undefined || type === 0;
    try {
      await withScenario(
        [
          {
            url: `${web ? 'https://music.163.com/weapi' : 'https://interface.music.163.com/eapi'}/v2/banner/get`,
            method: 'POST',
            check: (wire) => {
              const data = web
                ? readWebBody(wire.body)
                : readEapiBody(wire.body).data;
              expect(data).toMatchObject({
                clientType: ['pc', 'android', 'iphone', 'ipad'][type ?? 0],
              });
            },
            response: () => Response.json({ code: 200, banners: [] }),
          },
        ],
        async (scenario) => {
          const result = await settle(
            sdk.banner(
              { type },
              { cookie: 'MUSIC_U=modern', fetcher: scenario.fetcher },
            ),
          );
          expect(result).toMatchObject({ resolved: { body: { banners: [] } } });
        },
      );
    } finally {
      Math.random = random;
    }
  });
}

test('web migrated lyric uses WEAPI without introducing an account request', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/song/lyric',
        method: 'POST',
        response: () => Response.json({ code: 200, lrc: { lyric: 'sample' } }),
      },
    ],
    async (scenario) => {
      const result = await settle(
        sdk.lyric(
          { id: 7 },
          { cookie: 'MUSIC_U=modern', fetcher: scenario.fetcher },
        ),
      );
      expect(result).toMatchObject({
        resolved: { body: { lrc: { lyric: 'sample' } } },
      });
      expect(scenario.sent).toHaveLength(1);
    },
  );
});

for (const mode of ['none', 'string', 'provider'] as const) {
  test(`web tracks 512 fallback preserves sequential ${mode} tokens`, async () => {
    const random = Math.random;
    Math.random = () => 0;
    let providers = 0;
    try {
      await withScenario(
        Array.from({ length: mode === 'string' ? 1 : 2 }, (_, index) => ({
          url: 'https://music.163.com/weapi/v1/playlist/manipulate/tracks',
          method: 'POST',
          check: (wire) => {
            const token = mode === 'none' ? undefined : `fresh-${index + 1}`;
            expect(wire.headers.get('X-antiCheatToken')).toBe(token ?? null);
            expect(readWebBody(wire.body)).toMatchObject({
              op: 'add',
              pid: 7,
              imme: 'true',
              trackIds: index === 0 ? '["17","18"]' : '["17","18","17","18"]',
              ...(token ? { checkToken: token } : {}),
            });
          },
          response: () => Response.json({ code: index === 0 ? 512 : 200 }),
        })),
        async (scenario) => {
          const result = await settle(
            sdk.playlistTracks(
              { op: 'add', pid: 7, tracks: [17, 18] },
              {
                cookie: 'MUSIC_U=modern',
                fetcher: scenario.fetcher,
                checkToken:
                  mode === 'none'
                    ? undefined
                    : mode === 'string'
                      ? 'fresh-1'
                      : async () => `fresh-${++providers}`,
              },
            ),
          );
          expect(result).toHaveProperty(
            mode === 'string' ? 'rejected.status' : 'resolved.status',
            mode === 'string' ? 400 : 200,
          );
          expect(providers).toBe(mode === 'provider' ? 2 : 0);
        },
      );
    } finally {
      Math.random = random;
    }
  });
}

for (const code of [301, 405, -460]) {
  for (const module of ['like', 'comment'] as const) {
    test(`web ${module} refusal ${code} never replays or changes protocol`, async () => {
      const path =
        module === 'like' ? 'song/like' : 'v1/resource/comments/reply';
      const body = { code, msg: 'modern-refusal' };
      await withScenario(
        [
          {
            url: `https://music.163.com/weapi/${path}`,
            method: 'POST',
            response: () => Response.json(body),
          },
        ],
        async (scenario) => {
          const config = {
            cookie: 'MUSIC_U=modern',
            fetcher: scenario.fetcher,
            retry: {
              retries: 5,
              retryNonIdempotent: true,
              statusCodes: [301, 405],
              backoffMs: 0,
            },
          };
          const result = await settle(
            module === 'like'
              ? sdk.like({ id: 7 }, config)
              : sdk.comment(
                  { id: 7, t: 2, type: 0, commentId: 8, content: 'reply' },
                  config,
                ),
          );
          expect(result).toMatchObject({
            rejected: { body, failure: { kind: 'business', code } },
          });
          expect(scenario.sent).toHaveLength(1);
        },
      );
    });
  }
}
