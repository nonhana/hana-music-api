import { expect, expectTypeOf, test } from 'bun:test';

import {
  CommentAlbumBody,
  CommentMusicBody,
  CommentMvBody,
  CommentPlaylistBody,
  CommentVideoBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import commentAlbumDefault from '../fixtures/netease/comment/comment_album.default.json';
import commentAlbumEmpty from '../fixtures/netease/comment/comment_album.empty.json';
import commentAlbumOutOfRange from '../fixtures/netease/comment/comment_album.out-of-range.json';
import commentMusicDefault from '../fixtures/netease/comment/comment_music.default.json';
import commentMusicEmpty from '../fixtures/netease/comment/comment_music.empty.json';
import commentMusicOutOfRange from '../fixtures/netease/comment/comment_music.out-of-range.json';
import commentMvDefault from '../fixtures/netease/comment/comment_mv.default.json';
import commentMvOutOfRange from '../fixtures/netease/comment/comment_mv.out-of-range.json';
import commentPlaylistDefault from '../fixtures/netease/comment/comment_playlist.default.json';
import commentPlaylistEmpty from '../fixtures/netease/comment/comment_playlist.empty.json';
import commentPlaylistOutOfRange from '../fixtures/netease/comment/comment_playlist.out-of-range.json';
import commentVideoDefault from '../fixtures/netease/comment/comment_video.default.json';
import commentVideoOutOfRange from '../fixtures/netease/comment/comment_video.out-of-range.json';

// issue #102 B7 的匿名录制；登录对照里非 null 路径与类型相同，登录响应只会在宽松字段上多出现 null，登录录制未保留。
type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'comment_music',
    recording: commentMusicDefault,
    bodySchema: CommentMusicBody,
    call: (upstream, status) =>
      replay(upstream, status).commentMusic(commentMusicDefault.query),
  },
  {
    name: 'comment_music without comments',
    recording: commentMusicEmpty,
    bodySchema: CommentMusicBody,
    call: (upstream, status) =>
      replay(upstream, status).commentMusic(commentMusicEmpty.query),
  },
  {
    name: 'comment_music with an offset past its comments',
    recording: commentMusicOutOfRange,
    bodySchema: CommentMusicBody,
    call: (upstream, status) =>
      replay(upstream, status).commentMusic(commentMusicOutOfRange.query),
  },
  {
    name: 'comment_album',
    recording: commentAlbumDefault,
    bodySchema: CommentAlbumBody,
    call: (upstream, status) =>
      replay(upstream, status).commentAlbum(commentAlbumDefault.query),
  },
  {
    name: 'comment_album without comments',
    recording: commentAlbumEmpty,
    bodySchema: CommentAlbumBody,
    call: (upstream, status) =>
      replay(upstream, status).commentAlbum(commentAlbumEmpty.query),
  },
  {
    name: 'comment_album with an offset past its comments',
    recording: commentAlbumOutOfRange,
    bodySchema: CommentAlbumBody,
    call: (upstream, status) =>
      replay(upstream, status).commentAlbum(commentAlbumOutOfRange.query),
  },
  {
    name: 'comment_playlist',
    recording: commentPlaylistDefault,
    bodySchema: CommentPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).commentPlaylist(commentPlaylistDefault.query),
  },
  {
    name: 'comment_playlist without comments',
    recording: commentPlaylistEmpty,
    bodySchema: CommentPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).commentPlaylist(commentPlaylistEmpty.query),
  },
  {
    name: 'comment_playlist with an offset past its comments',
    recording: commentPlaylistOutOfRange,
    bodySchema: CommentPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).commentPlaylist(commentPlaylistOutOfRange.query),
  },
  {
    name: 'comment_mv',
    recording: commentMvDefault,
    bodySchema: CommentMvBody,
    call: (upstream, status) =>
      replay(upstream, status).commentMv(commentMvDefault.query),
  },
  {
    name: 'comment_mv with an offset past its comments',
    recording: commentMvOutOfRange,
    bodySchema: CommentMvBody,
    call: (upstream, status) =>
      replay(upstream, status).commentMv(commentMvOutOfRange.query),
  },
  {
    name: 'comment_video',
    recording: commentVideoDefault,
    bodySchema: CommentVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).commentVideo(commentVideoDefault.query),
  },
  {
    name: 'comment_video with an offset past its comments',
    recording: commentVideoOutOfRange,
    bodySchema: CommentVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).commentVideo(commentVideoOutOfRange.query),
  },
];

test.each(cases)('$name returns the recorded body', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.body).toEqual(entry.recording.response.body);

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

test('comment bodies type their tightened comment ids and loose fields', () => {
  expectTypeOf<
    CommentMusicBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    CommentAlbumBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    CommentPlaylistBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    CommentMvBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    CommentVideoBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();

  type MusicComment = CommentMusicBody['comments'][number];
  type MusicUser = NonNullable<MusicComment['user']>;
  type MusicHotComments = NonNullable<CommentMusicBody['hotComments']>;

  expectTypeOf<CommentMusicBody['comments']>().toEqualTypeOf<
    ReadonlyArray<MusicComment>
  >();
  expectTypeOf<CommentMusicBody['hotComments']>().toEqualTypeOf<
    ReadonlyArray<MusicHotComments[number]> | null | undefined
  >();
  expectTypeOf<CommentMusicBody['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<MusicComment['content']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<MusicComment['likedCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<MusicUser['nickname']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<MusicUser['vipRights']>().toExtend<
    { readonly redVipLevel?: number | null } | null | undefined
  >();
});

test('comment_music rejects a body without comments', async () => {
  const upstream = structuredClone(commentMusicDefault.response.body) as {
    comments?: unknown;
  };
  delete upstream.comments;

  await expectUpstreamShapeRejection(
    replay(upstream).commentMusic(commentMusicDefault.query),
    {
      module: 'comment_music',
      path: 'body.comments',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_music rejects a comments list that is not an array', async () => {
  const upstream = structuredClone(commentMusicDefault.response.body) as {
    comments: unknown;
  };
  upstream.comments = null;

  await expectUpstreamShapeRejection(
    replay(upstream).commentMusic(commentMusicDefault.query),
    {
      module: 'comment_music',
      path: 'body.comments',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('comment_music rejects a comment whose commentId is text', async () => {
  const upstream = structuredClone(commentMusicDefault.response.body);
  (upstream.comments[0] as { commentId: unknown }).commentId = '9673055460';

  await expectUpstreamShapeRejection(
    replay(upstream).commentMusic(commentMusicDefault.query),
    {
      module: 'comment_music',
      path: 'body.comments[0].commentId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('comment_album rejects a comment without a commentId', async () => {
  const upstream = structuredClone(commentAlbumDefault.response.body);
  delete (upstream.comments[0] as { commentId?: unknown }).commentId;

  await expectUpstreamShapeRejection(
    replay(upstream).commentAlbum(commentAlbumDefault.query),
    {
      module: 'comment_album',
      path: 'body.comments[0].commentId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_playlist rejects a body without a return code', async () => {
  const upstream = structuredClone(commentPlaylistDefault.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).commentPlaylist(commentPlaylistDefault.query),
    {
      module: 'comment_playlist',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_mv rejects a comment that is not an object', async () => {
  const upstream = structuredClone(commentMvDefault.response.body);
  (upstream.comments as Array<unknown>)[0] = null;

  await expectUpstreamShapeRejection(
    replay(upstream).commentMv(commentMvDefault.query),
    {
      module: 'comment_mv',
      path: 'body.comments[0]',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('comment_video rejects a hot comment without a commentId', async () => {
  const upstream = structuredClone(commentVideoDefault.response.body);
  const hotComment = upstream.hotComments?.[0] as
    | { commentId?: unknown }
    | undefined;
  if (!hotComment) {
    throw new Error('expected a recorded hot comment');
  }
  delete hotComment.commentId;

  await expectUpstreamShapeRejection(
    replay(upstream).commentVideo(commentVideoDefault.query),
    {
      module: 'comment_video',
      path: 'body.hotComments[0].commentId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('comment_music drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(commentMusicDefault.response.body) as {
    cnum?: unknown;
    isMusician?: unknown;
    more: unknown;
    total: unknown;
    userId?: unknown;
    commentBanner?: unknown;
    topComments?: unknown;
    comments: Array<Record<string, unknown>>;
  };
  delete upstream.cnum;
  delete upstream.userId;
  upstream.isMusician = 0;
  upstream.more = null;
  upstream.total = '2165';
  upstream.commentBanner = { title: '置顶' };
  upstream.topComments = [{ commentId: 1 }];

  const result = await replay(upstream).commentMusic(commentMusicDefault.query);

  expect(result.body as unknown).not.toHaveProperty('cnum');
  expect(result.body as unknown).not.toHaveProperty('userId');
  expect(result.body as unknown).not.toHaveProperty('isMusician');
  expect(result.body as unknown).not.toHaveProperty('total');
  expect(result.body.more as unknown).toBeNull();
  expect(result.body as unknown).toHaveProperty('commentBanner', {
    title: '置顶',
  });
  expect(result.body as unknown).toHaveProperty('topComments', [
    { commentId: 1 },
  ]);
  expect(result.body.comments).toHaveLength(
    commentMusicDefault.response.body.comments.length,
  );
});

test('comment_music drops bad fields inside a comment and keeps the record', async () => {
  const upstream = structuredClone(commentMusicDefault.response.body);
  const comment = upstream.comments[0] as Record<string, unknown>;
  const commentId = comment.commentId;
  comment.likedCount = '0';
  comment.content = 123;
  comment.decoration = 'none';
  comment.ipLocation = [];
  comment.beReplied = 'none';
  comment.aiCommentLabel = { label: 'AI' };

  const result = await replay(upstream).commentMusic(commentMusicDefault.query);
  const first = result.body.comments[0] as unknown as Record<string, unknown>;

  expect(first.commentId).toBe(commentId);
  expect(first).not.toHaveProperty('likedCount');
  expect(first).not.toHaveProperty('content');
  expect(first).not.toHaveProperty('decoration');
  expect(first).not.toHaveProperty('ipLocation');
  expect(first).not.toHaveProperty('beReplied');
  expect(first).toHaveProperty('aiCommentLabel', { label: 'AI' });
  expect(first.richContent).toBe(
    commentMusicDefault.response.body.comments[0]?.richContent as string,
  );
});

test('comment_mv drops a bad nested reply field but keeps the reply', async () => {
  const upstream = structuredClone(commentMvDefault.response.body);
  const comments = upstream.comments as Array<{
    beReplied?: Array<Record<string, unknown>>;
  }>;
  const comment = comments.find((entry) => (entry.beReplied?.length ?? 0) > 0);
  if (!comment?.beReplied?.[0]) {
    throw new Error('expected a recorded comment with a reply');
  }
  const reply = comment.beReplied[0];
  const replyId = reply.beRepliedCommentId as number;
  reply.content = 123;
  const replyUser = reply.user as Record<string, unknown>;
  const nickname = replyUser.nickname as string;
  replyUser.userId = 'not-a-number';

  const result = await replay(upstream).commentMv(commentMvDefault.query);
  const replayed = result.body.comments.find(
    (entry) =>
      entry.commentId ===
      (comment as unknown as { commentId: number }).commentId,
  );
  const replayedReply = replayed?.beReplied?.[0];
  if (!replayedReply) {
    throw new Error('expected the replayed reply');
  }
  const replayedUser = replayedReply.user as Record<string, unknown>;

  expect(replayedReply.beRepliedCommentId).toBe(replyId);
  expect(replayedReply).not.toHaveProperty('content');
  expect(replayedUser.nickname).toBe(nickname);
  expect(replayedUser).not.toHaveProperty('userId');
});

test('comment_music keeps a null hot comment list and rejects a bad one', async () => {
  const nullable = structuredClone(commentMusicDefault.response.body) as {
    hotComments: unknown;
  };
  nullable.hotComments = null;

  const nullResult = await replay(nullable).commentMusic(
    commentMusicDefault.query,
  );
  expect(nullResult.body.hotComments as unknown).toBeNull();

  const broken = structuredClone(commentMusicDefault.response.body);
  const brokenHotComment = broken.hotComments?.[0] as
    | { commentId: unknown }
    | undefined;
  if (!brokenHotComment) {
    throw new Error('expected a recorded hot comment');
  }
  brokenHotComment.commentId = '7431461934';

  await expectUpstreamShapeRejection(
    replay(broken).commentMusic(commentMusicDefault.query),
    {
      module: 'comment_music',
      path: 'body.hotComments[0].commentId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('comment_music returns a resource without comments and no hot comments', async () => {
  const result = await replay(
    commentMusicOutOfRange.response.body,
    commentMusicOutOfRange.response.status,
  ).commentMusic(commentMusicOutOfRange.query);

  expect(result.body.comments).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('hotComments');
  expect(result.body.total).toBe(2165);
});

test('comment_playlist returns an empty comment list unchanged', async () => {
  const result = await replay(
    commentPlaylistEmpty.response.body,
    commentPlaylistEmpty.response.status,
  ).commentPlaylist(commentPlaylistEmpty.query);

  expect(result.status).toBe(200);
  expect(result.body.comments).toEqual([]);
  expect(result.body.hotComments).toEqual([]);
  expect(result.body.total).toBe(0);
  expect(result.body.more).toBe(false);
});
