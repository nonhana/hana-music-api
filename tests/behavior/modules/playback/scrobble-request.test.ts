import { expect, test } from 'bun:test';

import { runRequestAtEdge } from '../../../../src/core/request.ts';

test('scrobble request uses the clientlog domain and scoped osx identity', async () => {
  let url = '';
  let cookie = '';
  const intent = {
    target: '/api/feedback/weblog',
    data: { logs: '[]' },
    protocol: 'eapi',
    method: 'POST',
    headers: {},
    response: 'json',
  } as const;

  await runRequestAtEdge(intent, {
    domain: 'https://clientlog.music.163.com',
    cookie: {
      MUSIC_U: 'listener',
      os: 'osx',
      appver: '3.1.10.5100',
      channel: 'netease',
      osver: '15.5',
    },
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
    {
      target: '/api/user/account',
      data: {},
      protocol: 'eapi',
      method: 'POST',
      headers: {},
      response: 'json',
    },
    {
      domain: 'https://clientlog.music.163.com',
      cookie: {
        MUSIC_U: 'listener',
        os: 'osx',
        appver: '3.1.10.5100',
        channel: 'netease',
        osver: '15.5',
      },
      fetcher: async () => Response.json({ code: 200 }),
    },
  ).catch((error: unknown) => error);
  expect(result).toMatchObject({ status: 400 });
});
