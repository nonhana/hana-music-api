import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  SignHappyInfoBody,
  SigninProgressBody,
  YunbeiBody,
  YunbeiInfoBody,
  YunbeiRcmdSongHistoryBody,
  YunbeiTasksBody,
  YunbeiTasksTodoBody,
  YunbeiTodayBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import signHappyInfoAnonymous from '../fixtures/netease/signin/sign_happy_info.anonymous.json';
import signHappyInfo from '../fixtures/netease/signin/sign_happy_info.default.json';
import signinProgressAnonymous from '../fixtures/netease/signin/signin_progress.anonymous.json';
import signinProgress from '../fixtures/netease/signin/signin_progress.default.json';
import signinProgressInvalidModule from '../fixtures/netease/signin/signin_progress.invalid-module.json';
import yunbeiAnonymous from '../fixtures/netease/vip/yunbei.anonymous.json';
import yunbei from '../fixtures/netease/vip/yunbei.default.json';
import yunbeiInfoAnonymous from '../fixtures/netease/vip/yunbei_info.anonymous.json';
import yunbeiInfo from '../fixtures/netease/vip/yunbei_info.default.json';
import yunbeiRcmdSongHistoryAnonymous from '../fixtures/netease/vip/yunbei_rcmd_song_history.anonymous.json';
import yunbeiRcmdSongHistory from '../fixtures/netease/vip/yunbei_rcmd_song_history.empty.json';
import yunbeiRcmdSongHistoryInvalidSize from '../fixtures/netease/vip/yunbei_rcmd_song_history.invalid-size.json';
import yunbeiTasksAnonymous from '../fixtures/netease/vip/yunbei_tasks.anonymous.json';
import yunbeiTasks from '../fixtures/netease/vip/yunbei_tasks.default.json';
import yunbeiTasksTodoAnonymous from '../fixtures/netease/vip/yunbei_tasks_todo.anonymous.json';
import yunbeiTasksTodo from '../fixtures/netease/vip/yunbei_tasks_todo.default.json';
import yunbeiTodayAnonymous from '../fixtures/netease/vip/yunbei_today.anonymous.json';
import yunbeiToday from '../fixtures/netease/vip/yunbei_today.default.json';

// issue #102 B37 的录制：签到与云贝状态接口。录制前用同一 Cookie 调用 login_status，
// account.anonimousUser 为 false；本账号录制时 signin_progress 尚未签到、yunbei_today 为
// 0 云贝、推歌历史为空，这几份录制同时是零值证据。
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
    name: 'signin_progress',
    recording: signinProgress,
    bodySchema: SigninProgressBody,
    call: (upstream, status) =>
      replay(upstream, status).signinProgress(signinProgress.query),
  },
  {
    name: 'sign_happy_info',
    recording: signHappyInfo,
    bodySchema: SignHappyInfoBody,
    call: (upstream, status) =>
      replay(upstream, status).signHappyInfo(signHappyInfo.query),
  },
  {
    name: 'yunbei',
    recording: yunbei,
    bodySchema: YunbeiBody,
    call: (upstream, status) => replay(upstream, status).yunbei(yunbei.query),
  },
  {
    name: 'yunbei_info',
    recording: yunbeiInfo,
    bodySchema: YunbeiInfoBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiInfo(yunbeiInfo.query),
  },
  {
    name: 'yunbei_today',
    recording: yunbeiToday,
    bodySchema: YunbeiTodayBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiToday(yunbeiToday.query),
  },
  {
    name: 'yunbei_tasks',
    recording: yunbeiTasks,
    bodySchema: YunbeiTasksBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiTasks(yunbeiTasks.query),
  },
  {
    name: 'yunbei_tasks_todo',
    recording: yunbeiTasksTodo,
    bodySchema: YunbeiTasksTodoBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiTasksTodo(yunbeiTasksTodo.query),
  },
  {
    name: 'yunbei_rcmd_song_history without records',
    recording: yunbeiRcmdSongHistory,
    bodySchema: YunbeiRcmdSongHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiRcmdSongHistory(
        yunbeiRcmdSongHistory.query,
      ),
  },
  {
    name: 'yunbei_info anonymous recording',
    recording: yunbeiInfoAnonymous,
    bodySchema: YunbeiInfoBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiInfo(yunbeiInfoAnonymous.query),
  },
  {
    name: 'yunbei_tasks anonymous recording',
    recording: yunbeiTasksAnonymous,
    bodySchema: YunbeiTasksBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiTasks(yunbeiTasksAnonymous.query),
  },
  {
    name: 'yunbei_tasks_todo anonymous recording',
    recording: yunbeiTasksTodoAnonymous,
    bodySchema: YunbeiTasksTodoBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiTasksTodo(yunbeiTasksTodoAnonymous.query),
  },
  {
    name: 'yunbei_rcmd_song_history anonymous recording',
    recording: yunbeiRcmdSongHistoryAnonymous,
    bodySchema: YunbeiRcmdSongHistoryBody,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiRcmdSongHistory(
        yunbeiRcmdSongHistoryAnonymous.query,
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
    name: 'signin_progress with an unknown module id',
    recording: signinProgressInvalidModule,
    call: (upstream, status) =>
      replay(upstream, status).signinProgress(
        signinProgressInvalidModule.query,
      ),
  },
  {
    name: 'yunbei_rcmd_song_history with a negative size',
    recording: yunbeiRcmdSongHistoryInvalidSize,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiRcmdSongHistory(
        yunbeiRcmdSongHistoryInvalidSize.query,
      ),
  },
  {
    name: 'signin_progress anonymous recording',
    recording: signinProgressAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).signinProgress(signinProgressAnonymous.query),
  },
  {
    name: 'sign_happy_info anonymous recording',
    recording: signHappyInfoAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).signHappyInfo(signHappyInfoAnonymous.query),
  },
  {
    name: 'yunbei anonymous recording',
    recording: yunbeiAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).yunbei(yunbeiAnonymous.query),
  },
  {
    name: 'yunbei_today anonymous recording',
    recording: yunbeiTodayAnonymous,
    call: (upstream, status) =>
      replay(upstream, status).yunbeiToday(yunbeiTodayAnonymous.query),
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

test('vip status bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    SigninProgressBody['data']['today']['todaySignedIn']
  >().toEqualTypeOf<boolean>();
  expectTypeOf<
    SigninProgressBody['data']['records'][number]['day']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    SigninProgressBody['data']['records'][number]['signed']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<
    SigninProgressBody['data']['stats'][number]['description']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    SignHappyInfoBody['data']['info']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<YunbeiBody['data']['shells']>().toEqualTypeOf<number>();
  expectTypeOf<
    YunbeiInfoBody['userPoint']['balance']
  >().toEqualTypeOf<number>();
  expectTypeOf<YunbeiInfoBody['level']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<YunbeiTodayBody['data']['shells']>().toEqualTypeOf<number>();
  expectTypeOf<
    YunbeiTasksBody['data'][number]['taskId']
  >().toEqualTypeOf<number>();
  expectTypeOf<YunbeiTasksBody['data'][number]['taskPoint']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    YunbeiTasksTodoBody['data'][number]['userTaskId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<YunbeiRcmdSongHistoryBody['data']['page']>['more']
  >().toEqualTypeOf<boolean | null | undefined>();
});

test('vip status modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.signinProgress(null as never),
    () => api.signHappyInfo(null as never),
    () => api.yunbei(null as never),
    () => api.yunbeiInfo(null as never),
    () => api.yunbeiToday(null as never),
    () => api.yunbeiTasks(null as never),
    () => api.yunbeiTasksTodo(null as never),
    () => api.yunbeiRcmdSongHistory(null as never),
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

test("signin_progress rejects a body without today's sign-in block", async () => {
  const upstream = structuredClone(signinProgress.response.body) as {
    data: { today?: unknown };
  };
  delete upstream.data.today;

  await expectUpstreamShapeRejection(
    replay(upstream).signinProgress(signinProgress.query),
    {
      module: 'signin_progress',
      path: 'body.data.today',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('signin_progress drops a bad signed flag and keeps the record day', async () => {
  const upstream = structuredClone(signinProgress.response.body) as {
    data: { records: Array<{ signed: unknown; extra?: unknown }> };
  };
  upstream.data.records[0]!.signed = 'false';
  upstream.data.records[0]!.extra = { note: 'kept' };

  const result = await replay(upstream).signinProgress(signinProgress.query);
  const record = result.body.data.records[0] as unknown as Record<
    string,
    unknown
  >;

  expect(result.status).toBe(200);
  expect(record).not.toHaveProperty('signed');
  expect(record).toHaveProperty('extra', { note: 'kept' });
  expect(record.day).toBe(signinProgress.response.body.data.records[0]?.day);
});

test('signin_progress drops bad loose stats and keeps undeclared fields', async () => {
  const upstream = structuredClone(signinProgress.response.body) as {
    data: {
      stats: Array<{
        description: unknown;
        prizes: Array<{ amount: unknown }>;
        extra?: unknown;
      }>;
    };
  };
  upstream.data.stats[0]!.description = 42;
  upstream.data.stats[0]!.prizes[0]!.amount = '5';
  upstream.data.stats[0]!.extra = { theme: 'autumn' };

  const result = await replay(upstream).signinProgress(signinProgress.query);
  const stat = result.body.data.stats[0] as unknown as Record<string, unknown>;
  const prize = (stat.prizes as Array<Record<string, unknown>>)[0]!;

  expect(stat).not.toHaveProperty('description');
  expect(prize).not.toHaveProperty('amount');
  expect(stat).toHaveProperty('extra', { theme: 'autumn' });
  expect(stat.id).toBe(signinProgress.response.body.data.stats[0]?.id);
});

test('sign_happy_info rejects a body without activity info', async () => {
  const upstream = structuredClone(signHappyInfo.response.body) as {
    data: { info?: unknown };
  };
  delete upstream.data.info;

  await expectUpstreamShapeRejection(
    replay(upstream).signHappyInfo(signHappyInfo.query),
    {
      module: 'sign_happy_info',
      path: 'body.data.info',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('sign_happy_info rejects an activity without an id', async () => {
  const upstream = structuredClone(signHappyInfo.response.body) as {
    data: { info: { id?: unknown } };
  };
  delete upstream.data.info.id;

  await expectUpstreamShapeRejection(
    replay(upstream).signHappyInfo(signHappyInfo.query),
    {
      module: 'sign_happy_info',
      path: 'body.data.info.id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('sign_happy_info drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(signHappyInfo.response.body) as {
    data: {
      info: {
        mainText: unknown;
        hotComments: Array<{ content: unknown }>;
        operator?: unknown;
        extra?: unknown;
      };
    };
  };
  upstream.data.info.mainText = 42;
  upstream.data.info.hotComments[0]!.content = 42;
  upstream.data.info.operator = '网易云音乐';
  upstream.data.info.extra = { campaign: 'happy' };

  const result = await replay(upstream).signHappyInfo(signHappyInfo.query);
  const info = result.body.data.info as unknown as Record<string, unknown>;
  const comment = (info.hotComments as Array<Record<string, unknown>>)[0]!;

  expect(info).not.toHaveProperty('mainText');
  expect(comment).not.toHaveProperty('content');
  expect(info).toHaveProperty('operator', '网易云音乐');
  expect(info).toHaveProperty('extra', { campaign: 'happy' });
  expect(info.id).toBe(signHappyInfo.response.body.data.info.id);
});

test('yunbei rejects a body without signed status', async () => {
  const upstream = structuredClone(yunbei.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(replay(upstream).yunbei(yunbei.query), {
    module: 'yunbei',
    path: 'body.data',
    expected: 'present',
    actual: 'missing',
  });
});

test('yunbei rejects a non-numeric shell count', async () => {
  const upstream = structuredClone(yunbei.response.body) as {
    data: { shells: unknown };
  };
  upstream.data.shells = '1';

  await expectUpstreamShapeRejection(replay(upstream).yunbei(yunbei.query), {
    module: 'yunbei',
    path: 'body.data.shells',
    expected: 'number',
    actual: 'string',
  });
});

test('yunbei keeps undeclared fields', async () => {
  const upstream = structuredClone(yunbei.response.body) as unknown as {
    data: Record<string, unknown>;
    extra?: unknown;
  };
  upstream.data.extra = { signedToday: true };
  upstream.extra = 'kept';

  const result = await replay(upstream).yunbei(yunbei.query);

  expect(result.body as unknown).toHaveProperty('extra', 'kept');
  expect(result.body.data as unknown).toHaveProperty('extra', {
    signedToday: true,
  });
});

test('yunbei_info rejects a body without a user point record', async () => {
  const upstream = structuredClone(yunbeiInfo.response.body) as {
    userPoint?: unknown;
  };
  delete upstream.userPoint;

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiInfo(yunbeiInfo.query),
    {
      module: 'yunbei_info',
      path: 'body.userPoint',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('yunbei_info rejects a non-numeric balance', async () => {
  const upstream = structuredClone(yunbeiInfo.response.body) as {
    userPoint: { balance: unknown };
  };
  upstream.userPoint.balance = '0';

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiInfo(yunbeiInfo.query),
    {
      module: 'yunbei_info',
      path: 'body.userPoint.balance',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('yunbei_info keeps a missing loose level', async () => {
  const upstream = structuredClone(yunbeiInfo.response.body) as {
    level?: unknown;
  };
  delete upstream.level;

  const result = await replay(upstream).yunbeiInfo(yunbeiInfo.query);

  expect(result.status).toBe(200);
  expect(result.body as unknown).not.toHaveProperty('level');
  expect(result.body.userPoint.balance).toBe(
    yunbeiInfo.response.body.userPoint.balance,
  );
});

test('yunbei_info drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(yunbeiInfo.response.body) as {
    level: unknown;
    gameConfig?: unknown;
    extra?: unknown;
  };
  upstream.level = '9';
  upstream.gameConfig = { enabled: false };
  upstream.extra = { theme: 'dark' };

  const result = await replay(upstream).yunbeiInfo(yunbeiInfo.query);

  expect(result.body as unknown).not.toHaveProperty('level');
  expect(result.body as unknown).toHaveProperty('gameConfig', {
    enabled: false,
  });
  expect(result.body as unknown).toHaveProperty('extra', { theme: 'dark' });
});

test('yunbei_today rejects a body without a data object', async () => {
  const upstream = structuredClone(yunbeiToday.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiToday(yunbeiToday.query),
    {
      module: 'yunbei_today',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('yunbei_today rejects a non-numeric shell count', async () => {
  const upstream = structuredClone(yunbeiToday.response.body) as {
    data: { shells: unknown };
  };
  upstream.data.shells = '0';

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiToday(yunbeiToday.query),
    {
      module: 'yunbei_today',
      path: 'body.data.shells',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('yunbei_today keeps undeclared fields', async () => {
  const upstream = structuredClone(yunbeiToday.response.body) as unknown as {
    data: Record<string, unknown>;
    extra?: unknown;
  };
  upstream.data.extra = { pending: 3 };
  upstream.extra = 'kept';

  const result = await replay(upstream).yunbeiToday(yunbeiToday.query);

  expect(result.body as unknown).toHaveProperty('extra', 'kept');
  expect(result.body.data as unknown).toHaveProperty('extra', { pending: 3 });
});

test('yunbei_tasks rejects a body without a task list', async () => {
  const upstream = structuredClone(yunbeiTasks.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiTasks(yunbeiTasks.query),
    {
      module: 'yunbei_tasks',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('yunbei_tasks rejects a task without a task id', async () => {
  const upstream = structuredClone(yunbeiTasks.response.body) as {
    data: Array<{ taskId?: unknown }>;
  };
  delete upstream.data[0]!.taskId;

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiTasks(yunbeiTasks.query),
    {
      module: 'yunbei_tasks',
      path: 'body.data[0].taskId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('yunbei_tasks drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(yunbeiTasks.response.body) as {
    data: Array<{
      taskName: unknown;
      taskPointDetail: unknown;
      extInfoMap?: unknown;
      extra?: unknown;
    }>;
  };
  upstream.data[0]!.taskName = 42;
  upstream.data[0]!.taskPointDetail = 'detail';
  upstream.data[0]!.extInfoMap = { missionCode: 'listen_daily' };
  upstream.data[0]!.extra = { abTest: 'b' };

  const result = await replay(upstream).yunbeiTasks(yunbeiTasks.query);
  const task = result.body.data[0] as unknown as Record<string, unknown>;

  expect(task).not.toHaveProperty('taskName');
  expect(task).not.toHaveProperty('taskPointDetail');
  expect(task).toHaveProperty('extInfoMap', { missionCode: 'listen_daily' });
  expect(task).toHaveProperty('extra', { abTest: 'b' });
  expect(task.taskId).toBe(yunbeiTasks.response.body.data[0]?.taskId);
});

test('yunbei_tasks_todo rejects a non-array task list', async () => {
  const upstream = structuredClone(yunbeiTasksTodo.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiTasksTodo(yunbeiTasksTodo.query),
    {
      module: 'yunbei_tasks_todo',
      path: 'body.data',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('yunbei_tasks_todo rejects a task without a user task id', async () => {
  const upstream = structuredClone(yunbeiTasksTodo.response.body) as {
    data: Array<{ userTaskId?: unknown }>;
  };
  delete upstream.data[0]!.userTaskId;

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiTasksTodo(yunbeiTasksTodo.query),
    {
      module: 'yunbei_tasks_todo',
      path: 'body.data[0].userTaskId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('yunbei_tasks_todo drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(yunbeiTasksTodo.response.body) as {
    data: Array<{ taskPoint: unknown; extra?: unknown }>;
  };
  upstream.data[0]!.taskPoint = '100';
  upstream.data[0]!.extra = { highlighted: true };

  const result = await replay(upstream).yunbeiTasksTodo(yunbeiTasksTodo.query);
  const task = result.body.data[0] as unknown as Record<string, unknown>;

  expect(task).not.toHaveProperty('taskPoint');
  expect(task).toHaveProperty('extra', { highlighted: true });
  expect(task.userTaskId).toBe(
    yunbeiTasksTodo.response.body.data[0]?.userTaskId,
  );
});

test('yunbei_rcmd_song_history rejects a body without a data object', async () => {
  const upstream = structuredClone(yunbeiRcmdSongHistory.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).yunbeiRcmdSongHistory(yunbeiRcmdSongHistory.query),
    {
      module: 'yunbei_rcmd_song_history',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('yunbei_rcmd_song_history keeps a missing or null page and drops a bad one', async () => {
  const withNull = structuredClone(yunbeiRcmdSongHistory.response.body) as {
    data: { page: unknown; records: unknown };
  };
  withNull.data.page = null;

  const nullResult = await replay(withNull).yunbeiRcmdSongHistory(
    yunbeiRcmdSongHistory.query,
  );
  expect(nullResult.status).toBe(200);
  expect(nullResult.body.data as unknown).toHaveProperty('page', null);
  expect((nullResult.body.data as { records: unknown }).records).toEqual([]);

  const without = structuredClone(yunbeiRcmdSongHistory.response.body) as {
    data: { page?: unknown; records: unknown };
  };
  delete without.data.page;

  const missingResult = await replay(without).yunbeiRcmdSongHistory(
    yunbeiRcmdSongHistory.query,
  );
  expect(missingResult.status).toBe(200);
  expect(missingResult.body.data as unknown).not.toHaveProperty('page');
  expect((missingResult.body.data as { records: unknown }).records).toEqual([]);

  const upstream = structuredClone(yunbeiRcmdSongHistory.response.body) as {
    data: { page: unknown; records: unknown };
  };
  upstream.data.page = 'page';
  upstream.data.records = [{ id: 1, songName: 'song' }];

  const result = await replay(upstream).yunbeiRcmdSongHistory(
    yunbeiRcmdSongHistory.query,
  );
  const data = result.body.data as unknown as Record<string, unknown>;

  expect(data).not.toHaveProperty('page');
  expect(data).toHaveProperty('records', [{ id: 1, songName: 'song' }]);
});
