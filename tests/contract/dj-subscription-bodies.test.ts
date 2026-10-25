import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  DjRadioTopBody,
  DjSublistBody,
  DjSubscriberBody,
  DjToplistBody,
  DjToplistHoursBody,
  DjToplistNewcomerBody,
  DjToplistPayBody,
  DjToplistPopularBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import djSublistAnonymous from '../fixtures/netease/dj/dj_sublist.anonymous.json';
import djSublist from '../fixtures/netease/dj/dj_sublist.default.json';
import djSublistInvalidLimit from '../fixtures/netease/dj/dj_sublist.invalid-limit.json';
import djSubscriberAnonymous from '../fixtures/netease/dj/dj_subscriber.anonymous.json';
import djSubscriber from '../fixtures/netease/dj/dj_subscriber.default.json';
import djSubscriberEmpty from '../fixtures/netease/dj/dj_subscriber.empty.json';
import djSubscriberMissingId from '../fixtures/netease/dj/dj_subscriber.missing-id.json';
import djToplistAnonymous from '../fixtures/netease/dj/dj_toplist.anonymous.json';
import djToplistEmpty from '../fixtures/netease/dj/dj_toplist.empty.json';
import djToplistHot from '../fixtures/netease/dj/dj_toplist.hot.json';
import djToplistInvalidLimit from '../fixtures/netease/dj/dj_toplist.invalid-limit.json';
import djToplist from '../fixtures/netease/dj/dj_toplist.new.json';
import djToplistHoursAnonymous from '../fixtures/netease/dj/dj_toplist_hours.anonymous.json';
import djToplistHours from '../fixtures/netease/dj/dj_toplist_hours.default.json';
import djToplistHoursInvalidLimit from '../fixtures/netease/dj/dj_toplist_hours.invalid-limit.json';
import djToplistNewcomerAnonymous from '../fixtures/netease/dj/dj_toplist_newcomer.anonymous.json';
import djToplistNewcomer from '../fixtures/netease/dj/dj_toplist_newcomer.default.json';
import djToplistNewcomerInvalidLimit from '../fixtures/netease/dj/dj_toplist_newcomer.invalid-limit.json';
import djToplistPayAnonymous from '../fixtures/netease/dj/dj_toplist_pay.anonymous.json';
import djToplistPay from '../fixtures/netease/dj/dj_toplist_pay.default.json';
import djToplistPayInvalidLimit from '../fixtures/netease/dj/dj_toplist_pay.invalid-limit.json';
import djToplistPopularAnonymous from '../fixtures/netease/dj/dj_toplist_popular.anonymous.json';
import djToplistPopular from '../fixtures/netease/dj/dj_toplist_popular.default.json';
import djToplistPopularInvalidLimit from '../fixtures/netease/dj/dj_toplist_popular.invalid-limit.json';
import djRadioTopAnonymous from '../fixtures/netease/dj/djRadio_top.anonymous.json';
import djRadioTop from '../fixtures/netease/dj/djRadio_top.default.json';
import djRadioTopInvalidParam from '../fixtures/netease/dj/djRadio_top.invalid-param.json';

// issue #102 B13 的录制：登录状态先用 login_status 确认 `account.anonimousUser: false`。榜单和订阅列表都
// 带 Cookie 录制，并保留同一请求的匿名对照；订阅列表必须登录才能看到订阅，匿名返回空列表。所有录制都
// 保留完整列表，没有截取。djRadio_top 在本账号的一次登录录制里只返回空 `data`，没有非空元素证据；
// 匿名返回 `code: 302`。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

// 上游对 djRadio_top 的非法参数返回 HTTP 400 和空正文，不能用 Response.json 回放。
const replayText = (body: string, status: number) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => new Response(body, { status }),
  });

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
    name: 'djRadio_top',
    recording: djRadioTop,
    bodySchema: DjRadioTopBody,
    call: (upstream, status) =>
      replay(upstream, status).djRadioTop(djRadioTop.query),
  },
  {
    name: 'dj_toplist',
    recording: djToplist,
    bodySchema: DjToplistBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplist(djToplist.query),
  },
  {
    name: 'dj_toplist for the hot chart',
    recording: djToplistHot,
    bodySchema: DjToplistBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplist(djToplistHot.query),
  },
  {
    name: 'dj_toplist past the last page',
    recording: djToplistEmpty,
    bodySchema: DjToplistBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplist(djToplistEmpty.query),
  },
  {
    name: 'dj_toplist anonymously',
    recording: djToplistAnonymous,
    bodySchema: DjToplistBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplist(djToplistAnonymous.query),
  },
  {
    name: 'dj_sublist',
    recording: djSublist,
    bodySchema: DjSublistBody,
    call: (upstream, status) =>
      replay(upstream, status).djSublist(djSublist.query),
  },
  {
    name: 'dj_sublist anonymously',
    recording: djSublistAnonymous,
    bodySchema: DjSublistBody,
    call: (upstream, status) =>
      replay(upstream, status).djSublist(djSublistAnonymous.query),
  },
  {
    name: 'dj_subscriber',
    recording: djSubscriber,
    bodySchema: DjSubscriberBody,
    call: (upstream, status) =>
      replay(upstream, status).djSubscriber(djSubscriber.query),
  },
  {
    name: 'dj_subscriber past the last subscriber',
    recording: djSubscriberEmpty,
    bodySchema: DjSubscriberBody,
    call: (upstream, status) =>
      replay(upstream, status).djSubscriber(djSubscriberEmpty.query),
  },
  {
    name: 'dj_subscriber anonymously',
    recording: djSubscriberAnonymous,
    bodySchema: DjSubscriberBody,
    call: (upstream, status) =>
      replay(upstream, status).djSubscriber(djSubscriberAnonymous.query),
  },
  {
    name: 'dj_toplist_hours',
    recording: djToplistHours,
    bodySchema: DjToplistHoursBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistHours(djToplistHours.query),
  },
  {
    name: 'dj_toplist_hours anonymously',
    recording: djToplistHoursAnonymous,
    bodySchema: DjToplistHoursBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistHours(djToplistHoursAnonymous.query),
  },
  {
    name: 'dj_toplist_newcomer',
    recording: djToplistNewcomer,
    bodySchema: DjToplistNewcomerBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistNewcomer(djToplistNewcomer.query),
  },
  {
    name: 'dj_toplist_newcomer anonymously',
    recording: djToplistNewcomerAnonymous,
    bodySchema: DjToplistNewcomerBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistNewcomer(
        djToplistNewcomerAnonymous.query,
      ),
  },
  {
    name: 'dj_toplist_pay',
    recording: djToplistPay,
    bodySchema: DjToplistPayBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistPay(djToplistPay.query),
  },
  {
    name: 'dj_toplist_pay anonymously',
    recording: djToplistPayAnonymous,
    bodySchema: DjToplistPayBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistPay(djToplistPayAnonymous.query),
  },
  {
    name: 'dj_toplist_popular',
    recording: djToplistPopular,
    bodySchema: DjToplistPopularBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistPopular(djToplistPopular.query),
  },
  {
    name: 'dj_toplist_popular anonymously',
    recording: djToplistPopularAnonymous,
    bodySchema: DjToplistPopularBody,
    call: (upstream, status) =>
      replay(upstream, status).djToplistPopular(
        djToplistPopularAnonymous.query,
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
    name: 'dj_toplist with a non-numeric limit',
    status: 400,
    recording: djToplistInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djToplist(djToplistInvalidLimit.query),
  },
  {
    name: 'dj_sublist with a non-numeric limit',
    status: 400,
    recording: djSublistInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djSublist(djSublistInvalidLimit.query),
  },
  {
    name: 'dj_subscriber without an id',
    status: 400,
    recording: djSubscriberMissingId,
    call: (upstream, status) =>
      replay(upstream, status).djSubscriber(djSubscriberMissingId.query),
  },
  {
    name: 'dj_toplist_hours with a non-numeric limit',
    status: 400,
    recording: djToplistHoursInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djToplistHours(djToplistHoursInvalidLimit.query),
  },
  {
    name: 'dj_toplist_newcomer with a non-numeric limit',
    status: 400,
    recording: djToplistNewcomerInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djToplistNewcomer(
        djToplistNewcomerInvalidLimit.query,
      ),
  },
  {
    name: 'dj_toplist_pay with a non-numeric limit',
    status: 400,
    recording: djToplistPayInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djToplistPay(djToplistPayInvalidLimit.query),
  },
  {
    name: 'dj_toplist_popular with a non-numeric limit',
    status: 400,
    recording: djToplistPopularInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djToplistPopular(
        djToplistPopularInvalidLimit.query,
      ),
  },
  {
    name: 'djRadio_top anonymously',
    status: 302,
    recording: djRadioTopAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).djRadioTop(djRadioTopAnonymous.query),
  },
])('$name is rejected with the upstream status', async (entry) => {
  expect(await settle(entry.call(entry.recording.response.body, 200))).toEqual({
    rejected: {
      status: entry.status,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('djRadio_top returns the empty body for a non-numeric id', async () => {
  // 网易云把 HTTP 400 归一成 status 200，正文是空字符串；这是空字符串分支，模块原样返回。
  const result = await settle<unknown>(
    replayText(
      djRadioTopInvalidParam.response.body,
      djRadioTopInvalidParam.response.status,
    ).djRadioTop(djRadioTopInvalidParam.query),
  );
  expect(result).toEqual({
    resolved: {
      status: 200,
      cookie: [],
      body: djRadioTopInvalidParam.response.body,
    },
  });
});

test('dj_toplist rejects a body without the chart list', async () => {
  const upstream = structuredClone(djToplist.response.body) as {
    toplist?: unknown;
  };
  delete upstream.toplist;

  await expectUpstreamShapeRejection(
    replay(upstream).djToplist(djToplist.query),
    {
      module: 'dj_toplist',
      path: 'body.toplist',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_toplist rejects a radio whose id is text', async () => {
  const upstream = structuredClone(djToplist.response.body);
  (upstream.toplist[0] as { id: unknown }).id = '972022490';

  await expectUpstreamShapeRejection(
    replay(upstream).djToplist(djToplist.query),
    {
      module: 'dj_toplist',
      path: 'body.toplist[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_sublist rejects a body without the subscription list', async () => {
  const upstream = structuredClone(djSublist.response.body) as {
    djRadios?: unknown;
  };
  delete upstream.djRadios;

  await expectUpstreamShapeRejection(
    replay(upstream).djSublist(djSublist.query),
    {
      module: 'dj_sublist',
      path: 'body.djRadios',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_sublist rejects a radio without an id', async () => {
  const upstream = structuredClone(djSublist.response.body);
  delete (upstream.djRadios[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djSublist(djSublist.query),
    {
      module: 'dj_sublist',
      path: 'body.djRadios[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_subscriber rejects a body without the subscriber list', async () => {
  const upstream = structuredClone(djSubscriber.response.body) as {
    subscribers?: unknown;
  };
  delete upstream.subscribers;

  await expectUpstreamShapeRejection(
    replay(upstream).djSubscriber(djSubscriber.query),
    {
      module: 'dj_subscriber',
      path: 'body.subscribers',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_subscriber rejects a subscriber whose userId is text', async () => {
  const upstream = structuredClone(djSubscriber.response.body);
  (upstream.subscribers[0] as { userId: unknown }).userId = '1317158371';

  await expectUpstreamShapeRejection(
    replay(upstream).djSubscriber(djSubscriber.query),
    {
      module: 'dj_subscriber',
      path: 'body.subscribers[0].userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_toplist_hours rejects a body without list data', async () => {
  const upstream = structuredClone(djToplistHours.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistHours(djToplistHours.query),
    {
      module: 'dj_toplist_hours',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_toplist_hours rejects an anchor whose id is text', async () => {
  const upstream = structuredClone(djToplistHours.response.body);
  (upstream.data.list[0] as { id: unknown }).id = '256233487';

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistHours(djToplistHours.query),
    {
      module: 'dj_toplist_hours',
      path: 'body.data.list[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_toplist_newcomer rejects a body without the anchor list', async () => {
  const upstream = structuredClone(
    djToplistNewcomer.response.body,
  ) as unknown as { data: { list?: unknown } };
  delete upstream.data.list;

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistNewcomer(djToplistNewcomer.query),
    {
      module: 'dj_toplist_newcomer',
      path: 'body.data.list',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_toplist_newcomer rejects an anchor whose id is text', async () => {
  const upstream = structuredClone(djToplistNewcomer.response.body);
  (upstream.data.list[0] as { id: unknown }).id = '1450663604';

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistNewcomer(djToplistNewcomer.query),
    {
      module: 'dj_toplist_newcomer',
      path: 'body.data.list[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_toplist_pay rejects a body without the paid list', async () => {
  const upstream = structuredClone(djToplistPay.response.body) as unknown as {
    data: { list?: unknown };
  };
  delete upstream.data.list;

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistPay(djToplistPay.query),
    {
      module: 'dj_toplist_pay',
      path: 'body.data.list',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_toplist_pay rejects a radio without an id', async () => {
  const upstream = structuredClone(djToplistPay.response.body);
  delete (upstream.data.list[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistPay(djToplistPay.query),
    {
      module: 'dj_toplist_pay',
      path: 'body.data.list[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_toplist_popular rejects a missing anchor list', async () => {
  const upstream = structuredClone(
    djToplistPopular.response.body,
  ) as unknown as { data: { list?: unknown } };
  delete upstream.data.list;

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistPopular(djToplistPopular.query),
    {
      module: 'dj_toplist_popular',
      path: 'body.data.list',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_toplist_popular rejects an anchor whose id is text', async () => {
  const upstream = structuredClone(djToplistPopular.response.body);
  (upstream.data.list[0] as { id: unknown }).id = '5145176140';

  await expectUpstreamShapeRejection(
    replay(upstream).djToplistPopular(djToplistPopular.query),
    {
      module: 'dj_toplist_popular',
      path: 'body.data.list[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('djRadio_top rejects a body without a return code', async () => {
  const upstream = structuredClone(djRadioTop.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).djRadioTop(djRadioTop.query),
    {
      module: 'djRadio_top',
      path: 'body',
      expected: 'object with code 200 or an empty string',
      actual: 'object',
    },
  );
});

test('dj_toplist drops a bad radio field and keeps undeclared ones', async () => {
  const upstream = structuredClone(djToplist.response.body) as unknown as {
    toplist: Array<Record<string, unknown>>;
    updateTime?: unknown;
  };
  delete upstream.updateTime;
  upstream.toplist[0]!.name = 42;
  upstream.toplist[0]!.dj = 'none';
  upstream.toplist[0]!.rank = null;
  upstream.toplist[0]!.customSource = 'toplist';

  const result = await replay(upstream).djToplist(djToplist.query);

  expect(result.body as unknown).not.toHaveProperty('updateTime');
  const [radio] = (
    result.body as unknown as { toplist: Array<Record<string, unknown>> }
  ).toplist;
  expect(radio).not.toHaveProperty('name');
  expect(radio).not.toHaveProperty('dj');
  expect(radio).toHaveProperty('rank', null);
  expect(radio).toHaveProperty('customSource', 'toplist');
  expect(radio!.id).toBe(djToplist.response.body.toplist[0]!.id);
});

test('dj_sublist drops a bad radio field and keeps undeclared ones', async () => {
  const upstream = structuredClone(djSublist.response.body) as unknown as {
    count?: unknown;
    djRadios: Array<Record<string, unknown>>;
  };
  delete upstream.count;
  const [radio] = upstream.djRadios;
  radio!.desc = 42;
  radio!.dj = 'none';
  radio!.descPicList = 'none';
  radio!.customSource = 'sublist';

  const result = await replay(upstream).djSublist(djSublist.query);

  expect(result.body as unknown).not.toHaveProperty('count');
  const [tightened] = (
    result.body as unknown as {
      djRadios: Array<Record<string, unknown>>;
    }
  ).djRadios;
  expect(tightened).not.toHaveProperty('desc');
  expect(tightened).not.toHaveProperty('dj');
  expect(tightened).not.toHaveProperty('descPicList');
  expect(tightened).toHaveProperty('customSource', 'sublist');
  expect(tightened!.id).toBe(djSublist.response.body.djRadios[0]!.id);
});

test('dj_subscriber drops bad subscriber fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(djSubscriber.response.body) as unknown as {
    hasMore?: unknown;
    subscribers: Array<Record<string, unknown>>;
  };
  delete upstream.hasMore;
  const [subscriber] = upstream.subscribers;
  subscriber!.nickname = 42;
  subscriber!.subscribeTime = 'yesterday';
  subscriber!.customSource = 'subscriber';

  const result = await replay(upstream).djSubscriber(djSubscriber.query);

  expect(result.body as unknown).not.toHaveProperty('hasMore');
  const [tightened] = (
    result.body as unknown as {
      subscribers: Array<Record<string, unknown>>;
    }
  ).subscribers;
  expect(tightened).not.toHaveProperty('nickname');
  expect(tightened).not.toHaveProperty('subscribeTime');
  expect(tightened).toHaveProperty('customSource', 'subscriber');
  expect(tightened!.userId).toBe(
    djSubscriber.response.body.subscribers[0]!.userId,
  );
});

test('dj_toplist_hours drops bad anchor stats and keeps the anchor', async () => {
  const upstream = structuredClone(djToplistHours.response.body) as unknown as {
    data: Record<string, unknown> & {
      list: Array<Record<string, unknown>>;
    };
  };
  upstream.data.total = '100';
  upstream.data.customSource = 'hours';
  upstream.data.list[0]!.nickName = 42;
  upstream.data.list[0]!.score = '2059477';

  const result = await replay(upstream).djToplistHours(djToplistHours.query);

  const data = (
    result.body as unknown as {
      data: Record<string, unknown> & {
        list: Array<Record<string, unknown>>;
      };
    }
  ).data;
  expect(data).not.toHaveProperty('total');
  expect(data).toHaveProperty('customSource', 'hours');
  expect(result.body as unknown).toHaveProperty('msg', null);
  expect(data.list[0]).not.toHaveProperty('nickName');
  expect(data.list[0]).not.toHaveProperty('score');
  expect(data.list[0]!.id).toBe(djToplistHours.response.body.data.list[0]!.id);
});

test('dj_toplist_newcomer drops bad anchor stats and keeps the anchor', async () => {
  const upstream = structuredClone(
    djToplistNewcomer.response.body,
  ) as unknown as {
    data: { list: Array<Record<string, unknown>> };
  };
  delete upstream.data.list[0]!.mainAuthDesc;
  upstream.data.list[0]!.avatarDetail = 'none';
  upstream.data.list[0]!.roomNo = 'seven';
  upstream.data.list[0]!.customSource = 'newcomer';

  const result = await replay(upstream).djToplistNewcomer(
    djToplistNewcomer.query,
  );

  const [anchor] = (
    result.body as unknown as { data: { list: Array<Record<string, unknown>> } }
  ).data.list;
  expect(anchor).not.toHaveProperty('avatarDetail');
  expect(anchor).not.toHaveProperty('roomNo');
  expect(anchor).not.toHaveProperty('mainAuthDesc');
  expect(anchor).toHaveProperty('customSource', 'newcomer');
  expect(anchor!.id).toBe(djToplistNewcomer.response.body.data.list[0]!.id);
});

test('dj_toplist_pay drops a bad radio name and keeps undeclared ones', async () => {
  const upstream = structuredClone(djToplistPay.response.body) as unknown as {
    data: { list: Array<Record<string, unknown>>; updateTime?: unknown };
  };
  delete upstream.data.updateTime;
  upstream.data.list[0]!.name = 42;
  upstream.data.list[0]!.creatorName = null;
  upstream.data.list[0]!.customSource = 'pay';

  const result = await replay(upstream).djToplistPay(djToplistPay.query);

  const [radio] = (
    result.body as unknown as { data: { list: Array<Record<string, unknown>> } }
  ).data.list;
  expect(radio).not.toHaveProperty('name');
  expect(radio).toHaveProperty('creatorName', null);
  expect(radio).toHaveProperty('customSource', 'pay');
  expect(
    (result.body as unknown as { data: Record<string, unknown> }).data,
  ).not.toHaveProperty('updateTime');
  expect(radio!.id).toBe(djToplistPay.response.body.data.list[0]!.id);
});

test('dj_toplist_popular drops a bad anchor rank and keeps undeclared ones', async () => {
  const upstream = structuredClone(
    djToplistPopular.response.body,
  ) as unknown as {
    data: { list: Array<Record<string, unknown>>; total?: unknown };
  };
  delete upstream.data.total;
  upstream.data.list[0]!.rank = '1';
  upstream.data.list[0]!.customSource = 'popular';

  const result = await replay(upstream).djToplistPopular(
    djToplistPopular.query,
  );

  const [anchor] = (
    result.body as unknown as { data: { list: Array<Record<string, unknown>> } }
  ).data.list;
  expect(anchor).not.toHaveProperty('rank');
  expect(anchor).toHaveProperty('customSource', 'popular');
  expect(
    (result.body as unknown as { data: Record<string, unknown> }).data,
  ).not.toHaveProperty('total');
  expect(anchor!.id).toBe(djToplistPopular.response.body.data.list[0]!.id);
});

test('djRadio_top drops a bad message and keeps undeclared data', async () => {
  const upstream = structuredClone(djRadioTop.response.body) as {
    data?: unknown;
    message?: unknown;
    customSource?: unknown;
  };
  upstream.message = 42;
  upstream.data = [{ id: 1 }];
  upstream.customSource = 'radio-top';

  const result = await replay(upstream).djRadioTop(djRadioTop.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('data', [{ id: 1 }]);
  expect(result.body as unknown).toHaveProperty('customSource', 'radio-top');
  expect((result.body as { code: number }).code).toBe(200);
});

test('subscription bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    DjToplistBody['toplist'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<DjToplistBody['toplist'][number]['name']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    DjSublistBody['djRadios'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<DjSublistBody['djRadios'][number]['desc']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    DjSubscriberBody['subscribers'][number]['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjSubscriberBody['subscribers'][number]['subscribeTime']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    DjToplistHoursBody['data']['list'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjToplistNewcomerBody['data']['list'][number]['rank']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    DjToplistPayBody['data']['list'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjToplistPopularBody['data']['list'][number]['score']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<Extract<DjRadioTopBody, ''>>().toEqualTypeOf<''>();
  expectTypeOf<Exclude<DjRadioTopBody, ''>['code']>().toEqualTypeOf<200>();
  expectTypeOf<Exclude<DjRadioTopBody, ''>['message']>().toEqualTypeOf<
    string | null | undefined
  >();
});
