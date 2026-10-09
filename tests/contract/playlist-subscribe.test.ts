import { expect, test } from 'bun:test';

import type { NcmApiResponse } from '../../index.ts';
import { createHanaMusicApi } from '../../index.ts';
import { eapiReqDecrypt } from '../../src/core/crypto.ts';
import rejected from '../fixtures/netease/playlist_subscribe/rejected.json';
import subscribed from '../fixtures/netease/playlist_subscribe/subscribe.json';
import unsubscribed from '../fixtures/netease/playlist_subscribe/unsubscribe.json';

// 2026-10-09 真账号实测：设备身份是 pc（SDK 默认）或带写死的 checkToken 时，收藏一律回 405“操作过于频繁”；
// 换成 iPhone 设备身份、不带 token 后，收藏和取消收藏都成功。
const createClient = (
  cookie: string,
  recorded: { status: number; body: unknown } = {
    status: 200,
    body: { code: 200 },
  },
) => {
  const sent: Array<{
    url: string;
    cookie: string;
    payload: Record<string, unknown>;
  }> = [];
  const client = createHanaMusicApi({
    cookie,
    fetcher: async (input, init) => {
      const body = init?.body;
      if (typeof body !== 'string') {
        throw new TypeError('Expected an encoded API body');
      }
      sent.push({
        url: input instanceof Request ? input.url : input.toString(),
        cookie: new Headers(init?.headers).get('cookie') ?? '',
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
  'playlistSubscribe t=$t sends only the id as an iPhone client without an anti-cheat token',
  async ({ t, path }) => {
    const { client, sent } = createClient('MUSIC_U=listener; os=pc');

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
    expect(header).not.toHaveProperty('X-antiCheatToken');
    expect(request?.cookie).toContain('os=iphone');
    expect(request?.cookie).not.toContain('X-antiCheatToken');
  },
);

test.each([
  { name: 'subscribe', recording: subscribed },
  { name: 'unsubscribe', recording: unsubscribed },
])(
  'playlistSubscribe returns the recorded $name success unchanged',
  async ({ recording }) => {
    const { client } = createClient('MUSIC_U=listener', recording.response);

    const result = await client.playlistSubscribe(recording.query);

    expect(result.status).toBe(200);
    expect(result.body).toEqual(recording.response.body);
  },
);

test('playlistSubscribe rejects with NetEase’s own status and message', async () => {
  const { client } = createClient('MUSIC_U=listener', rejected.response);

  const failure = (await client.playlistSubscribe(rejected.query).then(
    () => undefined,
    (error: unknown) => error,
  )) as NcmApiResponse | undefined;

  expect(failure?.status).toBe(405);
  expect(failure?.body).toEqual(rejected.response.body);
});
