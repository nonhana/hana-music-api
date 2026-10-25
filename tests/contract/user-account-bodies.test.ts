import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  UserBindingBody,
  UserCloudBody,
  UserCloudDetailBody,
  UserLevelBody,
  UserMedalBody,
  UserSocialStatusBody,
  UserSubcountBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import userBinding from '../fixtures/netease/user/user_binding.default.json';
import userBindingEmpty from '../fixtures/netease/user/user_binding.no-bindings.json';
import userCloud from '../fixtures/netease/user/user_cloud.default.json';
import userCloudPastEnd from '../fixtures/netease/user/user_cloud.past-end.json';
import userCloudDetail from '../fixtures/netease/user/user_cloud_detail.default.json';
import userCloudDetailEmpty from '../fixtures/netease/user/user_cloud_detail.empty.json';
import userLevel from '../fixtures/netease/user/user_level.default.json';
import userMedal from '../fixtures/netease/user/user_medal.default.json';
import userMedalUnknownUser from '../fixtures/netease/user/user_medal.unknown-user.json';
import userSocialStatus from '../fixtures/netease/user/user_social_status.default.json';
import userSubcount from '../fixtures/netease/user/user_subcount.default.json';

// issue #102 B16 的登录录制；user_medal.unknown-user 是同一账号视角下不存在的 uid。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

type JsonObject = Record<string, unknown>;

const objectAt = (value: unknown) => value as JsonObject;

const recordsAt = (value: unknown) => value as Array<JsonObject>;

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
    name: 'user_level',
    recording: userLevel,
    bodySchema: UserLevelBody,
    call: (upstream, status) => replay(upstream, status).userLevel(),
  },
  {
    name: 'user_subcount',
    recording: userSubcount,
    bodySchema: UserSubcountBody,
    call: (upstream, status) => replay(upstream, status).userSubcount(),
  },
  {
    name: 'user_binding',
    recording: userBinding,
    bodySchema: UserBindingBody,
    call: (upstream, status) =>
      replay(upstream, status).userBinding(userBinding.query),
  },
  {
    name: 'user_binding without bindings',
    recording: userBindingEmpty,
    bodySchema: UserBindingBody,
    call: (upstream, status) =>
      replay(upstream, status).userBinding(userBindingEmpty.query),
  },
  {
    name: 'user_social_status',
    recording: userSocialStatus,
    bodySchema: UserSocialStatusBody,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatus(userSocialStatus.query),
  },
  {
    name: 'user_medal',
    recording: userMedal,
    bodySchema: UserMedalBody,
    call: (upstream, status) =>
      replay(upstream, status).userMedal(userMedal.query),
  },
  {
    name: 'user_cloud',
    recording: userCloud,
    bodySchema: UserCloudBody,
    call: (upstream, status) =>
      replay(upstream, status).userCloud(userCloud.query),
  },
  {
    name: 'user_cloud past its list',
    recording: userCloudPastEnd,
    bodySchema: UserCloudBody,
    call: (upstream, status) =>
      replay(upstream, status).userCloud(userCloudPastEnd.query),
  },
  {
    name: 'user_cloud_detail',
    recording: userCloudDetail,
    bodySchema: UserCloudDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).userCloudDetail(userCloudDetail.query),
  },
  {
    name: 'user_cloud_detail without matches',
    recording: userCloudDetailEmpty,
    bodySchema: UserCloudDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).userCloudDetail(userCloudDetailEmpty.query),
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

test('user_medal passes a rejected code through', async () => {
  expect(
    await settle(
      replay(
        userMedalUnknownUser.response.body,
        userMedalUnknownUser.response.status,
      ).userMedal(userMedalUnknownUser.query),
    ),
  ).toEqual({
    rejected: {
      status: 499,
      cookie: [],
      body: userMedalUnknownUser.response.body,
    },
  });
});

test('user account bodies type tightened records and loose fields', () => {
  expectTypeOf<UserLevelBody['data']['level']>().toEqualTypeOf<number>();
  expectTypeOf<UserLevelBody['data']['info']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<UserSubcountBody['artistCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    UserBindingBody['bindings'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    UserBindingBody['bindings'][number]['tokenJsonStr']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    UserMedalBody['data']['obtainMedals'][number]['medalCode']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    UserMedalBody['data']['obtainMedals'][number]['medalLevel']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    UserMedalBody['data']['categoryMedalBlockVos'][number]['medalVOS'][number]['medalCode']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    UserMedalBody['data']['categoryMedalBlockVos'][number]['subGroups']
  >().toExtend<ReadonlyArray<unknown> | null | undefined>();
  expectTypeOf<
    UserCloudBody['data'][number]['songId']
  >().toEqualTypeOf<number>();
  expectTypeOf<UserCloudBody['data'][number]['privateCloud']>().toExtend<
    object | null | undefined
  >();
  expectTypeOf<
    UserCloudDetailBody['data'][number]['songId']
  >().toEqualTypeOf<number>();
});

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown) => Promise<unknown>;
  mutate: (upstream: JsonObject) => void;
  shape: {
    module: string;
    path: string;
    expected: string;
    actual: string;
  };
}>([
  {
    name: 'user_level without level info',
    recording: userLevel,
    call: (upstream) => replay(upstream).userLevel(),
    mutate: (upstream) => {
      delete upstream.data;
    },
    shape: {
      module: 'user_level',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'user_level with a text level',
    recording: userLevel,
    call: (upstream) => replay(upstream).userLevel(),
    mutate: (upstream) => {
      objectAt(upstream.data).level = '9';
    },
    shape: {
      module: 'user_level',
      path: 'body.data.level',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: 'user_subcount without a return code',
    recording: userSubcount,
    call: (upstream) => replay(upstream).userSubcount(),
    mutate: (upstream) => {
      delete upstream.code;
    },
    shape: {
      module: 'user_subcount',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'user_binding with a null binding id',
    recording: userBinding,
    call: (upstream) => replay(upstream).userBinding(userBinding.query),
    mutate: (upstream) => {
      recordsAt(upstream.bindings)[0]!.id = null;
    },
    shape: {
      module: 'user_binding',
      path: 'body.bindings[0].id',
      expected: 'number',
      actual: 'null',
    },
  },
  {
    name: 'user_social_status without a return code',
    recording: userSocialStatus,
    call: (upstream) =>
      replay(upstream).userSocialStatus(userSocialStatus.query),
    mutate: (upstream) => {
      delete upstream.code;
    },
    shape: {
      module: 'user_social_status',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'user_medal without a medal code',
    recording: userMedal,
    call: (upstream) => replay(upstream).userMedal(userMedal.query),
    mutate: (upstream) => {
      delete recordsAt(objectAt(upstream.data).obtainMedals)[0]!.medalCode;
    },
    shape: {
      module: 'user_medal',
      path: 'body.data.obtainMedals[0].medalCode',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'user_cloud with a text song id',
    recording: userCloud,
    call: (upstream) => replay(upstream).userCloud(userCloud.query),
    mutate: (upstream) => {
      recordsAt(upstream.data)[0]!.songId = '2706240277';
    },
    shape: {
      module: 'user_cloud',
      path: 'body.data[0].songId',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: 'user_cloud_detail without data',
    recording: userCloudDetail,
    call: (upstream) => replay(upstream).userCloudDetail(userCloudDetail.query),
    mutate: (upstream) => {
      delete upstream.data;
    },
    shape: {
      module: 'user_cloud_detail',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  },
])(
  '$name rejects the upstream shape',
  async ({ recording, call, mutate, shape }) => {
    const upstream = structuredClone(recording.response.body) as JsonObject;
    mutate(upstream);

    await expectUpstreamShapeRejection(call(upstream), shape);
  },
);

test('user_medal treats missing or null subGroups as normal', async () => {
  const withoutSubGroups = structuredClone(
    userMedal.response.body,
  ) as JsonObject;
  delete recordsAt(objectAt(withoutSubGroups.data).categoryMedalBlockVos)[1]!
    .subGroups;

  const missing = await replay(withoutSubGroups).userMedal(userMedal.query);

  expect(
    missing.body.data.categoryMedalBlockVos[1] as unknown,
  ).not.toHaveProperty('subGroups');

  const withNull = structuredClone(userMedal.response.body) as JsonObject;
  recordsAt(objectAt(withNull.data).categoryMedalBlockVos)[0]!.subGroups = null;

  const result = await replay(withNull).userMedal(userMedal.query);

  expect(result.body.data.categoryMedalBlockVos[0]!.subGroups).toBeNull();
});

test('user_medal rejects a broken record inside subGroups', async () => {
  const upstream = structuredClone(userMedal.response.body) as JsonObject;
  const block = recordsAt(objectAt(upstream.data).categoryMedalBlockVos)[1]!;
  delete recordsAt(block.subGroups)[0]!.medals;

  await expectUpstreamShapeRejection(
    replay(upstream).userMedal(userMedal.query),
    {
      module: 'user_medal',
      path: 'body.data.categoryMedalBlockVos[1].subGroups[0].medals',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_level drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userLevel.response.body) as JsonObject;
  const data = objectAt(upstream.data);
  delete data.info;
  data.progress = null;
  data.nextPlayCount = '12000';
  upstream.full = 'false';
  data.customLevelField = { tier: 1 };
  upstream.customTopField = true;

  const result = await replay(upstream).userLevel();

  expect(result.body.data as unknown).not.toHaveProperty('info');
  expect(result.body.data as unknown).not.toHaveProperty('nextPlayCount');
  expect(result.body.data.progress).toBeNull();
  expect(result.body as unknown).not.toHaveProperty('full');
  expect(result.body.data.customLevelField).toEqual({ tier: 1 });
  expect(
    (result.body as unknown as Record<string, unknown>).customTopField,
  ).toBe(true);
  expect(result.body.data.level).toBe(userLevel.response.body.data.level);
});

test('user_subcount drops bad loose counts and keeps undeclared ones', async () => {
  const upstream = structuredClone(userSubcount.response.body) as JsonObject;
  delete upstream.artistCount;
  upstream.mvCount = null;
  upstream.djRadioCount = '1';
  upstream.customCount = 3;

  const result = await replay(upstream).userSubcount();

  expect(result.body as unknown).not.toHaveProperty('artistCount');
  expect(result.body as unknown).not.toHaveProperty('djRadioCount');
  expect(result.body.mvCount).toBeNull();
  expect((result.body as unknown as Record<string, unknown>).customCount).toBe(
    3,
  );
  expect(result.body.code).toBe(200);
});

test('user_binding drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userBinding.response.body) as JsonObject;
  const binding = recordsAt(upstream.bindings)[0]!;
  delete binding.url;
  binding.expired = 'false';
  binding.userId = null;
  binding.customBindingField = 1;

  const result = await replay(upstream).userBinding(userBinding.query);

  expect(result.body.bindings[0] as unknown).not.toHaveProperty('url');
  expect(result.body.bindings[0] as unknown).not.toHaveProperty('expired');
  expect(result.body.bindings[0]!.userId).toBeNull();
  expect(result.body.bindings[0]!.customBindingField).toBe(1);
  expect(result.body.bindings[0]!.id).toBe(
    userBinding.response.body.bindings[0]!.id,
  );
});

test('user_social_status drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(
    userSocialStatus.response.body,
  ) as JsonObject;
  delete upstream.data;
  upstream.message = 1;
  upstream.customStatusField = 'x';

  const result = await replay(upstream).userSocialStatus(
    userSocialStatus.query,
  );

  expect(result.body as unknown).not.toHaveProperty('data');
  expect(result.body as unknown).not.toHaveProperty('message');
  expect(
    (result.body as unknown as Record<string, unknown>).customStatusField,
  ).toBe('x');
  expect(result.body.code).toBe(200);
});

test('user_medal drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userMedal.response.body) as JsonObject;
  const data = objectAt(upstream.data);
  delete data.rankingPer;
  data.medalNum = '493';
  upstream.message = null;
  const medal = recordsAt(data.obtainMedals)[0]!;
  medal.medalLevel = 'one';
  medal.levelMedalPicUrl = 'undeclared.png';
  data.customMedalField = true;

  const result = await replay(upstream).userMedal(userMedal.query);

  expect(result.body.data as unknown).not.toHaveProperty('rankingPer');
  expect(result.body.data as unknown).not.toHaveProperty('medalNum');
  expect(result.body.message).toBeNull();
  expect(result.body.data.obtainMedals[0] as unknown).not.toHaveProperty(
    'medalLevel',
  );
  expect(
    (result.body.data.obtainMedals[0] as unknown as Record<string, unknown>)
      .levelMedalPicUrl,
  ).toBe('undeclared.png');
  expect(result.body.data.customMedalField).toBe(true);
});

test('user_cloud drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userCloud.response.body) as JsonObject;
  const data = recordsAt(upstream.data);
  delete upstream.hasMore;
  upstream.count = '25';
  upstream.upgradeSign = null;
  upstream.cursor = 7;
  delete data[0]!.fileName;
  data[0]!.privateCloud = 'not-an-object';
  data[0]!.customCloudField = { matched: false };

  const result = await replay(upstream).userCloud(userCloud.query);

  expect(result.body as unknown).not.toHaveProperty('hasMore');
  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body.upgradeSign).toBeNull();
  expect((result.body as unknown as Record<string, unknown>).cursor).toBe(7);
  expect(result.body.data[0] as unknown).not.toHaveProperty('fileName');
  expect(result.body.data[0] as unknown).not.toHaveProperty('privateCloud');
  expect(result.body.data[0]!.customCloudField).toEqual({ matched: false });
  expect(result.body.data[0]!.songId).toBe(
    userCloud.response.body.data[0]!.songId,
  );
});

test('user_cloud_detail drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(userCloudDetail.response.body) as JsonObject;
  const data = recordsAt(upstream.data);
  delete data[0]!.matchType;
  data[0]!.addTime = 'yesterday';
  data[0]!.simpleSong = null;
  data[0]!.customDetailField = 'x';

  const result = await replay(upstream).userCloudDetail(userCloudDetail.query);

  expect(result.body.data[0] as unknown).not.toHaveProperty('matchType');
  expect(result.body.data[0] as unknown).not.toHaveProperty('addTime');
  expect(result.body.data[0]!.simpleSong).toBeNull();
  expect(result.body.data[0]!.customDetailField).toBe('x');
  expect(result.body.data[0]!.songId).toBe(
    userCloudDetail.response.body.data[0]!.songId,
  );
});
