import { expect, test } from 'bun:test';

import { Exit } from 'effect';
import type { Effect } from 'effect';

import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { setRuntimeState } from '../../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { generatedModuleRoutes } from '../../../../src/types/generated/module-surface.generated.ts';
import { businessFailure, settle } from '../../../_kit/assertions.ts';
import { currentRequests } from '../../../_kit/current-requests.ts';
import { testEntropy } from '../../../_kit/harness/sdk.ts';
import { runExit } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import type { WireRequest } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import expectedClients from '../../../fixtures/consumers/client-identities.json';
import frozenRequests from '../../../fixtures/requests/membership-business.json';

const baseline = currentRequests('membership-business', frozenRequests);

setRuntimeState({ deviceId: 'content-device' });
type Case = (typeof baseline.cases)[number];
const cookie =
  'MUSIC_U=account-fixture; MUSIC_A=anonymous-fixture; __csrf=csrf; deviceId=content-device';
const refusal = { code: 403, msg: 'request-probe' };
// #128 把公开输入收窄为具体业务类型后，旧基线样本分三类：仍按原样解码、数字字符串归一后请求体不同、
// 以及旧协议输入不再被接受。后两类只覆盖已完成迁移的领域，其他领域继续按旧基线断言。
const modernQueries: Readonly<Record<string, unknown>> = {
  'vip_growthpoint_get/default': { ids: ['17', '19'] },
  'vip_growthpoint_get/all-fields': { ids: ['17', '19'] },
};
const modernData: Readonly<Record<string, Readonly<Record<string, unknown>>>> =
  {
    'vip_growthpoint_get/default': { taskIds: '17,19' },
    'vip_growthpoint_get/all-fields': { taskIds: '17,19' },
    'vip_growthpoint_details/string-zero': { limit: 20, offset: 0 },
    'vip_timemachine/range-string-zero-limit': {
      startTime: 1,
      endTime: 2,
      type: 1,
      limit: 60,
    },
    'vip_timemachine/string-zero-range': {},
    'yunbei_expense/string-zero': { limit: 10, offset: 0 },
    'yunbei_rcmd_song/string-zero': {
      songId: '17',
      reason: '0',
      scene: '',
      fromUserId: -1,
      yunbeiNum: 10,
    },
    'yunbei_rcmd_song_history/string-zero': {
      page: '{"size":20,"cursor":"0"}',
    },
    'yunbei_receipt/string-zero': { limit: 10, offset: 0 },
    'daily_signin/string-zero': { type: 0 },
    'daily_signin/type-str-0': { type: 0 },
    'daily_signin/type-str-1': { type: 1 },
    'musician_cloudbean_obtain/default': {
      userMissionId: '17',
      period: 7,
    },
    'musician_cloudbean_obtain/all-fields': {
      userMissionId: '17',
      period: 7,
    },
    'digitalAlbum_purchased/string-zero': {
      limit: 30,
      offset: 0,
      total: true,
    },
    'record_recent_album/string-zero': { limit: 100 },
    'record_recent_dj/string-zero': { limit: 100 },
    'record_recent_playlist/string-zero': { limit: 100 },
    'record_recent_song/string-zero': { limit: 100 },
    'record_recent_video/string-zero': { limit: 100 },
    'record_recent_voice/string-zero': { limit: 100 },
    'user_record/string-zero': { uid: '23', type: 0 },
    'user_record/type-str-0': { uid: '23', type: 0 },
    'user_record/type-str-1': { uid: '23', type: 1 },
  };

// 基线冻结旧协议输入；用当前 decoder 判定哪些条目已改为本地 400，避免手工维护清单。
const legacyInputs = new Set(
  (
    await Promise.all(
      baseline.cases.map(async (entry) => {
        const { decodeModuleInput } = (await import(
          `../../../../src/modules/${entry.module}.ts`
        )) as {
          decodeModuleInput: (
            input: unknown,
          ) => Effect.Effect<unknown, unknown>;
        };
        return Exit.isFailure(await runExit(decodeModuleInput(entry.query)))
          ? `${entry.module}/${entry.label}`
          : '';
      }),
    )
  ).filter((key) => key !== ''),
);

const checkWire = (
  entry: Case,
  wire: WireRequest,
  token?: string,
  expectedData?: Readonly<Record<string, unknown>>,
) => {
  expect(wire.url).toBe(entry.url);
  expect(wire.method).toBe('POST');
  expect(wire.headers.get('x-aeapi')).toBeNull();
  expect(wire.headers.get('X-antiCheatToken')).toBe(token ?? null);
  expect(wire.headers.get('user-agent')).toBe(
    entry.profile === 'weapiPc'
      ? expectedClients.web.userAgent
      : expectedClients.iphone.userAgent,
  );
  const cookies = Object.fromEntries(
    wire.headers
      .get('cookie')!
      .split('; ')
      .map((part) => {
        const index = part.indexOf('=');
        return [
          part.slice(0, index),
          decodeURIComponent(part.slice(index + 1)),
        ];
      }),
  );
  expect(cookies).toMatchObject({
    MUSIC_U: 'account-fixture',
    MUSIC_A: 'anonymous-fixture',
    __csrf: 'csrf',
    deviceId: 'content-device',
    ...(entry.profile === 'weapiPc'
      ? { os: 'web' }
      : expectedClients.iphone.cookie),
  });
  for (const name of [
    'OS',
    'APPVER',
    'CHANNEL',
    'OSVER',
    'buildver',
    'mobilename',
    'versioncode',
    'resolution',
    ...(entry.profile === 'weapiPc' ? ['appver', 'channel', 'osver'] : []),
  ])
    expect(cookies).not.toHaveProperty(name);
  expect(wire.url).not.toContain('account-token');
  expect(wire.headers.get('cookie')).not.toContain('account-token');
  const payload = (
    entry.profile === 'weapiPc'
      ? readWebBody(wire.body)
      : readEapiBody(wire.body).data
  ) as Record<string, unknown>;
  const { header, e_r, csrf_token, checkToken, ...data } = payload;
  expect(data).toEqual(expectedData ?? entry.data);
  expect(e_r).toBe(false);
  expect(checkToken).toBe(token);
  if (entry.profile === 'weapiPc') {
    expect(csrf_token).toBe('csrf');
    expect(header).toBeUndefined();
    expect(wire.headers.get('referer')).toBe('https://music.163.com');
  } else {
    expect(readEapiBody(wire.body).path).toBe(entry.path);
    expect(header).toEqual({
      ...cookies,
      ...(token ? { 'X-antiCheatToken': token } : {}),
    });
    expect(csrf_token).toBeUndefined();
  }
};

for (const entry of baseline.cases.filter(
  (candidate) => !legacyInputs.has(`${candidate.module}/${candidate.label}`),
)) {
  const query = modernQueries[`${entry.module}/${entry.label}`] ?? entry.query;
  const expectedData = modernData[`${entry.module}/${entry.label}`];
  test(`membership client ${entry.module}/${entry.label} owns its baseline wire contract`, async () => {
    const observed = await settle(
      withScenario(
        [
          {
            url: entry.url,
            method: 'POST',
            response: () => Response.json(refusal),
          },
        ],
        async (scenario) => {
          const config = {
            cookie: `${cookie}; os=android; appver=conflict; channel=conflict; osver=conflict; OS=iphone; APPVER=conflict; CHANNEL=conflict; OSVER=conflict`,
          };
          const client = createClientFromContext(
            config,
            buildCallServices(config, false, {
              fetcher: scenario.fetcher,
              entropy: testEntropy,
            }),
          );
          // The checked baseline method belongs to the generated client; its real decoder validates this fixture input.
          const call = client[entry.method as keyof typeof client] as (
            query: unknown,
          ) => Promise<NcmApiResponse>;
          return {
            result: await settle(call(query)),
            wire: scenario.sent[0],
          };
        },
      ),
    );
    expect(observed).toHaveProperty('resolved');
    if (!('resolved' in observed)) return;
    expect(observed.resolved.result).toEqual({
      rejected: {
        status: 403,
        body: refusal,
        cookie: [],
        failure: businessFailure(refusal),
      },
    });
    checkWire(entry, observed.resolved.wire!, undefined, expectedData);
  });

  test(`membership HTTP ${entry.module}/${entry.label} discovers its baseline wire contract`, async () => {
    const observed = await settle(
      withScenario(
        [
          {
            url: entry.url,
            method: 'POST',
            response: () => Response.json(refusal),
          },
        ],
        async (scenario) => {
          const app = await createServer(
            {},
            { execution: { fetcher: scenario.fetcher, entropy: testEntropy } },
          );
          const response = await app.request(
            generatedModuleRoutes[
              entry.module as keyof typeof generatedModuleRoutes
            ],
            {
              method: 'POST',
              headers: { cookie, 'content-type': 'application/json' },
              body: JSON.stringify(query),
            },
          );
          return {
            status: response.status,
            body: await response.json(),
            wire: scenario.sent[0],
          };
        },
      ),
    );
    expect(observed).toHaveProperty('resolved');
    if (!('resolved' in observed)) return;
    expect(observed.resolved).toMatchObject({ status: 403, body: refusal });
    checkWire(entry, observed.resolved.wire!, undefined, expectedData);
  });
}

for (const entry of baseline.cases.filter((candidate) =>
  legacyInputs.has(`${candidate.module}/${candidate.label}`),
)) {
  test(`membership ${entry.module}/${entry.label} rejects its legacy input before sending`, async () => {
    let sends = 0;
    const config = { cookie };
    const client = createClientFromContext(
      config,
      buildCallServices(config, false, {
        fetcher: async () => {
          sends += 1;
          return Response.json(refusal);
        },
        entropy: testEntropy,
      }),
    );
    const call = client[entry.method as keyof typeof client] as (
      query: unknown,
    ) => Promise<NcmApiResponse>;

    const outcome = await settle(call(entry.query));

    expect(outcome).toHaveProperty('rejected');
    if (!('rejected' in outcome)) return;
    expect(outcome.rejected.status).toBe(400);
    expect(sends).toBe(0);
  });
}

for (const entry of baseline.cases.filter(
  (candidate) =>
    [
      'batch',
      'daily_signin',
      'digitalAlbum_ordering',
      'musician_cloudbean_obtain',
      'musician_sign',
      'vip_growthpoint_get',
      'yunbei_sign',
      'yunbei_task_finish',
      'yunbei_rcmd_song',
      'vip_info',
      'listen_data_report',
      'yunbei_expense',
    ].includes(candidate.module) && candidate.label === 'default',
)) {
  for (const kind of ['string', 'provider'] as const) {
    test(`membership ${entry.module}/${entry.label} transmits an optional ${kind} token`, async () => {
      let providers = 0;
      const observed = await settle(
        withScenario(
          [
            {
              url: entry.url,
              method: 'POST',
              response: () => Response.json(refusal),
            },
          ],
          async (scenario) => {
            const config = {
              cookie,
              checkToken:
                kind === 'string'
                  ? 'account-token'
                  : async () => {
                      providers++;
                      return 'account-token';
                    },
            };
            const client = createClientFromContext(
              config,
              buildCallServices(config, false, {
                fetcher: scenario.fetcher,
                entropy: testEntropy,
              }),
            );
            const call = client[entry.method as keyof typeof client] as (
              query: unknown,
              config?: ModuleCallConfig,
            ) => Promise<NcmApiResponse>;
            return {
              result: await settle(
                call(
                  modernQueries[`${entry.module}/${entry.label}`] ??
                    entry.query,
                ),
              ),
              wire: scenario.sent[0],
            };
          },
        ),
      );
      expect(observed).toHaveProperty('resolved');
      if (!('resolved' in observed)) return;
      expect(observed.resolved.result).toMatchObject({
        rejected: { status: 403 },
      });
      checkWire(
        entry,
        observed.resolved.wire!,
        'account-token',
        modernData[`${entry.module}/${entry.label}`],
      );
      expect(providers).toBe(kind === 'provider' ? 1 : 0);
    });
  }
}
