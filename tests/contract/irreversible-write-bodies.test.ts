import { expect, expectTypeOf, test } from 'bun:test';

import { createHanaMusicApi, RegisterAnonimousBody } from '../../index.ts';
import type { CommentQuery } from '../../src/types/modules.ts';
import type { RawRecording, Recording } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import commentAddRejected from '../fixtures/netease/comment/comment.add-rejected.json';
import digitalAlbumOrderingMissing from '../fixtures/netease/digital-album/digitalAlbum_ordering.missing-params.json';
import registerAnonymousRecording from '../fixtures/netease/login/register_anonimous.default.json';
import sendSongRejected from '../fixtures/netease/msg/send_song.rejected.json';
import sendTextRejected from '../fixtures/netease/msg/send_text.rejected.json';

// issue #102 B49：评论和私信写操作在录制账号上被上游风控拒绝（comment 250、send_* 2201），
// 多次换内容、歌曲和资源类型都没有成功正文，本批不给这些模块声明 Body；
// digitalAlbum_ordering 只录到缺参 HTTP 400 空正文，未实际下单或支付。
// register_anonimous 有成功正文，公开体由上游 JSON 和 Set-Cookie 拼出。
const replay = (upstream: unknown, setCookie: ReadonlyArray<string> = []) => {
  const headers = new Headers();
  for (const cookie of setCookie) {
    headers.append('set-cookie', cookie);
  }
  return createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { headers }),
  });
};

test('register_anonimous returns the recorded account and credential cookie', async () => {
  const recording = registerAnonymousRecording as Recording;
  const expectedBody = recording.context?.expect as Record<string, unknown>;
  const result = await replay(recording.response.body, [
    'MUSIC_A=fresh; Path=/',
  ]).registerAnonimous();

  expect(result.status).toBe(200);
  expect(result.body as unknown).toEqual({
    ...expectedBody,
    cookie: 'MUSIC_A=fresh; Path=/',
  });

  const expected = validateSync(RegisterAnonimousBody, expectedBody);
  expect(expected.issues).toBeUndefined();
  expect(expected.value).toEqual(expectedBody);

  const published = validateSync(RegisterAnonimousBody, result.body);
  expect(published.issues).toBeUndefined();
  expect(published.value).toEqual(result.body);
});

test('register_anonimous body types the tightened account id and loose registration time', () => {
  expectTypeOf<RegisterAnonimousBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<RegisterAnonimousBody['userId']>().toEqualTypeOf<number>();
  expectTypeOf<RegisterAnonimousBody['cookie']>().toEqualTypeOf<string>();
  expectTypeOf<RegisterAnonimousBody['createTime']>().toEqualTypeOf<
    number | null | undefined
  >();
});

test('register_anonimous rejects a body without a return code', async () => {
  await expectUpstreamShapeRejection(
    replay({ userId: 10000001 }, ['MUSIC_A=fresh; Path=/']).registerAnonimous(),
    {
      module: 'register_anonimous',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('register_anonimous rejects a body without the new account id', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200 }, ['MUSIC_A=fresh; Path=/']).registerAnonimous(),
    {
      module: 'register_anonimous',
      path: 'body.userId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('register_anonimous rejects a non-numeric account id', async () => {
  const upstream = {
    ...registerAnonymousRecording.response.body,
    userId: '10000001',
  };

  await expectUpstreamShapeRejection(
    replay(upstream, ['MUSIC_A=fresh; Path=/']).registerAnonimous(),
    {
      module: 'register_anonimous',
      path: 'body.userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('register_anonimous rejects a response without the anonymous credential', async () => {
  await expectUpstreamShapeRejection(
    replay(registerAnonymousRecording.response.body).registerAnonimous(),
    {
      module: 'register_anonimous',
      path: 'cookie.MUSIC_A',
      expected: 'nonempty credential',
      actual: 'missing',
    },
  );
});

test('register_anonimous passes an unrecorded code through as a business rejection', async () => {
  const upstream = { code: 400, message: 'registration failed' };

  expect(await settle(replay(upstream).registerAnonimous())).toEqual({
    rejected: { status: 400, cookie: [], body: upstream },
  });
});

test('register_anonimous drops a bad create time and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    registerAnonymousRecording.response.body,
  ) as Record<string, unknown> & { createTime?: unknown };
  upstream.createTime = 'now';
  upstream.future = ['kept'];

  const result = await replay(upstream, [
    'MUSIC_A=fresh; Path=/',
  ]).registerAnonimous();

  const body = result.body as Record<string, unknown>;
  expect(body).not.toHaveProperty('createTime');
  expect(body).toHaveProperty('userId', 10000001);
  expect(body).toHaveProperty('cookie', 'MUSIC_A=fresh; Path=/');
  expect(body).toHaveProperty('future', ['kept']);

  const missing = structuredClone(registerAnonymousRecording.response.body) as {
    createTime?: unknown;
  };
  delete missing.createTime;

  const missingResult = await replay(missing, [
    'MUSIC_A=fresh; Path=/',
  ]).registerAnonimous();

  expect(missingResult.body as unknown).not.toHaveProperty('createTime');
});

test('register_anonimous keeps a null registration time', async () => {
  const upstream = {
    ...registerAnonymousRecording.response.body,
    createTime: null,
  };

  const result = await replay(upstream, [
    'MUSIC_A=fresh; Path=/',
  ]).registerAnonimous();

  expect(result.body as unknown).toHaveProperty('createTime', null);
});

test('register_anonimous rejects a non-object input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json(
        { code: 200, userId: 1 },
        { headers: { 'set-cookie': 'MUSIC_A=fresh; Path=/' } },
      );
    },
  });

  expect(await settle(api.registerAnonimous(null as never))).toMatchObject({
    rejected: { status: 400 },
  });
  expect(await settle(api.registerAnonimous([] as never))).toMatchObject({
    rejected: { status: 400 },
  });
  expect(upstreamCalls).toBe(0);
});

test('comment keeps the 250 risk-control rejection without a body schema', async () => {
  const recording = commentAddRejected as Recording;
  const result = await replay(recording.response.body).comment(
    recording.query as CommentQuery,
  );

  expect(result).toEqual({
    status: 250,
    cookie: [],
    body: commentAddRejected.response.body,
  });
});

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, query: Record<string, unknown>) => Promise<unknown>;
}>([
  {
    name: 'send_text',
    recording: sendTextRejected,
    call: (upstream, query) => replay(upstream).sendText(query),
  },
  {
    name: 'send_song',
    recording: sendSongRejected,
    call: (upstream, query) => replay(upstream).sendSong(query),
  },
])(
  '$name passes the 2201 risk-control rejection through',
  async ({ recording, call }) => {
    expect(
      await settle(call(recording.response.body, recording.query)),
    ).toEqual({
      rejected: { status: 400, cookie: [], body: recording.response.body },
    });
  },
);

test('digitalAlbum_ordering documents the missing-parameter rejection', async () => {
  const recording = digitalAlbumOrderingMissing as RawRecording;
  expect(recording.response).toEqual({ status: 400, body: '' });

  // 400 在 SPECIAL_STATUS_CODES 里，SDK 公开状态仍是 200，正文保持上游的空字符串；
  // 这里只用本地 fetcher 回放缺参返回，没有实际下单或支付。
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () =>
      new Response('', { status: recording.response.status }),
  });

  expect(await api.digitalAlbumOrdering({})).toEqual({
    status: 200,
    cookie: [],
    body: '',
  });
});
