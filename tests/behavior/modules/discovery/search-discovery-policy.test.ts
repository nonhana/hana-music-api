import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

import { Effect, Exit } from 'effect';
import { TestClock } from 'effect/testing';

import { fmTrash, invokeModule, searchSuggest } from '../../../../index.ts';
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
import { runEffect, runExit } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import responseFiles from '../../../fixtures/requests/search-discovery-responses.json';
import baseline from '../../../fixtures/requests/search-discovery.json';

const defaults = baseline.cases.filter((entry) => entry.label === 'default');
const validDefaults = (
  await Promise.all(
    defaults.map(async (entry) => {
      const { decodeModuleInput } = (await import(
        `../../../../src/modules/${entry.module}.ts`
      )) as {
        decodeModuleInput: (input: unknown) => Effect.Effect<unknown, unknown>;
      };
      return Exit.isSuccess(await runExit(decodeModuleInput(entry.query)))
        ? entry
        : undefined;
    }),
  )
).filter((entry) => entry !== undefined);
const cookie =
  'MUSIC_U=discovery-account; MUSIC_A=discovery-anonymous; __csrf=csrf';

for (const entry of validDefaults) {
  for (const failure of ['EAI_AGAIN', 'socket hang up']) {
    test(`discovery ${entry.module} preserves ${failure} retry eligibility`, async () => {
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
  test(`discovery ${entry.module} never shares or caches successful calls`, async () => {
    const path = responseFiles[entry.module as keyof typeof responseFiles];
    const body: unknown = JSON.parse(
      await readFile(`${projectRoot}/${path}`, 'utf8'),
    ).response.body;
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
const discoveryMethodInput = (
  method: 'fmTrash' | 'cloudsearch' | 'personalFmMode',
) =>
  method === 'fmTrash'
    ? { id: 17 }
    : method === 'cloudsearch'
      ? { keywords: 'probe' }
      : { mode: 'DEFAULT' };

for (const method of ['fmTrash', 'cloudsearch', 'personalFmMode'] as const) {
  for (const mode of ['cancel', 'deadline'] as const) {
    for (const phase of ['provider', 'body'] as const) {
      test(`discovery ${method} ${mode} covers the complete ${phase} phase`, async () => {
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
                client[method](discoveryMethodInput(method) as never, {
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
for (const method of ['fmTrash', 'personalFmMode'] as const) {
  test(`discovery ${method} never replays after a partial response body fails`, async () => {
    const url =
      method === 'fmTrash'
        ? 'https://music.163.com/weapi/radio/trash/add'
        : 'https://interface.music.163.com/eapi/v1/radio/get';
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
              client[method](discoveryMethodInput(method) as never),
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
  { module: 'top_list', query: { idx: 1 }, route: '/top/list', status: 500 },
  { module: 'banner', query: { type: {} }, route: '/banner', status: 400 },
] as const) {
  test(`discovery ${entry.module} preserves its local rejection without sending or taking a token`, async () => {
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
      const call = entry.module === 'banner' ? client.banner : client.topList;
      const sdk = await settle<NcmApiResponse>(call(entry.query as never));
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
    expect(outcome.sdk).toHaveProperty(
      entry.status === 500 ? 'resolved.status' : 'rejected.status',
      entry.status,
    );
    if (entry.status === 500)
      expect(outcome.sdk).toHaveProperty('resolved.body', {
        code: 500,
        msg: '不支持此方式调用,只支持id调用',
      });
    expect(outcome.sends).toBe(0);
    expect(providers).toBe(0);
  });
}

test('discovery HTTP rejects generic token config before sending', async () => {
  const outcome = await withScenario([], async (scenario) => {
    const app = await createServer(
      {},
      { execution: { fetcher: scenario.fetcher } },
    );
    const response = await app.request('/search/suggest?checkToken=forbidden');
    return { status: response.status, sends: scenario.sent.length };
  });
  expect(outcome).toEqual({ status: 400, sends: 0 });
});

test('discovery root named and dynamic entries retain Promise refusal envelopes', async () => {
  const outcome = await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/search/suggest/keyword',
        method: 'POST',
        times: 2,
        response: () => Response.json({ code: 403 }),
      },
      {
        url: 'https://music.163.com/weapi/radio/trash/add',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
    ],
    async (scenario) => {
      const config = { cookie, fetcher: scenario.fetcher };
      const pending = searchSuggest({ type: 'mobile' }, config);
      expect(pending).toBeInstanceOf(Promise);
      return Promise.all([
        settle(pending),
        settle(invokeModule('search_suggest', { type: 'mobile' }, config)),
        settle(fmTrash({ id: 17 }, config)),
      ]);
    },
  );
  for (const result of outcome)
    expect(result).toEqual({
      rejected: {
        status: 403,
        body: { code: 403 },
        cookie: [],
        failure: businessFailure({ code: 403 }),
      },
    });
});

for (const method of ['calendar', 'topAlbum'] as const) {
  test(`discovery ${method} retains its current date defaults`, async () => {
    const began = Date.now();
    const outcome = await withScenario(
      [
        {
          url:
            method === 'calendar'
              ? 'https://music.163.com/weapi/mcalendar/detail'
              : 'https://music.163.com/weapi/discovery/new/albums/area',
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
        await settle<NcmApiResponse>(client[method]({}));
        return readWebBody(scenario.sent[0]!.body) as Record<string, number>;
      },
    );
    if (method === 'calendar') {
      for (const value of [outcome.startTime!, outcome.endTime!]) {
        expect(value).toBeGreaterThanOrEqual(began);
        expect(value).toBeLessThanOrEqual(Date.now());
      }
    } else {
      expect([
        new Date(began).getFullYear(),
        new Date().getFullYear(),
      ]).toContain(outcome.year!);
      expect([
        new Date(began).getMonth() + 1,
        new Date().getMonth() + 1,
      ]).toContain(outcome.month!);
    }
  });
}

test('discovery interleaved calls freeze account input and token snapshots', async () => {
  const ready = createStage('discovery token');
  let finish!: (value: string) => void;
  const firstCookie = { MUSIC_U: 'first-account' };
  const query = { id: 17, time: 29 };
  const outcome = await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/cloudsearch/pc',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
      {
        url: 'https://music.163.com/weapi/radio/trash/add',
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
        client.fmTrash(query, {
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
      query.id = 99;
      query.time = 30;
      const second = await settle(
        client.cloudsearch(
          { keywords: 'other' },
          { cookie: 'MUSIC_U=second-account', checkToken: 'second-token' },
        ),
      );
      finish('first-token');
      await first;
      return { second, wires: scenario.sent };
    },
  );
  expect(outcome.second).toHaveProperty('rejected.status', 403);
  expect(readWebBody(outcome.wires[1]!.body)).toMatchObject({
    songId: 17,
    time: 29,
    checkToken: 'first-token',
  });
  expect(readEapiBody(outcome.wires[0]!.body).data).toMatchObject({
    s: 'other',
    checkToken: 'second-token',
    header: { MUSIC_U: 'second-account' },
  });
  expect(outcome.wires[1]!.headers.get('cookie')).toContain(
    'MUSIC_U=first-account',
  );
  expect(outcome.wires[1]!.headers.get('cookie')).not.toContain(
    'second-account',
  );
});
