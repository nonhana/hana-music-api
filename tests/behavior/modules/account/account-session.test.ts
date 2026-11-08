import { expect, test } from 'bun:test';

import { createHanaMusicApi } from '../../../../index.ts';
import {
  getRuntimeState,
  setRuntimeState,
} from '../../../../src/core/runtime.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { settle } from '../../../_kit/assertions.ts';
import { testEntropy } from '../../../_kit/harness/sdk.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readWebBody } from '../../../_kit/upstream/wire.ts';

const account = {
  code: 200,
  account: { id: 17, anonimousUser: false },
  profile: { userId: 17 },
};
for (const entry of [
  {
    module: 'login',
    path: 'https://interface.music.163.com/eapi/w/login',
    query: {
      email: 'synthetic@example.invalid',
      password: 'synthetic-password',
    },
    body: { code: 200 },
  },
  {
    module: 'loginCellphone',
    path: 'https://music.163.com/weapi/w/login/cellphone',
    query: { phone: '00000000000', captcha: 'synthetic-code' },
    body: account,
  },
  {
    module: 'loginRefresh',
    path: 'https://interface.music.163.com/eapi/login/token/refresh',
    query: {},
    body: { code: 200 },
  },
  {
    module: 'logout',
    path: 'https://interface.music.163.com/eapi/logout',
    query: {},
    body: { code: 200 },
  },
] as const) {
  test(`account ${entry.module} returns response cookies without changing another call session`, async () => {
    const previous = getRuntimeState();
    const responseCookies = [
      'MUSIC_U=fresh-session; Path=/; HttpOnly',
      '__csrf=fresh-csrf; Path=/',
    ];
    const result = await withScenario(
      [
        {
          url: entry.path,
          method: 'POST',
          check: (wire) =>
            expect(wire.headers.get('cookie')).toContain(
              'MUSIC_U=initial-session',
            ),
          response: () => {
            const headers = new Headers();
            for (const value of responseCookies)
              headers.append('set-cookie', value);
            return Response.json(entry.body, { headers });
          },
        },
        {
          url: 'https://music.163.com/weapi/nuser/account/get',
          method: 'POST',
          check: (wire) =>
            expect(wire.headers.get('cookie')).toContain(
              'MUSIC_U=initial-session',
            ),
          response: () => Response.json(account),
        },
        {
          url: 'https://music.163.com/weapi/nuser/account/get',
          method: 'POST',
          check: (wire) =>
            expect(wire.headers.get('cookie')).toContain(
              'MUSIC_U=other-session',
            ),
          response: () => Response.json(account),
        },
        {
          url: 'https://music.163.com/weapi/nuser/account/get',
          method: 'POST',
          check: (wire) =>
            expect(wire.headers.get('cookie')).toContain(
              'MUSIC_U=fresh-session',
            ),
          response: () => Response.json(account),
        },
      ],
      async (scenario) => {
        const client = createHanaMusicApi({
          cookie: 'MUSIC_U=initial-session',
          fetcher: scenario.fetcher,
        });
        const call = client[entry.module] as (
          query: unknown,
        ) => ReturnType<typeof client.logout>;
        const response = await call(entry.query);
        await client.userAccount();
        await createHanaMusicApi({
          cookie: 'MUSIC_U=other-session',
          fetcher: scenario.fetcher,
        }).userAccount();
        await client.userAccount({}, { cookie: response.cookie.join('; ') });
        return response;
      },
    );
    expect(result.status).toBe(200);
    expect(result.cookie).toEqual(responseCookies);
    if (entry.module !== 'logout')
      expect(result.body).toHaveProperty('cookie', responseCookies.join(';'));
    expect(getRuntimeState()).toEqual(previous);
  });
}

for (const method of [
  'login',
  'loginCellphone',
  'loginRefresh',
  'logout',
] as const) {
  test(`account HTTP ${method} merges request cookies and preserves secure response attributes`, async () => {
    const entry = {
      login: { route: '/login', url: 'eapi/w/login', body: { code: 200 } },
      loginCellphone: {
        route: '/login/cellphone',
        url: 'weapi/w/login/cellphone',
        body: account,
      },
      loginRefresh: {
        route: '/login/refresh',
        url: 'eapi/login/token/refresh',
        body: { code: 200 },
      },
      logout: { route: '/logout', url: 'eapi/logout', body: { code: 200 } },
    }[method];
    await withScenario(
      [
        {
          url: `https://${entry.url.startsWith('weapi') ? 'music' : 'interface.music'}.163.com/${entry.url}`,
          method: 'POST',
          times: 2,
          check: (wire) => {
            expect(wire.headers.get('cookie')).toContain(
              'MUSIC_U=body-session',
            );
            expect(wire.headers.get('cookie')).not.toContain('headerOnly=kept');
            expect(wire.headers.get('cookie')).not.toContain('queryOnly=kept');
          },
          response: () =>
            Response.json(entry.body, {
              headers: {
                'set-cookie': 'MUSIC_U=returned-session; Path=/; HttpOnly',
              },
            }),
        },
      ],
      async (scenario) => {
        for (const app of [
          await createServer({}, { execution: { fetcher: scenario.fetcher } }),
          await createServer({}, { execution: { fetcher: scenario.fetcher } }),
        ]) {
          const response = await app.request(
            `https://api.example${entry.route}?cookie=${encodeURIComponent('MUSIC_U=query-session; queryOnly=kept')}`,
            {
              method: 'POST',
              headers: {
                cookie: 'MUSIC_U=header-session; headerOnly=kept',
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                email: 'synthetic@example.invalid',
                password: 'synthetic-password',
                phone: '00000000000',
                captcha: 'synthetic-code',
                cookie: 'MUSIC_U=body-session',
              }),
            },
          );
          expect(response.status).toBe(200);
          const setCookie = response.headers.get('set-cookie');
          expect(setCookie).toContain('MUSIC_U=returned-session');
          expect(setCookie).toContain('SameSite=None');
          expect(setCookie).toContain('Secure');
          expect(setCookie).toContain('HttpOnly');
        }
      },
    );
  });
}

test('account anonymous initialization updates only anonymous runtime state and leaves the business token fresh', async () => {
  const previous = getRuntimeState();
  setRuntimeState({ anonymousToken: '', deviceId: 'anonymous-device' });
  let providers = 0;
  try {
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          check: (wire) => {
            expect(wire.headers.get('X-antiCheatToken')).toBeNull();
            expect(wire.headers.get('cookie')).toContain(
              'deviceId=anonymous-device',
            );
            expect(wire.headers.get('cookie')).toContain('os=web');
          },
          response: () =>
            Response.json(
              { code: 200 },
              {
                headers: {
                  'set-cookie': 'MUSIC_A=initialized-anonymous; Path=/',
                },
              },
            ),
        },
        {
          url: 'https://interface.music.163.com/eapi/login/qrcode/unikey',
          method: 'POST',
          check: (wire) => {
            expect(wire.headers.get('cookie')).toContain(
              'MUSIC_A=initialized-anonymous',
            );
            expect(wire.headers.get('X-antiCheatToken')).toBe('business-token');
          },
          response: () => Response.json({ code: 200, unikey: 'synthetic-key' }),
        },
      ],
      async (scenario) => {
        const result = await createHanaMusicApi({
          deviceId: 'anonymous-device',
          fetcher: scenario.fetcher,
          checkToken: async () => {
            providers++;
            return 'business-token';
          },
        }).loginQrKey();
        expect(result.body.data.unikey).toBe('synthetic-key');
      },
    );
    expect(providers).toBe(1);
    expect(getRuntimeState().anonymousToken).toBe('initialized-anonymous');
  } finally {
    setRuntimeState(previous);
  }
});

test('account failed anonymous initialization does not install a credential or continue the business call', async () => {
  const previous = getRuntimeState();
  setRuntimeState({ anonymousToken: '' });
  try {
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        expect(
          await settle(
            createHanaMusicApi({ fetcher: scenario.fetcher }).loginQrKey(),
          ),
        ).toHaveProperty('rejected.status', 502);
      },
    );
    expect(getRuntimeState().anonymousToken).toBe('');
  } finally {
    setRuntimeState(previous);
  }
});

test('account explicit anonymous registration keeps the baseline device username and returns the credential without global session mutation', async () => {
  const previous = getRuntimeState();
  setRuntimeState({ deviceId: 'account-device' });
  try {
    await withScenario(
      [
        {
          url: 'https://music.163.com/weapi/register/anonimous',
          method: 'POST',
          check: (wire) => {
            expect(readWebBody(wire.body)).toHaveProperty(
              'username',
              'YWNjb3VudC1kZXZpY2UgQyttYzRYSTlWMTdYbm1iOWZQYlB1Zz09',
            );
          },
          response: () =>
            Response.json(
              { code: 200, userId: 17 },
              {
                headers: { 'set-cookie': 'MUSIC_A=explicit-anonymous; Path=/' },
              },
            ),
        },
      ],
      async (scenario) => {
        const app = await createServer(
          {},
          { execution: { fetcher: scenario.fetcher, entropy: testEntropy } },
        );
        const response = await app.request('/register/anonimous', {
          headers: { cookie: 'MUSIC_U=explicit-session' },
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toHaveProperty(
          'cookie',
          'MUSIC_A=explicit-anonymous; Path=/',
        );
      },
    );
    expect(getRuntimeState().anonymousToken).toBe(previous.anonymousToken);
  } finally {
    setRuntimeState(previous);
  }
});

test('account separate HTTP services keep interleaved sessions and response cookies isolated', async () => {
  const first = {
    code: 200,
    account: { id: 17, anonimousUser: false },
    profile: { userId: 17 },
  };
  const second = {
    code: 200,
    account: { id: 29, anonimousUser: false },
    profile: { userId: 29 },
  };
  const url = 'https://music.163.com/weapi/nuser/account/get';
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/w/login/cellphone',
        method: 'POST',
        check: (wire) => {
          expect(wire.headers.get('cookie')).toContain('MUSIC_U=initial-first');
          expect(wire.headers.get('cookie')).not.toContain('second');
        },
        response: () =>
          Response.json(first, {
            headers: { 'set-cookie': 'MUSIC_U=fresh-first; Path=/' },
          }),
      },
      {
        url: 'https://music.163.com/weapi/w/login/cellphone',
        method: 'POST',
        check: (wire) => {
          expect(wire.headers.get('cookie')).toContain(
            'MUSIC_U=initial-second',
          );
          expect(wire.headers.get('cookie')).not.toContain('first');
        },
        response: () =>
          Response.json(second, {
            headers: { 'set-cookie': 'MUSIC_U=fresh-second; Path=/' },
          }),
      },
      ...[
        { cookie: 'initial-first', body: first },
        { cookie: 'initial-second', body: second },
        { cookie: 'fresh-first', body: first },
        { cookie: 'fresh-second', body: second },
      ].map((entry) => ({
        url,
        method: 'POST',
        check: (wire: { headers: Headers }) => {
          expect(wire.headers.get('cookie')).toContain(
            `MUSIC_U=${entry.cookie}`,
          );
          expect(wire.headers.get('cookie')).not.toContain(
            entry.cookie.includes('first') ? 'second' : 'first',
          );
        },
        response: () => Response.json(entry.body),
      })),
    ],
    async (scenario) => {
      const firstApp = await createServer(
        {},
        { execution: { fetcher: scenario.fetcher } },
      );
      const secondApp = await createServer(
        {},
        { execution: { fetcher: scenario.fetcher } },
      );
      const loginBody = JSON.stringify({
        phone: '00000000000',
        captcha: 'synthetic-code',
      });
      const firstLogin = await firstApp.request('/login/cellphone', {
        method: 'POST',
        headers: {
          cookie: 'MUSIC_U=initial-first',
          'content-type': 'application/json',
        },
        body: loginBody,
      });
      const secondLogin = await secondApp.request('/login/cellphone', {
        method: 'POST',
        headers: {
          cookie: 'MUSIC_U=initial-second',
          'content-type': 'application/json',
        },
        body: loginBody,
      });
      expect(firstLogin.status).toBe(200);
      expect(secondLogin.status).toBe(200);
      const firstCookie = firstLogin.headers.get('set-cookie')!.split(';')[0]!;
      const secondCookie = secondLogin.headers
        .get('set-cookie')!
        .split(';')[0]!;
      expect(firstCookie).toBe('MUSIC_U=fresh-first');
      expect(secondCookie).toBe('MUSIC_U=fresh-second');
      for (const entry of [
        { app: firstApp, cookie: 'MUSIC_U=initial-first', uid: 17 },
        { app: secondApp, cookie: 'MUSIC_U=initial-second', uid: 29 },
        { app: firstApp, cookie: firstCookie, uid: 17 },
        { app: secondApp, cookie: secondCookie, uid: 29 },
      ]) {
        const response = await entry.app.request('/user/account', {
          headers: { cookie: entry.cookie },
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toHaveProperty('account.id', entry.uid);
      }
    },
  );
});
