import { expect, test } from 'bun:test';

import type { ModuleCallConfig, NcmApiResponse } from '../../index.ts';
import { createHanaMusicApi } from '../../index.ts';
import { settle } from '../_kit/assertions.ts';
import ownPlaylist from '../fixtures/netease/playlist_subscribe/own.json';
import rejectedHttp200 from '../fixtures/netease/playlist_subscribe/rejected-http-200.json';
import rejected from '../fixtures/netease/playlist_subscribe/rejected.json';
import tokenSubscribed from '../fixtures/netease/playlist_subscribe/subscribe-token.json';
import subscribed from '../fixtures/netease/playlist_subscribe/subscribe.json';
import unsubscribed from '../fixtures/netease/playlist_subscribe/unsubscribe.json';

const createClient = (
  config: Pick<
    ModuleCallConfig,
    'checkToken' | 'cookie' | 'ua' | 'retry' | 'crypto'
  >,
  recorded: { status: number; body: unknown } = {
    status: 200,
    body: { code: 200 },
  },
) => {
  const sent: Array<{
    url: string;
    cookie: string;
    userAgent: string;
    headers: Headers;
    body: string;
    bodyKeys: Array<string>;
  }> = [];
  const client = createHanaMusicApi({
    ...config,
    fetcher: async (input, init) => {
      const headers = new Headers(init?.headers);
      const body = typeof init?.body === 'string' ? init.body : '';
      sent.push({
        url: input instanceof Request ? input.url : input.toString(),
        cookie: headers.get('cookie') ?? '',
        userAgent: headers.get('user-agent') ?? '',
        headers,
        body,
        bodyKeys: [...new URLSearchParams(body).keys()],
      });
      return Response.json(recorded.body, { status: recorded.status });
    },
  });
  return { client, sent };
};

test.each([
  { t: 1, path: 'subscribe' },
  { t: 0, path: 'unsubscribe' },
])(
  'playlistSubscribe t=$t sends a weapi web request, whatever client the caller set',
  async ({ t, path }) => {
    const { client, sent } = createClient({
      cookie: 'MUSIC_U=listener; os=pc; appver=3.1.17.204416',
      ua: 'Mozilla/5.0 (Windows NT 10.0) NeteaseMusicDesktop/3.1.29.205117',
      crypto: 'eapi',
    });

    await client.playlistSubscribe({ id: 2889745179, t });

    expect(sent).toHaveLength(1);
    const [request] = sent;
    expect(request?.url).toBe(`https://music.163.com/weapi/playlist/${path}`);
    const cookie = new Map(
      request?.cookie.split('; ').map((pair) => {
        const [name = '', value = ''] = pair.split('=');
        return [name, value];
      }),
    );
    expect(cookie.get('os')).toBe('web');
    expect(cookie.get('MUSIC_U')).toBe('listener');
    expect(request?.userAgent).toBe(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
    );
    expect(request?.headers.get('referer')).toBe('https://music.163.com');
    // cspell:ignore anticheattoken
    expect(request?.headers.has('x-anticheattoken')).toBe(false);
    expect(request?.bodyKeys.toSorted()).toEqual(['encSecKey', 'params']);
  },
);

test('playlistSubscribe uses weapi with a configured checkToken', async () => {
  const token = 'fresh-check-token';
  const { client, sent } = createClient(
    {
      cookie: 'MUSIC_U=listener; os=iphone; appver=9.0.90',
      checkToken: token,
    },
    tokenSubscribed.response,
  );

  const result = await client.playlistSubscribe({ id: 2889745179, t: 1 });

  expect(result.status).toBe(200);
  expect(sent).toHaveLength(1);
  const [request] = sent;
  expect(request?.url).toBe('https://music.163.com/weapi/playlist/subscribe');
  expect(request?.headers.get('x-anticheattoken')).toBe(token);
  expect(request?.bodyKeys.toSorted()).toEqual(['encSecKey', 'params']);
  const cookie = new Map(
    request?.cookie.split('; ').map((pair) => {
      const [name = '', value = ''] = pair.split('=');
      return [name, value];
    }),
  );
  expect(cookie.get('os')).toBe('web');
  expect(cookie.get('MUSIC_U')).toBe('listener');
  expect(request?.userAgent).not.toContain('NeteaseMusicDesktop');
});

test('playlistSubscribe calls the checkToken provider for each subscribe only', async () => {
  let calls = 0;
  const { client, sent } = createClient({
    cookie: 'MUSIC_U=listener',
    checkToken: async () => `token-${(calls += 1)}`,
  });

  await client.playlistSubscribe({ id: 1, t: 1 });
  await client.playlistSubscribe({ id: 2, t: 1 });
  await client.playlistSubscribe({ id: 1, t: 0 });

  expect(calls).toBe(2);
  expect(sent).toHaveLength(3);
  expect(sent[0]?.url).toBe('https://music.163.com/weapi/playlist/subscribe');
  expect(sent[1]?.url).toBe('https://music.163.com/weapi/playlist/subscribe');
  expect(sent[0]?.headers.get('x-anticheattoken')).toBe('token-1');
  expect(sent[1]?.headers.get('x-anticheattoken')).toBe('token-2');
  expect(sent[2]?.url).toBe('https://music.163.com/weapi/playlist/unsubscribe');
  expect(sent[2]?.headers.has('x-anticheattoken')).toBe(false);
  expect(sent[2]?.bodyKeys.toSorted()).toEqual(['encSecKey', 'params']);
  const cookie = new Map(
    sent[2]?.cookie.split('; ').map((pair) => {
      const [name = '', value = ''] = pair.split('=');
      return [name, value];
    }),
  );
  expect(cookie.get('os')).toBe('web');
});

test('playlistSubscribe rejects when the checkToken provider fails', async () => {
  const { client, sent } = createClient({
    cookie: 'MUSIC_U=listener',
    checkToken: async () => {
      throw new Error('token unavailable');
    },
  });

  expect(await settle(client.playlistSubscribe({ id: 1, t: 1 }))).toEqual({
    rejected: {
      status: 400,
      body: { code: 400, msg: 'checkToken provider failed' },
      cookie: [],
    },
  });
  expect(sent).toHaveLength(0);
});

test('playlistSubscribe rejects an empty checkToken before sending', async () => {
  const { client, sent } = createClient({
    cookie: 'MUSIC_U=listener',
    checkToken: '',
  });

  expect(await settle(client.playlistSubscribe({ id: 1, t: 1 }))).toEqual({
    rejected: {
      status: 400,
      body: { code: 400, msg: 'checkToken must not be empty' },
      cookie: [],
    },
  });
  expect(sent).toHaveLength(0);
});

test.each([
  { name: 'subscribe', recording: subscribed },
  { name: 'unsubscribe', recording: unsubscribed },
])(
  'playlistSubscribe returns the recorded $name success unchanged',
  async ({ recording }) => {
    const { client } = createClient(
      { cookie: 'MUSIC_U=listener' },
      recording.response,
    );

    const result = await client.playlistSubscribe(recording.query);

    expect(result.status).toBe(200);
    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('playlistSubscribe rejects with NetEase own status and message plus retryAfter', async () => {
  const { client } = createClient(
    { cookie: 'MUSIC_U=listener' },
    rejected.response,
  );

  const failure = (await client.playlistSubscribe(rejected.query).then(
    () => undefined,
    (error: unknown) => error,
  )) as NcmApiResponse | undefined;

  expect(failure?.status).toBe(405);
  expect(failure?.body).toEqual({
    ...rejected.response.body,
    retryAfter: 30,
  });
});

test('playlistSubscribe preserves the recorded own-playlist rejection without turning it into a rate limit', async () => {
  const { client, sent } = createClient(
    { cookie: 'MUSIC_U=listener' },
    ownPlaylist.response,
  );

  expect(await settle(client.playlistSubscribe(ownPlaylist.query))).toEqual({
    rejected: {
      status: 401,
      body: ownPlaylist.response.body,
      cookie: [],
    },
  });
  expect(sent).toHaveLength(1);
});

test('playlistSubscribe rejects an HTTP 200 business 405 without replaying the write', async () => {
  const { client, sent } = createClient(
    { cookie: 'MUSIC_U=listener', retry: { retries: 2 } },
    rejectedHttp200.response,
  );

  expect(await settle(client.playlistSubscribe(rejectedHttp200.query))).toEqual(
    {
      rejected: {
        status: 405,
        body: { ...rejectedHttp200.response.body, retryAfter: 30 },
        cookie: [],
      },
    },
  );
  expect(sent).toHaveLength(1);
});
