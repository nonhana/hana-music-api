import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  UserCommentHistoryBody,
  UserDjBody,
  UserEventBody,
  UserFollowedsBody,
  UserFollowMixedBody,
  UserFollowsBody,
  UserMutualfollowGetBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import userCommentHistoryAnonymous from '../fixtures/netease/user/user_comment_history.anonymous.json';
import userCommentHistory from '../fixtures/netease/user/user_comment_history.default.json';
import userCommentHistoryEmpty from '../fixtures/netease/user/user_comment_history.empty.json';
import userDj from '../fixtures/netease/user/user_dj.default.json';
import userDjEmpty from '../fixtures/netease/user/user_dj.empty.json';
import userEvent from '../fixtures/netease/user/user_event.default.json';
import userEventEmpty from '../fixtures/netease/user/user_event.empty.json';
import userFollowMixedAnonymous from '../fixtures/netease/user/user_follow_mixed.anonymous.json';
import userFollowMixed from '../fixtures/netease/user/user_follow_mixed.default.json';
import userFollowMixedEmpty from '../fixtures/netease/user/user_follow_mixed.empty.json';
import userFolloweds from '../fixtures/netease/user/user_followeds.default.json';
import userFollowedsEmpty from '../fixtures/netease/user/user_followeds.empty.json';
import userFollows from '../fixtures/netease/user/user_follows.default.json';
import userFollowsEmpty from '../fixtures/netease/user/user_follows.empty.json';
import userMutualfollowAnonymous from '../fixtures/netease/user/user_mutualfollow_get.anonymous.json';
import userMutualfollowMutual from '../fixtures/netease/user/user_mutualfollow_get.mutual.json';
import userMutualfollowNotMutual from '../fixtures/netease/user/user_mutualfollow_get.not-mutual.json';

// issue #102 B17 的登录录制：关注/粉丝/评论历史/互关用账号 599663130 与他人 uid 对照，
// 未登录录制（user_follow_mixed.anonymous、user_comment_history.anonymous、
// user_mutualfollow_get.anonymous）只用于登录对照和错误路径。
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
    name: 'user_follow_mixed',
    recording: userFollowMixed,
    bodySchema: UserFollowMixedBody,
    call: (upstream, status) =>
      replay(upstream, status).userFollowMixed(userFollowMixed.query),
  },
  {
    name: 'user_follow_mixed with an out-of-range cursor',
    recording: userFollowMixedEmpty,
    bodySchema: UserFollowMixedBody,
    call: (upstream, status) =>
      replay(upstream, status).userFollowMixed(userFollowMixedEmpty.query),
  },
  {
    name: 'user_followeds',
    recording: userFolloweds,
    bodySchema: UserFollowedsBody,
    call: (upstream, status) =>
      replay(upstream, status).userFolloweds(userFolloweds.query),
  },
  {
    name: 'user_followeds without followers',
    recording: userFollowedsEmpty,
    bodySchema: UserFollowedsBody,
    call: (upstream, status) =>
      replay(upstream, status).userFolloweds(userFollowedsEmpty.query),
  },
  {
    name: 'user_follows',
    recording: userFollows,
    bodySchema: UserFollowsBody,
    call: (upstream, status) =>
      replay(upstream, status).userFollows(userFollows.query),
  },
  {
    name: 'user_follows with an out-of-range offset',
    recording: userFollowsEmpty,
    bodySchema: UserFollowsBody,
    call: (upstream, status) =>
      replay(upstream, status).userFollows(userFollowsEmpty.query),
  },
  {
    name: 'user_comment_history',
    recording: userCommentHistory,
    bodySchema: UserCommentHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).userCommentHistory(userCommentHistory.query),
  },
  {
    name: 'user_comment_history without comments',
    recording: userCommentHistoryEmpty,
    bodySchema: UserCommentHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).userCommentHistory(
        userCommentHistoryEmpty.query,
      ),
  },
  {
    name: 'user_comment_history for an anonymous viewer',
    recording: userCommentHistoryAnonymous,
    bodySchema: UserCommentHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).userCommentHistory(
        userCommentHistoryAnonymous.query,
      ),
  },
  {
    name: 'user_dj',
    recording: userDj,
    bodySchema: UserDjBody,
    call: (upstream, status) => replay(upstream, status).userDj(userDj.query),
  },
  {
    name: 'user_dj without programs',
    recording: userDjEmpty,
    bodySchema: UserDjBody,
    call: (upstream, status) =>
      replay(upstream, status).userDj(userDjEmpty.query),
  },
  {
    name: 'user_event',
    recording: userEvent,
    bodySchema: UserEventBody,
    call: (upstream, status) =>
      replay(upstream, status).userEvent(userEvent.query),
  },
  {
    name: 'user_event without events',
    recording: userEventEmpty,
    bodySchema: UserEventBody,
    call: (upstream, status) =>
      replay(upstream, status).userEvent(userEventEmpty.query),
  },
  {
    name: 'user_mutualfollow_get when mutual',
    recording: userMutualfollowMutual,
    bodySchema: UserMutualfollowGetBody,
    call: (upstream, status) =>
      replay(upstream, status).userMutualfollowGet(
        userMutualfollowMutual.query,
      ),
  },
  {
    name: 'user_mutualfollow_get when not mutual',
    recording: userMutualfollowNotMutual,
    bodySchema: UserMutualfollowGetBody,
    call: (upstream, status) =>
      replay(upstream, status).userMutualfollowGet(
        userMutualfollowNotMutual.query,
      ),
  },
  {
    name: 'user_mutualfollow_get for an anonymous viewer',
    recording: userMutualfollowAnonymous,
    bodySchema: UserMutualfollowGetBody,
    call: (upstream, status) =>
      replay(upstream, status).userMutualfollowGet(
        userMutualfollowAnonymous.query,
      ),
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

test('user_follow_mixed passes the not-login rejection through', async () => {
  expect(
    await settle(
      replay(
        userFollowMixedAnonymous.response.body,
        userFollowMixedAnonymous.response.status,
      ).userFollowMixed(userFollowMixedAnonymous.query),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: userFollowMixedAnonymous.response.body,
    },
  });
});

test('user social bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    UserFollowsBody['follow'][number]['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<UserFollowsBody['follow'][number]['nickname']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<UserFollowsBody['more']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    UserFollowedsBody['followeds'][number]['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<UserFollowedsBody['newCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    UserFollowMixedBody['data']['records'][number]['followId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<
      UserFollowMixedBody['data']['records'][number]['userProfile']
    >['userId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<UserFollowMixedBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<UserMutualfollowGetBody['data']>().toEqualTypeOf<boolean>();
  expectTypeOf<
    NonNullable<UserCommentHistoryBody['data']['comments']>[number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<UserCommentHistoryBody['data']['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<UserDjBody['programs'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<UserDjBody['count']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<UserEventBody['events'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<UserEventBody['events'][number]['type']>().toEqualTypeOf<
    number | null | undefined
  >();
  type LikedUser = NonNullable<
    NonNullable<
      NonNullable<UserEventBody['events'][number]['info']>['commentThread']
    >['latestLikedUsers']
  >[number];
  expectTypeOf<LikedUser['s']>().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<LikedUser['t']>().toEqualTypeOf<number | null | undefined>();
});

test('user_follows rejects a body without the follow list', async () => {
  const upstream = structuredClone(userFollows.response.body) as {
    follow?: unknown;
  };
  delete upstream.follow;

  await expectUpstreamShapeRejection(
    replay(upstream).userFollows(userFollows.query),
    {
      module: 'user_follows',
      path: 'body.follow',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_follows rejects a follow record whose user id is text', async () => {
  const upstream = structuredClone(userFollows.response.body) as {
    follow: Array<{ userId: unknown }>;
  };
  upstream.follow[0]!.userId = '1600559670';

  await expectUpstreamShapeRejection(
    replay(upstream).userFollows(userFollows.query),
    {
      module: 'user_follows',
      path: 'body.follow[0].userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('user_followeds rejects a body without the follower list', async () => {
  const upstream = structuredClone(userFolloweds.response.body) as {
    followeds?: unknown;
  };
  delete upstream.followeds;

  await expectUpstreamShapeRejection(
    replay(upstream).userFolloweds(userFolloweds.query),
    {
      module: 'user_followeds',
      path: 'body.followeds',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_followeds rejects a follower whose user id is text', async () => {
  const upstream = structuredClone(userFolloweds.response.body) as {
    followeds: Array<{ userId: unknown }>;
  };
  upstream.followeds[0]!.userId = '13595690613';

  await expectUpstreamShapeRejection(
    replay(upstream).userFolloweds(userFolloweds.query),
    {
      module: 'user_followeds',
      path: 'body.followeds[0].userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('user_follow_mixed rejects a body without the record data', async () => {
  const upstream = structuredClone(userFollowMixed.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).userFollowMixed(userFollowMixed.query),
    {
      module: 'user_follow_mixed',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_follow_mixed rejects a record without its follow id', async () => {
  const upstream = structuredClone(userFollowMixed.response.body) as {
    data: { records: Array<{ followId?: unknown }> };
  };
  delete upstream.data.records[0]!.followId;

  await expectUpstreamShapeRejection(
    replay(upstream).userFollowMixed(userFollowMixed.query),
    {
      module: 'user_follow_mixed',
      path: 'body.data.records[0].followId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_follow_mixed rejects a present user profile that is not an object', async () => {
  const upstream = structuredClone(userFollowMixed.response.body) as {
    data: { records: Array<{ userProfile: unknown }> };
  };
  upstream.data.records[0]!.userProfile = '洛天依';

  await expectUpstreamShapeRejection(
    replay(upstream).userFollowMixed(userFollowMixed.query),
    {
      module: 'user_follow_mixed',
      path: 'body.data.records[0].userProfile',
      expected: 'object | null',
      actual: 'string',
    },
  );
});

test('user_mutualfollow_get rejects a result that is not a boolean', async () => {
  const upstream = structuredClone(userMutualfollowMutual.response.body) as {
    data: unknown;
  };
  upstream.data = 'true';

  await expectUpstreamShapeRejection(
    replay(upstream).userMutualfollowGet(userMutualfollowMutual.query),
    {
      module: 'user_mutualfollow_get',
      path: 'body.data',
      expected: 'boolean',
      actual: 'string',
    },
  );
});

test('user_comment_history rejects a comment list that is not a list', async () => {
  const upstream = structuredClone(userCommentHistory.response.body) as {
    data: { comments: unknown };
  };
  upstream.data.comments = 'none';

  await expectUpstreamShapeRejection(
    replay(upstream).userCommentHistory(userCommentHistory.query),
    {
      module: 'user_comment_history',
      path: 'body.data.comments',
      expected: 'array | null',
      actual: 'string',
    },
  );
});

test('user_comment_history rejects a comment without its id', async () => {
  const upstream = structuredClone(userCommentHistory.response.body) as {
    data: { comments: Array<{ commentId?: unknown }> };
  };
  delete upstream.data.comments[0]!.commentId;

  await expectUpstreamShapeRejection(
    replay(upstream).userCommentHistory(userCommentHistory.query),
    {
      module: 'user_comment_history',
      path: 'body.data.comments[0].commentId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_dj rejects a body without the program list', async () => {
  const upstream = structuredClone(userDj.response.body) as {
    programs?: unknown;
  };
  delete upstream.programs;

  await expectUpstreamShapeRejection(replay(upstream).userDj(userDj.query), {
    module: 'user_dj',
    path: 'body.programs',
    expected: 'present',
    actual: 'missing',
  });
});

test('user_dj rejects a program whose id is text', async () => {
  const upstream = structuredClone(userDj.response.body) as {
    programs: Array<{ id: unknown }>;
  };
  upstream.programs[0]!.id = '794062371';

  await expectUpstreamShapeRejection(replay(upstream).userDj(userDj.query), {
    module: 'user_dj',
    path: 'body.programs[0].id',
    expected: 'number',
    actual: 'string',
  });
});

test('user_event rejects a body without the event list', async () => {
  const upstream = structuredClone(userEvent.response.body) as {
    events?: unknown;
  };
  delete upstream.events;

  await expectUpstreamShapeRejection(
    replay(upstream).userEvent(userEvent.query),
    {
      module: 'user_event',
      path: 'body.events',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_event rejects an event whose id is text', async () => {
  const upstream = structuredClone(userEvent.response.body) as {
    events: Array<{ id: unknown }>;
  };
  upstream.events[0]!.id = '37982331004';

  await expectUpstreamShapeRejection(
    replay(upstream).userEvent(userEvent.query),
    {
      module: 'user_event',
      path: 'body.events[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('user_follows drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userFollows.response.body) as {
    more: unknown;
    touchCount: unknown;
    follow: Array<Record<string, unknown> & { vipRights: unknown }>;
  };
  upstream.more = 'true';
  upstream.touchCount = false;
  upstream.follow[0]!.vipRights = 'vip';
  upstream.follow[1]!.extra = { from: 'upstream' };

  const result = await replay(upstream).userFollows(userFollows.query);

  expect(result.body as unknown).not.toHaveProperty('more');
  expect(result.body as unknown).not.toHaveProperty('touchCount');
  expect(result.body.follow[0] as unknown).not.toHaveProperty('vipRights');
  expect(result.body.follow[0]!.nickname).toBe(
    userFollows.response.body.follow[0]!.nickname,
  );
  expect(result.body.follow[1]).toHaveProperty('extra', { from: 'upstream' });
});

test('user_followeds drops a bad new count and keeps null vip rights', async () => {
  const upstream = structuredClone(userFolloweds.response.body) as {
    newCount: unknown;
    followeds: Array<Record<string, unknown> & { vipRights: unknown }>;
  };
  upstream.newCount = '0';
  upstream.followeds[0]!.vipRights = 'vip';
  upstream.followeds[1]!.vipRights = null;
  delete upstream.followeds[2]!.signature;
  upstream.followeds[2]!.extra = 'upstream';

  const result = await replay(upstream).userFolloweds(userFolloweds.query);

  expect(result.body as unknown).not.toHaveProperty('newCount');
  expect(result.body.followeds[0] as unknown).not.toHaveProperty('vipRights');
  expect(result.body.followeds[1]!.vipRights as unknown).toBeNull();
  expect(result.body.followeds[2] as unknown).not.toHaveProperty('signature');
  expect(result.body.followeds[2]).toHaveProperty('extra', 'upstream');
});

test('user_follow_mixed accepts a missing user profile and drops bad nested fields', async () => {
  const upstream = structuredClone(userFollowMixed.response.body) as {
    data: {
      page: unknown;
      records: Array<Record<string, unknown> & { artistInfo: unknown }>;
    };
  };
  delete upstream.data.records[0]!.userProfile;
  upstream.data.records[1]!.userProfile = null;
  upstream.data.records[2]!.artistInfo = 'artist';
  upstream.data.page = 'page';
  upstream.data.records[3]!.extra = { from: 'upstream' };

  const result = await replay(upstream).userFollowMixed(userFollowMixed.query);

  expect(result.body.data.records[0] as unknown).not.toHaveProperty(
    'userProfile',
  );
  expect(result.body.data.records[1]!.userProfile as unknown).toBeNull();
  expect(result.body.data.records[2] as unknown).not.toHaveProperty(
    'artistInfo',
  );
  expect(result.body.data as unknown).not.toHaveProperty('page');
  expect(result.body.data.records[3]).toHaveProperty('extra', {
    from: 'upstream',
  });
});

test('user_comment_history accepts missing and null comment lists', async () => {
  const missing = structuredClone(userCommentHistory.response.body) as {
    data: { comments?: unknown; hotComments?: unknown };
  };
  delete missing.data.comments;
  delete missing.data.hotComments;

  const withoutLists = await replay(missing).userCommentHistory(
    userCommentHistory.query,
  );
  expect(withoutLists.body.data as unknown).not.toHaveProperty('comments');
  expect(withoutLists.body.data as unknown).not.toHaveProperty('hotComments');

  const nulled = structuredClone(userCommentHistory.response.body) as {
    data: { comments?: unknown; hotComments?: unknown };
  };
  nulled.data.comments = null;
  nulled.data.hotComments = null;

  const withNull = await replay(nulled).userCommentHistory(
    userCommentHistory.query,
  );
  expect(withNull.body.data.comments as unknown).toBeNull();
  expect(withNull.body.data.hotComments as unknown).toBeNull();
});

test('user_event keeps the latest liked users', async () => {
  const result = await replay(userEvent.response.body).userEvent(
    userEvent.query,
  );

  expect(result.body.events[0]?.info?.commentThread?.latestLikedUsers).toEqual(
    userEvent.response.body.events[0]!.info.commentThread.latestLikedUsers,
  );
});

test('user_event drops a bad latest-liked-users list', async () => {
  const upstream = structuredClone(userEvent.response.body) as {
    events: Array<{
      info: { commentThread: { latestLikedUsers: unknown } };
    }>;
  };
  upstream.events[0]!.info.commentThread.latestLikedUsers = 'liked';

  const result = await replay(upstream).userEvent(userEvent.query);

  expect(
    result.body.events[0]?.info?.commentThread as unknown,
  ).not.toHaveProperty('latestLikedUsers');
});

test('user_comment_history drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userCommentHistory.response.body) as {
    data: {
      commentCount: unknown;
      hasMore: unknown;
      reminder: unknown;
      comments: Array<Record<string, unknown>>;
    };
  };
  upstream.data.commentCount = '410';
  upstream.data.hasMore = 'true';
  upstream.data.reminder = 'false';
  (upstream.data as Record<string, unknown>).extra = 'upstream';
  upstream.data.comments[0]!.extraCommentField = 'upstream';

  const result = await replay(upstream).userCommentHistory(
    userCommentHistory.query,
  );

  expect(result.body.data as unknown).not.toHaveProperty('commentCount');
  expect(result.body.data as unknown).not.toHaveProperty('hasMore');
  expect(result.body.data as unknown).not.toHaveProperty('reminder');
  expect(result.body.data).toHaveProperty('extra', 'upstream');
  expect(result.body.data.comments?.[0]).toHaveProperty(
    'extraCommentField',
    'upstream',
  );
  expect(result.body.data.comments?.[0]?.commentId).toBe(
    userCommentHistory.response.body.data.comments[0]!.commentId,
  );
});

test('user_comment_history rejects a hot comment without its id', async () => {
  const upstream = structuredClone(userCommentHistory.response.body) as {
    data: { hotComments: Array<{ commentId?: unknown }> };
  };
  delete upstream.data.hotComments[0]!.commentId;

  await expectUpstreamShapeRejection(
    replay(upstream).userCommentHistory(userCommentHistory.query),
    {
      module: 'user_comment_history',
      path: 'body.data.hotComments[0].commentId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_mutualfollow_get keeps undeclared fields', async () => {
  const upstream = structuredClone(
    userMutualfollowMutual.response.body,
  ) as Record<string, unknown>;
  upstream.extra = { from: 'upstream' };

  const result = await replay(upstream).userMutualfollowGet(
    userMutualfollowMutual.query,
  );

  expect(result.body).toHaveProperty('extra', { from: 'upstream' });
  expect(result.body.data).toBe(true);
});

test('user_dj drops bad counters and keeps undeclared program fields', async () => {
  const upstream = structuredClone(userDj.response.body) as {
    count: unknown;
    more: unknown;
    programs: Array<Record<string, unknown>>;
  };
  upstream.count = '51';
  upstream.more = null;
  upstream.programs[0]!.extra = 'upstream';

  const result = await replay(upstream).userDj(userDj.query);

  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body.more as unknown).toBeNull();
  expect(result.body.programs[0]).toHaveProperty('extra', 'upstream');
  expect(result.body.programs[0]!.id).toBe(
    userDj.response.body.programs[0]!.id,
  );
});

test('user_event drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userEvent.response.body) as {
    events: Array<Record<string, unknown> & { info: unknown }>;
  };
  upstream.events[0]!.type = '18';
  upstream.events[0]!.typeDesc = 18;
  upstream.events[0]!.info = 'info';
  upstream.events[1]!.extra = { from: 'upstream' };

  const result = await replay(upstream).userEvent(userEvent.query);

  expect(result.body.events[0] as unknown).not.toHaveProperty('type');
  expect(result.body.events[0] as unknown).not.toHaveProperty('typeDesc');
  expect(result.body.events[0] as unknown).not.toHaveProperty('info');
  expect(result.body.events[1]).toHaveProperty('extra', {
    from: 'upstream',
  });
  expect(result.body.events[1]!.id).toBe(userEvent.response.body.events[1]!.id);
});

test('user_follow_mixed rejects an invalid scene before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json(userFollowMixed.response.body);
    },
  });

  const outcome = await settle(api.userFollowMixed({ scene: 9 as never }));

  expect(outcome).toHaveProperty('rejected.status', 400);
  expect(outcome).toHaveProperty('rejected.body.code', 400);
  expect(upstreamCalls).toBe(0);
});
