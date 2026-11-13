import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';

import { Effect } from 'effect';
import { TestClock } from 'effect/testing';

import { invokeModule } from '../../../../index.ts';
import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { projectRoot, settle } from '../../../_kit/assertions.ts';
import { currentRequests } from '../../../_kit/current-requests.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { runEffect } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readWebBody } from '../../../_kit/upstream/wire.ts';
import responseFiles from '../../../fixtures/requests/account-social-responses.json';
import frozenRequests from '../../../fixtures/requests/account-social.json';

const baseline = currentRequests('account-social', frozenRequests);

const defaults = baseline.cases.filter((entry) => entry.label === 'default');

type Case = (typeof baseline.cases)[number];

const parseNicknames = (value: string): Array<string> => {
  if (value.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === 'string')
      ) {
        return parsed;
      }
    } catch {
      // Not a JSON nickname list; the recording still shows the semicolon protocol.
    }
  }
  return value.split(';');
};

const splitList = (value: unknown) =>
  Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',').filter(Boolean)
      : [];

const businessQuery = (entry: Case): Record<string, unknown> => {
  const query = entry.query as Record<string, unknown>;
  if ('user_ids' in query) {
    const ids = query.user_ids;
    const { user_ids: _userIds, ...rest } = query;
    return {
      ...rest,
      userIds: Array.isArray(ids)
        ? ids
        : String(ids)
            .split(',')
            .map((id) => id.trim()),
    };
  }
  if (typeof query.nicknames === 'string') {
    return { ...query, nicknames: parseNicknames(query.nicknames) };
  }
  if (entry.module === 'listentogether_sync_list_command') {
    return {
      ...query,
      displayList: splitList(query.displayList),
      randomList: splitList(query.randomList),
    };
  }
  return query;
};
const cookie =
  'MUSIC_U=account-account; MUSIC_A=account-anonymous; __csrf=csrf';

for (const entry of defaults) {
  for (const failure of ['EAI_AGAIN', 'socket hang up']) {
    test(`account ${entry.module} preserves ${failure} retry eligibility`, async () => {
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
              result: await settle<NcmApiResponse>(call(businessQuery(entry))),
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
  test(`account ${entry.module} never shares or caches successful calls`, async () => {
    const path = responseFiles[entry.module as keyof typeof responseFiles];
    const synthetic: Record<string, unknown> = {
      login_status: { code: 200, account: null, profile: null },
      verify_getQr: { code: 200, data: { qrCode: 'synthetic-qr' } },
    };
    const recorded: unknown = path
      ? JSON.parse(await readFile(`${projectRoot}/${path}`, 'utf8')).response
          .body
      : (synthetic[entry.module] ?? { code: 200 });
    const body =
      entry.module === 'login_qr_key'
        ? (recorded as { data: unknown }).data
        : recorded;
    const observed = await settle(
      withScenario(
        [
          {
            url: entry.url,
            method: 'POST',
            times: 4,
            response: () => {
              const headers = new Headers();
              headers.append('set-cookie', 'MUSIC_U=synthetic-success; Path=/');
              headers.append(
                'set-cookie',
                'MUSIC_A=synthetic-anonymous; Path=/',
              );
              return Response.json(body, { headers });
            },
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
            call(businessQuery(entry)),
            call(businessQuery(entry)),
          ]);
          const next = await call(businessQuery(entry));
          await call(businessQuery(entry), { cookie: 'MUSIC_U=other-account' });
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
const accountPolicyInput = (method: 'login' | 'comment' | 'loginQrCheck') =>
  method === 'login'
    ? {
        email: 'synthetic@example.invalid',
        password: 'synthetic-password',
      }
    : method === 'comment'
      ? { id: 17, t: 1, type: 0 }
      : { key: 'synthetic-key' };

for (const method of ['login', 'comment', 'loginQrCheck'] as const) {
  for (const mode of ['cancel', 'deadline'] as const) {
    for (const phase of ['provider', 'body'] as const) {
      test(`account ${method} ${mode} covers the complete ${phase} phase`, async () => {
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
                (
                  client[method] as (
                    query: unknown,
                    config: ModuleCallConfig,
                  ) => Promise<NcmApiResponse>
                )(accountPolicyInput(method), { signal: controller.signal }),
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
for (const method of [
  'sendText',
  'loginQrCheck',
  'listentogetherHeatbeat',
  'msgPrivateHistory',
] as const) {
  test(`account ${method} never replays after a partial response body fails`, async () => {
    const entry = defaults.find((candidate) => candidate.method === method)!;
    const url = entry.url;
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
              (client[method] as (query: unknown) => Promise<NcmApiResponse>)(
                businessQuery(entry),
              ),
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

for (const input of [
  {
    module: 'listentogether_sync_list_command',
    query: { randomList: [], displayList: '17' },
  },
  { module: 'follow', query: { id: {} } },
  { module: 'comment_hug_list', query: { sid: {} } },
] as const) {
  test(`account ${input.module} rejects invalid input before sending or taking a token`, async () => {
    let providers = 0;
    const result = await withScenario([], async (scenario) =>
      settle(
        invokeModule(input.module, input.query as never, {
          cookie,
          fetcher: scenario.fetcher,
          checkToken: async () => {
            providers++;
            return 'unused-token';
          },
        }),
      ),
    );
    expect(result).toHaveProperty('rejected.status', 400);
    expect(providers).toBe(0);
  });
}

test('account HTTP rejects generic token config before sending', async () => {
  await withScenario([], async (scenario) => {
    const app = await createServer(
      {},
      { execution: { fetcher: scenario.fetcher } },
    );
    const response = await app.request('/login/qr/check', {
      method: 'POST',
      headers: { cookie, 'content-type': 'application/json' },
      body: JSON.stringify({ key: 'synthetic', checkToken: 'forbidden' }),
    });
    expect(response.status).toBe(400);
  });
});

test('account interleaved calls freeze credentials input and account snapshots', async () => {
  const ready = createStage('account provider');
  let finish!: (token: string) => void;
  const firstCookie = { MUSIC_U: 'first-account' };
  const query = {
    email: 'synthetic@example.invalid',
    password: 'first-password',
  };
  const result = await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/resource/comments/add',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
      {
        url: 'https://music.163.com/weapi/w/login',
        method: 'POST',
        response: () => Response.json({ code: 403 }),
      },
    ],
    async (scenario) => {
      const config = { cookie };
      const client = createClientFromContext(
        config,
        buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      const first = settle(
        client.login(query, {
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
      query.password = 'changed';
      query.email = 'changed@example.invalid';
      await settle(
        client.comment(
          { id: 17, type: 0, t: 1, content: 'second-content' },
          { cookie: 'MUSIC_U=second-account', checkToken: 'second-token' },
        ),
      );
      finish('first-token');
      await first;
      return scenario.sent;
    },
  );
  expect(readWebBody(result[0]!.body)).toMatchObject({
    content: 'second-content',
    checkToken: 'second-token',
  });
  expect(result[0]!.headers.get('cookie')).toContain('MUSIC_U=second-account');
  expect(result[1]!.headers.get('cookie')).toContain('MUSIC_U=first-account');
  expect(readWebBody(result[1]!.body)).toMatchObject({
    username: 'synthetic@example.invalid',
    password: 'b975f06bfd229cc7f1c47a1ade7720ce',
    checkToken: 'first-token',
  });
});
