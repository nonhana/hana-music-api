import { expect, test } from 'bun:test';

import type { ModuleCallConfig, NcmApiResponse } from '../../../index.ts';
import { createHanaMusicApi } from '../../../index.ts';
import { settle } from '../../_kit/assertions.ts';
import ownPlaylist from '../../fixtures/netease/playlist_subscribe/own.json';
import rejectedHttp200 from '../../fixtures/netease/playlist_subscribe/rejected-http-200.json';
import rejected from '../../fixtures/netease/playlist_subscribe/rejected.json';
import subscribed from '../../fixtures/netease/playlist_subscribe/subscribe.json';
import unsubscribed from '../../fixtures/netease/playlist_subscribe/unsubscribe.json';

const createClient = (
  config: ModuleCallConfig,
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
  { name: 'subscribe', recording: subscribed },
  { name: 'unsubscribe', recording: unsubscribed },
])(
  'playlistSubscribe returns the recorded $name success unchanged',
  async ({ recording }) => {
    const { client } = createClient(
      { cookie: 'MUSIC_U=listener' },
      recording.response,
    );

    const result = await client.playlistSubscribe({
      id: recording.query.id,
      t: recording.query.t as 0 | 1 | 2,
    });

    expect(result.status).toBe(200);
    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('playlistSubscribe rejects with NetEase own status and message plus retryAfter', async () => {
  const { client } = createClient(
    { cookie: 'MUSIC_U=listener' },
    rejected.response,
  );

  const failure = (await client
    .playlistSubscribe({ id: rejected.query.id, t: 1 })
    .then(
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

  expect(
    await settle(client.playlistSubscribe({ id: ownPlaylist.query.id, t: 1 })),
  ).toEqual({
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

  expect(
    await settle(
      client.playlistSubscribe({ id: rejectedHttp200.query.id, t: 1 }),
    ),
  ).toEqual({
    rejected: {
      status: 405,
      body: { ...rejectedHttp200.response.body, retryAfter: 30 },
      cookie: [],
    },
  });
  expect(sent).toHaveLength(1);
});
