import { expect, test } from 'bun:test';

import { Exit } from 'effect';
import type { Effect } from 'effect';

import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { setRuntimeState } from '../../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { generatedModuleRoutes } from '../../../../src/types/generated/module-surface.generated.ts';
import { settle } from '../../../_kit/assertions.ts';
import { testEntropy } from '../../../_kit/harness/sdk.ts';
import { runExit } from '../../../_kit/it.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import type { WireRequest } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import expectedClients from '../../../fixtures/consumers/client-identities.json';
import baseline from '../../../fixtures/requests/podcast-video.json';

setRuntimeState({ deviceId: 'content-device' });
type Case = (typeof baseline.cases)[number];
const cookie =
  'MUSIC_U=account-fixture; MUSIC_A=anonymous-fixture; __csrf=csrf; deviceId=content-device';
const refusal = { code: 403, msg: 'request-probe' };

// 基线冻结的是 #128 之前可被旧 decoder 接受的输入；0、空串、null、false、
// 未知枚举和协议串已在模块 decoder 拒绝，这里只保留本地拒绝和零请求的断言。
// 路径由基线条目决定，静态导入会把全部模块依赖拉进这个 wire 测试。
const isLegacyInput = async (entry: Case): Promise<boolean> => {
  const { decodeModuleInput } = (await import(
    `../../../../src/modules/${entry.module}.ts`
  )) as {
    decodeModuleInput: (input: unknown) => Effect.Effect<unknown, unknown>;
  };
  return Exit.isFailure(await runExit(decodeModuleInput(entry.query)));
};

// HTTP 数字字符串在 #128 后先解码成数字，0 再按模块原有默认值兜底，与数值 0 的最终请求一致。
const withExpectedData = (entry: Case): Case => {
  if (entry.module === 'mv_all' && entry.label === 'string-zero') {
    return { ...entry, data: { ...entry.data, limit: 30, offset: 0 } } as Case;
  }
  if (entry.module === 'voicelist_list_search') {
    if (entry.label === 'string-zero') {
      return {
        ...entry,
        data: { ...entry.data, limit: '200', voiceFeeType: 0 },
      } as Case;
    }
    if (entry.label === 'fee-int-0' || entry.label === 'fee-str-0') {
      return { ...entry, data: { ...entry.data, voiceFeeType: 0 } } as Case;
    }
  }
  if (entry.module === 'voicelist_search' && entry.label === 'string-zero') {
    return { ...entry, data: { ...entry.data, limit: '200' } } as Case;
  }
  if (entry.label !== 'string-zero') return entry;
  const zero = baseline.cases.find(
    (candidate) =>
      candidate.module === entry.module && candidate.label === 'zero',
  );
  return zero === undefined ? entry : ({ ...entry, data: zero.data } as Case);
};

const legacyCases = new Set(
  (
    await Promise.all(
      baseline.cases.map(async (entry) =>
        (await isLegacyInput(entry)) ? `${entry.module}/${entry.label}` : '',
      ),
    )
  ).filter((key) => key !== ''),
);
const checkWire = (entry: Case, wire: WireRequest, token?: string) => {
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
  expect(data).toEqual(entry.data);
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

for (const entry of baseline.cases) {
  if (legacyCases.has(`${entry.module}/${entry.label}`)) {
    test(`content client ${entry.module}/${entry.label} rejects the legacy input locally`, async () => {
      const observed = await settle(
        withScenario([], async (scenario) => {
          const config = { cookie };
          const client = createClientFromContext(
            config,
            buildCallServices(config, false, {
              fetcher: scenario.fetcher,
              entropy: testEntropy,
            }),
          );
          const call = client[entry.method as keyof typeof client] as (
            query: unknown,
          ) => Promise<NcmApiResponse>;
          return {
            result: await settle(call(entry.query)),
            wires: scenario.sent.length,
          };
        }),
      );
      expect(observed).toHaveProperty('resolved');
      if (!('resolved' in observed)) return;
      expect(observed.resolved.result).toMatchObject({
        rejected: { status: 400, cookie: [] },
      });
      expect(observed.resolved.wires).toBe(0);
    });

    test(`content HTTP ${entry.module}/${entry.label} rejects the legacy input locally`, async () => {
      const observed = await settle(
        withScenario([], async (scenario) => {
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
              body: JSON.stringify(entry.query),
            },
          );
          return {
            status: response.status,
            body: await response.json(),
            wires: scenario.sent.length,
          };
        }),
      );
      expect(observed).toHaveProperty('resolved');
      if (!('resolved' in observed)) return;
      expect(observed.resolved).toMatchObject({
        status: 400,
        body: { code: 400 },
      });
      expect(observed.resolved.wires).toBe(0);
    });
    continue;
  }

  const expected = withExpectedData(entry);

  test(`content client ${entry.module}/${entry.label} owns its baseline wire contract`, async () => {
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
            result: await settle(call(entry.query)),
            wire: scenario.sent[0],
          };
        },
      ),
    );
    expect(observed).toHaveProperty('resolved');
    if (!('resolved' in observed)) return;
    expect(observed.resolved.result).toEqual({
      rejected: { status: 403, body: refusal, cookie: [] },
    });
    checkWire(expected, observed.resolved.wire!);
  });

  test(`content HTTP ${entry.module}/${entry.label} discovers its baseline wire contract`, async () => {
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
              body: JSON.stringify(entry.query),
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
    checkWire(expected, observed.resolved.wire!);
  });
}

for (const entry of baseline.cases.filter(
  (candidate) =>
    [
      'broadcast_sub',
      'dj_sub',
      'mv_sub',
      'video_sub',
      'voice_delete',
      'voicelist_trans',
      'mlog_to_video',
      'video_timeline_all',
      'voice_detail',
    ].includes(candidate.module) && candidate.label === 'default',
)) {
  for (const kind of ['string', 'provider'] as const) {
    test(`content ${entry.module}/${entry.label} transmits an optional ${kind} token`, async () => {
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
            const query =
              entry.module === 'voice_delete'
                ? {
                    ids: (entry.query as { ids: Array<number> }).ids,
                  }
                : entry.query;
            return {
              result: await settle(call(query)),
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
      checkWire(entry, observed.resolved.wire!, 'account-token');
      expect(providers).toBe(kind === 'provider' ? 1 : 0);
    });
  }
}
