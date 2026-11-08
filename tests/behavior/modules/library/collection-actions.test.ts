import { expect, test } from 'bun:test';

import { buildCallServices } from '../../../../src/core/call.ts';
import { createClientFromContext } from '../../../../src/sdk/generated/client-factory.generated.ts';
import { createServer } from '../../../../src/server/create-server.ts';
import { settle } from '../../../_kit/assertions.ts';
import { createStage, testEntropy } from '../../../_kit/harness/sdk.ts';
import { withScenario } from '../../../_kit/upstream/scenario.ts';
import { readWebBody } from '../../../_kit/upstream/wire.ts';

const actions = [
  { method: 'albumSub', route: 'album', t: 1, action: 'sub', data: { id: 17 } },
  {
    method: 'albumSub',
    route: 'album',
    t: 0,
    action: 'unsub',
    data: { id: 17 },
  },
  {
    method: 'artistSub',
    route: 'artist',
    t: 1,
    action: 'sub',
    data: { artistId: 17, artistIds: '[17]' },
  },
  {
    method: 'artistSub',
    route: 'artist',
    t: 0,
    action: 'unsub',
    data: { artistId: 17, artistIds: '[17]' },
  },
] as const;

test('concurrent album and artist calls freeze each account input and token', async () => {
  const stage = createStage('album token');
  let finish!: (value: string) => void;
  const cookie = { MUSIC_U: 'album-account', MUSIC_A: 'album-anonymous' };
  const query = { id: 17, t: 1 as const };
  await withScenario(
    [
      {
        url: 'https://music.163.com/weapi/artist/unsub',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'artist-token' },
        check: (wire) => {
          expect(wire.headers.get('cookie')).toContain(
            'MUSIC_U=artist-account',
          );
          expect(readWebBody(wire.body)).toMatchObject({
            artistId: 19,
            artistIds: '[19]',
            checkToken: 'artist-token',
          });
        },
        response: () => Response.json({ code: 200 }),
      },
      {
        url: 'https://music.163.com/weapi/album/sub',
        method: 'POST',
        headers: { 'X-antiCheatToken': 'album-token' },
        check: (wire) => {
          expect(wire.headers.get('cookie')).toContain('MUSIC_U=album-account');
          expect(wire.headers.get('cookie')).toContain(
            'MUSIC_A=album-anonymous',
          );
          expect(readWebBody(wire.body)).toMatchObject({
            id: 17,
            checkToken: 'album-token',
          });
        },
        response: () => Response.json({ code: 200 }),
      },
    ],
    async (scenario) => {
      const config = { cookie: 'MUSIC_U=base' };
      const client = createClientFromContext(
        config,
        buildCallServices(config, false, {
          fetcher: scenario.fetcher,
          entropy: testEntropy,
        }),
      );
      const first = client.albumSub(query, {
        cookie,
        checkToken: () =>
          new Promise<string>((resolve) => {
            finish = resolve;
            stage.reach();
          }),
      });
      await stage.wait(first);
      cookie.MUSIC_U = 'changed';
      query.id = 99;
      await client.artistSub(
        { id: 19, t: 0 },
        { cookie: 'MUSIC_U=artist-account', checkToken: 'artist-token' },
      );
      finish('album-token');
      await first;
      expect(scenario.entries).toHaveLength(2);
    },
  );
});

for (const tokenKind of ['none', 'string', 'provider'] as const) {
  test.each(actions)(
    `collection $route/$action sends its declared web contract with ${tokenKind}`,
    async ({ method, route, t, action, data }) => {
      let providers = 0;
      const token = tokenKind === 'none' ? undefined : 'collection-token';
      await withScenario(
        [
          {
            url: `https://music.163.com/weapi/${route}/${action}`,
            method: 'POST',
            headers: { 'X-antiCheatToken': token ?? null, 'x-aeapi': null },
            check: (wire) => {
              expect(wire.headers.get('user-agent')).toContain(
                'Chrome/124.0.0.0',
              );
              const cookie = wire.headers.get('cookie')!;
              expect(cookie).toContain('os=web');
              expect(cookie).toContain('MUSIC_U=collector');
              expect(cookie).toContain('MUSIC_A=anonymous-collector');
              for (const name of [
                'appver',
                'osver',
                'channel',
                'clientSign',
                'APPVER',
                'OS',
              ])
                expect(cookie).not.toContain(`${name}=`);
              expect(readWebBody(wire.body)).toEqual({
                ...data,
                e_r: false,
                csrf_token: 'csrf',
                ...(token ? { checkToken: token } : {}),
              });
            },
            response: () => Response.json({ code: 200, future: true }),
          },
        ],
        async (scenario) => {
          const config = {
            cookie:
              'MUSIC_U=collector; MUSIC_A=anonymous-collector; __csrf=csrf; os=pc; appver=desktop; channel=pc; osver=desktop; clientSign=old; APPVER=mobile; OS=iphone',

            checkToken:
              tokenKind === 'provider'
                ? async () => {
                    providers++;
                    return 'collection-token';
                  }
                : token,
          };
          const client = createClientFromContext(
            config,
            buildCallServices(config, false, {
              fetcher: scenario.fetcher,
              entropy: testEntropy,
            }),
          );
          expect(await settle(client[method]({ id: 17, t }))).toMatchObject({
            resolved: {
              status: 200,
              body: { code: 200, future: true },
              cookie: [],
            },
          });
          expect(providers).toBe(tokenKind === 'provider' ? 1 : 0);
          expect(scenario.entries).toHaveLength(1);
        },
      );
    },
  );
}

test.each(actions)(
  'collection $route/$action never retries a rejected write',
  async ({ method, route, t, action }) => {
    await withScenario(
      [
        {
          url: `https://music.163.com/weapi/${route}/${action}`,
          method: 'POST',
          reject: new Error('ECONNREFUSED'),
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        const config = {
          cookie: 'MUSIC_U=collector',
          retry: { retryNonIdempotent: true, backoffMs: 0 },
        };
        const client = createClientFromContext(
          config,
          buildCallServices(config, false, {
            fetcher: scenario.fetcher,
            entropy: testEntropy,
          }),
        );
        expect(await settle(client[method]({ id: 17, t }))).toHaveProperty(
          'rejected',
        );
        expect(scenario.entries).toHaveLength(1);
      },
    );
  },
);

test.each(actions)(
  'HTTP discovers collection $route/$action without opening token execution config',
  async ({ route, t, action, data }) => {
    await withScenario(
      [
        {
          url: `https://music.163.com/weapi/${route}/${action}`,
          method: 'POST',
          headers: { 'X-antiCheatToken': null },
          check: (wire) => {
            expect(wire.headers.get('cookie')).toContain('os=web');
            const expected = Object.fromEntries(
              Object.entries(data).map(([name, value]) => [
                name,
                typeof value === 'number' ? String(value) : value,
              ]),
            );
            expect(readWebBody(wire.body)).toMatchObject(expected);
          },
          response: () => Response.json({ code: 200 }),
        },
      ],
      async (scenario) => {
        const app = await createServer(
          {},
          { execution: { fetcher: scenario.fetcher, entropy: testEntropy } },
        );
        const response = await app.request(`/${route}/sub?id=17&t=${t}`, {
          headers: { cookie: 'MUSIC_U=http-collector' },
        });
        expect(response.status).toBe(200);
        expect(
          (await app.request(`/${route}/sub?id=17&t=${t}&checkToken=forbidden`))
            .status,
        ).toBe(400);
        expect(scenario.entries).toHaveLength(1);
      },
    );
  },
);
