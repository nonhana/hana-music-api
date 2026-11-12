import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { invokeModule, mlogToVideo, voiceDelete } from '../../../../index.ts';
import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import {
  businessFailure,
  projectRoot,
  settle,
} from '../../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import responseFiles from '../../../fixtures/requests/podcast-video-responses.json';
import baseline from '../../../fixtures/requests/podcast-video.json';

// dj_recommend_type 的基线 default 省略了必填 type；#128 后 decoder 直接拒绝，策略用例改用合法分类编号。
const defaults = baseline.cases
  .filter(
    (entry) =>
      entry.label === 'default' && entry.module !== 'video_detail_info',
  )
  .map((entry) => {
    if (entry.module === 'dj_recommend_type')
      return { ...entry, query: { type: 3 } };
    if (entry.module === 'voice_delete')
      return {
        ...entry,
        query: {
          ids: (entry.query as { ids: Array<number> }).ids,
        },
      };
    return entry;
  });
const cookie =
  'MUSIC_U=content-account; MUSIC_A=content-anonymous; __csrf=csrf';

for (const entry of defaults) {
  for (const failure of ['EAI_AGAIN', 'socket hang up']) {
    test(`content ${entry.module} preserves ${failure} retry eligibility`, async () => {
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
              result: await settle<NcmApiResponse>(call(entry.query)),
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
  test(`content ${entry.module} never shares or caches successful calls`, async () => {
    const path = responseFiles[entry.module as keyof typeof responseFiles];
    // Unrecorded workbench successes are synthetic policy samples, not upstream evidence.
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
const contentMethodInput = (
  method: 'voiceDelete' | 'voiceDetail' | 'djSub' | 'videoTimelineAll',
) =>
  method === 'voiceDelete'
    ? { ids: [17] }
    : method === 'voiceDetail'
      ? { id: 17 }
      : method === 'djSub'
        ? { rid: 17 }
        : {};

for (const method of [
  'voiceDelete',
  'voiceDetail',
  'djSub',
  'videoTimelineAll',
] as const) {
  for (const mode of ['cancel', 'deadline'] as const) {
    for (const phase of ['provider', 'body'] as const) {
      test(`content ${method} ${mode} covers the complete ${phase} phase`, async () => {
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
                client[method](contentMethodInput(method) as never, {
                  signal: controller.signal,
                }),
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
for (const method of ['voiceDelete', 'videoTimelineAll'] as const) {
  test(`content ${method} never replays after a partial response body fails`, async () => {
    const url =
      method === 'voiceDelete'
        ? 'https://interface.music.163.com/eapi/content/voice/delete'
        : 'https://music.163.com/weapi/videotimeline/otherclient/get';
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
            result: await settle(
              client[method](contentMethodInput(method) as never),
            ),
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

for (const entry of [
  {
    module: 'dj_program',
    query: { asc: {} },
    route: '/dj/program',
    status: 400,
  },
  {
    module: 'dj_program',
    query: { asc: null },
    route: '/dj/program',
    status: 400,
  },
  {
    module: 'mv_detail_info',
    query: { mvid: {} },
    route: '/mv/detail/info',
    status: 400,
  },
  {
    module: 'video_detail_info',
    query: { vid: [] },
    route: '/video/detail/info',
    status: 400,
  },
  {
    module: 'user_dj',
    query: { uid: '23', limit: '' },
    route: '/user/dj',
    status: 400,
  },
] as const) {
  test(`content ${entry.module}/${JSON.stringify(entry.query)} preserves its local rejection without sending or taking a token`, async () => {
    let providers = 0;
    const outcome = await withScenario([], async (scenario) => {
      const config = {
        cookie,
        checkToken: async () => {
          providers++;
          return 'unused-token';
        },
      };
      const client = createClientFromContext(
        config,
        buildCallServices(config, false, { fetcher: scenario.fetcher }),
      );
      const call = client[
        entry.module === 'dj_program'
          ? 'djProgram'
          : entry.module === 'mv_detail_info'
            ? 'mvDetailInfo'
            : entry.module === 'video_detail_info'
              ? 'videoDetailInfo'
              : 'userDj'
      ] as (query: unknown) => Promise<NcmApiResponse>;
      const sdk = await settle<NcmApiResponse>(call(entry.query));
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
    });
    expect(outcome.status).toBe(entry.status);
    expect(outcome.sdk).toHaveProperty('rejected.status', entry.status);
    expect(outcome.sends).toBe(0);
    expect(providers).toBe(0);
  });
}

test('content HTTP rejects generic token config before sending', async () => {
  const outcome = await withScenario([], async (scenario) => {
    const app = await createServer(
      {},
      { execution: { fetcher: scenario.fetcher } },
    );
    const response = await app.request(
      '/video/timeline/all?checkToken=forbidden',
    );
    return { status: response.status, sends: scenario.sent.length };
  });
  expect(outcome).toEqual({ status: 400, sends: 0 });
});

test('content named and dynamic entries retain Promise refusal envelopes', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/mlog/video/convert/id',
        method: 'POST',
        times: 2,
        response: () => Response.json({ code: 403 }),
      },
      {
        url: 'https://interface.music.163.com/eapi/content/voice/delete',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
    ],
    async (scenario) => {
      const config = { cookie, fetcher: scenario.fetcher };
      const pending = mlogToVideo({ id: 'synthetic-mlog' }, config);
      expect(pending).toBeInstanceOf(Promise);
      const results = await Promise.all([
        settle(pending),
        settle(invokeModule('mlog_to_video', { id: 'synthetic-mlog' }, config)),
        settle(voiceDelete({ ids: [17] }, config)),
      ]);
      for (const result of results)
        expect(result).toEqual({
          rejected: {
            status: 403,
            body: { code: 403 },
            cookie: [],
            failure: businessFailure({ code: 403 }),
          },
        });
    },
  );
});

test('content interleaved calls freeze distinct account inputs tokens and results', async () => {
  const ready = createStage('content first token');
  let finish!: (value: string) => void;
  const firstCookie = { MUSIC_U: 'first-content-account' };
  const query = { ids: [17] };
  const outcome = await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/videotimeline/otherclient/get',
        method: 'POST',
        response: () =>
          Response.json({ code: 200, datas: [], owner: 'second' }),
      },
      {
        url: 'https://interface.music.163.com/eapi/content/voice/delete',
        method: 'POST',
        response: () => Response.json({ code: 200, owner: 'first' }),
      },
    ],
    async (scenario) => {
      const config = { cookie };
      const services = buildCallServices(config, false, {
        fetcher: scenario.fetcher,
        entropy: testEntropy,
      });
      const client = createClientFromContext(config, services);
      const first = settle(
        client.voiceDelete(query, {
          cookie: firstCookie,
          checkToken: () =>
            new Promise((resolve) => {
              finish = resolve;
              ready.reach();
            }),
        }),
      );
      await ready.wait(first);
      firstCookie.MUSIC_U = 'changed';
      query.ids = [99];
      const second = await client.videoTimelineAll(
        { offset: 3 },
        {
          cookie: 'MUSIC_U=second-content-account',
          checkToken: 'second-token',
        },
      );
      finish('first-token');
      return {
        first: await first,
        second,
        wires: scenario.sent,
        reads: services.reads.snapshot,
      };
    },
  );
  expect(outcome.first).toMatchObject({
    resolved: { body: { owner: 'first' } },
  });
  expect(outcome.second.body).toMatchObject({ owner: 'second' });
  expect(readEapiBody(outcome.wires[1]!.body).data).toMatchObject({
    ids: '[17]',
    checkToken: 'first-token',
    header: { MUSIC_U: 'first-content-account' },
  });
  expect(readWebBody(outcome.wires[0]!.body)).toMatchObject({
    offset: 3,
    checkToken: 'second-token',
  });
  expect(outcome.wires[0]!.headers.get('cookie')).toContain(
    'MUSIC_U=second-content-account',
  );
  expect(outcome.wires[1]!.headers.get('cookie')).not.toContain(
    'second-content-account',
  );
  expect(outcome.reads).toMatchObject({ inflight: 0, merged: 0, cacheHits: 0 });
});

for (const uid of ['../escape', '23?extra=1', '23#fragment']) {
  test(`content user_dj rejects dynamic path escape ${uid} before sending`, async () => {
    await withScenario([], async (scenario) => {
      const config = { cookie, fetcher: scenario.fetcher };
      expect(
        await settle(invokeModule('user_dj', { uid }, config)),
      ).toHaveProperty('rejected.status', 400);
      expect(scenario.sent).toHaveLength(0);
    });
  });
}

for (const entry of [
  {
    route: '/voice/detail',
    url: 'https://interface.music.163.com/eapi/voice/workbench/voice/detail',
    body: { code: 200 },
  },
  {
    route: '/video/timeline/all',
    url: 'https://music.163.com/weapi/videotimeline/otherclient/get',
    body: { code: 200, datas: [] },
  },
]) {
  test(`content HTTP ${entry.route} keeps distinct concurrent account inputs and results`, async () => {
    const outcome = await withScenario(
      [
        {
          url: entry.url,
          method: 'POST',
          times: 2,
          response: (wire) => {
            const first = wire.headers
              .get('cookie')!
              .includes('MUSIC_U=http-first-body');
            const payload =
              entry.route === '/voice/detail'
                ? readEapiBody(wire.body).data
                : readWebBody(wire.body);
            return Response.json({
              ...entry.body,
              owner: first ? 'first' : 'second',
              input: payload,
            });
          },
        },
      ],
      async (scenario) => {
        const app = await createServer(
          {},
          { execution: { fetcher: scenario.fetcher, entropy: testEntropy } },
        );
        const [first, second] = await Promise.all([
          app.request(
            entry.route +
              '?cookie=' +
              encodeURIComponent('MUSIC_U=http-first-query'),
            {
              method: 'POST',
              headers: {
                cookie: 'MUSIC_U=http-first-header',
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                ...(entry.route === '/voice/detail'
                  ? { id: '17' }
                  : { offset: 3 }),
                cookie: 'MUSIC_U=http-first-body',
              }),
            },
          ),
          app.request(entry.route, {
            method: 'POST',
            headers: {
              cookie: 'MUSIC_U=http-second-header',
              'content-type': 'application/json',
            },
            body: JSON.stringify(
              entry.route === '/voice/detail' ? { id: '19' } : { offset: 7 },
            ),
          }),
        ]);
        return {
          first: await first.json(),
          second: await second.json(),
          wires: scenario.sent,
        };
      },
    );
    expect(outcome.first).toMatchObject({
      owner: 'first',
      input:
        entry.route === '/voice/detail'
          ? { id: '17', header: { MUSIC_U: 'http-first-body' } }
          : { offset: 3 },
    });
    expect(outcome.second).toMatchObject({
      owner: 'second',
      input:
        entry.route === '/voice/detail'
          ? { id: '19', header: { MUSIC_U: 'http-second-header' } }
          : { offset: 7 },
    });
    expect(outcome.wires).toHaveLength(2);
  });
}
