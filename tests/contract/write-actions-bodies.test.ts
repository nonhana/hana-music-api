import { expect, expectTypeOf, test } from 'bun:test';

import {
  BroadcastSubBody,
  CommentLikeBody,
  createHanaMusicApi,
  DjSubBody,
  FollowBody,
  MvSubBody,
  ResourceLikeBody,
  VideoSubBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import broadcastSubSubscribeAgain from '../fixtures/netease/like-collect/broadcast_sub.subscribe-again.json';
import broadcastSubSubscribe from '../fixtures/netease/like-collect/broadcast_sub.subscribe.json';
import broadcastSubUnsubscribe from '../fixtures/netease/like-collect/broadcast_sub.unsubscribe.json';
import commentLikeLike from '../fixtures/netease/like-collect/comment_like.like.json';
import commentLikeUnlike from '../fixtures/netease/like-collect/comment_like.unlike.json';
import djSubSubscribeAgain from '../fixtures/netease/like-collect/dj_sub.subscribe-again.json';
import djSubSubscribe from '../fixtures/netease/like-collect/dj_sub.subscribe.json';
import djSubUnsubscribe from '../fixtures/netease/like-collect/dj_sub.unsubscribe.json';
import followRejected from '../fixtures/netease/like-collect/follow.rejected.json';
import followUnfollow from '../fixtures/netease/like-collect/follow.unfollow.json';
import mvSubSubscribeAgain from '../fixtures/netease/like-collect/mv_sub.subscribe-again.json';
import mvSubSubscribe from '../fixtures/netease/like-collect/mv_sub.subscribe.json';
import mvSubUnsubscribe from '../fixtures/netease/like-collect/mv_sub.unsubscribe.json';
import resourceLikeLike from '../fixtures/netease/like-collect/resource_like.like.json';
import resourceLikeUnlike from '../fixtures/netease/like-collect/resource_like.unlike.json';
import videoSubSubscribeAgain from '../fixtures/netease/like-collect/video_sub.subscribe-again.json';
import videoSubSubscribe from '../fixtures/netease/like-collect/video_sub.subscribe.json';
import videoSubUnsubscribe from '../fixtures/netease/like-collect/video_sub.unsubscribe.json';

// issue #102 B45 的可逆写操作录制。mv_sub、video_sub、dj_sub、broadcast_sub 对同一目标先
// 正向再反向，并用 mv_sublist、dj_sublist、broadcast_channel_collect_list 回读核对状态；回读
// 结论记在各录制文件的 context.note。follow、resource_like、comment_like 的正方向（关注/点赞）
// 在录制设备上被上游拒绝（code 250），成功正文只有反向操作的证据，回读只用于确认本次没有改变
// 状态，没有保留独立的状态读出文件；video_sub 重复收藏返回 code 408。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ readonly status: number; readonly body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'follow unfollow',
    recording: followUnfollow,
    bodySchema: FollowBody,
    call: (upstream, status) =>
      replay(upstream, status).follow(followUnfollow.query),
  },
  {
    name: 'mv_sub subscribe',
    recording: mvSubSubscribe,
    bodySchema: MvSubBody,
    call: (upstream, status) =>
      replay(upstream, status).mvSub(mvSubSubscribe.query),
  },
  {
    name: 'mv_sub subscribe again',
    recording: mvSubSubscribeAgain,
    bodySchema: MvSubBody,
    call: (upstream, status) =>
      replay(upstream, status).mvSub(mvSubSubscribeAgain.query),
  },
  {
    name: 'mv_sub unsubscribe',
    recording: mvSubUnsubscribe,
    bodySchema: MvSubBody,
    call: (upstream, status) =>
      replay(upstream, status).mvSub(mvSubUnsubscribe.query),
  },
  {
    name: 'video_sub subscribe',
    recording: videoSubSubscribe,
    bodySchema: VideoSubBody,
    call: (upstream, status) =>
      replay(upstream, status).videoSub(videoSubSubscribe.query),
  },
  {
    name: 'video_sub unsubscribe',
    recording: videoSubUnsubscribe,
    bodySchema: VideoSubBody,
    call: (upstream, status) =>
      replay(upstream, status).videoSub(videoSubUnsubscribe.query),
  },
  {
    name: 'dj_sub subscribe',
    recording: djSubSubscribe,
    bodySchema: DjSubBody,
    call: (upstream, status) =>
      replay(upstream, status).djSub(djSubSubscribe.query),
  },
  {
    name: 'dj_sub subscribe again',
    recording: djSubSubscribeAgain,
    bodySchema: DjSubBody,
    call: (upstream, status) =>
      replay(upstream, status).djSub(djSubSubscribeAgain.query),
  },
  {
    name: 'dj_sub unsubscribe',
    recording: djSubUnsubscribe,
    bodySchema: DjSubBody,
    call: (upstream, status) =>
      replay(upstream, status).djSub(djSubUnsubscribe.query),
  },
  {
    name: 'broadcast_sub subscribe',
    recording: broadcastSubSubscribe,
    bodySchema: BroadcastSubBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastSub(broadcastSubSubscribe.query),
  },
  {
    name: 'broadcast_sub subscribe again',
    recording: broadcastSubSubscribeAgain,
    bodySchema: BroadcastSubBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastSub(broadcastSubSubscribeAgain.query),
  },
  {
    name: 'broadcast_sub unsubscribe',
    recording: broadcastSubUnsubscribe,
    bodySchema: BroadcastSubBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastSub(broadcastSubUnsubscribe.query),
  },
  {
    name: 'resource_like unlike',
    recording: resourceLikeUnlike,
    bodySchema: ResourceLikeBody,
    call: (upstream, status) =>
      replay(upstream, status).resourceLike(resourceLikeUnlike.query),
  },
  {
    name: 'comment_like unlike',
    recording: commentLikeUnlike,
    bodySchema: CommentLikeBody,
    call: (upstream, status) =>
      replay(upstream, status).commentLike({
        ...commentLikeUnlike.query,
        t: 0,
      }),
  },
];

test.each(cases)('$name returns the recorded body', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.status).toBe(entry.recording.response.status);
  expect(result.body).toEqual(entry.recording.response.body);

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'follow',
    recording: followRejected,
    call: (upstream, status) =>
      replay(upstream, status).follow(followRejected.query),
  },
  {
    name: 'video_sub subscribing twice',
    recording: videoSubSubscribeAgain,
    call: (upstream, status) =>
      replay(upstream, status).videoSub(videoSubSubscribeAgain.query),
  },
  {
    name: 'resource_like',
    recording: resourceLikeLike,
    call: (upstream, status) =>
      replay(upstream, status).resourceLike(resourceLikeLike.query),
  },
  {
    name: 'comment_like',
    recording: commentLikeLike,
    call: (upstream, status) =>
      replay(upstream, status).commentLike({
        ...commentLikeLike.query,
        t: 1,
      }),
  },
])('$name passes a rejected code through', async (entry) => {
  expect(
    await settle(
      entry.call(
        entry.recording.response.body,
        entry.recording.response.status,
      ),
    ),
  ).toEqual({
    rejected: {
      status: (entry.recording.response.body as { code: number }).code,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('write action bodies type the tightened code and loose hints', () => {
  expectTypeOf<FollowBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<FollowBody['msg']>().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<MvSubBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<MvSubBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<VideoSubBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<VideoSubBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<DjSubBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<BroadcastSubBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<BroadcastSubBody['data']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<BroadcastSubBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<ResourceLikeBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<CommentLikeBody['code']>().toEqualTypeOf<200>();
});

test('follow rejects a non-primitive id before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(await settle(api.follow({ id: {}, t: 1 }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'id must be a primitive value' },
    },
  });
  expect(upstreamCalls).toBe(0);
});

test('resource_like rejects a non-primitive id before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(await settle(api.resourceLike({ id: [], type: 0, t: 1 }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'id must be a primitive value' },
    },
  });
  expect(upstreamCalls).toBe(0);
});

test('comment_like rejects an invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(await settle(api.commentLike(null as never))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'Expected <Declaration>' },
    },
  });
  const invalidInput = { ...commentLikeUnlike.query, t: 2 as never };
  expect(await settle(api.commentLike(invalidInput))).toMatchObject({
    rejected: { status: 400 },
  });
  expect(upstreamCalls).toBe(0);
});

test.each<{
  name: string;
  module: string;
  recording: Recording;
  call: (upstream: unknown) => Promise<unknown>;
}>([
  {
    name: 'follow',
    module: 'follow',
    recording: followUnfollow,
    call: (upstream) => replay(upstream).follow(followUnfollow.query),
  },
  {
    name: 'mv_sub',
    module: 'mv_sub',
    recording: mvSubUnsubscribe,
    call: (upstream) => replay(upstream).mvSub(mvSubUnsubscribe.query),
  },
  {
    name: 'video_sub',
    module: 'video_sub',
    recording: videoSubUnsubscribe,
    call: (upstream) => replay(upstream).videoSub(videoSubUnsubscribe.query),
  },
  {
    name: 'dj_sub',
    module: 'dj_sub',
    recording: djSubSubscribe,
    call: (upstream) => replay(upstream).djSub(djSubSubscribe.query),
  },
  {
    name: 'broadcast_sub',
    module: 'broadcast_sub',
    recording: broadcastSubUnsubscribe,
    call: (upstream) =>
      replay(upstream).broadcastSub(broadcastSubUnsubscribe.query),
  },
  {
    name: 'resource_like',
    module: 'resource_like',
    recording: resourceLikeUnlike,
    call: (upstream) => replay(upstream).resourceLike(resourceLikeUnlike.query),
  },
  {
    name: 'comment_like',
    module: 'comment_like',
    recording: commentLikeUnlike,
    call: (upstream) =>
      replay(upstream).commentLike({ ...commentLikeUnlike.query, t: 0 }),
  },
])('$name rejects a body without a return code', async (entry) => {
  const upstream = structuredClone(entry.recording.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(entry.call(upstream), {
    module: entry.module,
    path: 'body.code',
    expected: 'present',
    actual: 'missing',
  });
});

test('mv_sub drops bad loose hints and keeps undeclared fields', async () => {
  const upstream = structuredClone(mvSubSubscribe.response.body) as {
    message?: unknown;
    data?: unknown;
    extra?: unknown;
  };
  upstream.message = 42;
  upstream.data = null;
  upstream.extra = { reason: 'duplicate' };

  const result = await replay(upstream).mvSub(mvSubSubscribe.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('data', null);
  expect(result.body as unknown).toHaveProperty('extra', {
    reason: 'duplicate',
  });

  const missing = structuredClone(mvSubSubscribe.response.body) as {
    message?: unknown;
    data?: unknown;
  };
  delete missing.message;
  delete missing.data;

  const missingResult = await replay(missing).mvSub(mvSubSubscribe.query);

  expect(missingResult.body as unknown).not.toHaveProperty('message');
  expect(missingResult.body as unknown).not.toHaveProperty('data');
});

test('follow drops a bad loose hint and keeps undeclared fields', async () => {
  const upstream = structuredClone(followUnfollow.response.body) as {
    msg?: unknown;
    dialog?: unknown;
  };
  upstream.msg = 123;
  upstream.dialog = { title: '风险提示' };

  const result = await replay(upstream).follow(followUnfollow.query);

  expect(result.body as unknown).not.toHaveProperty('msg');
  expect(result.body as unknown).toHaveProperty('dialog', {
    title: '风险提示',
  });

  const missing = structuredClone(followUnfollow.response.body) as {
    msg?: unknown;
  };
  delete missing.msg;

  const missingResult = await replay(missing).follow(followUnfollow.query);

  expect(missingResult.body as unknown).not.toHaveProperty('msg');
});

test('broadcast_sub drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(broadcastSubSubscribe.response.body) as {
    data?: unknown;
    message?: unknown;
    interactId?: unknown;
  };
  upstream.data = 'yes';
  upstream.message = null;
  upstream.interactId = 7390120232;

  const result = await replay(upstream).broadcastSub(
    broadcastSubSubscribe.query,
  );

  expect(result.body as unknown).not.toHaveProperty('data');
  expect(result.body as unknown).toHaveProperty('message', null);
  expect(result.body as unknown).toHaveProperty('interactId', 7390120232);

  const missing = structuredClone(broadcastSubSubscribe.response.body) as {
    data?: unknown;
    message?: unknown;
  };
  delete missing.data;
  delete missing.message;

  const missingResult = await replay(missing).broadcastSub(
    broadcastSubSubscribe.query,
  );

  expect(missingResult.body as unknown).not.toHaveProperty('data');
  expect(missingResult.body as unknown).not.toHaveProperty('message');
});

test('video_sub drops a bad loose hint and keeps undeclared fields', async () => {
  const upstream = structuredClone(videoSubSubscribe.response.body) as {
    message?: unknown;
    debugInfo?: unknown;
  };
  upstream.message = 42;
  upstream.debugInfo = { reason: 'already-collected' };

  const result = await replay(upstream).videoSub(videoSubSubscribe.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('debugInfo', {
    reason: 'already-collected',
  });
});

test('resource_like keeps undeclared fields', async () => {
  const upstream = structuredClone(resourceLikeUnlike.response.body) as Record<
    string,
    unknown
  >;
  upstream.threadId = 'R_SO_4_2092595510';

  const result = await replay(upstream).resourceLike(resourceLikeUnlike.query);

  expect(result.body as unknown).toHaveProperty(
    'threadId',
    'R_SO_4_2092595510',
  );
});
