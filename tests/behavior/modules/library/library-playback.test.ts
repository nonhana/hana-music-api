import { expect, test } from 'bun:test';

import { Exit } from 'effect';
import type { Effect } from 'effect';

import type { ModuleCallConfig, NcmApiResponse } from '../../../../index.ts';
import { buildCallServices } from '../../../../src/core/call.ts';
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
import baseline from '../../../fixtures/requests/library-playback.json';

type Case = (typeof baseline.cases)[number];
const cookie =
  'MUSIC_U=library-account; MUSIC_A=library-anonymous; __csrf=csrf; deviceId=library-device';
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
    MUSIC_U: 'library-account',
    MUSIC_A: 'library-anonymous',
    __csrf: 'csrf',
    deviceId: 'library-device',
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
  expect(wire.url).not.toContain('library-token');
  expect(wire.headers.get('cookie')).not.toContain('library-token');
  const payload = (
    entry.profile === 'weapiPc'
      ? readWebBody(wire.body)
      : readEapiBody(wire.body).data
  ) as Record<string, unknown>;
  const { header, e_r, csrf_token, checkToken, ...data } = payload;
  const expected =
    entry.module === 'artist_list' && entry.label === 'default'
      ? { ...entry.data, type: 1 }
      : entry.module === 'cloud_match'
        ? { ...entry.data, adjustSongId: 29 }
        : entry.data;
  expect(data).toEqual(expected);
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

// 基线冻结旧协议输入；用当前 decoder 判定本地拒绝，避免手工维护清单。
const legacyCases = new Set(
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

for (const entry of baseline.cases) {
  if (legacyCases.has(`${entry.module}/${entry.label}`)) {
    test(`library client ${entry.module}/${entry.label} rejects the legacy input locally`, async () => {
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
        rejected: { status: 400 },
      });
      expect(observed.resolved.wires).toBe(0);
    });

    test(`library HTTP ${entry.module}/${entry.label} rejects the legacy input locally`, async () => {
      let wires = 0;
      const app = await createServer(
        {},
        {
          execution: {
            fetcher: async () => {
              wires += 1;
              return Response.json(refusal);
            },
          },
        },
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
      expect(response.status).toBe(400);
      expect(wires).toBe(0);
    });
    continue;
  }

  test(`library client ${entry.module}/${entry.label} owns its baseline wire contract`, async () => {
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

  test(`library HTTP ${entry.module}/${entry.label} discovers its baseline wire contract`, async () => {
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
            '/' + entry.module.replaceAll('_', '/'),
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
    !legacyCases.has(`${candidate.module}/${candidate.label}`) &&
    (candidate.module === 'album' ||
      candidate.module === 'lyric_new' ||
      candidate.module === 'playlist_import_task_status' ||
      candidate.module === 'like') &&
    (candidate.label === 'default' || candidate.label === 'unlike'),
)) {
  for (const kind of ['string', 'provider'] as const) {
    test(`library ${entry.module}/${entry.label} transmits an optional ${kind} token`, async () => {
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
                  ? 'library-token'
                  : async () => {
                      providers++;
                      return 'library-token';
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
      checkWire(entry, observed.resolved.wire!, 'library-token');
      expect(providers).toBe(kind === 'provider' ? 1 : 0);
    });
  }
}
