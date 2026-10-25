import { expect, expectTypeOf, test } from 'bun:test';

import {
  CommentDjBody,
  CommentEventBody,
  CommentFloorBody,
  CommentHotBody,
  CommentHugListBody,
  CommentNewBody,
  createHanaMusicApi,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import commentDjDefault from '../fixtures/netease/comment/comment_dj.default.json';
import commentDjEmpty from '../fixtures/netease/comment/comment_dj.empty.json';
import commentDjOutOfRange from '../fixtures/netease/comment/comment_dj.out-of-range.json';
import commentEventDefault from '../fixtures/netease/comment/comment_event.default.json';
import commentEventEmpty from '../fixtures/netease/comment/comment_event.empty.json';
import commentEventOutOfRange from '../fixtures/netease/comment/comment_event.out-of-range.json';
import commentFloorDefault from '../fixtures/netease/comment/comment_floor.default.json';
import commentFloorEmpty from '../fixtures/netease/comment/comment_floor.empty.json';
import commentHotDefault from '../fixtures/netease/comment/comment_hot.default.json';
import commentHotEmpty from '../fixtures/netease/comment/comment_hot.empty.json';
import commentHugListDefault from '../fixtures/netease/comment/comment_hug_list.default.json';
import commentHugListEmpty from '../fixtures/netease/comment/comment_hug_list.empty.json';
import commentNewDefault from '../fixtures/netease/comment/comment_new.default.json';
import commentNewEmpty from '../fixtures/netease/comment/comment_new.empty.json';

// issue #102 B8 的录制。六个模块都用登录 Cookie 做过登录对照：先确认 login_status 的
// account.anonimousUser 为 false；只抽查了本批匿名录制中非 null 的路径与类型，登录录制
// 未保留，不对公开结构作相同性断言。
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
  ) => Promise<{ status: number; body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'comment_dj',
    recording: commentDjDefault,
    bodySchema: CommentDjBody,
    call: (upstream, status) =>
      replay(upstream, status).commentDj(commentDjDefault.query),
  },
  {
    name: 'comment_dj without comments',
    recording: commentDjEmpty,
    bodySchema: CommentDjBody,
    call: (upstream, status) =>
      replay(upstream, status).commentDj(commentDjEmpty.query),
  },
  {
    name: 'comment_dj with an offset past its comments',
    recording: commentDjOutOfRange,
    bodySchema: CommentDjBody,
    call: (upstream, status) =>
      replay(upstream, status).commentDj(commentDjOutOfRange.query),
  },
  {
    name: 'comment_event',
    recording: commentEventDefault,
    bodySchema: CommentEventBody,
    call: (upstream, status) =>
      replay(upstream, status).commentEvent(commentEventDefault.query),
  },
  {
    name: 'comment_event without comments',
    recording: commentEventEmpty,
    bodySchema: CommentEventBody,
    call: (upstream, status) =>
      replay(upstream, status).commentEvent(commentEventEmpty.query),
  },
  {
    name: 'comment_event with an offset past its comments',
    recording: commentEventOutOfRange,
    bodySchema: CommentEventBody,
    call: (upstream, status) =>
      replay(upstream, status).commentEvent(commentEventOutOfRange.query),
  },
  {
    name: 'comment_floor',
    recording: commentFloorDefault,
    bodySchema: CommentFloorBody,
    call: (upstream, status) =>
      replay(upstream, status).commentFloor(commentFloorDefault.query),
  },
  {
    name: 'comment_floor without floor comments',
    recording: commentFloorEmpty,
    bodySchema: CommentFloorBody,
    call: (upstream, status) =>
      replay(upstream, status).commentFloor(commentFloorEmpty.query),
  },
  {
    name: 'comment_hot',
    recording: commentHotDefault,
    bodySchema: CommentHotBody,
    call: (upstream, status) =>
      replay(upstream, status).commentHot(commentHotDefault.query),
  },
  {
    name: 'comment_hot without hot comments',
    recording: commentHotEmpty,
    bodySchema: CommentHotBody,
    call: (upstream, status) =>
      replay(upstream, status).commentHot(commentHotEmpty.query),
  },
  {
    name: 'comment_hug_list',
    recording: commentHugListDefault,
    bodySchema: CommentHugListBody,
    call: (upstream, status) =>
      replay(upstream, status).commentHugList(commentHugListDefault.query),
  },
  {
    name: 'comment_hug_list without hugs',
    recording: commentHugListEmpty,
    bodySchema: CommentHugListBody,
    call: (upstream, status) =>
      replay(upstream, status).commentHugList(commentHugListEmpty.query),
  },
  {
    name: 'comment_new',
    recording: commentNewDefault,
    bodySchema: CommentNewBody,
    call: (upstream, status) =>
      replay(upstream, status).commentNew(commentNewDefault.query),
  },
  {
    name: 'comment_new without comments',
    recording: commentNewEmpty,
    bodySchema: CommentNewBody,
    call: (upstream, status) =>
      replay(upstream, status).commentNew(commentNewEmpty.query),
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

test('comment extension bodies type tightened ids and loose fields', () => {
  expectTypeOf<
    CommentDjBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    CommentEventBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    CommentHotBody['hotComments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    CommentFloorBody['data']['comments'][number]['commentId']
  >().toEqualTypeOf<number>();

  expectTypeOf<CommentDjBody['comments']>().toEqualTypeOf<
    ReadonlyArray<CommentDjBody['comments'][number]>
  >();
  expectTypeOf<CommentDjBody['hotComments']>().toEqualTypeOf<
    ReadonlyArray<CommentDjBody['comments'][number]> | null | undefined
  >();
  expectTypeOf<CommentHotBody['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    NonNullable<CommentFloorBody['data']['ownerComment']>['commentId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<CommentHugListBody['data']['hugComments']>().toEqualTypeOf<
    ReadonlyArray<CommentHugListBody['data']['hugComments'][number]>
  >();
  expectTypeOf<
    CommentHugListBody['data']['hugComments'][number]['hugContent']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    NonNullable<CommentHugListBody['data']['currentComment']>['threadId']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    CommentNewBody['data']['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<
      CommentNewBody['data']['comments'][number]['user']
    >['encryptUserId']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    NonNullable<CommentNewBody['data']['comments'][number]['user']>['isHug']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<
    CommentNewBody['data']['comments'][number]['args']
  >().toEqualTypeOf<string | null | undefined>();
});

test('comment_dj rejects a body without comments', async () => {
  const upstream = structuredClone(commentDjDefault.response.body) as {
    comments?: unknown;
  };
  delete upstream.comments;

  await expectUpstreamShapeRejection(
    replay(upstream).commentDj(commentDjDefault.query),
    {
      module: 'comment_dj',
      path: 'body.comments',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_dj rejects a comments list that is not an array', async () => {
  const upstream = structuredClone(commentDjDefault.response.body) as {
    comments: unknown;
  };
  upstream.comments = null;

  await expectUpstreamShapeRejection(
    replay(upstream).commentDj(commentDjDefault.query),
    {
      module: 'comment_dj',
      path: 'body.comments',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('comment_event rejects a comment whose commentId is missing', async () => {
  const upstream = structuredClone(commentEventDefault.response.body);
  delete (upstream.comments[0] as { commentId?: unknown }).commentId;

  await expectUpstreamShapeRejection(
    replay(upstream).commentEvent(commentEventDefault.query),
    {
      module: 'comment_event',
      path: 'body.comments[0].commentId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_hot rejects a hot comment whose commentId is text', async () => {
  const upstream = structuredClone(commentHotDefault.response.body);
  (upstream.hotComments[0] as { commentId: unknown }).commentId = '7431461934';

  await expectUpstreamShapeRejection(
    replay(upstream).commentHot(commentHotDefault.query),
    {
      module: 'comment_hot',
      path: 'body.hotComments[0].commentId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('comment_floor rejects a floor comment that is not an object', async () => {
  const upstream = structuredClone(commentFloorDefault.response.body);
  (upstream.data.comments as Array<unknown>)[0] = null;

  await expectUpstreamShapeRejection(
    replay(upstream).commentFloor(commentFloorDefault.query),
    {
      module: 'comment_floor',
      path: 'body.data.comments[0]',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('comment_hug_list rejects a body without the hug list', async () => {
  const upstream = structuredClone(commentHugListDefault.response.body) as {
    data?: { hugComments?: unknown };
  };
  if (upstream.data) {
    delete upstream.data.hugComments;
  }

  await expectUpstreamShapeRejection(
    replay(upstream).commentHugList(commentHugListDefault.query),
    {
      module: 'comment_hug_list',
      path: 'body.data.hugComments',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_new rejects a comment whose commentId is text', async () => {
  const upstream = structuredClone(commentNewDefault.response.body);
  (upstream.data.comments[0] as { commentId: unknown }).commentId =
    '7431461934';

  await expectUpstreamShapeRejection(
    replay(upstream).commentNew(commentNewDefault.query),
    {
      module: 'comment_new',
      path: 'body.data.comments[0].commentId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('comment_new rejects a body without the comment list', async () => {
  const upstream = structuredClone(commentNewDefault.response.body) as {
    data?: { comments?: unknown };
  };
  if (upstream.data) {
    delete upstream.data.comments;
  }

  await expectUpstreamShapeRejection(
    replay(upstream).commentNew(commentNewDefault.query),
    {
      module: 'comment_new',
      path: 'body.data.comments',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_dj keeps a null hot list and rejects a bad record in it', async () => {
  const nullable = structuredClone(commentDjDefault.response.body) as {
    hotComments: unknown;
  };
  nullable.hotComments = null;

  const nullResult = await replay(nullable).commentDj(commentDjDefault.query);
  expect(nullResult.body.hotComments as unknown).toBeNull();

  const broken = structuredClone(commentDjDefault.response.body);
  broken.hotComments = [
    { commentId: '7431461934' },
  ] as unknown as typeof broken.hotComments;

  await expectUpstreamShapeRejection(
    replay(broken).commentDj(commentDjDefault.query),
    {
      module: 'comment_dj',
      path: 'body.hotComments[0].commentId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('comment_event keeps a null hot list and rejects a bad record in it', async () => {
  const nullable = structuredClone(commentEventDefault.response.body) as {
    hotComments: unknown;
  };
  nullable.hotComments = null;

  const nullResult = await replay(nullable).commentEvent(
    commentEventDefault.query,
  );
  expect(nullResult.body.hotComments as unknown).toBeNull();

  const broken = structuredClone(commentEventDefault.response.body);
  broken.hotComments = [
    { commentId: '7431461934' },
  ] as unknown as typeof broken.hotComments;

  await expectUpstreamShapeRejection(
    replay(broken).commentEvent(commentEventDefault.query),
    {
      module: 'comment_event',
      path: 'body.hotComments[0].commentId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('comment_dj returns the out-of-range recording without hotComments', async () => {
  const result = await replay(
    commentDjOutOfRange.response.body,
    commentDjOutOfRange.response.status,
  ).commentDj(commentDjOutOfRange.query);

  expect(result.status).toBe(200);
  expect(result.body.comments).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('hotComments');
  expect(result.body.total).toBe(8);
});

test('comment_event returns the out-of-range recording without hotComments', async () => {
  const result = await replay(
    commentEventOutOfRange.response.body,
    commentEventOutOfRange.response.status,
  ).commentEvent(commentEventOutOfRange.query);

  expect(result.status).toBe(200);
  expect(result.body.comments).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('hotComments');
  expect(result.body.total).toBe(2);
});

test('comment_dj drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(commentDjDefault.response.body) as {
    cnum?: unknown;
    isMusician?: unknown;
    total: unknown;
    comments: Array<Record<string, unknown>>;
  };
  delete upstream.cnum;
  delete upstream.isMusician;
  upstream.total = '8';
  (upstream as Record<string, unknown>).commentBanner = { title: '置顶' };
  (upstream as Record<string, unknown>).unknownField = [{ id: 1 }];
  upstream.comments[0]!.likedCount = '0';
  upstream.comments[0]!.ipLocation = 'none';

  const result = await replay(upstream).commentDj(commentDjDefault.query);

  expect(result.body as unknown).not.toHaveProperty('cnum');
  expect(result.body as unknown).not.toHaveProperty('isMusician');
  expect(result.body as unknown).not.toHaveProperty('total');
  expect(result.body as unknown).toHaveProperty('commentBanner', {
    title: '置顶',
  });
  expect(result.body as unknown).toHaveProperty('unknownField', [{ id: 1 }]);
  expect(result.body.comments[0]).toHaveProperty('commentId');
  expect(result.body.comments[0] as unknown).not.toHaveProperty('likedCount');
  expect(result.body.comments[0] as unknown).not.toHaveProperty('ipLocation');
});

test('comment_event drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(commentEventDefault.response.body) as {
    cnum: unknown;
    isMusician: unknown;
    more?: unknown;
    comments: Array<Record<string, unknown>>;
  };
  upstream.cnum = '0';
  upstream.isMusician = 0;
  delete upstream.more;
  (upstream as Record<string, unknown>).extra = { kept: true };

  const result = await replay(upstream).commentEvent(commentEventDefault.query);

  expect(result.body as unknown).not.toHaveProperty('cnum');
  expect(result.body as unknown).not.toHaveProperty('isMusician');
  expect(result.body as unknown).not.toHaveProperty('more');
  expect(result.body as unknown).toHaveProperty('extra', { kept: true });
  expect(result.body.comments).toHaveLength(2);
});

test('comment_hot drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(commentHotDefault.response.body) as {
    hasMore: unknown;
    total: unknown;
    hotComments: Array<Record<string, unknown>>;
  };
  delete upstream.hasMore;
  upstream.total = '77';
  (upstream as Record<string, unknown>).banner = { text: '热评' };
  upstream.hotComments[0]!.likedCount = '695';
  upstream.hotComments[0]!.user = 'none';

  const result = await replay(upstream).commentHot(commentHotDefault.query);

  expect(result.body as unknown).not.toHaveProperty('hasMore');
  expect(result.body as unknown).not.toHaveProperty('total');
  expect(result.body as unknown).toHaveProperty('banner', { text: '热评' });
  expect(result.body.hotComments[0]).toHaveProperty('commentId');
  expect(result.body.hotComments[0] as unknown).not.toHaveProperty(
    'likedCount',
  );
  expect(result.body.hotComments[0] as unknown).not.toHaveProperty('user');
  expect(result.body.hotComments).toHaveLength(6);
});

test('comment_floor drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(commentFloorDefault.response.body) as {
    message: unknown;
    data: {
      hasMore: unknown;
      totalCount: unknown;
      ownerComment: Record<string, unknown>;
      extra?: unknown;
    };
  };
  upstream.message = 200;
  upstream.data.hasMore = 'false';
  upstream.data.totalCount = '49';
  upstream.data.ownerComment.commentId = '9673055460';
  upstream.data.extra = { kept: true };

  const result = await replay(upstream).commentFloor(commentFloorDefault.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body.data as unknown).not.toHaveProperty('hasMore');
  expect(result.body.data as unknown).not.toHaveProperty('totalCount');
  expect(result.body.data as unknown).toHaveProperty('extra', { kept: true });
  expect(result.body.data.ownerComment).toBeDefined();
  expect(result.body.data.ownerComment as unknown).not.toHaveProperty(
    'commentId',
  );
  expect(result.body.data.comments).toHaveLength(6);
});

test('comment_floor returns a floor without replies and keeps the owner comment', async () => {
  const result = await replay(
    commentFloorEmpty.response.body,
    commentFloorEmpty.response.status,
  ).commentFloor(commentFloorEmpty.query);

  expect(result.status).toBe(200);
  expect(result.body.data.comments).toEqual([]);
  expect(result.body.data.ownerComment?.commentId).toBe(9673055460);
  expect(result.body.data.totalCount).toBe(0);
  expect(result.body.data.hasMore).toBe(false);
});

test('comment_hug_list drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(commentHugListDefault.response.body) as {
    message: unknown;
    data: {
      cursor: unknown;
      idCursor: unknown;
      currentComment: Record<string, unknown>;
      hugComments: Array<Record<string, unknown>>;
      extra?: unknown;
    };
  };
  upstream.message = 200;
  upstream.data.cursor = null;
  upstream.data.idCursor = 'not-a-number';
  upstream.data.currentComment.commentId = '7431461934';
  upstream.data.hugComments[0]!.hugContent = 123;
  upstream.data.extra = { kept: true };

  const result = await replay(upstream).commentHugList(
    commentHugListDefault.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body.data.cursor as unknown).toBeNull();
  expect(result.body.data as unknown).not.toHaveProperty('idCursor');
  expect(result.body.data as unknown).toHaveProperty('extra', { kept: true });
  expect(result.body.data.currentComment).toBeDefined();
  expect(result.body.data.currentComment as unknown).not.toHaveProperty(
    'commentId',
  );
  expect(result.body.data.hugComments[0] as unknown).not.toHaveProperty(
    'hugContent',
  );
  expect(result.body.data.hugComments[0]!.user).toBeDefined();
});

test('comment_hug_list keeps an undeclared ext_dislike field', async () => {
  const upstream = structuredClone(commentHugListDefault.response.body) as {
    data: {
      currentComment: {
        extInfo?: { statistics?: Record<string, unknown> };
      };
    };
  };
  const statistics = upstream.data.currentComment.extInfo?.statistics;
  if (!statistics) {
    throw new Error('expected recorded statistics');
  }
  statistics.ext_dislike = '7';

  const result = await replay(upstream).commentHugList(
    commentHugListDefault.query,
  );
  const replayed = result.body.data.currentComment as
    | { extInfo?: { statistics?: Record<string, unknown> } }
    | null
    | undefined;

  expect(replayed?.extInfo?.statistics?.ext_dislike).toBe('7');
});

test('comment_hug_list returns a zero hug recording and keeps the current comment', async () => {
  const result = await replay(
    commentHugListEmpty.response.body,
    commentHugListEmpty.response.status,
  ).commentHugList(commentHugListEmpty.query);

  expect(result.status).toBe(200);
  expect(result.body.data.hugComments).toEqual([]);
  expect(result.body.data.hugTotalCounts).toBe(0);
  expect(result.body.data.currentComment?.commentId).toBe(9673055460);
});

test('comment_new drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(commentNewDefault.response.body) as {
    message: unknown;
    data: {
      commentsTitle: unknown;
      sortTypeList: unknown;
      comments: Array<Record<string, unknown>>;
      extra?: unknown;
    };
  };
  upstream.message = 200;
  upstream.data.commentsTitle = 123;
  upstream.data.sortTypeList = 'none';
  upstream.data.extra = { kept: true };
  const comment = upstream.data.comments[0]!;
  comment.replyCount = '49';
  comment.track = 42;
  const user = comment.user as Record<string, unknown>;
  user.encryptUserId = 123;

  const result = await replay(upstream).commentNew(commentNewDefault.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body.data as unknown).not.toHaveProperty('commentsTitle');
  expect(result.body.data as unknown).not.toHaveProperty('sortTypeList');
  expect(result.body.data as unknown).toHaveProperty('extra', { kept: true });
  expect(result.body.data.comments[0]).toHaveProperty('commentId');
  expect(result.body.data.comments[0] as unknown).not.toHaveProperty(
    'replyCount',
  );
  expect(result.body.data.comments[0] as unknown).not.toHaveProperty('track');
  expect(result.body.data.comments[0]!.user).toBeDefined();
  expect(result.body.data.comments[0]!.user as unknown).not.toHaveProperty(
    'encryptUserId',
  );
});

test('comment_new returns an empty comment list unchanged', async () => {
  const result = await replay(
    commentNewEmpty.response.body,
    commentNewEmpty.response.status,
  ).commentNew(commentNewEmpty.query);

  expect(result.status).toBe(200);
  expect(result.body.data.comments).toEqual([]);
  expect(result.body.data.totalCount).toBe(0);
  expect(result.body.data.hasMore).toBe(false);
  expect(result.body.data.style).toBe('DEFAULT');
});

test('comment_hug_list rejects a non-primitive sid before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json(commentHugListDefault.response.body);
    },
  });

  expect(
    await settle(
      api.commentHugList({
        ...commentHugListDefault.query,
        sid: { id: 2092595510 },
      }),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'sid must be a primitive value' },
    },
  });
  expect(upstreamCalls).toBe(0);
});

test('comment_dj passes an upstream business failure through unchanged', async () => {
  const upstream = structuredClone(commentDjDefault.response.body) as {
    code: number;
    msg?: string;
  };
  upstream.code = 400;
  upstream.msg = '评论不存在';

  expect(
    await settle(replay(upstream).commentDj(commentDjDefault.query)),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: upstream,
    },
  });
});
