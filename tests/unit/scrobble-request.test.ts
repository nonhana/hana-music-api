import { expect, test } from 'bun:test';

import { buildApiRequestIntent } from '../../src/core/request-intent.ts';
import { runRequestAtEdge } from '../../src/core/request.ts';

test('scrobble request uses the clientlog domain and scoped osx identity', async () => {
  let url = '';
  let cookie = '';
  const intent = buildApiRequestIntent(
    '/api/feedback/weblog',
    { logs: '[]' },
    {
      cookieOverrides: {
        appver: '3.1.10.5100',
        channel: 'netease',
        os: 'osx',
        osver: '15.5',
      },
      crypto: 'eapi',
      domain: 'https://clientlog.music.163.com',
    },
  );

  await runRequestAtEdge(intent, {
    cookie: 'MUSIC_U=listener',
    fetcher: async (input, init) => {
      url = input instanceof Request ? input.url : input.toString();
      cookie = new Headers(init?.headers).get('Cookie') ?? '';
      return Response.json({ code: 200, data: 'success' });
    },
  });

  expect(url).toBe('https://clientlog.music.163.com/eapi/feedback/weblog');
  expect(cookie).toContain('os=osx');
  expect(cookie).toContain('appver=3.1.10.5100');
  expect(cookie).toContain('osver=15.5');
  expect(cookie).toContain('channel=netease');
  expect(cookie).toContain('MUSIC_U=listener');
});

test('authenticated API requests cannot use the clientlog domain for other endpoints', async () => {
  const result = await runRequestAtEdge(
    buildApiRequestIntent(
      '/api/user/account',
      {},
      { crypto: 'eapi', domain: 'https://clientlog.music.163.com' },
    ),
    {
      cookie: 'MUSIC_U=listener',
      fetcher: async () => Response.json({ code: 200 }),
    },
  ).catch((error: unknown) => error);
  expect(result).toMatchObject({ status: 400 });
});
