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
              result: await settle(call(entry.query)),
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
