import { expect, test } from 'bun:test';

import type { NcmApiResponse } from '../../index.ts';
import { createHanaMusicApi } from '../../index.ts';
import { eapiReqDecrypt } from '../../src/core/crypto.ts';
import rejected from '../fixtures/netease/playlist_subscribe/rejected.json';
import subscribed from '../fixtures/netease/playlist_subscribe/subscribe.json';
import unsubscribed from '../fixtures/netease/playlist_subscribe/unsubscribe.json';

// 收藏歌单固定以 iPhone 客户端身份发出，调用方传入的 os 和 User-Agent 都会被替换，见 #32、#33。
const createClient = (
  config: { cookie: string; ua?: string },
  recorded: { status: number; body: unknown } = {
    status: 200,
    body: { code: 200 },
  },
) => {
  const sent: Array<{
    url: string;
    cookie: string;
    userAgent: string;
    payload: Record<string, unknown>;
  }> = [];
  const client = createHanaMusicApi({
    ...config,
    fetcher: async (input, init) => {
      const body = init?.body;
      if (typeof body !== 'string') {
        throw new TypeError('Expected an encoded API body');
      }
      sent.push({
        url: input instanceof Request ? input.url : input.toString(),
        cookie: new Headers(init?.headers).get('cookie') ?? '',
        userAgent: new Headers(init?.headers).get('user-agent') ?? '',
        payload:
          eapiReqDecrypt(new URLSearchParams(body).get('params') ?? '')?.data ??
          {},
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
  'playlistSubscribe t=$t sends only the id as an iPhone client, whatever device the caller set',
  async ({ t, path }) => {
    const { client, sent } = createClient({
      cookie: 'MUSIC_U=listener; os=pc; appver=3.1.17.204416',
      ua: 'Mozilla/5.0 (Windows NT 10.0) NeteaseMusicDesktop/3.1.29.205117',
    });

    await client.playlistSubscribe({ id: 2889745179, t });

    expect(sent).toHaveLength(1);
    const [request] = sent;
    expect(request?.url).toBe(
      `https://interface.music.163.com/eapi/playlist/${path}`,
    );
    const { header, ...business } = request?.payload ?? {};
    expect(business).toEqual({ id: 2889745179, e_r: false });
    expect(header).toMatchObject({
      os: 'iphone',
      appver: '9.0.90',
      osver: '16.2',
      channel: 'distribution',
      MUSIC_U: 'listener',
    });
    expect(request?.cookie).toContain('os=iphone');
    expect(request?.userAgent).toBe(
      'NeteaseMusic 9.0.90/5038 (iPhone; iOS 16.2; zh_CN)',
    );
  },
);

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
    expect(result.body).toEqual(recording.response.body);
  },
);

test('playlistSubscribe rejects with NetEase’s own status and message', async () => {
  const { client } = createClient(
    { cookie: 'MUSIC_U=listener' },
    rejected.response,
  );

  const failure = (await client.playlistSubscribe(rejected.query).then(
    () => undefined,
    (error: unknown) => error,
  )) as NcmApiResponse | undefined;

  expect(failure?.status).toBe(405);
  expect(failure?.body).toEqual(rejected.response.body);
});
