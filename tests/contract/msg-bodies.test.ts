import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  MsgCommentsBody,
  MsgForwardsBody,
  MsgNoticesBody,
  MsgPrivateBody,
  MsgPrivateHistoryBody,
  MsgRecentcontactBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import msgCommentsAnonymous from '../fixtures/netease/msg/msg_comments.anonymous.json';
import msgComments from '../fixtures/netease/msg/msg_comments.default.json';
import msgCommentsEmpty from '../fixtures/netease/msg/msg_comments.empty.json';
import msgForwardsAnonymous from '../fixtures/netease/msg/msg_forwards.anonymous.json';
import msgForwards from '../fixtures/netease/msg/msg_forwards.default.json';
import msgForwardsEmpty from '../fixtures/netease/msg/msg_forwards.empty.json';
import msgNoticesAnonymous from '../fixtures/netease/msg/msg_notices.anonymous.json';
import msgNotices from '../fixtures/netease/msg/msg_notices.default.json';
import msgNoticesEmpty from '../fixtures/netease/msg/msg_notices.empty.json';
import msgPrivateAnonymous from '../fixtures/netease/msg/msg_private.anonymous.json';
import msgPrivate from '../fixtures/netease/msg/msg_private.default.json';
import msgPrivateEmpty from '../fixtures/netease/msg/msg_private.empty.json';
import msgPrivateHistoryAnonymous from '../fixtures/netease/msg/msg_private_history.anonymous.json';
import msgPrivateHistory from '../fixtures/netease/msg/msg_private_history.default.json';
import msgPrivateHistoryEmpty from '../fixtures/netease/msg/msg_private_history.empty.json';
import msgRecentcontactAnonymous from '../fixtures/netease/msg/msg_recentcontact.anonymous.json';
import msgRecentcontact from '../fixtures/netease/msg/msg_recentcontact.default.json';

// issue #102 B20 的登录录制；通知和私信需要登录，未登录时上游返回 code 301 或空列表。
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
    name: 'msg_comments',
    recording: msgComments,
    bodySchema: MsgCommentsBody,
    call: (upstream, status) =>
      replay(upstream, status).msgComments(msgComments.query),
  },
  {
    name: 'msg_comments without received comments',
    recording: msgCommentsEmpty,
    bodySchema: MsgCommentsBody,
    call: (upstream, status) =>
      replay(upstream, status).msgComments(msgCommentsEmpty.query),
  },
  {
    name: 'msg_forwards',
    recording: msgForwards,
    bodySchema: MsgForwardsBody,
    call: (upstream, status) =>
      replay(upstream, status).msgForwards(msgForwards.query),
  },
  {
    name: 'msg_forwards without mentions',
    recording: msgForwardsEmpty,
    bodySchema: MsgForwardsBody,
    call: (upstream, status) =>
      replay(upstream, status).msgForwards(msgForwardsEmpty.query),
  },
  {
    name: 'msg_notices',
    recording: msgNotices,
    bodySchema: MsgNoticesBody,
    call: (upstream, status) =>
      replay(upstream, status).msgNotices(msgNotices.query),
  },
  {
    name: 'msg_notices without notices',
    recording: msgNoticesEmpty,
    bodySchema: MsgNoticesBody,
    call: (upstream, status) =>
      replay(upstream, status).msgNotices(msgNoticesEmpty.query),
  },
  {
    name: 'msg_private',
    recording: msgPrivate,
    bodySchema: MsgPrivateBody,
    call: (upstream, status) =>
      replay(upstream, status).msgPrivate(msgPrivate.query),
  },
  {
    name: 'msg_private without conversations',
    recording: msgPrivateEmpty,
    bodySchema: MsgPrivateBody,
    call: (upstream, status) =>
      replay(upstream, status).msgPrivate(msgPrivateEmpty.query),
  },
  {
    name: 'msg_private for an anonymous viewer',
    recording: msgPrivateAnonymous,
    bodySchema: MsgPrivateBody,
    call: (upstream, status) =>
      replay(upstream, status).msgPrivate(msgPrivateAnonymous.query),
  },
  {
    name: 'msg_private_history',
    recording: msgPrivateHistory,
    bodySchema: MsgPrivateHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).msgPrivateHistory(msgPrivateHistory.query),
  },
  {
    name: 'msg_private_history without messages',
    recording: msgPrivateHistoryEmpty,
    bodySchema: MsgPrivateHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).msgPrivateHistory(msgPrivateHistoryEmpty.query),
  },
  {
    name: 'msg_private_history for an anonymous viewer',
    recording: msgPrivateHistoryAnonymous,
    bodySchema: MsgPrivateHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).msgPrivateHistory(
        msgPrivateHistoryAnonymous.query,
      ),
  },
  {
    name: 'msg_recentcontact',
    recording: msgRecentcontact,
    bodySchema: MsgRecentcontactBody,
    call: (upstream, status) =>
      replay(upstream, status).msgRecentcontact(msgRecentcontact.query),
  },
  {
    name: 'msg_recentcontact without a signed-in viewer',
    recording: msgRecentcontactAnonymous,
    bodySchema: MsgRecentcontactBody,
    call: (upstream, status) =>
      replay(upstream, status).msgRecentcontact(
        msgRecentcontactAnonymous.query,
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

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'msg_comments',
    recording: msgCommentsAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).msgComments(msgCommentsAnonymous.query),
  },
  {
    name: 'msg_forwards',
    recording: msgForwardsAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).msgForwards(msgForwardsAnonymous.query),
  },
  {
    name: 'msg_notices',
    recording: msgNoticesAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).msgNotices(msgNoticesAnonymous.query),
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
      status: 301,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('msg bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    MsgCommentsBody['comments'][number]['commentId']
  >().toEqualTypeOf<number>();
  expectTypeOf<MsgCommentsBody['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    MsgForwardsBody['forwards'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<MsgForwardsBody['lasttime']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    MsgNoticesBody['notices'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<MsgNoticesBody['more']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    MsgPrivateBody['msgs'][number]['user']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<MsgPrivateBody['msgs'][number]['lastMsg']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    MsgPrivateHistoryBody['msgs'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<MsgPrivateHistoryBody['isSubed']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    MsgRecentcontactBody['data']['follow'][number]['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    MsgRecentcontactBody['data']['follow'][number]['onlined']
  >().toEqualTypeOf<boolean | null | undefined>();
});

test('msg_comments rejects received comments that are not a list', async () => {
  const upstream = structuredClone(msgComments.response.body) as {
    comments: unknown;
  };
  upstream.comments = null;

  await expectUpstreamShapeRejection(
    replay(upstream).msgComments(msgComments.query),
    {
      module: 'msg_comments',
      path: 'body.comments',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('msg_comments rejects a missing received comments list', async () => {
  const upstream = structuredClone(msgComments.response.body) as {
    comments: unknown;
  };
  delete upstream.comments;

  await expectUpstreamShapeRejection(
    replay(upstream).msgComments(msgComments.query),
    {
      module: 'msg_comments',
      path: 'body.comments',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('msg_comments rejects a received comment without its own id', async () => {
  const upstream = structuredClone(msgComments.response.body) as {
    comments: Array<{ commentId: unknown }>;
  };
  const [comment] = upstream.comments;
  if (comment === undefined) throw new Error('expected a recorded comment');
  comment.commentId = '9663068565';

  await expectUpstreamShapeRejection(
    replay(upstream).msgComments(msgComments.query),
    {
      module: 'msg_comments',
      path: 'body.comments[0].commentId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('msg_comments drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    msgComments.response.body,
  ) as unknown as Record<string, unknown> & {
    comments: Array<Record<string, unknown>>;
  };
  const [comment] = upstream.comments;
  if (comment === undefined) throw new Error('expected a recorded comment');
  upstream.more = 'more';
  upstream.undeclaredTop = { kept: true };
  comment.beRepliedUser = 'not a user';
  comment.content = null;
  comment.undeclaredComment = 'kept';

  const result = await replay(upstream).msgComments(msgComments.query);
  const body = result.body as unknown as Record<string, unknown> & {
    comments: Array<Record<string, unknown>>;
  };

  expect(body.more).toBeUndefined();
  expect(body.undeclaredTop).toEqual({ kept: true });
  expect(body.comments[0]?.beRepliedUser).toBeUndefined();
  expect(body.comments[0]?.content).toBeNull();
  expect(body.comments[0]?.undeclaredComment).toBe('kept');
});

test('msg_comments drops a missing loose field', async () => {
  const upstream = structuredClone(
    msgComments.response.body,
  ) as unknown as Record<string, unknown>;
  delete upstream.more;

  const result = await replay(upstream).msgComments(msgComments.query);

  expect(result.body).not.toHaveProperty('more');
});

test('msg_comments rejects a non-primitive uid locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(msgComments.response.body);
    },
  });

  expect(await settle(api.msgComments({ uid: {} }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'uid must be a primitive value' },
    },
  });
  expect(requests).toBe(0);
});

test('msg_forwards rejects a mention list that is not a list', async () => {
  const upstream = structuredClone(msgForwards.response.body) as {
    forwards: unknown;
  };
  delete upstream.forwards;

  await expectUpstreamShapeRejection(
    replay(upstream).msgForwards(msgForwards.query),
    {
      module: 'msg_forwards',
      path: 'body.forwards',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('msg_forwards rejects a missing mention id', async () => {
  const upstream = structuredClone(msgForwards.response.body) as {
    forwards: Array<{ id?: unknown }>;
  };
  const [forward] = upstream.forwards;
  if (forward === undefined) throw new Error('expected a recorded forward');
  delete forward.id;

  await expectUpstreamShapeRejection(
    replay(upstream).msgForwards(msgForwards.query),
    {
      module: 'msg_forwards',
      path: 'body.forwards[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('msg_forwards rejects a mention without its own id', async () => {
  const upstream = structuredClone(msgForwards.response.body) as {
    forwards: Array<{ id: unknown }>;
  };
  const [forward] = upstream.forwards;
  if (forward === undefined) throw new Error('expected a recorded forward');
  forward.id = '2140722320';

  await expectUpstreamShapeRejection(
    replay(upstream).msgForwards(msgForwards.query),
    {
      module: 'msg_forwards',
      path: 'body.forwards[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('msg_forwards drops a bad origin and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    msgForwards.response.body,
  ) as unknown as Record<string, unknown> & {
    forwards: Array<Record<string, unknown>>;
  };
  const [forward] = upstream.forwards;
  if (forward === undefined) throw new Error('expected a recorded forward');
  forward.uf = 'not an origin';
  forward.undeclaredForward = 'kept';
  upstream.newCount = 'many';
  upstream.lasttime = null;
  upstream.undeclaredTop = 'kept';

  const result = await replay(upstream).msgForwards(msgForwards.query);
  const body = result.body as unknown as Record<string, unknown> & {
    forwards: Array<Record<string, unknown>>;
  };

  expect(body.newCount).toBeUndefined();
  expect(body.lasttime).toBeNull();
  expect(body.undeclaredTop).toBe('kept');
  expect(body.forwards[0]?.uf).toBeUndefined();
  expect(body.forwards[0]?.undeclaredForward).toBe('kept');
});

test('msg_forwards drops a missing loose field', async () => {
  const upstream = structuredClone(
    msgForwards.response.body,
  ) as unknown as Record<string, unknown>;
  delete upstream.newCount;

  const result = await replay(upstream).msgForwards(msgForwards.query);

  expect(result.body).not.toHaveProperty('newCount');
});

test('msg_notices rejects a notice list that is null', async () => {
  const upstream = structuredClone(msgNotices.response.body) as {
    notices: unknown;
  };
  upstream.notices = null;

  await expectUpstreamShapeRejection(
    replay(upstream).msgNotices(msgNotices.query),
    {
      module: 'msg_notices',
      path: 'body.notices',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('msg_notices rejects a missing notice list', async () => {
  const upstream = structuredClone(msgNotices.response.body) as {
    notices: unknown;
  };
  delete upstream.notices;

  await expectUpstreamShapeRejection(
    replay(upstream).msgNotices(msgNotices.query),
    {
      module: 'msg_notices',
      path: 'body.notices',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('msg_notices rejects a notice without its own id', async () => {
  const upstream = structuredClone(msgNotices.response.body) as {
    notices: Array<{ id: unknown }>;
  };
  const [notice] = upstream.notices;
  if (notice === undefined) throw new Error('expected a recorded notice');
  notice.id = '119472291495';

  await expectUpstreamShapeRejection(
    replay(upstream).msgNotices(msgNotices.query),
    {
      module: 'msg_notices',
      path: 'body.notices[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('msg_notices drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    msgNotices.response.body,
  ) as unknown as Record<string, unknown> & {
    notices: Array<Record<string, unknown>>;
  };
  const [notice] = upstream.notices;
  if (notice === undefined) throw new Error('expected a recorded notice');
  notice.notice = 42;
  notice.undeclaredNotice = 'kept';
  upstream.lastTime = 'yesterday';
  upstream.more = null;
  upstream.undeclaredTop = { kept: true };

  const result = await replay(upstream).msgNotices(msgNotices.query);
  const body = result.body as unknown as Record<string, unknown> & {
    notices: Array<Record<string, unknown>>;
  };

  expect(body.lastTime).toBeUndefined();
  expect(body.more).toBeNull();
  expect(body.undeclaredTop).toEqual({ kept: true });
  expect(body.notices[0]?.notice).toBeUndefined();
  expect(body.notices[0]?.undeclaredNotice).toBe('kept');
});

test('msg_notices drops a missing loose field', async () => {
  const upstream = structuredClone(
    msgNotices.response.body,
  ) as unknown as Record<string, unknown>;
  delete upstream.lastTime;

  const result = await replay(upstream).msgNotices(msgNotices.query);

  expect(result.body).not.toHaveProperty('lastTime');
});

test('msg_private rejects a conversation list that is null', async () => {
  const upstream = structuredClone(msgPrivate.response.body) as {
    msgs: unknown;
  };
  upstream.msgs = null;

  await expectUpstreamShapeRejection(
    replay(upstream).msgPrivate(msgPrivate.query),
    {
      module: 'msg_private',
      path: 'body.msgs',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('msg_private rejects a missing conversation list', async () => {
  const upstream = structuredClone(msgPrivate.response.body) as {
    msgs: unknown;
  };
  delete upstream.msgs;

  await expectUpstreamShapeRejection(
    replay(upstream).msgPrivate(msgPrivate.query),
    {
      module: 'msg_private',
      path: 'body.msgs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('msg_private rejects a conversation without its own id', async () => {
  const upstream = structuredClone(msgPrivate.response.body) as {
    msgs: Array<{ user: { id: unknown } }>;
  };
  const [conversation] = upstream.msgs;
  if (conversation === undefined) {
    throw new Error('expected a recorded conversation');
  }
  conversation.user.id = '98985071166';

  await expectUpstreamShapeRejection(
    replay(upstream).msgPrivate(msgPrivate.query),
    {
      module: 'msg_private',
      path: 'body.msgs[0].user.id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('msg_private drops bad loose users and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    msgPrivate.response.body,
  ) as unknown as Record<string, unknown> & {
    msgs: Array<{
      fromUser?: unknown;
      lastMsgTime?: unknown;
      msgSenderType?: unknown;
      undeclaredConversation?: unknown;
    }>;
  };
  const [first, second] = upstream.msgs;
  if (first === undefined || second === undefined) {
    throw new Error('expected two recorded conversations');
  }
  first.fromUser = 'not a user';
  first.msgSenderType = null;
  first.undeclaredConversation = 'kept';
  second.lastMsgTime = 'recently';
  upstream.more = 'more';
  upstream.undeclaredTop = 'kept';

  const result = await replay(upstream).msgPrivate(msgPrivate.query);
  const body = result.body as unknown as Record<string, unknown> & {
    msgs: Array<Record<string, unknown>>;
  };

  expect(body.more).toBeUndefined();
  expect(body.undeclaredTop).toBe('kept');
  expect(body.msgs[0]?.fromUser).toBeUndefined();
  expect(body.msgs[0]?.msgSenderType).toBeNull();
  expect(body.msgs[0]?.undeclaredConversation).toBe('kept');
  expect(body.msgs[1]?.lastMsgTime).toBeUndefined();
});

test('msg_private drops a missing loose field', async () => {
  const upstream = structuredClone(
    msgPrivate.response.body,
  ) as unknown as Record<string, unknown>;
  delete upstream.more;

  const result = await replay(upstream).msgPrivate(msgPrivate.query);

  expect(result.body).not.toHaveProperty('more');
});

test('msg_private_history rejects a message list that is null', async () => {
  const upstream = structuredClone(msgPrivateHistory.response.body) as {
    msgs: unknown;
  };
  upstream.msgs = null;

  await expectUpstreamShapeRejection(
    replay(upstream).msgPrivateHistory(msgPrivateHistory.query),
    {
      module: 'msg_private_history',
      path: 'body.msgs',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('msg_private_history rejects a missing message list', async () => {
  const upstream = structuredClone(msgPrivateHistory.response.body) as {
    msgs: unknown;
  };
  delete upstream.msgs;

  await expectUpstreamShapeRejection(
    replay(upstream).msgPrivateHistory(msgPrivateHistory.query),
    {
      module: 'msg_private_history',
      path: 'body.msgs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('msg_private_history rejects a message without its own id', async () => {
  const upstream = structuredClone(msgPrivateHistory.response.body) as {
    msgs: Array<{ id: unknown }>;
  };
  const [message] = upstream.msgs;
  if (message === undefined) throw new Error('expected a recorded message');
  message.id = '358245385249';

  await expectUpstreamShapeRejection(
    replay(upstream).msgPrivateHistory(msgPrivateHistory.query),
    {
      module: 'msg_private_history',
      path: 'body.msgs[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('msg_private_history drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    msgPrivateHistory.response.body,
  ) as unknown as Record<string, unknown> & {
    msgs: Array<Record<string, unknown>>;
  };
  const [message] = upstream.msgs;
  if (message === undefined) throw new Error('expected a recorded message');
  message.msg = 42;
  message.fromUser = 'not a user';
  message.undeclaredMessage = 'kept';
  upstream.hint = [];
  upstream.more = null;
  upstream.undeclaredTop = { kept: true };

  const result = await replay(upstream).msgPrivateHistory(
    msgPrivateHistory.query,
  );
  const body = result.body as unknown as Record<string, unknown> & {
    msgs: Array<Record<string, unknown>>;
  };

  expect(body.hint).toBeUndefined();
  expect(body.more).toBeNull();
  expect(body.undeclaredTop).toEqual({ kept: true });
  expect(body.msgs[0]?.msg).toBeUndefined();
  expect(body.msgs[0]?.fromUser).toBeUndefined();
  expect(body.msgs[0]?.undeclaredMessage).toBe('kept');
});

test('msg_private_history drops a missing loose field', async () => {
  const upstream = structuredClone(
    msgPrivateHistory.response.body,
  ) as unknown as Record<string, unknown>;
  delete upstream.hint;

  const result = await replay(upstream).msgPrivateHistory(
    msgPrivateHistory.query,
  );

  expect(result.body).not.toHaveProperty('hint');
});

test('msg_recentcontact rejects a data block that is not an object', async () => {
  const upstream = structuredClone(msgRecentcontact.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).msgRecentcontact(msgRecentcontact.query),
    {
      module: 'msg_recentcontact',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('msg_recentcontact rejects a contact list that is not a list', async () => {
  const upstream = structuredClone(msgRecentcontact.response.body) as {
    data: { follow: unknown };
  };
  upstream.data.follow = null;

  await expectUpstreamShapeRejection(
    replay(upstream).msgRecentcontact(msgRecentcontact.query),
    {
      module: 'msg_recentcontact',
      path: 'body.data.follow',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('msg_recentcontact rejects a missing contact list', async () => {
  const upstream = structuredClone(msgRecentcontact.response.body) as {
    data: { follow?: unknown };
  };
  delete upstream.data.follow;

  await expectUpstreamShapeRejection(
    replay(upstream).msgRecentcontact(msgRecentcontact.query),
    {
      module: 'msg_recentcontact',
      path: 'body.data.follow',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('msg_recentcontact rejects a contact without its own id', async () => {
  const upstream = structuredClone(msgRecentcontact.response.body) as {
    data: { follow: Array<{ userId: unknown }> };
  };
  const [contact] = upstream.data.follow;
  if (contact === undefined) throw new Error('expected a recorded contact');
  contact.userId = '609105586';

  await expectUpstreamShapeRejection(
    replay(upstream).msgRecentcontact(msgRecentcontact.query),
    {
      module: 'msg_recentcontact',
      path: 'body.data.follow[0].userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('msg_recentcontact drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    msgRecentcontact.response.body,
  ) as unknown as Record<string, unknown> & {
    data: Record<string, unknown> & {
      follow: Array<Record<string, unknown>>;
    };
  };
  const [contact] = upstream.data.follow;
  if (contact === undefined) throw new Error('expected a recorded contact');
  contact.onlined = 'online';
  contact.py = null;
  contact.expertTags = [1];
  contact.undeclaredContact = 'kept';
  upstream.data.extra = 'kept';

  const result = await replay(upstream).msgRecentcontact(
    msgRecentcontact.query,
  );
  const body = result.body as unknown as {
    data: Record<string, unknown> & {
      follow: Array<Record<string, unknown>>;
    };
  };

  expect(body.data.extra).toBe('kept');
  expect(body.data.follow[0]?.onlined).toBeUndefined();
  expect(body.data.follow[0]?.py).toBeNull();
  expect(body.data.follow[0]?.expertTags).toBeUndefined();
  expect(body.data.follow[0]?.undeclaredContact).toBe('kept');
});

test('msg_recentcontact drops a missing loose field', async () => {
  const upstream = structuredClone(
    msgRecentcontact.response.body,
  ) as unknown as {
    data: { follow: Array<Record<string, unknown>> };
  };
  const [contact] = upstream.data.follow;
  if (contact === undefined) throw new Error('expected a recorded contact');
  delete contact.onlined;

  const result = await replay(upstream).msgRecentcontact(
    msgRecentcontact.query,
  );
  const body = result.body as unknown as {
    data: { follow: Array<Record<string, unknown>> };
  };

  expect(body.data.follow[0]).not.toHaveProperty('onlined');
});
