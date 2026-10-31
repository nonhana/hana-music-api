import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  EventBody,
  HotTopicBody,
  TopicDetailBody,
  TopicDetailEventHotBody,
  TopicSublistBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import event from '../fixtures/netease/event/event.default.json';
import eventEmpty from '../fixtures/netease/event/event.empty.json';
import eventInvalidPagesize from '../fixtures/netease/event/event.invalid-pagesize.json';
import hotTopic from '../fixtures/netease/topic/hot_topic.default.json';
import hotTopicInvalidLimit from '../fixtures/netease/topic/hot_topic.invalid-limit.json';
import topicDetail from '../fixtures/netease/topic/topic_detail.default.json';
import topicDetailMissingActid from '../fixtures/netease/topic/topic_detail.missing-actid.json';
import topicDetailUnknown from '../fixtures/netease/topic/topic_detail.unknown.json';
import topicDetailEventHot from '../fixtures/netease/topic/topic_detail_event_hot.default.json';
import topicDetailEventHotEmpty from '../fixtures/netease/topic/topic_detail_event_hot.empty.json';
import topicDetailEventHotMissingActid from '../fixtures/netease/topic/topic_detail_event_hot.missing-actid.json';
import topicDetailEventHotUnknown from '../fixtures/netease/topic/topic_detail_event_hot.unknown.json';
import topicSublist from '../fixtures/netease/topic/topic_sublist.default.json';
import topicSublistInvalidOffset from '../fixtures/netease/topic/topic_sublist.invalid-offset.json';
import topicSublistOutOfRange from '../fixtures/netease/topic/topic_sublist.out-of-range.json';

// issue #102 B19 的登录录制：账号 599663130（event.default.json 的 `event[].user.userId`；
// 登录态由本次会话 `login_status` 现场确认，未提交）。
// 匿名对照只在本次录制中用于确认字段集合一致，没有提交成 fixture。
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
    name: 'event',
    recording: event,
    bodySchema: EventBody,
    call: (upstream, status) => replay(upstream, status).event(event.query),
  },
  {
    name: 'event without events',
    recording: eventEmpty,
    bodySchema: EventBody,
    call: (upstream, status) =>
      replay(upstream, status).event(eventEmpty.query),
  },
  {
    name: 'hot_topic',
    recording: hotTopic,
    bodySchema: HotTopicBody,
    call: (upstream, status) =>
      replay(upstream, status).hotTopic(hotTopic.query),
  },
  {
    name: 'topic_sublist',
    recording: topicSublist,
    bodySchema: TopicSublistBody,
    call: (upstream, status) =>
      replay(upstream, status).topicSublist(topicSublist.query),
  },
  {
    name: 'topic_sublist past its page',
    recording: topicSublistOutOfRange,
    bodySchema: TopicSublistBody,
    call: (upstream, status) =>
      replay(upstream, status).topicSublist(topicSublistOutOfRange.query),
  },
  {
    name: 'topic_detail',
    recording: topicDetail,
    bodySchema: TopicDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).topicDetail(topicDetail.query),
  },
  {
    name: 'topic_detail_event_hot',
    recording: topicDetailEventHot,
    bodySchema: TopicDetailEventHotBody,
    call: (upstream, status) =>
      replay(upstream, status).topicDetailEventHot(topicDetailEventHot.query),
  },
  {
    name: 'topic_detail_event_hot without hot events',
    recording: topicDetailEventHotEmpty,
    bodySchema: TopicDetailEventHotBody,
    call: (upstream, status) =>
      replay(upstream, status).topicDetailEventHot(
        topicDetailEventHotEmpty.query,
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
  status: number;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'event with an invalid pagesize',
    status: 400,
    recording: eventInvalidPagesize,
    call: (upstream, status) =>
      replay(upstream, status).event(eventInvalidPagesize.query),
  },
  {
    name: 'hot_topic with an invalid limit',
    status: 400,
    recording: hotTopicInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).hotTopic(hotTopicInvalidLimit.query),
  },
  {
    name: 'topic_sublist with an invalid offset',
    status: 400,
    recording: topicSublistInvalidOffset,
    call: (upstream, status) =>
      replay(upstream, status).topicSublist(topicSublistInvalidOffset.query),
  },
  {
    name: 'topic_detail without an actid',
    status: 400,
    recording: topicDetailMissingActid,
    call: (upstream, status) =>
      replay(upstream, status).topicDetail(topicDetailMissingActid.query),
  },
  {
    name: 'topic_detail_event_hot without an actid',
    status: 400,
    recording: topicDetailEventHotMissingActid,
    call: (upstream, status) =>
      replay(upstream, status).topicDetailEventHot(
        topicDetailEventHotMissingActid.query,
      ),
  },
  {
    name: 'topic_detail',
    status: 404,
    recording: topicDetailUnknown,
    call: (upstream, status) =>
      replay(upstream, status).topicDetail(topicDetailUnknown.query),
  },
  {
    name: 'topic_detail_event_hot',
    status: 404,
    recording: topicDetailEventHotUnknown,
    call: (upstream, status) =>
      replay(upstream, status).topicDetailEventHot(
        topicDetailEventHotUnknown.query,
      ),
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
      status: entry.status,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('hot_topic rejects a body without the hot list', async () => {
  const upstream = structuredClone(hotTopic.response.body) as { hot?: unknown };
  delete upstream.hot;

  await expectUpstreamShapeRejection(
    replay(upstream).hotTopic(hotTopic.query),
    {
      module: 'hot_topic',
      path: 'body.hot',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('topic_detail rejects a body without the act', async () => {
  const upstream = structuredClone(topicDetail.response.body) as {
    act?: unknown;
  };
  delete upstream.act;

  await expectUpstreamShapeRejection(
    replay(upstream).topicDetail(topicDetail.query),
    {
      module: 'topic_detail',
      path: 'body.act',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('topic_detail_event_hot rejects a body without the event list', async () => {
  const upstream = structuredClone(topicDetailEventHot.response.body) as {
    events?: unknown;
  };
  delete upstream.events;

  await expectUpstreamShapeRejection(
    replay(upstream).topicDetailEventHot(topicDetailEventHot.query),
    {
      module: 'topic_detail_event_hot',
      path: 'body.events',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dynamic and topic bodies type their tightened records', () => {
  expectTypeOf<EventBody['event'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<EventBody['event'][number]['type']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<EventBody['lasttime']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<HotTopicBody['hot'][number]['actId']>().toEqualTypeOf<number>();
  expectTypeOf<HotTopicBody['hot'][number]['title']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    TopicSublistBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<TopicSublistBody['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<TopicDetailBody['act']['actId']>().toEqualTypeOf<number>();
  expectTypeOf<TopicDetailBody['needBeginNotify']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    TopicDetailEventHotBody['events'][number]['id']
  >().toEqualTypeOf<number>();
});

test('event rejects a body without the event list', async () => {
  const upstream = structuredClone(event.response.body) as { event?: unknown };
  delete upstream.event;

  await expectUpstreamShapeRejection(replay(upstream).event(event.query), {
    module: 'event',
    path: 'body.event',
    expected: 'present',
    actual: 'missing',
  });
});

test('event rejects an event whose id is text', async () => {
  const upstream = structuredClone(event.response.body) as {
    event: Array<{ id: unknown }>;
  };
  upstream.event[0]!.id = '37982331004';

  await expectUpstreamShapeRejection(replay(upstream).event(event.query), {
    module: 'event',
    path: 'body.event[0].id',
    expected: 'number',
    actual: 'string',
  });
});

test('hot_topic rejects a hot list that is not an array', async () => {
  const upstream = structuredClone(hotTopic.response.body) as {
    hot: unknown;
  };
  upstream.hot = null;

  await expectUpstreamShapeRejection(
    replay(upstream).hotTopic(hotTopic.query),
    {
      module: 'hot_topic',
      path: 'body.hot',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('hot_topic rejects a topic whose actId is text', async () => {
  const upstream = structuredClone(hotTopic.response.body) as {
    hot: Array<{ actId: unknown }>;
  };
  upstream.hot[0]!.actId = '115842105';

  await expectUpstreamShapeRejection(
    replay(upstream).hotTopic(hotTopic.query),
    {
      module: 'hot_topic',
      path: 'body.hot[0].actId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('topic_sublist rejects a body without the list', async () => {
  const upstream = structuredClone(topicSublist.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).topicSublist(topicSublist.query),
    {
      module: 'topic_sublist',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('topic_sublist rejects a topic whose id is text', async () => {
  const upstream = structuredClone(topicSublist.response.body) as {
    data: Array<{ id: unknown }>;
  };
  upstream.data[0]!.id = '18704053';

  await expectUpstreamShapeRejection(
    replay(upstream).topicSublist(topicSublist.query),
    {
      module: 'topic_sublist',
      path: 'body.data[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('topic_detail rejects a null act', async () => {
  const upstream = structuredClone(topicDetail.response.body) as {
    act: unknown;
  };
  upstream.act = null;

  await expectUpstreamShapeRejection(
    replay(upstream).topicDetail(topicDetail.query),
    {
      module: 'topic_detail',
      path: 'body.act',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('topic_detail rejects an act whose actId is text', async () => {
  const upstream = structuredClone(topicDetail.response.body);
  (upstream.act as { actId: unknown }).actId = '115842105';

  await expectUpstreamShapeRejection(
    replay(upstream).topicDetail(topicDetail.query),
    {
      module: 'topic_detail',
      path: 'body.act.actId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('topic_detail_event_hot rejects a null event list', async () => {
  const upstream = structuredClone(topicDetailEventHot.response.body) as {
    events: unknown;
  };
  upstream.events = null;

  await expectUpstreamShapeRejection(
    replay(upstream).topicDetailEventHot(topicDetailEventHot.query),
    {
      module: 'topic_detail_event_hot',
      path: 'body.events',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('topic_detail_event_hot rejects an event whose id is text', async () => {
  const upstream = structuredClone(topicDetailEventHot.response.body);
  (upstream.events[0] as { id: unknown }).id = '21510856830';

  await expectUpstreamShapeRejection(
    replay(upstream).topicDetailEventHot(topicDetailEventHot.query),
    {
      module: 'topic_detail_event_hot',
      path: 'body.events[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('event drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(event.response.body) as {
    event: Array<Record<string, unknown> & { info: unknown }>;
  };
  upstream.event[0]!.type = '18';
  upstream.event[0]!.typeDesc = 18;
  upstream.event[0]!.info = 'info';
  upstream.event[1]!.extra = { from: 'upstream' };

  const result = await replay(upstream).event(event.query);

  expect(result.body.event[0] as unknown).not.toHaveProperty('type');
  expect(result.body.event[0] as unknown).not.toHaveProperty('typeDesc');
  expect(result.body.event[0] as unknown).not.toHaveProperty('info');
  expect(result.body.event[1]).toHaveProperty('extra', {
    from: 'upstream',
  });
  expect(result.body.event[1]!.id).toBe(event.response.body.event[1]!.id);
});

test('hot_topic drops a bad title and keeps null and undeclared fields', async () => {
  const upstream = structuredClone(hotTopic.response.body) as {
    hot: Array<Record<string, unknown>>;
  };
  upstream.hot[0]!.title = 42;
  upstream.hot[0]!.participateCount = '8218';
  upstream.hot[0]!.isDefaultImg = null;
  upstream.hot[0]!.extra = { from: 'upstream' };

  const result = await replay(upstream).hotTopic(hotTopic.query);
  const first = result.body.hot[0] as unknown as Record<string, unknown>;

  expect(first).not.toHaveProperty('title');
  expect(first).not.toHaveProperty('participateCount');
  expect(first.isDefaultImg).toBeNull();
  expect(first).toHaveProperty('extra', { from: 'upstream' });
  expect(first.actId).toBe(hotTopic.response.body.hot[0]!.actId);
});

test('topic_sublist drops bad counters and keeps undeclared ones', async () => {
  const upstream = structuredClone(topicSublist.response.body) as {
    count: unknown;
    hasMore: unknown;
    data: Array<Record<string, unknown>>;
  };
  upstream.count = '1';
  upstream.hasMore = null;
  upstream.data[0]!.readCount = '521404';
  upstream.data[0]!.extra = { from: 'upstream' };

  const result = await replay(upstream).topicSublist(topicSublist.query);
  const first = result.body.data[0] as unknown as Record<string, unknown>;

  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body.hasMore).toBeNull();
  expect(first).not.toHaveProperty('readCount');
  expect(first).toHaveProperty('extra', { from: 'upstream' });
  expect(first.id).toBe(topicSublist.response.body.data[0]!.id);
});

test('topic_detail drops a bad title and keeps undeclared fields', async () => {
  const upstream = structuredClone(topicDetail.response.body) as {
    needBeginNotify: unknown;
    act: Record<string, unknown>;
  };
  upstream.needBeginNotify = 'false';
  upstream.act.title = 42;
  upstream.act.commodityInfo = { price: 1 };

  const result = await replay(upstream).topicDetail(topicDetail.query);
  const act = result.body.act as unknown as Record<string, unknown>;

  expect(result.body as unknown).not.toHaveProperty('needBeginNotify');
  expect(act).not.toHaveProperty('title');
  expect(act).toHaveProperty('commodityInfo', { price: 1 });
  expect(act.actId).toBe(topicDetail.response.body.act.actId);
});

test('topic_detail_event_hot drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(topicDetailEventHot.response.body) as {
    events: Array<Record<string, unknown>>;
  };
  upstream.events[0]!.type = '18';
  upstream.events[1]!.extra = { from: 'upstream' };

  const result = await replay(upstream).topicDetailEventHot(
    topicDetailEventHot.query,
  );

  expect(result.body.events[0] as unknown).not.toHaveProperty('type');
  expect(result.body.events[1]).toHaveProperty('extra', {
    from: 'upstream',
  });
  expect(result.body.events[1]!.id).toBe(
    topicDetailEventHot.response.body.events[1]!.id,
  );
});

test('hot_topic and topic_detail_event_hot accept empty lists', async () => {
  const hot = await replay({ code: 200, hot: [] }).hotTopic({});
  expect(hot.body).toEqual({ code: 200, hot: [] });

  const events = await replay({ code: 200, events: [] }).topicDetailEventHot({
    actid: 115842105,
  });
  expect(events.body).toEqual({ code: 200, events: [] });
});

test('event rejects a non-object input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json(event.response.body);
    },
  });

  const outcome = await settle(api.event(null as never));

  expect(outcome).toHaveProperty('rejected.status', 400);
  expect(outcome).toHaveProperty('rejected.body.code', 400);
  expect(upstreamCalls).toBe(0);
});
