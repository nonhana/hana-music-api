import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { album, invokeModule, songUrlV1 } from '../../../../index.ts';
import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { projectRoot, settle } from '../../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import responseFiles from '../../../fixtures/requests/library-playback-responses.json';
import baseline from '../../../fixtures/requests/library-playback.json';

const defaults = baseline.cases.filter((entry) => entry.label === 'default');
const cookie =
  'MUSIC_U=library-account; MUSIC_A=library-anonymous; __csrf=csrf';

for (const entry of defaults) {
  for (const failure of ['EAI_AGAIN', 'socket hang up']) {
    test(`library ${entry.module} preserves ${failure} retry eligibility`, async () => {
      const attempts =
        entry.retry === 'never'
          ? 1
          : entry.retry === 'read'
            ? 2
            : failure === 'EAI_AGAIN'
              ? 3
              : 1;
      const observed = await settle(
        withScenario(
          [
            {
              url: entry.url,
              method: 'POST',
              times: attempts,
              reject: new Error(failure),
              response: () => Response.json({ code: 200 }),
            },
          ],
          async (scenario) => {
            const config = {
              cookie,
              retry: {
                retryNonIdempotent: true,
                retries: 1,
                backoffMs: 0,
                jitter: false,
              },
            };
            const client = createClientFromContext(
              config,
              buildCallServices(config, false, { fetcher: scenario.fetcher }),
            );
            const call = client[entry.method as keyof typeof client] as (
              query: unknown,
            ) => Promise<NcmApiResponse>;
            return {
              result: await settle(call(entry.query)),
              sends: scenario.sent.length,
            };
          },
        ),
      );
      expect(observed).toMatchObject({
        resolved: { result: { rejected: { status: 502 } }, sends: attempts },
      });
    });
  }
  test(`library ${entry.module} never shares or caches successful calls`, async () => {
    const path = responseFiles[entry.module as keyof typeof responseFiles];
    // Three modules have no successful recording; this synthetic body only proves traffic policy.
    const body: unknown = path
      ? JSON.parse(await readFile(`${projectRoot}/${path}`, 'utf8')).response
          .body
      : { code: 200, synthetic: true };
    const observed = await settle(
      withScenario(
        [
          {
            url: entry.url,
            method: 'POST',
            times: 4,
            response: () => Response.json(body),
          },
        ],
        async (scenario) => {
          const config = { cookie, cache: { ttlMs: 60000 } };
          const services = buildCallServices(config, false, {
            fetcher: scenario.fetcher,
          });
          const client = createClientFromContext(config, services);
          const call = client[entry.method as keyof typeof client] as (
            query: unknown,
            config?: ModuleCallConfig,
          ) => Promise<NcmApiResponse>;
          const first = await Promise.all([
            call(entry.query),
            call(entry.query),
          ]);
          const next = await call(entry.query);
          await call(entry.query, { cookie: 'MUSIC_U=other-account' });
          return {
            statuses: [...first, next].map((result) => result.status),
            sends: scenario.sent.length,
            reads: services.reads.snapshot,
          };
        },
      ),
    );
    expect(observed).toMatchObject({
      resolved: {
        statuses: [200, 200, 200],
        sends: 4,
        reads: { inflight: 0, merged: 0, cacheHits: 0 },
      },
    });
  });
}

for (const entry of [
  { module: 'album', query: { id: '../../artist/17' }, route: '/album' },
  {
    module: 'artist_album',
    query: { id: '../../artist/17' },
    route: '/artist/album',
  },
  { module: 'artists', query: { id: '../../album/17' }, route: '/artists' },
  {
    module: 'album_songsaleboard',
    query: { type: '../../../artist' },
    route: '/album/songsaleboard',
  },
] as const) {
  test(`library ${entry.module} rejects a normalized dynamic path escape before sending`, async () => {
    const result = await settle(
      withScenario([], async (scenario) => {
        const client = createClientFromContext(
          { cookie },
          buildCallServices({ cookie }, false, { fetcher: scenario.fetcher }),
        );
        const method = entry.module.replace(/_([a-z])/g, (_, letter: string) =>
          letter.toUpperCase(),
        );
        const call = client[method as keyof typeof client] as (
          query: unknown,
        ) => Promise<NcmApiResponse>;
        const sdk = await settle(call(entry.query));
        const app = await createServer(
          {},
          { execution: { fetcher: scenario.fetcher } },
        );
        const http = await app.request(entry.route, {
          method: 'POST',
          headers: { cookie, 'content-type': 'application/json' },
          body: JSON.stringify(entry.query),
        });
        return { sdk, status: http.status, sends: scenario.sent.length };
      }),
    );
    expect(result).toMatchObject({
      resolved: {
        sdk: { rejected: { status: 400 } },
        status: 400,
        sends: 0,
      },
    });
  });
}

test('library HTTP still rejects token execution config before sending', async () => {
  const result = await withScenario([], async (scenario) => {
    const app = await createServer(
      {},
      { execution: { fetcher: scenario.fetcher } },
    );
    const response = await app.request(
      '/like?id=17&like=false&checkToken=forbidden',
      { headers: { cookie } },
    );
    return { status: response.status, sends: scenario.sent.length };
  });
  expect(result).toEqual({ status: 400, sends: 0 });
});

test('library root named and dynamic SDK entries retain Promise refusal envelopes', async () => {
  const result = await settle(
    withScenario(
      [
        {
          url: 'https://music.163.com/weapi/v1/album/17',
          method: 'POST',
          response: () => Response.json({ code: 403, msg: 'refused' }),
        },
        {
          url: 'https://interface.music.163.com/eapi/song/enhance/player/url/v1',
          method: 'POST',
          times: 2,
          response: () => Response.json({ code: 403, msg: 'refused' }),
        },
      ],
      async (scenario) => {
        const config = { cookie, fetcher: scenario.fetcher };
        return Promise.all([
          settle(album({ id: 17 }, config)),
          settle(songUrlV1({ id: 17, level: 'sky' }, config)),
          settle(invokeModule('song_url_v1', { id: 17 }, config)),
        ]);
      },
    ),
  );
  expect(result).toHaveProperty('resolved');
  if (!('resolved' in result)) return;
  expect(result.resolved).toHaveLength(3);
  for (const outcome of result.resolved) {
    expect(outcome).toHaveProperty('rejected.status', 403);
    expect(outcome).toHaveProperty('rejected.body', {
      code: 403,
      msg: 'refused',
    });
  }
});

for (const method of ['artistNewMv', 'artistNewSong'] as const) {
  test(`library ${method} defaults before to the current time`, async () => {
    const url = `https://music.163.com/weapi/sub/artist/new/works/${method === 'artistNewMv' ? 'mv' : 'song'}/list`;
    const began = Date.now();
    const result = await withScenario(
      [{ url, method: 'POST', response: () => Response.json({ code: 403 }) }],
      async (scenario) => {
        const client = createClientFromContext(
          { cookie },
          buildCallServices({ cookie }, false, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
        );
        await settle(client[method]({}));
        return readWebBody(scenario.sent[0]!.body) as {
          startTimestamp: number;
        };
      },
    );
    expect(result.startTimestamp).toBeGreaterThanOrEqual(began);
    expect(result.startTimestamp).toBeLessThanOrEqual(Date.now());
  });
}

test('library import creates its original default local-time playlist name', async () => {
  const started = Date.now();
  const result = await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/playlist/import/name/task/create',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
    ],
    async (scenario) => {
      const client = createClientFromContext(
        { cookie },
        buildCallServices({ cookie }, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      await settle(client.playlistImportNameTaskCreate({}));
      return readEapiBody(scenario.sent[0]!.body).data as {
        playlistName: string;
        songs: string;
      };
    },
  );
  expect([
    new Date(started).toLocaleString(),
    new Date().toLocaleString(),
  ]).toContain(result.playlistName.slice('导入音乐 '.length));
  expect(result.playlistName.startsWith('导入音乐 ')).toBe(true);
  expect(result.songs).toBe('');
});

for (const method of [
  'like',
  'songUrlV1',
  'playlistImportTaskStatus',
] as const) {
  for (const mode of ['cancel', 'deadline'] as const) {
    for (const phase of ['provider', 'body'] as const) {
      test(`library ${method} ${mode} covers the complete ${phase} phase`, async () => {
        await runEffect(
          Effect.scoped(
            Effect.gen(function* () {
              const clock = yield* TestClock.make();
              const reached = createStage(phase);
              const controller = new AbortController();
              let finish!: (value: string) => void;
              let cancelled = 0;
              let sends = 0;
              const config = {
                cookie,
                timeoutMs: 100,
                checkToken:
                  phase === 'provider'
                    ? () =>
                        new Promise<string>((resolve) => {
                          finish = resolve;
                          reached.reach();
                        })
                    : undefined,
              };
              const services = buildCallServices(config, false, {
                clock,
                entropy: testEntropy,
                fetcher: async () => {
                  sends++;
                  return new Response(
                    new ReadableStream<Uint8Array>(
                      {
                        pull: () => reached.reach(),
                        cancel: () => {
                          cancelled++;
                        },
                      },
                      { highWaterMark: 0 },
                    ),
                    { headers: { 'content-type': 'application/json' } },
                  );
                },
              });
              const client = createClientFromContext(config, services);
              const pending = settle<NcmApiResponse>(
                client[method]({ id: 17 }, { signal: controller.signal }),
              );
              yield* Effect.promise(() => reached.wait(pending));
              if (mode === 'cancel') controller.abort();
              else yield* clock.adjust(100);
              const result = yield* Effect.promise(() => pending);
              expect(result).toMatchObject({
                rejected: { status: mode === 'cancel' ? 499 : 504 },
              });
              if (phase === 'provider') {
                finish('late-token');
                yield* Effect.yieldNow;
              }
              expect(sends).toBe(phase === 'provider' ? 0 : 1);
              expect(cancelled).toBe(phase === 'body' ? 1 : 0);
              expect(services.reads.snapshot.inflight).toBe(0);
            }),
          ),
        );
      });
    }
  }
}

test('library interleaved PC calls freeze each account input and token', async () => {
  const ready = createStage('library token');
  let finish!: (value: string) => void;
  const firstCookie = { MUSIC_U: 'first-account' };
  const query = { id: 17, like: false };
  const result = await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/song/enhance/player/url/v1',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
      {
        url: 'https://music.163.com/weapi/radio/like',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
    ],
    async (scenario) => {
      const client = createClientFromContext(
        { cookie },
        buildCallServices({ cookie }, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      const first = settle(
        client.like(query, {
          cookie: firstCookie,
          checkToken: () =>
            new Promise<string>((resolve) => {
              finish = resolve;
              ready.reach();
            }),
        }),
      );
      await ready.wait(first);
      firstCookie.MUSIC_U = 'changed';
      query.id = 99;
      query.like = true;
      const second = await settle(
        client.songUrlV1(
          { id: 23 },
          { cookie: 'MUSIC_U=second-account', checkToken: 'second-token' },
        ),
      );
      finish('first-token');
      await first;
      return { second, wires: scenario.sent };
    },
  );
  expect(result.second).toMatchObject({ rejected: { status: 403 } });
  expect(readWebBody(result.wires[1]!.body)).toMatchObject({
    trackId: 17,
    like: false,
    checkToken: 'first-token',
  });
  expect(readEapiBody(result.wires[0]!.body).data).toMatchObject({
    ids: '[23]',
    checkToken: 'second-token',
    header: { MUSIC_U: 'second-account' },
  });
  expect(result.wires[1]!.headers.get('cookie')).toContain(
    'MUSIC_U=first-account',
  );
  expect(result.wires[1]!.headers.get('cookie')).not.toContain(
    'second-account',
  );
});

for (const code of [200, 400]) {
  test(`library cloud deletion preserves a synthetic ${code} response without narrowing unknown fields`, async () => {
    const body = { code, future: { items: [17, 23] } };
    const result = await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/cloud/del',
          method: 'POST',
          response: () =>
            Response.json(body, {
              headers: {
                'set-cookie': 'synthetic=updated; Domain=music.163.com; Path=/',
              },
            }),
        },
      ],
      async (scenario) => {
        const client = createClientFromContext(
          { cookie },
          buildCallServices({ cookie }, false, { fetcher: scenario.fetcher }),
        );
        return settle(client.userCloudDel({ id: 17 }));
      },
    );
    expect(result).toEqual({
      resolved: { status: 200, body, cookie: ['synthetic=updated; Path=/'] },
    });
  });
}

for (const method of ['like', 'playlistImportTaskStatus'] as const) {
  test(`library ${method} never replays after a partial response body fails`, async () => {
    const url =
      method === 'like'
        ? 'https://music.163.com/weapi/radio/like'
        : 'https://interface.music.163.com/eapi/playlist/import/task/status/v2';
    let bodyPulls = 0;
    const observed = await settle(
      withScenario(
        [
          {
            url,
            method: 'POST',
            response: () =>
              new Response(
                new ReadableStream<Uint8Array>({
                  start: (controller) =>
                    controller.enqueue(new TextEncoder().encode('{"code":')),
                  pull: (controller) => {
                    bodyPulls++;
                    controller.error(new Error('socket hang up'));
                  },
                }),
                { headers: { 'content-type': 'application/json' } },
              ),
          },
        ],
        async (scenario) => {
          const config = {
            cookie,
            retry: {
              retryNonIdempotent: true,
              retries: 5,
              statusCodes: [502],
              backoffMs: 0,
              jitter: false,
            },
          };
          const services = buildCallServices(config, false, {
            fetcher: scenario.fetcher,
          });
          const client = createClientFromContext(config, services);
          return {
            result: await settle<NcmApiResponse>(client[method]({ id: 17 })),
            sends: scenario.sent.length,
            reads: services.reads.snapshot,
          };
        },
      ),
    );
    expect(observed).toMatchObject({
      resolved: {
        result: { rejected: { status: 502 } },
        sends: 1,
        reads: { inflight: 0 },
      },
    });
    expect(bodyPulls).toBe(1);
  });
}
