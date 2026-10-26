import { expect, expectTypeOf, test } from 'bun:test';

import {
  CalendarBody,
  createHanaMusicApi,
  InnerVersionBody,
  StylePreferenceBody,
  UserSocialStatusRcmdBody,
  UserSocialStatusSupportBody,
} from '../../index.ts';
import { SERVICE_VERSION } from '../../src/core/service-metadata.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import calendarAnonymous from '../fixtures/netease/recommend/calendar.anonymous.json';
import calendar from '../fixtures/netease/recommend/calendar.default.json';
import calendarEmpty from '../fixtures/netease/recommend/calendar.empty.json';
import stylePreferenceAnonymous from '../fixtures/netease/style/style_preference.anonymous.json';
import stylePreference from '../fixtures/netease/style/style_preference.default.json';
import userSocialStatusRcmdAnonymous from '../fixtures/netease/user/user_social_status_rcmd.anonymous.json';
import userSocialStatusRcmd from '../fixtures/netease/user/user_social_status_rcmd.default.json';
import userSocialStatusRcmdEmpty from '../fixtures/netease/user/user_social_status_rcmd.empty.json';
import userSocialStatusSupportAnonymous from '../fixtures/netease/user/user_social_status_support.anonymous.json';
import userSocialStatusSupport from '../fixtures/netease/user/user_social_status_support.default.json';

// issue #102 B46 的录制：日历、曲风偏好和社交状态读取。录制前用同一 Cookie 调 login_status
// 确认 account.anonimousUser 为 false；style_preference 的匿名录制只作空结果证据。
// user_social_status_rcmd 先录无状态空结果，再用 user_social_status_edit 设置 LISTENING；
// event_del 删同一状态 id 未生效，实际用 status/edit 的外层空 content 清空并回读确认。
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
    name: 'calendar',
    recording: calendar,
    bodySchema: CalendarBody,
    call: (upstream, status) =>
      replay(upstream, status).calendar(calendar.query),
  },
  {
    name: 'calendar without events',
    recording: calendarEmpty,
    bodySchema: CalendarBody,
    call: (upstream, status) =>
      replay(upstream, status).calendar(calendarEmpty.query),
  },
  {
    name: 'calendar for an anonymous listener',
    recording: calendarAnonymous,
    bodySchema: CalendarBody,
    call: (upstream, status) =>
      replay(upstream, status).calendar(calendarAnonymous.query),
  },
  {
    name: 'style_preference',
    recording: stylePreference,
    bodySchema: StylePreferenceBody,
    call: (upstream, status) =>
      replay(upstream, status).stylePreference(stylePreference.query),
  },
  {
    name: 'style_preference for an anonymous listener',
    recording: stylePreferenceAnonymous,
    bodySchema: StylePreferenceBody,
    call: (upstream, status) =>
      replay(upstream, status).stylePreference(stylePreferenceAnonymous.query),
  },
  {
    name: 'user_social_status_support',
    recording: userSocialStatusSupport,
    bodySchema: UserSocialStatusSupportBody,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatusSupport(
        userSocialStatusSupport.query,
      ),
  },
  {
    name: 'user_social_status_rcmd',
    recording: userSocialStatusRcmd,
    bodySchema: UserSocialStatusRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatusRcmd(userSocialStatusRcmd.query),
  },
  {
    name: 'user_social_status_rcmd without a status',
    recording: userSocialStatusRcmdEmpty,
    bodySchema: UserSocialStatusRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatusRcmd(
        userSocialStatusRcmdEmpty.query,
      ),
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
    name: 'user_social_status_rcmd',
    recording: userSocialStatusRcmdAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatusRcmd(
        userSocialStatusRcmdAnonymous.query,
      ),
  },
  {
    name: 'user_social_status_support',
    recording: userSocialStatusSupportAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatusSupport(
        userSocialStatusSupportAnonymous.query,
      ),
  },
])('$name rejects an anonymous 302 business code', async (entry) => {
  expect(
    await settle(
      entry.call(
        entry.recording.response.body,
        entry.recording.response.status,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 302,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('inner_version returns the constructed version body without upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const result = await api.innerVersion();

  expect(result).toEqual({
    status: 200,
    cookie: [],
    body: { code: 200, data: { version: SERVICE_VERSION } },
  });
  const validated = validateSync(InnerVersionBody, result.body);
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(result.body);
  expect(upstreamCalls).toBe(0);
});

test('misc read bodies type tightened records and loose fields', () => {
  expectTypeOf<
    CalendarBody['data']['calendarEvents'][number]['id']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    CalendarBody['data']['calendarEvents'][number]['title']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<InnerVersionBody['data']['version']>().toEqualTypeOf<string>();
  expectTypeOf<
    StylePreferenceBody['data']['tagPreferenceVos'][number]['tagId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    StylePreferenceBody['data']['tagPreferenceVos'][number]['ratio']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    UserSocialStatusSupportBody['data'][number]['type']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    UserSocialStatusSupportBody['data'][number]['canEdit']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<
    NonNullable<
      UserSocialStatusRcmdBody['data']['userRcmdInfoVOList']
    >[number]['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<UserSocialStatusRcmdBody['data']['userRcmdInfoVOList']>
  >().toExtend<ReadonlyArray<unknown>>();
  expectTypeOf<null>().toExtend<
    UserSocialStatusRcmdBody['data']['userRcmdInfoVOList']
  >();
  expectTypeOf<undefined>().toExtend<
    UserSocialStatusRcmdBody['data']['userRcmdInfoVOList']
  >();
});

test('misc read modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.calendar(null as never),
    () => api.innerVersion(null as never),
    () => api.stylePreference(null as never),
    () => api.userSocialStatusRcmd(null as never),
    () => api.userSocialStatusSupport(null as never),
  ];

  for (const call of calls) {
    expect(await settle(call())).toEqual({
      rejected: {
        status: 400,
        cookie: [],
        body: { code: 400, msg: 'Expected <Declaration>' },
      },
    });
  }
  expect(upstreamCalls).toBe(0);
});

test('calendar rejects a body without calendar events', async () => {
  const upstream = structuredClone(calendar.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.calendarEvents;

  await expectUpstreamShapeRejection(
    replay(upstream).calendar(calendar.query),
    {
      module: 'calendar',
      path: 'body.data.calendarEvents',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('calendar rejects an event with a numeric id', async () => {
  const upstream = structuredClone(calendar.response.body) as {
    data: { calendarEvents: Array<Record<string, unknown>> };
  };
  upstream.data.calendarEvents[0]!.id = 42;

  await expectUpstreamShapeRejection(
    replay(upstream).calendar(calendar.query),
    {
      module: 'calendar',
      path: 'body.data.calendarEvents[0].id',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('calendar drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(calendar.response.body) as {
    data: {
      abtest: unknown;
      calendarConfig: unknown;
      calendarEvents: Array<Record<string, unknown>>;
    };
  };
  upstream.data.calendarEvents[0]!.title = 42;
  upstream.data.calendarEvents[0]!.tag = null;
  upstream.data.calendarEvents[0]!.extInfo = { kind: 'trailer' };
  upstream.data.calendarConfig = 'none';
  upstream.data.abtest = { bucket: 1 };

  const result = await replay(upstream).calendar(calendar.query);
  const first = result.body.data.calendarEvents[0]!;

  expect(first as unknown).not.toHaveProperty('title');
  expect(first.tag as unknown).toBeNull();
  expect(first as unknown).toHaveProperty('extInfo', { kind: 'trailer' });
  expect(result.body.data as unknown).not.toHaveProperty('calendarConfig');
  expect(result.body.data as unknown).toHaveProperty('abtest', { bucket: 1 });
});

test('calendar accepts missing loose fields', async () => {
  const upstream = structuredClone(calendar.response.body) as {
    data: {
      calendarConfig?: unknown;
      calendarEvents: Array<Record<string, unknown>>;
    };
  };
  delete upstream.data.calendarConfig;
  delete upstream.data.calendarEvents[0]!.title;

  const result = await replay(upstream).calendar(calendar.query);

  expect(result.body.data as unknown).not.toHaveProperty('calendarConfig');
  expect(result.body.data.calendarEvents[0] as unknown).not.toHaveProperty(
    'title',
  );
});

test('style_preference rejects a body without preferences', async () => {
  const upstream = structuredClone(stylePreference.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.tagPreferenceVos;

  await expectUpstreamShapeRejection(
    replay(upstream).stylePreference(stylePreference.query),
    {
      module: 'style_preference',
      path: 'body.data.tagPreferenceVos',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('style_preference rejects a preference with a string tagId', async () => {
  const upstream = structuredClone(stylePreference.response.body) as {
    data: { tagPreferenceVos: Array<Record<string, unknown>> };
  };
  upstream.data.tagPreferenceVos[0]!.tagId = '1252';

  await expectUpstreamShapeRejection(
    replay(upstream).stylePreference(stylePreference.query),
    {
      module: 'style_preference',
      path: 'body.data.tagPreferenceVos[0].tagId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('style_preference accepts missing loose fields', async () => {
  const upstream = structuredClone(stylePreference.response.body) as {
    data: {
      tags?: unknown;
      tagPreferenceVos: Array<Record<string, unknown>>;
    };
  };
  delete upstream.data.tags;
  delete upstream.data.tagPreferenceVos[0]!.ratio;

  const result = await replay(upstream).stylePreference(stylePreference.query);

  expect(result.body.data as unknown).not.toHaveProperty('tags');
  expect(result.body.data.tagPreferenceVos[0] as unknown).not.toHaveProperty(
    'ratio',
  );
});

test('style_preference drops a bad tag tree and keeps undeclared fields', async () => {
  const upstream = structuredClone(stylePreference.response.body) as {
    data: { tags: unknown } & Record<string, unknown>;
  };
  upstream.data.tags = 'none';
  upstream.data.extraTags = [{ tagId: 1 }];

  const result = await replay(upstream).stylePreference(stylePreference.query);

  expect(result.body.data as unknown).not.toHaveProperty('tags');
  expect(result.body.data as unknown).toHaveProperty('extraTags', [
    { tagId: 1 },
  ]);
});

test('style_preference drops a bad nested tag field', async () => {
  const upstream = structuredClone(stylePreference.response.body) as {
    data: {
      tags: Array<
        Record<string, unknown> & {
          childrenTags: Array<Record<string, unknown>>;
        }
      >;
    };
  };
  upstream.data.tags[0]!.childrenTags[0]!.enName = 42;

  const result = await replay(upstream).stylePreference(stylePreference.query);
  const child = result.body.data.tags![0]!.childrenTags![0]!;

  expect(child as unknown).not.toHaveProperty('enName');
  expect(child.tagId).toBe(
    stylePreference.response.body.data.tags[0]!.childrenTags[0]!.tagId,
  );
});

test('user_social_status_support rejects a body without the status list', async () => {
  const upstream = structuredClone(userSocialStatusSupport.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).userSocialStatusSupport(userSocialStatusSupport.query),
    {
      module: 'user_social_status_support',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_social_status_support rejects a status without a type', async () => {
  const upstream = structuredClone(userSocialStatusSupport.response.body) as {
    data: Array<Record<string, unknown>>;
  };
  delete upstream.data[0]!.type;

  await expectUpstreamShapeRejection(
    replay(upstream).userSocialStatusSupport(userSocialStatusSupport.query),
    {
      module: 'user_social_status_support',
      path: 'body.data[0].type',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_social_status_support accepts missing loose fields', async () => {
  const upstream = structuredClone(userSocialStatusSupport.response.body) as {
    data: Array<Record<string, unknown>>;
  };
  delete upstream.data[0]!.canEdit;
  delete upstream.data[0]!.iconUrl;

  const result = await replay(upstream).userSocialStatusSupport(
    userSocialStatusSupport.query,
  );

  expect(result.body.data[0] as unknown).not.toHaveProperty('canEdit');
  expect(result.body.data[0] as unknown).not.toHaveProperty('iconUrl');
});

test('user_social_status_support drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(userSocialStatusSupport.response.body) as {
    data: Array<Record<string, unknown>>;
  };
  upstream.data[0]!.canEdit = 'no';
  upstream.data[0]!.actionUrl = null;
  upstream.data[0]!.extra = 'kept';

  const result = await replay(upstream).userSocialStatusSupport(
    userSocialStatusSupport.query,
  );
  const first = result.body.data[0]!;

  expect(first as unknown).not.toHaveProperty('canEdit');
  expect(first.actionUrl as unknown).toBeNull();
  expect(first as unknown).toHaveProperty('extra', 'kept');
});

test('user_social_status_rcmd accepts a missing user list', async () => {
  const upstream = structuredClone(userSocialStatusRcmd.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.userRcmdInfoVOList;

  const result = await replay(upstream).userSocialStatusRcmd(
    userSocialStatusRcmd.query,
  );

  expect(result.body as unknown).toEqual(upstream);
  expect(result.body.data as unknown).not.toHaveProperty('userRcmdInfoVOList');
});

test('user_social_status_rcmd returns a null user list unchanged', async () => {
  const upstream = structuredClone(userSocialStatusRcmd.response.body) as {
    data: { userRcmdInfoVOList: unknown };
  };
  upstream.data.userRcmdInfoVOList = null;

  const result = await replay(upstream).userSocialStatusRcmd(
    userSocialStatusRcmd.query,
  );

  expect(result.body.data.userRcmdInfoVOList as unknown).toBeNull();
});

test('user_social_status_rcmd rejects a user without a userId', async () => {
  const upstream = structuredClone(userSocialStatusRcmd.response.body) as {
    data: { userRcmdInfoVOList: Array<Record<string, unknown>> };
  };
  delete upstream.data.userRcmdInfoVOList[0]!.userId;

  await expectUpstreamShapeRejection(
    replay(upstream).userSocialStatusRcmd(userSocialStatusRcmd.query),
    {
      module: 'user_social_status_rcmd',
      path: 'body.data.userRcmdInfoVOList[0].userId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_social_status_rcmd rejects a non-object user in the list', async () => {
  const upstream = structuredClone(userSocialStatusRcmd.response.body) as {
    data: { userRcmdInfoVOList: Array<unknown> };
  };
  upstream.data.userRcmdInfoVOList = [null];

  await expectUpstreamShapeRejection(
    replay(upstream).userSocialStatusRcmd(userSocialStatusRcmd.query),
    {
      module: 'user_social_status_rcmd',
      path: 'body.data.userRcmdInfoVOList[0]',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('user_social_status_rcmd drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(userSocialStatusRcmd.response.body) as {
    data: Record<string, unknown> & {
      statusContentDTO: unknown;
      userRcmdInfoVOList: Array<Record<string, unknown>>;
    };
  };
  upstream.data.statusContentDTO = 'none';
  upstream.data.extraField = 'kept';
  const user = upstream.data.userRcmdInfoVOList[0]!;
  user.nickName = 42;
  user.statusContentDTO = { type: 'LISTENING', content: null };
  user.identityInfoDTO = 'none';
  user.rcmdWords = { unexpected: true };
  user.tagRcmdVOList = [{ name: '内蒙古 赤峰', match: false, id: 9 }];

  const result = await replay(upstream).userSocialStatusRcmd(
    userSocialStatusRcmd.query,
  );
  const first = result.body.data.userRcmdInfoVOList![0]!;

  expect(result.body.data as unknown).not.toHaveProperty('statusContentDTO');
  expect(result.body.data as unknown).toHaveProperty('extraField', 'kept');
  expect(first as unknown).not.toHaveProperty('nickName');
  expect(first.statusContentDTO?.content as unknown).toBeNull();
  expect(first as unknown).not.toHaveProperty('identityInfoDTO');
  expect(first as unknown).toHaveProperty('rcmdWords', {
    unexpected: true,
  });
  expect(first.tagRcmdVOList?.[0] as unknown).toHaveProperty('id', 9);
});
