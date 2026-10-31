import { expect, expectTypeOf, test } from 'bun:test';

import {
  MusicianCloudbeanBody,
  MusicianDataOverviewBody,
  MusicianPlayTrendBody,
  MusicianTasksBody,
  MusicianTasksNewBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import musicianCloudbeanAnonymous from '../fixtures/netease/musician/musician_cloudbean.anonymous.json';
import musicianCloudbean from '../fixtures/netease/musician/musician_cloudbean.default.json';
import musicianDataOverviewAnonymous from '../fixtures/netease/musician/musician_data_overview.anonymous.json';
import musicianDataOverview from '../fixtures/netease/musician/musician_data_overview.default.json';
import musicianPlayTrendAnonymous from '../fixtures/netease/musician/musician_play_trend.anonymous-empty.json';
import musicianPlayTrend from '../fixtures/netease/musician/musician_play_trend.default.json';
import musicianPlayTrendEmpty from '../fixtures/netease/musician/musician_play_trend.empty.json';
import musicianPlayTrendMs from '../fixtures/netease/musician/musician_play_trend.ms-params.json';
import musicianPlayTrendNoParams from '../fixtures/netease/musician/musician_play_trend.no-params.json';
import musicianPlayTrendSeconds from '../fixtures/netease/musician/musician_play_trend.s-params.json';
import musicianTasksAnonymous from '../fixtures/netease/musician/musician_tasks.anonymous.json';
import musicianTasks from '../fixtures/netease/musician/musician_tasks.default.json';
import musicianTasksNewAnonymous from '../fixtures/netease/musician/musician_tasks_new.anonymous.json';
import musicianTasksNew from '../fixtures/netease/musician/musician_tasks_new.default.json';

// issue #102 B36 的音乐人账号录制；录制前经 login_status 确认 account.anonimousUser: false（未落盘）。
// 匿名只用于业务拒绝路径（musician_play_trend 匿名仍成功但趋势为空）。

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
    name: 'musician_cloudbean',
    recording: musicianCloudbean,
    bodySchema: MusicianCloudbeanBody,
    call: (upstream, status) =>
      replay(upstream, status).musicianCloudbean(musicianCloudbean.query),
  },
  {
    name: 'musician_data_overview',
    recording: musicianDataOverview,
    bodySchema: MusicianDataOverviewBody,
    call: (upstream, status) =>
      replay(upstream, status).musicianDataOverview(musicianDataOverview.query),
  },
  {
    name: 'musician_play_trend',
    recording: musicianPlayTrend,
    bodySchema: MusicianPlayTrendBody,
    call: (upstream, status) =>
      replay(upstream, status).musicianPlayTrend(musicianPlayTrend.query),
  },
  {
    name: 'musician_play_trend without plays',
    recording: musicianPlayTrendEmpty,
    bodySchema: MusicianPlayTrendBody,
    call: (upstream, status) =>
      replay(upstream, status).musicianPlayTrend(musicianPlayTrendEmpty.query),
  },
  {
    name: 'anonymous musician_play_trend without plays',
    recording: musicianPlayTrendAnonymous,
    bodySchema: MusicianPlayTrendBody,
    call: (upstream, status) =>
      replay(upstream, status).musicianPlayTrend(
        musicianPlayTrendAnonymous.query,
      ),
  },
  {
    name: 'musician_tasks',
    recording: musicianTasks,
    bodySchema: MusicianTasksBody,
    call: (upstream, status) =>
      replay(upstream, status).musicianTasks(musicianTasks.query),
  },
  {
    name: 'musician_tasks_new',
    recording: musicianTasksNew,
    bodySchema: MusicianTasksNewBody,
    call: (upstream, status) =>
      replay(upstream, status).musicianTasksNew(musicianTasksNew.query),
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

// cloudbean 的 600、data_overview 的 10000 和 tasks/tasks_new 的 301 是请求层既有拒绝：
// interpretResponse 在模块之前就按业务码定 status 并拒绝，不经过 decodeUpstreamBody；
// musician_play_trend 的 400（缺参/毫秒/秒）是本批新增的业务拒绝。
test.each<{
  name: string;
  recording: Recording;
  status: number;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'musician_cloudbean anonymously',
    recording: musicianCloudbeanAnonymous,
    status: 400,
    call: (upstream, status) =>
      replay(upstream, status).musicianCloudbean(
        musicianCloudbeanAnonymous.query,
      ),
  },
  {
    name: 'musician_data_overview anonymously',
    recording: musicianDataOverviewAnonymous,
    status: 400,
    call: (upstream, status) =>
      replay(upstream, status).musicianDataOverview(
        musicianDataOverviewAnonymous.query,
      ),
  },
  {
    name: 'musician_play_trend without time range',
    recording: musicianPlayTrendNoParams,
    status: 400,
    call: (upstream, status) =>
      replay(upstream, status).musicianPlayTrend(
        musicianPlayTrendNoParams.query,
      ),
  },
  {
    name: 'musician_play_trend with millisecond timestamps',
    recording: musicianPlayTrendMs,
    status: 400,
    call: (upstream, status) =>
      replay(upstream, status).musicianPlayTrend(musicianPlayTrendMs.query),
  },
  {
    name: 'musician_play_trend with second timestamps',
    recording: musicianPlayTrendSeconds,
    status: 400,
    call: (upstream, status) =>
      replay(upstream, status).musicianPlayTrend(
        musicianPlayTrendSeconds.query,
      ),
  },
  {
    name: 'musician_tasks without login',
    recording: musicianTasksAnonymous,
    status: 301,
    call: (upstream, status) =>
      replay(upstream, status).musicianTasks(musicianTasksAnonymous.query),
  },
  {
    name: 'musician_tasks_new without login',
    recording: musicianTasksNewAnonymous,
    status: 301,
    call: (upstream, status) =>
      replay(upstream, status).musicianTasksNew(
        musicianTasksNewAnonymous.query,
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

test('musician bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    MusicianCloudbeanBody['data']['cloudBean']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    MusicianCloudbeanBody['data']['artistId']
  >().toEqualTypeOf<number>();
  expectTypeOf<MusicianCloudbeanBody['data']['maxCloudBean']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    MusicianDataOverviewBody['data']['productionTotal']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    MusicianPlayTrendBody['data'][number]['dateTime']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    MusicianPlayTrendBody['data'][number]['dataValue']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    MusicianTasksBody['data']['list'][number]['missionId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    MusicianTasksBody['data']['list'][number]['name']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    NonNullable<
      MusicianTasksNewBody['data']['list'][number]['userStageTargetList']
    >[number]['times']
  >().toEqualTypeOf<number | null | undefined>();
});

test('musician_cloudbean rejects a cloud bean payload without data', async () => {
  const upstream = structuredClone(musicianCloudbean.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).musicianCloudbean(musicianCloudbean.query),
    {
      module: 'musician_cloudbean',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('musician_cloudbean rejects a cloud bean count that is text', async () => {
  const upstream = structuredClone(musicianCloudbean.response.body);
  (upstream.data as { cloudBean: unknown }).cloudBean = '5';

  await expectUpstreamShapeRejection(
    replay(upstream).musicianCloudbean(musicianCloudbean.query),
    {
      module: 'musician_cloudbean',
      path: 'body.data.cloudBean',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('musician_cloudbean drops an invalid loose field and keeps the rest', async () => {
  const upstream = structuredClone(musicianCloudbean.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.maxCloudBean = 'unlimited';
  upstream.data.needPop = null;
  upstream.data.extra = 'kept';

  const result = await replay(upstream).musicianCloudbean(
    musicianCloudbean.query,
  );

  expect(result.body.data).not.toHaveProperty('maxCloudBean');
  expect(result.body.data).toHaveProperty('needPop', null);
  expect(result.body.data).toHaveProperty('extra', 'kept');
  expect(result.body.data).toHaveProperty('cloudBean', 5);
  expect(result.body.data).toHaveProperty('musicianLevel', null);
});

test('musician_data_overview rejects a payload without data', async () => {
  const upstream = structuredClone(musicianDataOverview.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).musicianDataOverview(musicianDataOverview.query),
    {
      module: 'musician_data_overview',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('musician_data_overview drops invalid loose metrics', async () => {
  const upstream = structuredClone(musicianDataOverview.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.productionTotal = '12';
  upstream.data.availableExtractIncomeTotal = null;
  upstream.data.extra = { note: 'kept' };

  const result = await replay(upstream).musicianDataOverview(
    musicianDataOverview.query,
  );

  expect(result.body.data).not.toHaveProperty('productionTotal');
  expect(result.body.data).toHaveProperty('availableExtractIncomeTotal', null);
  expect(result.body.data).toHaveProperty('extra', { note: 'kept' });
  expect(result.body.data).toHaveProperty('totalFansCount', 31);
});

test('musician_play_trend rejects a trend that is not an array', async () => {
  const upstream = structuredClone(musicianPlayTrend.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).musicianPlayTrend(musicianPlayTrend.query),
    {
      module: 'musician_play_trend',
      path: 'body.data',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('musician_play_trend rejects a point without a play count', async () => {
  const upstream = structuredClone(musicianPlayTrend.response.body) as {
    data: Array<{ dataValue?: unknown }>;
  };
  delete upstream.data[0]!.dataValue;

  await expectUpstreamShapeRejection(
    replay(upstream).musicianPlayTrend(musicianPlayTrend.query),
    {
      module: 'musician_play_trend',
      path: 'body.data[0].dataValue',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('musician_play_trend drops a null message and keeps unknown fields', async () => {
  const upstream = structuredClone(musicianPlayTrend.response.body) as Record<
    string,
    unknown
  >;
  upstream.message = null;
  upstream.extra = 1;

  const result = await replay(upstream).musicianPlayTrend(
    musicianPlayTrend.query,
  );

  expect(result.body).toHaveProperty('message', null);
  expect(result.body).toHaveProperty('extra', 1);
  expect(result.body.data).toEqual(musicianPlayTrend.response.body.data);
});

test('musician_tasks rejects a task without a mission id', async () => {
  const upstream = structuredClone(musicianTasks.response.body) as {
    data: { list: Array<{ missionId?: unknown }> };
  };
  delete upstream.data.list[0]!.missionId;

  await expectUpstreamShapeRejection(
    replay(upstream).musicianTasks(musicianTasks.query),
    {
      module: 'musician_tasks',
      path: 'body.data.list[0].missionId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('musician_tasks drops invalid loose fields and keeps unknown fields', async () => {
  const upstream = structuredClone(musicianTasks.response.body) as {
    data: { list: Array<Record<string, unknown>> };
  };
  delete upstream.data.list[0]!.name;
  upstream.data.list[0]!.extendInfo = null;
  upstream.data.list[0]!.extra = 'kept';

  const result = await replay(upstream).musicianTasks(musicianTasks.query);

  expect(result.body.data.list[0]).not.toHaveProperty('name');
  expect(result.body.data.list[0]).toHaveProperty('extendInfo', null);
  expect(result.body.data.list[0]).toHaveProperty('extra', 'kept');
  expect(result.body.data.list[0]).toHaveProperty('missionId', 6703455);
});

test('musician_tasks_new rejects a task without a mission id', async () => {
  const upstream = structuredClone(musicianTasksNew.response.body) as {
    data: { list: Array<{ missionId?: unknown }> };
  };
  delete upstream.data.list[0]!.missionId;

  await expectUpstreamShapeRejection(
    replay(upstream).musicianTasksNew(musicianTasksNew.query),
    {
      module: 'musician_tasks_new',
      path: 'body.data.list[0].missionId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('musician_tasks_new drops the whole stage list when one target is invalid', async () => {
  const upstream = structuredClone(musicianTasksNew.response.body) as {
    data: { list: Array<Record<string, unknown>> };
  };
  (upstream.data.list[0]!.userStageTargetList as Array<unknown>)[0] = 'five';
  upstream.data.list[0]!.extra = 'kept';

  const result = await replay(upstream).musicianTasksNew(
    musicianTasksNew.query,
  );

  expect(result.body.data.list[0]).not.toHaveProperty('userStageTargetList');
  expect(result.body.data.list[0]).toHaveProperty('extra', 'kept');
  expect(result.body.data.list[0]).toHaveProperty('missionId', 6605451);
});

type BodyMutation = {
  readonly name: string;
  readonly mutate: (upstream: Record<string, unknown>) => void;
  readonly expected: {
    readonly path: string;
    readonly expected: string;
    readonly actual: string;
  };
};

const tasksBodyMutations: Array<BodyMutation> = [
  {
    name: 'musician_tasks rejects a payload without data',
    mutate: (upstream) => {
      delete upstream.data;
    },
    expected: { path: 'body.data', expected: 'present', actual: 'missing' },
  },
  {
    name: 'musician_tasks rejects a null data',
    mutate: (upstream) => {
      upstream.data = null;
    },
    expected: { path: 'body.data', expected: 'object', actual: 'null' },
  },
  {
    name: 'musician_tasks rejects data without a list',
    mutate: (upstream) => {
      delete (upstream.data as Record<string, unknown>).list;
    },
    expected: {
      path: 'body.data.list',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'musician_tasks rejects a null list',
    mutate: (upstream) => {
      (upstream.data as Record<string, unknown>).list = null;
    },
    expected: { path: 'body.data.list', expected: 'array', actual: 'null' },
  },
];

test.each(tasksBodyMutations)('$name', async ({ mutate, expected }) => {
  const upstream = structuredClone(musicianTasks.response.body) as Record<
    string,
    unknown
  >;
  mutate(upstream);

  await expectUpstreamShapeRejection(
    replay(upstream).musicianTasks(musicianTasks.query),
    { module: 'musician_tasks', ...expected },
  );
});

const tasksNewBodyMutations: Array<BodyMutation> = [
  {
    name: 'musician_tasks_new rejects a payload without data',
    mutate: (upstream) => {
      delete upstream.data;
    },
    expected: { path: 'body.data', expected: 'present', actual: 'missing' },
  },
  {
    name: 'musician_tasks_new rejects a null data',
    mutate: (upstream) => {
      upstream.data = null;
    },
    expected: { path: 'body.data', expected: 'object', actual: 'null' },
  },
  {
    name: 'musician_tasks_new rejects data without a list',
    mutate: (upstream) => {
      delete (upstream.data as Record<string, unknown>).list;
    },
    expected: {
      path: 'body.data.list',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'musician_tasks_new rejects a null list',
    mutate: (upstream) => {
      (upstream.data as Record<string, unknown>).list = null;
    },
    expected: { path: 'body.data.list', expected: 'array', actual: 'null' },
  },
];

test.each(tasksNewBodyMutations)('$name', async ({ mutate, expected }) => {
  const upstream = structuredClone(musicianTasksNew.response.body) as Record<
    string,
    unknown
  >;
  mutate(upstream);

  await expectUpstreamShapeRejection(
    replay(upstream).musicianTasksNew(musicianTasksNew.query),
    { module: 'musician_tasks_new', ...expected },
  );
});

const trendPointMutations: Array<BodyMutation> = [
  {
    name: 'musician_play_trend rejects a point without a date',
    mutate: (upstream) => {
      delete (upstream.data as Array<Record<string, unknown>>)[0]!.dateTime;
    },
    expected: {
      path: 'body.data[0].dateTime',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'musician_play_trend rejects a numeric date',
    mutate: (upstream) => {
      (upstream.data as Array<Record<string, unknown>>)[0]!.dateTime = 20261019;
    },
    expected: {
      path: 'body.data[0].dateTime',
      expected: 'string',
      actual: 'number',
    },
  },
  {
    name: 'musician_play_trend rejects a numeric play count',
    mutate: (upstream) => {
      (upstream.data as Array<Record<string, unknown>>)[0]!.dataValue = 1;
    },
    expected: {
      path: 'body.data[0].dataValue',
      expected: 'string',
      actual: 'number',
    },
  },
];

test.each(trendPointMutations)('$name', async ({ mutate, expected }) => {
  const upstream = structuredClone(musicianPlayTrend.response.body) as Record<
    string,
    unknown
  >;
  mutate(upstream);

  await expectUpstreamShapeRejection(
    replay(upstream).musicianPlayTrend(musicianPlayTrend.query),
    { module: 'musician_play_trend', ...expected },
  );
});

test('musician_cloudbean rejects an artist id that is text', async () => {
  const upstream = structuredClone(musicianCloudbean.response.body);
  (upstream.data as { artistId: unknown }).artistId = '51535561';

  await expectUpstreamShapeRejection(
    replay(upstream).musicianCloudbean(musicianCloudbean.query),
    {
      module: 'musician_cloudbean',
      path: 'body.data.artistId',
      expected: 'number',
      actual: 'string',
    },
  );
});

// 真实空账号仍未录到；这两条手写边界锁定空数组会被接受，不是真实录制。
test.each<{
  name: string;
  body: { code: 200; message: string; data: { list: Array<never> } };
  call: (upstream: unknown) => Promise<{ status: number; body: unknown }>;
}>([
  {
    name: 'musician_tasks',
    body: { code: 200, message: 'success', data: { list: [] } },
    call: (upstream) => replay(upstream).musicianTasks({}),
  },
  {
    name: 'musician_tasks_new',
    body: { code: 200, message: 'success', data: { list: [] } },
    call: (upstream) => replay(upstream).musicianTasksNew({}),
  },
])('$name accepts an empty task list', async ({ body, call }) => {
  const result = await call(body);

  expect(result.status).toBe(200);
  expect(result.body).toEqual(body);
});
