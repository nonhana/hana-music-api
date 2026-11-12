import { expect, test } from 'bun:test';

import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
import { setRuntimeState } from '../../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { generatedModuleRoutes } from '../../../../src/types/generated/module-surface.generated.ts';
import { settle } from '../../../_kit/assertions.ts';
import { testEntropy } from '../../../_kit/harness/sdk.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import type { WireRequest } from '../../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../../_kit/upstream/wire.ts';
import expectedClients from '../../../fixtures/consumers/client-identities.json';
import baseline from '../../../fixtures/requests/account-social.json';

setRuntimeState({ deviceId: 'account-device' });
type Case = (typeof baseline.cases)[number];
const cookie =
  'MUSIC_U=account-fixture; MUSIC_A=anonymous-fixture; __csrf=csrf; deviceId=account-device';
const refusal = { code: 403, msg: 'request-probe' };

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

const expectedData = (entry: Case): Record<string, unknown> => {
  const data = entry.data as Record<string, unknown>;
  if (entry.module === 'user_follow_mixed' && typeof data.scene === 'string') {
    return { ...data, scene: Number(data.scene) };
  }
  if (entry.module === 'get_userids') {
    return {
      ...data,
      nicknames: (businessQuery(entry).nicknames as Array<string>).join(';'),
    };
  }
  if (entry.module === 'verify_getQr') {
    return { ...data, verifyType: Number(data.verifyType) };
  }
  if (
    entry.module === 'listentogether_sync_list_command' &&
    typeof data.playlistParam === 'string'
  ) {
    const playlistParam = JSON.parse(data.playlistParam) as Record<
      string,
      unknown
    >;
    return {
      ...data,
      playlistParam: JSON.stringify({
        ...playlistParam,
        displayList: (playlistParam.displayList as Array<string>).filter(
          Boolean,
        ),
        randomList: (playlistParam.randomList as Array<string>).filter(Boolean),
      }),
    };
  }
  return data;
};

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
    deviceId: 'account-device',
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
  expect(data).toEqual(expectedData(entry));
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
  test(`account client ${entry.module}/${entry.label} owns its baseline wire contract`, async () => {
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
            result: await settle(call(businessQuery(entry))),
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
    checkWire(entry, observed.resolved.wire!);
  });

  test(`account HTTP ${entry.module}/${entry.label} discovers its baseline wire contract`, async () => {
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
              body: JSON.stringify(businessQuery(entry)),
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
    checkWire(entry, observed.resolved.wire!);
  });
}

for (const entry of baseline.cases.filter(
  (candidate) =>
    [
      'login',
      'login_cellphone',
      'login_qr_check',
      'captcha_verify',
      'comment',
      'send_text',
      'listentogether_heatbeat',
      'user_account',
    ].includes(candidate.module) && candidate.label === 'default',
)) {
  for (const kind of ['string', 'provider'] as const) {
    test(`account ${entry.module}/${entry.label} transmits an optional ${kind} token`, async () => {
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
              result: await settle(call(businessQuery(entry))),
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
