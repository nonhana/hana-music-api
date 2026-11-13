import { afterEach, expect, test } from 'bun:test';
import { createDecipheriv } from 'node:crypto';

import { createHanaMusicApi, createRequest } from '../../../index.ts';
import { registerAnonymous } from '../../../src/app/generate-config.ts';
import { registerAnonymousToken } from '../../../src/core/anonymous.ts';
import { buildCallServices } from '../../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../../src/core/identity-snapshot.ts';
import { prepareRequest } from '../../../src/core/request-plan.ts';
import { requestProfiles } from '../../../src/core/request-profiles.ts';
import { getRuntimeState, setRuntimeState } from '../../../src/core/runtime.ts';
import { createClientFromContext } from '../../../src/sdk/generated/client-factory.generated.ts';
import { sdkModuleRegistry } from '../../../src/sdk/generated/registry.generated.ts';
import { createServer } from '../../../src/server/create-server.ts';
import { settle } from '../../_kit/assertions.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import { withScenario } from '../../_kit/upstream/scenario.ts';
import { readEapiBody, readWebBody } from '../../_kit/upstream/wire.ts';
import expectedClients from '../../fixtures/consumers/client-identities.json';

const previous = getRuntimeState();
afterEach(() => setRuntimeState(previous));
const iphone = expectedClients.iphone.userAgent;
const platform = expectedClients.iphone.cookie;
const readCookies = (headers: Headers) =>
  Object.fromEntries(
    (headers.get('cookie') ?? '')
      .split('; ')
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        return [
          part.slice(0, index),
          decodeURIComponent(part.slice(index + 1)),
        ];
      }),
  );

for (const [label, state, cookie, expected] of [
  ['conflict', { deviceId: 'D1' }, 'deviceId=D2', 'D1'],
  ['explicit', { deviceId: 'D1' }, '', 'D1'],
  ['cookie', undefined, 'deviceId=D2', 'D2'],
  ['fallback', undefined, '', 'runtime-device'],
  ['invalid', { deviceId: ' ' }, 'deviceId=D2', 'D2'],
] as const) {
  test(`identity selects one device ${label} at the SDK wire`, async () => {
    setRuntimeState({ anonymousToken: '', deviceId: 'runtime-device' });
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          response: () =>
            Response.json(
              { code: 200, userId: 42 },
              { headers: { 'set-cookie': 'MUSIC_A=new-session; Path=/' } },
            ),
        },
      ],
      async (scenario) => {
        const config = { cookie: `MUSIC_U=account; ${cookie}`, state };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
        );
        await client.registerAnonimous();
        const wire = scenario.sent[0]!;
        const cookies = readCookies(wire.headers);
        expect(cookies.deviceId).toBe(expected);
        const payload = readWebBody(wire.body) as { username: string };
        expect(
          Buffer.from(payload.username, 'base64').toString().split(' ')[0],
        ).toBe(expected);
        expect(cookies.os).toBe('web');
        expect(cookies).not.toHaveProperty('appver');
      },
    );
  });
}

for (const entry of ['sdk', 'http'] as const)
  for (const level of ['exhigh', 'sky'] as const) {
    test(`identity ${entry} Ficus ${level} uses its declared identity`, async () => {
      await withScenario(
        [
          {
            url:
              level === 'sky'
                ? 'https://interface.music.163.com/eapi/song/enhance/player/url/v1'
                : 'https://music.163.com/weapi/song/enhance/player/url/v1',
            method: 'POST',
            response: () =>
              Response.json({
                code: 200,
                data: [{ id: 1411594141, url: null, code: 404 }],
              }),
          },
        ],
        async (scenario) => {
          const cookie =
            'MUSIC_U=account; deviceId=D2; OS=pc; os=android; APPVER=old; appver=old; OSVER=Windows; CHANNEL=old; BUILDVER=old; versioncode=140; mobilename=desktop; resolution=1920x1080; clientSign=old';
          if (entry === 'sdk') {
            const config = {
              cookie,
              state: { deviceId: 'D1' },
            };
            const client = createClientFromContext(
              config,
              buildCallServices(config, false, {
                fetcher: scenario.fetcher,
                entropy: testEntropy,
              }),
            );
            expect(
              (await client.songUrlV1({ ids: [1411594141], level })).body
                .data[0]!.url,
            ).toBeNull();
          } else {
            const app = await createServer(
              {},
              {
                execution: { fetcher: scenario.fetcher, entropy: testEntropy },
              },
            );
            const result = await app.request('/song/url/v1', {
              method: 'POST',
              headers: { cookie, 'content-type': 'application/json' },
              body: JSON.stringify({ ids: [1411594141], level }),
            });
            expect(result.status).toBe(200);
          }
          const wire = scenario.sent[0]!;
          const cookies = readCookies(wire.headers);
          expect(wire.headers.get('user-agent')).toBe(
            level === 'sky' ? iphone : expectedClients.web.userAgent,
          );
          expect(cookies).toMatchObject({
            ...(level === 'sky' ? platform : { os: 'web' }),
            deviceId: entry === 'sdk' ? 'D1' : 'D2',
          });
          for (const key of [
            'buildver',
            'versioncode',
            'mobilename',
            'resolution',
            'clientSign',
            'OS',
            'APPVER',
            'OSVER',
            'CHANNEL',
            'BUILDVER',
          ])
            expect(cookies).not.toHaveProperty(key);
          const decoded =
            level === 'sky'
              ? readEapiBody(wire.body)
              : {
                  path: '/api/song/enhance/player/url/v1',
                  data: readWebBody(wire.body),
                };
          expect(decoded.path).toBe('/api/song/enhance/player/url/v1');
          expect(decoded.data).toEqual({
            ids: '["1411594141"]',
            level,
            encodeType: 'flac',
            ...(level === 'sky' ? { immerseType: 'c51' } : {}),
            e_r: false,
            ...(level === 'sky' ? { header: cookies } : { csrf_token: '' }),
          });
          if (level === 'sky') expect(cookies.requestId).toMatch(/^\d+_0000$/);
        },
      );
    });
  }

test('identity projection is deterministic and omits unproven desktop defaults', () => {
  const state = { anonymousToken: '', cnIp: '', deviceId: 'fallback' };
  const options = {
    cookie: { MUSIC_U: 'account', deviceId: 'D2' },
    state: { deviceId: 'D1' },
    crypto: 'eapi' as const,
  };
  const identity = resolveIdentitySnapshot(options, state);
  const entropy = testEntropy(1700000000000);
  const resolved = {
    target: '/api/test',
    protocol: 'eapi',
    method: 'POST',
    response: 'json',
    data: {},
    headers: {},
    identity,
    ip: '',
    expectedUrl: 'https://interface.music.163.com/eapi/test',
    policy: { semantic: 'read', retry: 'never' },
    retry: undefined,
    token: { source: undefined, uses: undefined, managed: true },
    client: {
      domain: requestProfiles.eapi.domain,
      userAgent: requestProfiles.eapi.userAgent,
      cookie: requestProfiles.eapi.cookie,
      controlledCookies: requestProfiles.eapi.omitCookies,
      controlledHeaders: [],
      encryptResponse: false,
      acceptGzip: false,
    },
  } as const;
  const first = prepareRequest(resolved, entropy);
  expect(first).toEqual(prepareRequest(resolved, entropy));
  expect(readCookies(new Headers(first.headers))).toEqual({
    __csrf: '',
    ...platform,
    deviceId: 'D1',
    requestId: '1700000000000_0000',
    MUSIC_U: 'account',
  });
});

test('identity low-level default api and eapi use coherent iPhone fields', async () => {
  for (const crypto of ['api', 'eapi'] as const)
    await withScenario(
      [
        {
          url: `https://interface.music.163.com/${crypto}/identity`,
          method: 'POST',
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        await createRequest(
          '/api/identity',
          { id: 7 },
          {
            crypto,
            cookie: 'MUSIC_U=account; deviceId=D2',
            state: { deviceId: 'D1' },
            fetcher: scenario.fetcher,
          },
        );
        const wire = scenario.sent[0]!;
        expect(wire.headers.get('user-agent')).toBe(iphone);
        expect(readCookies(wire.headers)).toMatchObject({
          ...platform,
          deviceId: 'D1',
        });
        if (crypto === 'eapi')
          expect(
            (readEapiBody(wire.body).data as { header: unknown }).header,
          ).toEqual(readCookies(wire.headers));
        else expect(new URLSearchParams(wire.body).get('id')).toBe('7');
      },
    );
});

test('identity refusal -460 sends once and never rotates identity', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/song/enhance/player/url/v1',
        method: 'POST',
        response: () =>
          Response.json({ code: -460, message: 'synthetic-refusal' }),
      },
    ],
    async (scenario) => {
      const config = {
        cookie: 'MUSIC_U=account',
        state: { deviceId: 'D1' },
        retry: { retries: 5, retryNonIdempotent: true },
      };
      const client = createClientFromContext(
        config,
        buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      expect(
        await settle(client.songUrlV1({ ids: [1411594141], level: 'exhigh' })),
      ).toMatchObject({ rejected: { body: { code: -460 } } });
      expect(scenario.sent).toHaveLength(1);
    },
  );
});

test('identity standalone anonymous state wins over the cookie device', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/register/anonimous',
        method: 'POST',
        response: () =>
          Response.json(
            { code: 200 },
            { headers: { 'set-cookie': 'MUSIC_A=standalone; Path=/' } },
          ),
      },
    ],
    async (scenario) => {
      const registration = await registerAnonymousToken({
        state: { deviceId: 'D1' },
        cookie: { deviceId: 'D2' },
        fetcher: scenario.fetcher,
      });
      expect(registration.deviceId).toBe('D1');
      expect(readCookies(scenario.sent[0]!.headers).deviceId).toBe('D1');
    },
  );
});

for (const [label, state, cookie, expected] of [
  ['conflict', { deviceId: 'D1' }, 'deviceId=D2', 'D1'],
  ['explicit', { deviceId: 'D1' }, '', 'D1'],
  ['cookie', undefined, 'deviceId=D2', 'D2'],
  ['fallback', undefined, '', 'runtime-device'],
] as const)
  test(`identity implicit anonymous ${label} shares its device with the business call`, async () => {
    setRuntimeState({ anonymousToken: '', deviceId: 'runtime-device' });
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          response: () =>
            Response.json(
              { code: 200 },
              { headers: { 'set-cookie': 'MUSIC_A=implicit; Path=/' } },
            ),
        },
        {
          url: 'https://music.163.com/weapi/login/qrcode/unikey',
          method: 'POST',
          response: () => Response.json({ code: 200, unikey: 'key' }),
        },
      ],
      async (scenario) => {
        const config = {
          cookie: `${cookie}; OS=pc; os=pc; appver=old; channel=old`,
          state,
        };
        const client = createClientFromContext(
          config,
          buildCallServices(config, true, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
        );
        await client.loginQrKey();
        const registration = scenario.sent[0]!;
        const payload = readWebBody(registration.body) as { username: string };
        expect(
          Buffer.from(payload.username, 'base64').toString().split(' ')[0],
        ).toBe(expected);
        for (const wire of scenario.sent)
          expect(readCookies(wire.headers).deviceId).toBe(expected);
        expect(readCookies(registration.headers).os).toBe('web');
        expect(readCookies(registration.headers)).not.toHaveProperty('appver');
        expect(readCookies(scenario.sent[1]!.headers).MUSIC_A).toBe('implicit');
      },
    );
  });

test('identity shared reads separate accounts and devices and keep matching cache hits', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/song/lyric',
        method: 'POST',
        times: 3,
        response: (wire) => {
          const data = readWebBody(wire.body) as { id: number };
          const header = readCookies(wire.headers);
          return Response.json({
            code: 200,
            lrc: {
              lyric: `${header.MUSIC_U}/${header.deviceId}/${data.id}`,
            },
          });
        },
      },
    ],
    async (scenario) => {
      const config = { cache: { ttlMs: 60000 } };
      const services = buildCallServices(config, false, {
        fetcher: scenario.fetcher,
        entropy: testEntropy,
      });
      const client = createClientFromContext(config, services);
      const entries = [
        { account: 'A', device: 'D1', id: 101 },
        { account: 'A', device: 'D2', id: 101 },
        { account: 'B', device: 'D3', id: 202 },
      ];
      const results = await Promise.all(
        entries.map((entry) =>
          client.lyric(
            { id: entry.id },
            {
              cookie: { MUSIC_U: entry.account, deviceId: 'old' },
              state: { deviceId: entry.device },
            },
          ),
        ),
      );
      expect(results.map((result) => result.body.lrc?.lyric)).toEqual([
        'A/D1/101',
        'A/D2/101',
        'B/D3/202',
      ]);
      for (const entry of entries)
        expect(
          (
            await client.lyric(
              { id: entry.id },
              {
                cookie: { MUSIC_U: entry.account, deviceId: 'old' },
                state: { deviceId: entry.device },
              },
            )
          ).body.lrc?.lyric,
        ).toBe(`${entry.account}/${entry.device}/${entry.id}`);
      expect(scenario.sent).toHaveLength(3);
      expect(services.reads.snapshot.inflight).toBe(0);
    },
  );
});

test('identity pure local calls do not initialize a session or take a token', async () => {
  setRuntimeState({ anonymousToken: '' });
  let providers = 0;
  await withScenario([], async (scenario) => {
    const config = {
      identityPool: { size: 1 },
      checkToken: async () => {
        providers++;
        return 'unused';
      },
    };
    const client = createClientFromContext(
      config,
      buildCallServices(config, true, { fetcher: scenario.fetcher }),
    );
    expect((await client.innerVersion()).status).toBe(200);
    expect((await client.loginQrCreate({ key: 'local-key' })).status).toBe(200);
    expect(providers).toBe(0);
  });
});

test('identity low-level weapi defaults to web while raw options stay explicit', async () => {
  for (const raw of [false, true])
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/identity',
          method: 'POST',
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        await createRequest(
          '/api/identity',
          {},
          {
            crypto: 'weapi',
            cookie: {
              MUSIC_U: 'account',
              ...(raw ? { os: 'raw-os', appver: 'raw-app' } : {}),
            },
            ...(raw ? { ua: 'raw-agent' } : {}),
            fetcher: scenario.fetcher,
          },
        );
        const wire = scenario.sent[0]!;
        expect(readCookies(wire.headers).os).toBe(raw ? 'raw-os' : 'web');
        expect(wire.headers.get('user-agent')).toBe(
          raw ? 'raw-agent' : expectedClients.web.userAgent,
        );
        if (raw) expect(readCookies(wire.headers).appver).toBe('raw-app');
        else expect(readCookies(wire.headers)).not.toHaveProperty('appver');
      },
    );
});

test('identity web removes conflicting case platform cookies', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/user/playlist',
        method: 'POST',
        response: () => Response.json({ code: 200, playlist: [] }),
      },
    ],
    async (scenario) => {
      const config = {
        cookie:
          'MUSIC_U=account; deviceId=D2; OS=pc; APPVER=old; CHANNEL=old; OSVER=old; buildver=old; resolution=old',
      };
      const client = createClientFromContext(
        config,
        buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      await client.userPlaylist({ uid: 17 });
      const wire = scenario.sent[0]!;
      const cookies = readCookies(wire.headers);
      expect(cookies).toMatchObject({
        os: 'web',
        deviceId: 'D2',
        MUSIC_U: 'account',
      });
      for (const name of [
        'OS',
        'APPVER',
        'CHANNEL',
        'OSVER',
        'buildver',
        'resolution',
      ])
        expect(cookies).not.toHaveProperty(name);
      expect(readWebBody(wire.body)).toMatchObject({ uid: 17 });
    },
  );
});

test('identity low-level linuxapi keeps its Linux default and independently decoded forward body', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/api/linux/forward',
        method: 'POST',
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      await createRequest(
        '/api/identity',
        { id: 17 },
        {
          crypto: 'linuxapi',
          cookie: 'MUSIC_U=linux-account; deviceId=D2',
          state: { deviceId: 'D1' },
          fetcher: scenario.fetcher,
        },
      );
      const wire = scenario.sent[0]!;
      expect(wire.headers.get('user-agent')).toBe(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
      );
      expect(readCookies(wire.headers)).toMatchObject({
        os: 'linux',
        osver: 'Deepin 20.9',
        appver: '1.2.1.0428',
        channel: 'netease',
        deviceId: 'D1',
      });
      const decipher = createDecipheriv(
        'aes-128-ecb',
        Buffer.from('rFgB&h#%2?^eDg:Q'),
        null,
      );
      const decoded = JSON.parse(
        Buffer.concat([
          decipher.update(
            Buffer.from(new URLSearchParams(wire.body).get('eparams')!, 'hex'),
          ),
          decipher.final(),
        ]).toString(),
      );
      expect(decoded).toEqual({
        method: 'POST',
        params: { id: 17, e_r: false },
        url: 'https://music.163.com/api/identity',
      });
    },
  );
});

test('identity CLI registration uses the same device in username and HTTP cookie', async () => {
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/register/anonimous',
        method: 'POST',
        response: () =>
          Response.json(
            { code: 200 },
            { headers: { 'set-cookie': 'MUSIC_A=cli; Path=/' } },
          ),
      },
    ],
    async (scenario) => {
      await registerAnonymous(
        { state: { deviceId: 'CLI-D1' }, fetcher: scenario.fetcher },
        { entropy: testEntropy },
      );
      const wire = scenario.sent[0]!;
      expect(readCookies(wire.headers).deviceId).toBe('CLI-D1');
      const data = readWebBody(wire.body) as { username: string };
      expect(
        Buffer.from(data.username, 'base64').toString().split(' ')[0],
      ).toBe('CLI-D1');
      expect(readCookies(wire.headers).os).toBe('web');
      expect(readCookies(wire.headers)).not.toHaveProperty('appver');
    },
  );
});

test('identity concurrent anonymous calls retain distinct devices and returned credentials', async () => {
  setRuntimeState({ anonymousToken: '', deviceId: 'runtime' });
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/register/anonimous',
        method: 'POST',
        times: 2,
        response: (wire) => {
          const data = readWebBody(wire.body) as { username: string };
          const device = Buffer.from(data.username, 'base64')
            .toString()
            .split(' ')[0];
          expect(readCookies(wire.headers).deviceId).toBe(device);
          return Response.json(
            { code: 200 },
            { headers: { 'set-cookie': `MUSIC_A=session-${device}; Path=/` } },
          );
        },
      },
      {
        url: 'https://music.163.com/weapi/login/qrcode/unikey',
        method: 'POST',
        times: 2,
        response: (wire) => {
          const cookies = readCookies(wire.headers);
          expect(cookies.MUSIC_A).toBe(`session-${cookies.deviceId}`);
          return Response.json({ code: 200, unikey: cookies.deviceId });
        },
      },
    ],
    async (scenario) => {
      const config = {};
      const client = createClientFromContext(
        config,
        buildCallServices(config, true, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      const results = await Promise.all(
        ['D1', 'D2'].map((deviceId) =>
          client.loginQrKey({}, { state: { deviceId } }),
        ),
      );
      expect(results.map((result) => result.body.data.unikey)).toEqual([
        'D1',
        'D2',
      ]);
      expect(scenario.sent).toHaveLength(4);
    },
  );
});

test('identity registry has no mixed profiles or undeclared defaults', () => {
  expect(Object.keys(requestProfiles).toSorted()).toEqual([
    'api',
    'clientlogOsx',
    'eapi',
    'linuxapi',
    'plainImage',
    'plainInterface',
    'plainLookup',
    'plainMusic',
    'plainNos',
    'plainVoice',
    'web',
  ]);
  const profiles: Array<string> = [];
  for (const module of Object.values(sdkModuleRegistry)) {
    expect(module.actions).toBeDefined();
    for (const action of Object.values(module.actions ?? {}))
      profiles.push(action.profile);
  }
  expect(profiles).toHaveLength(390);
  expect(profiles.filter((profile) => profile === 'web')).toHaveLength(289);
  expect(profiles.filter((profile) => profile === 'eapi')).toHaveLength(90);
});

for (const [label, state, cookie, expected] of [
  ['cookie', undefined, 'deviceId=pool-cookie', 'pool-cookie'],
  ['state', { deviceId: 'pool-state' }, 'deviceId=pool-cookie', 'pool-state'],
] as const)
  test(`identity caller ${label} device wins over an anonymous pool including registration`, async () => {
    setRuntimeState({ anonymousToken: '', deviceId: 'pool-runtime' });
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          response: (wire) => {
            expect(readCookies(wire.headers).deviceId).toBe(expected);
            const payload = readWebBody(wire.body) as { username: string };
            expect(
              Buffer.from(payload.username, 'base64').toString().split(' ')[0],
            ).toBe(expected);
            return Response.json(
              { code: 200 },
              {
                headers: { 'set-cookie': 'MUSIC_A=pool-registration; Path=/' },
              },
            );
          },
        },
        {
          url: 'https://music.163.com/weapi/login/qrcode/unikey',
          method: 'POST',
          response: (wire) => {
            expect(readCookies(wire.headers).deviceId).toBe(expected);
            expect(readCookies(wire.headers).deviceId).toBe(expected);
            return Response.json({ code: 200, unikey: 'pool-key' });
          },
        },
      ],
      async (scenario) => {
        const config = { identityPool: { size: 1 } };
        const client = createClientFromContext(
          config,
          buildCallServices(config, true, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
        );
        expect((await client.loginQrKey({}, { cookie, state })).status).toBe(
          200,
        );
      },
    );
  });

test('identity low-level partial PC override gets matching generated platform defaults', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/identity',
        method: 'POST',
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      await createRequest(
        '/api/identity',
        {},
        { cookie: { os: 'pc' }, fetcher: scenario.fetcher },
      );
      const wire = scenario.sent[0]!;
      expect(wire.headers.get('user-agent')).toBe(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      );
      expect(readCookies(wire.headers)).toMatchObject({
        os: 'pc',
        osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
        appver: '3.1.17.204416',
        channel: 'netease',
      });
      expect(
        (readEapiBody(wire.body).data as { header: unknown }).header,
      ).toEqual(readCookies(wire.headers));
    },
  );
});

for (const [os, expected] of [
  [
    'android',
    {
      os: 'android',
      appver: '9.1.65.240927161425',
      osver: '14',
      channel: 'xiaomi',
      agent:
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    },
  ],
  [
    'osx',
    {
      ...expectedClients.osx.cookie,
      agent: expectedClients.osx.userAgent,
    },
  ],
] as const)
  test(`identity low-level partial ${os} override selects coherent defaults`, async () => {
    await withScenario(
      [
        {
          url: 'https://interface.music.163.com/eapi/identity',
          method: 'POST',
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        await createRequest(
          '/api/identity',
          { id: 17 },
          { cookie: { os }, fetcher: scenario.fetcher },
        );
        const wire = scenario.sent[0]!;
        expect(wire.headers.get('user-agent')).toBe(expected.agent);
        const { agent: _agent, ...fields } = expected;
        expect(readCookies(wire.headers)).toMatchObject(fields);
        expect(readEapiBody(wire.body).data).toEqual({
          id: 17,
          e_r: false,
          header: readCookies(wire.headers),
        });
      },
    );
  });

test('identity low-level unknown raw OS does not invent a client UA or versions', async () => {
  await withScenario(
    [
      {
        url: 'https://interface.music.163.com/eapi/identity',
        method: 'POST',
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      await createRequest(
        '/api/identity',
        {},
        { cookie: { os: 'custom-system' }, fetcher: scenario.fetcher },
      );
      const wire = scenario.sent[0]!;
      expect(wire.headers.get('user-agent')).toBeNull();
      expect(readCookies(wire.headers).os).toBe('custom-system');
      for (const field of [
        'appver',
        'channel',
        'osver',
        'buildver',
        'versioncode',
        'mobilename',
        'resolution',
      ])
        expect(readCookies(wire.headers)).not.toHaveProperty(field);
    },
  );
});

for (const [label, deviceId] of [
  ['blank', ' '],
  ['undefined', undefined],
] as const)
  test(`identity pool ignores ${label} state device through a concurrent runtime change`, async () => {
    setRuntimeState({ anonymousToken: '', deviceId: 'initial-runtime' });
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          response: (wire) => {
            expect(readCookies(wire.headers).deviceId).toBe('initial-runtime');
            const payload = readWebBody(wire.body) as { username: string };
            expect(
              Buffer.from(payload.username, 'base64').toString().split(' ')[0],
            ).toBe('initial-runtime');
            setRuntimeState({ deviceId: 'later-runtime' });
            return Response.json(
              { code: 200 },
              { headers: { 'set-cookie': 'MUSIC_A=pool-stable; Path=/' } },
            );
          },
        },
        {
          url: 'https://music.163.com/weapi/login/qrcode/unikey',
          method: 'POST',
          response: (wire) => {
            expect(readCookies(wire.headers).deviceId).toBe('initial-runtime');
            return Response.json({ code: 200, unikey: 'stable' });
          },
        },
      ],
      async (scenario) => {
        const config = { identityPool: { size: 1 } };
        const client = createClientFromContext(
          config,
          buildCallServices(config, true, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
        );
        expect(
          (await client.loginQrKey({}, { state: { deviceId } })).status,
        ).toBe(200);
      },
    );
  });

test('identity existing anonymous session keeps its runtime device without an explicit device', async () => {
  setRuntimeState({
    anonymousToken: 'existing-runtime-token',
    deviceId: 'existing-anonymous-device',
  });
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/login/qrcode/unikey',
        method: 'POST',
        response: (wire) => {
          const cookies = readCookies(wire.headers);
          expect(cookies).toMatchObject({
            MUSIC_A: 'existing-runtime-token',
            deviceId: 'existing-anonymous-device',
          });
          expect(wire.url).toBe(
            'https://music.163.com/weapi/login/qrcode/unikey',
          );
          expect(new URLSearchParams(wire.body).has('params')).toBe(true);
          expect(cookies.os).toBe('web');
          return Response.json({ code: 200, unikey: 'existing' });
        },
      },
    ],
    async (scenario) => {
      const client = createHanaMusicApi({
        fetcher: scenario.fetcher,
      });
      expect((await client.loginQrKey()).status).toBe(200);
      expect(scenario.sent).toHaveLength(1);
    },
  );
});

test('identity shared cache includes a changing runtime device with the same anonymous credentials', async () => {
  setRuntimeState({
    anonymousToken: 'runtime-session',
    deviceId: 'runtime-D1',
  });
  await withScenario(
    ['runtime-D1', 'runtime-D2'].map((device) => ({
      url: 'https://music.163.com/weapi/song/lyric',
      method: 'POST',
      response: (wire) => {
        expect(readCookies(wire.headers).deviceId).toBe(device);
        return Response.json({ code: 200, lrc: { lyric: device } });
      },
    })),
    async (scenario) => {
      const client = createHanaMusicApi({
        cache: { ttlMs: 60_000 },
        cookie: 'MUSIC_A=same-session',
        fetcher: scenario.fetcher,
      });
      for (const device of ['runtime-D1', 'runtime-D2', 'runtime-D1']) {
        setRuntimeState({ deviceId: device });
        expect((await client.lyric({ id: 7 })).body.lrc?.lyric).toBe(device);
      }
      expect(scenario.sent).toHaveLength(2);
    },
  );
});
