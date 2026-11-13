import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

import { Effect, Exit } from 'effect';
import { TestClock } from 'effect/testing';

import {
  dailySignin,
  digitalAlbumOrdering,
  invokeModule,
} from '../../../../index.ts';
import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import type { ModuleIdentifier } from '../../../../src/types/index.ts';
import {
  businessFailure,
  projectRoot,
  settle,
} from '../../../_kit/assertions.ts';
import { currentRequests } from '../../../_kit/current-requests.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect, runExit } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import responseFiles from '../../../fixtures/requests/membership-business-responses.json';
import frozenRequests from '../../../fixtures/requests/membership-business.json';

const baseline = currentRequests('membership-business', frozenRequests);

const defaults = baseline.cases.filter((entry) => entry.label === 'default');
// #128 收窄公开输入后，编号集合改为数组；延续默认样本的 token/重试覆盖。
const modernQueries: Readonly<Record<string, unknown>> = {
  vip_growthpoint_get: { ids: ['17', '19'] },
  digitalAlbum_sales: { ids: [17, 19] },
};
const validDefaults = (
  await Promise.all(
    defaults.map(async (entry) => {
      const { decodeModuleInput } = (await import(
        `../../../../src/modules/${entry.module}.ts`
      )) as {
        decodeModuleInput: (input: unknown) => Effect.Effect<unknown, unknown>;
      };
      const query = modernQueries[entry.module] ?? entry.query;
      return Exit.isSuccess(await runExit(decodeModuleInput(query)))
        ? entry
        : undefined;
    }),
  )
).filter((entry) => entry !== undefined);
const cookie =
  'MUSIC_U=content-account; MUSIC_A=content-anonymous; __csrf=csrf';

for (const entry of validDefaults) {
  for (const failure of ['EAI_AGAIN', 'socket hang up']) {
    test(`membership ${entry.module} preserves ${failure} retry eligibility`, async () => {
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
            const moduleQuery = modernQueries[entry.module] ?? entry.query;
            return {
              result: await settle<NcmApiResponse>(call(moduleQuery)),
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
  test(`membership ${entry.module} never shares or caches successful calls`, async () => {
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
          const moduleQuery = modernQueries[entry.module] ?? entry.query;
          const first = await Promise.all([
            call(moduleQuery),
            call(moduleQuery),
          ]);
          const next = await call(moduleQuery);
          await call(moduleQuery, { cookie: 'MUSIC_U=other-account' });
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
for (const method of [
  'dailySignin',
  'listenDataTotal',
  'digitalAlbumOrdering',
  'vipInfo',
] as const) {
  for (const mode of ['cancel', 'deadline'] as const) {
    for (const phase of ['provider', 'body'] as const) {
      test(`membership ${method} ${mode} covers the complete ${phase} phase`, async () => {
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
                client[method](membershipMethodInput(method) as never, {
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
const membershipMethodInput = (method: string) =>
  method === 'digitalAlbumOrdering'
    ? { id: 17, payment: '3', quantity: 1 }
    : {};

for (const method of ['dailySignin', 'digitalAlbumOrdering'] as const) {
  test(`membership ${method} never replays after a partial response body fails`, async () => {
    const url =
      method === 'dailySignin'
        ? 'https://interface.music.163.com/eapi/point/dailyTask'
        : 'https://music.163.com/weapi/ordering/web/digital';
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
              client[method](membershipMethodInput(method) as never),
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
  { module: 'batch', query: { '/api/empty': null }, route: '/batch' },
  { module: 'summary_annual', query: { year: {} }, route: '/summary/annual' },
  {
    module: 'user_record',
    query: { uid: '23', type: 'month' },
    route: '/user/record',
  },
  { module: 'user_record', query: { type: 0 }, route: '/user/record' },
]) {
  test(`membership ${entry.module}/${JSON.stringify(entry.query)} preserves local rejection without sending or taking a token`, async () => {
    let providers = 0;
    await withScenario([], async (scenario) => {
      const config = {
        cookie,
        fetcher: scenario.fetcher,
        checkToken: async () => {
          providers++;
          return 'unused-token';
        },
      };
      expect(
        await settle(
          invokeModule(entry.module as ModuleIdentifier, entry.query, config),
        ),
      ).toHaveProperty('rejected.status', 400);
      const app = await createServer(
        {},
        { execution: { fetcher: scenario.fetcher } },
      );
      const response = await app.request(entry.route, {
        method: 'POST',
        headers: { cookie, 'content-type': 'application/json' },
        body: JSON.stringify(entry.query),
      });
      expect(response.status).toBe(400);
      expect(scenario.sent).toHaveLength(0);
    });
    expect(providers).toBe(0);
  });
}

test('membership HTTP rejects generic token config before sending', async () => {
  const outcome = await withScenario([], async (scenario) => {
    const app = await createServer(
      {},
      { execution: { fetcher: scenario.fetcher } },
    );
    const response = await app.request('/daily_signin?checkToken=forbidden');
    return { status: response.status, sends: scenario.sent.length };
  });
  expect(outcome).toEqual({ status: 400, sends: 0 });
});

test('membership named and dynamic entries retain Promise refusal envelopes', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/ordering/web/digital',
        method: 'POST',
        times: 2,
        response: () => Response.json({ code: 403 }),
      },
      {
        url: 'https://interface.music.163.com/eapi/point/dailyTask',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
    ],
    async (scenario) => {
      const config = { cookie, fetcher: scenario.fetcher };
      const pending = digitalAlbumOrdering(
        { id: '17', payment: '3', quantity: 2 },
        config,
      );
      expect(pending).toBeInstanceOf(Promise);
      const results = await Promise.all([
        settle(pending),
        settle(
          invokeModule(
            'digitalAlbum_ordering',
            { id: '19', payment: '3', quantity: 1 },
            config,
          ),
        ),
        settle(dailySignin({ type: 1 }, config)),
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

test('membership interleaved calls freeze distinct account inputs tokens and results', async () => {
  const ready = createStage('membership first token');
  let finish!: (value: string) => void;
  const firstCookie = { MUSIC_U: 'first-membership-account' };
  const query: { type: 0 | 1 } = { type: 1 };
  const outcome = await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/ordering/web/digital',
        method: 'POST',
        response: () => Response.json({ code: 200, owner: 'second' }),
      },
      {
        url: 'https://interface.music.163.com/eapi/point/dailyTask',
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
        client.dailySignin(query, {
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
      query.type = 0;
      const second = await client.digitalAlbumOrdering(
        { id: '19', payment: '3', quantity: 2 },
        {
          cookie: 'MUSIC_U=second-membership-account',
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
    type: 1,
    checkToken: 'first-token',
    header: { MUSIC_U: 'first-membership-account' },
  });
  expect(readWebBody(outcome.wires[0]!.body)).toMatchObject({
    digitalResources: JSON.stringify([
      { business: 'Album', resourceID: '19', quantity: 2 },
    ]),
    checkToken: 'second-token',
  });
  expect(outcome.wires[0]!.headers.get('cookie')).toContain(
    'MUSIC_U=second-membership-account',
  );
  expect(outcome.wires[1]!.headers.get('cookie')).not.toContain(
    'second-membership-account',
  );
  expect(outcome.reads).toMatchObject({ inflight: 0, merged: 0, cacheHits: 0 });
});

for (const year of ['../../../escape', '2024?extra=1', '2024#fragment']) {
  test(`membership summary_annual rejects dynamic path escape ${year} before sending`, async () => {
    await withScenario([], async (scenario) => {
      expect(
        await settle(
          invokeModule('summary_annual', { year } as never, {
            cookie,
            fetcher: scenario.fetcher,
          }),
        ),
      ).toHaveProperty('rejected.status', 400);
      expect(scenario.sent).toHaveLength(0);
    });
  });
}

for (const entry of [
  {
    route: '/daily_signin',
    url: 'https://interface.music.163.com/eapi/point/dailyTask',
    protocol: 'eapi',
  },
  {
    route: '/digitalAlbum/ordering',
    url: 'https://music.163.com/weapi/ordering/web/digital',
    protocol: 'weapi',
  },
]) {
  test(`membership HTTP ${entry.route} keeps distinct concurrent account inputs and results`, async () => {
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
            const input =
              entry.protocol === 'eapi'
                ? readEapiBody(wire.body).data
                : readWebBody(wire.body);
            return Response.json({
              code: 200,
              owner: first ? 'first' : 'second',
              input,
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
              body: JSON.stringify(
                entry.protocol === 'eapi'
                  ? { type: 1, cookie: 'MUSIC_U=http-first-body' }
                  : {
                      id: '17',
                      payment: '3',
                      quantity: 1,
                      cookie: 'MUSIC_U=http-first-body',
                    },
              ),
            },
          ),
          app.request(entry.route, {
            method: 'POST',
            headers: {
              cookie: 'MUSIC_U=http-second-header',
              'content-type': 'application/json',
            },
            body: JSON.stringify(
              entry.protocol === 'eapi'
                ? { type: 0 }
                : {
                    id: '19',
                    payment: '0',
                    quantity: 2,
                  },
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
        entry.protocol === 'eapi'
          ? { type: 1, header: { MUSIC_U: 'http-first-body' } }
          : {
              paymentMethod: '3',
              digitalResources: JSON.stringify([
                { business: 'Album', resourceID: '17', quantity: 1 },
              ]),
            },
    });
    expect(outcome.second).toMatchObject({
      owner: 'second',
      input:
        entry.protocol === 'eapi'
          ? { type: 0, header: { MUSIC_U: 'http-second-header' } }
          : {
              paymentMethod: '0',
              digitalResources: JSON.stringify([
                { business: 'Album', resourceID: '19', quantity: 2 },
              ]),
            },
    });
    expect(outcome.wires).toHaveLength(2);
  });
}
