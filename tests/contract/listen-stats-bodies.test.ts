import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  ListenDataRealtimeReportBody,
  ListenDataReportBody,
  ListenDataTodaySongBody,
  ListenDataTotalBody,
  ListenDataYearReportBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import listenDataRealtimeReportAnonymous from '../fixtures/netease/listen/listen_data_realtime_report.anonymous.json';
import listenDataRealtimeReport from '../fixtures/netease/listen/listen_data_realtime_report.default.json';
import listenDataRealtimeReportMonth from '../fixtures/netease/listen/listen_data_realtime_report.month.json';
import listenDataReportAnonymous from '../fixtures/netease/listen/listen_data_report.anonymous.json';
import listenDataReport from '../fixtures/netease/listen/listen_data_report.default.json';
import listenDataReportEmpty from '../fixtures/netease/listen/listen_data_report.empty.json';
import listenDataReportMonth from '../fixtures/netease/listen/listen_data_report.month.json';
import listenDataReportYear from '../fixtures/netease/listen/listen_data_report.year.json';
import listenDataTodaySongAnonymous from '../fixtures/netease/listen/listen_data_today_song.anonymous.json';
import listenDataTodaySong from '../fixtures/netease/listen/listen_data_today_song.default.json';
import listenDataTotalAnonymous from '../fixtures/netease/listen/listen_data_total.anonymous.json';
import listenDataTotal from '../fixtures/netease/listen/listen_data_total.default.json';
import listenDataYearReportAnonymous from '../fixtures/netease/listen/listen_data_year_report.anonymous.json';
import listenDataYearReport from '../fixtures/netease/listen/listen_data_year_report.default.json';

// issue #102 B33 的录制来自本机登录账号（context.viewer 是 authenticated），
// 本次会话用 login_status 确认 account.anonimousUser: false（未落盘）；5 个模块的未登录调用都会被上游以 code 302 拒绝（各模块的 .anonymous.json）。
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
  ) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'listen_data_total returns the recorded total duration',
    recording: listenDataTotal,
    bodySchema: ListenDataTotalBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataTotal(listenDataTotal.query),
  },
  {
    name: 'listen_data_today_song returns the recorded today list',
    recording: listenDataTodaySong,
    bodySchema: ListenDataTodaySongBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataTodaySong(listenDataTodaySong.query),
  },
  {
    name: 'listen_data_year_report returns the recorded yearly report',
    recording: listenDataYearReport,
    bodySchema: ListenDataYearReportBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataYearReport(listenDataYearReport.query),
  },
  {
    name: 'listen_data_realtime_report returns the recorded weekly durations',
    recording: listenDataRealtimeReport,
    bodySchema: ListenDataRealtimeReportBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataRealtimeReport(
        listenDataRealtimeReport.query,
      ),
  },
  {
    name: 'listen_data_realtime_report returns the recorded monthly durations',
    recording: listenDataRealtimeReportMonth,
    bodySchema: ListenDataRealtimeReportBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataRealtimeReport(
        listenDataRealtimeReportMonth.query,
      ),
  },
  {
    name: 'listen_data_report returns the recorded weekly report',
    recording: listenDataReport,
    bodySchema: ListenDataReportBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataReport(listenDataReport.query),
  },
  {
    name: 'listen_data_report returns the recorded monthly report',
    recording: listenDataReportMonth,
    bodySchema: ListenDataReportBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataReport(listenDataReportMonth.query),
  },
  {
    name: 'listen_data_report returns the recorded yearly report',
    recording: listenDataReportYear,
    bodySchema: ListenDataReportBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataReport(listenDataReportYear.query),
  },
  {
    name: 'listen_data_report returns the recorded empty week',
    recording: listenDataReportEmpty,
    bodySchema: ListenDataReportBody,
    call: (upstream, status) =>
      replay(upstream, status).listenDataReport(listenDataReportEmpty.query),
  },
];

test.each(cases)('$name', async (entry) => {
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

test('listen bodies type the tightened records and loose fields', () => {
  expectTypeOf<ListenDataTotalBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    ListenDataTotalBody['data']['totalDuration']
  >().toEqualTypeOf<number>();
  expectTypeOf<ListenDataTotalBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    ListenDataTodaySongBody['data']['songDTOs'][number]['songId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    ListenDataTodaySongBody['data']['songDTOs'][number]['aliasName']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    ListenDataYearReportBody['data']['yearItems'][number]['year']
  >().toEqualTypeOf<number>();
  expectTypeOf<ListenDataYearReportBody['data']['displayYear']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    ListenDataRealtimeReportBody['data']['startTime']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<
      ListenDataRealtimeReportBody['data']['weekTodayListenBlock']
    >['coverUrls']
  >().toEqualTypeOf<ReadonlyArray<string> | null | undefined>();
  expectTypeOf<
    NonNullable<ListenDataReportBody['data']['topStyleBlock']>['songId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<
      NonNullable<ListenDataReportBody['data']['topArtistBlock']>['items']
    >[number]['resourceId']
  >().toEqualTypeOf<string | null | undefined>();
});

test('listen_data_total rejects a body without a return code', async () => {
  const upstream = structuredClone(listenDataTotal.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataTotal(listenDataTotal.query),
    {
      module: 'listen_data_total',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_total rejects a body without the data container', async () => {
  const upstream = structuredClone(listenDataTotal.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataTotal(listenDataTotal.query),
    {
      module: 'listen_data_total',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_total rejects a body without the total duration', async () => {
  const upstream = structuredClone(listenDataTotal.response.body) as {
    data: { totalDuration?: unknown };
  };
  delete upstream.data.totalDuration;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataTotal(listenDataTotal.query),
    {
      module: 'listen_data_total',
      path: 'body.data.totalDuration',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_total rejects a nonnumeric total duration', async () => {
  const upstream = structuredClone(listenDataTotal.response.body) as {
    data: { totalDuration: unknown };
  };
  upstream.data.totalDuration = '20165563';

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataTotal(listenDataTotal.query),
    {
      module: 'listen_data_total',
      path: 'body.data.totalDuration',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('listen_data_today_song rejects a body without the song list', async () => {
  const upstream = structuredClone(listenDataTodaySong.response.body) as {
    data?: { songDTOs?: unknown };
  };
  delete upstream.data!.songDTOs;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataTodaySong(listenDataTodaySong.query),
    {
      module: 'listen_data_today_song',
      path: 'body.data.songDTOs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_today_song rejects a song without an id', async () => {
  const upstream = structuredClone(listenDataTodaySong.response.body) as {
    data: { songDTOs: Array<{ songId?: unknown }> };
  };
  delete upstream.data.songDTOs[0]!.songId;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataTodaySong(listenDataTodaySong.query),
    {
      module: 'listen_data_today_song',
      path: 'body.data.songDTOs[0].songId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_today_song rejects a text song id', async () => {
  const upstream = structuredClone(listenDataTodaySong.response.body) as {
    data: { songDTOs: Array<{ songId: unknown }> };
  };
  upstream.data.songDTOs[0]!.songId = '1896365460';

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataTodaySong(listenDataTodaySong.query),
    {
      module: 'listen_data_today_song',
      path: 'body.data.songDTOs[0].songId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('listen_data_year_report rejects a body without the year list', async () => {
  const upstream = structuredClone(listenDataYearReport.response.body) as {
    data?: { yearItems?: unknown };
  };
  delete upstream.data!.yearItems;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataYearReport(listenDataYearReport.query),
    {
      module: 'listen_data_year_report',
      path: 'body.data.yearItems',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_year_report rejects a text year', async () => {
  const upstream = structuredClone(listenDataYearReport.response.body) as {
    data: { yearItems: Array<{ year: unknown }> };
  };
  upstream.data.yearItems[0]!.year = '2025';

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataYearReport(listenDataYearReport.query),
    {
      module: 'listen_data_year_report',
      path: 'body.data.yearItems[0].year',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('listen_data_realtime_report rejects a body without the durations', async () => {
  const upstream = structuredClone(listenDataRealtimeReport.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataRealtimeReport(listenDataRealtimeReport.query),
    {
      module: 'listen_data_realtime_report',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_realtime_report rejects a null duration container', async () => {
  const upstream = structuredClone(listenDataRealtimeReport.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataRealtimeReport(listenDataRealtimeReport.query),
    {
      module: 'listen_data_realtime_report',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('listen_data_report rejects a body without the report data', async () => {
  const upstream = structuredClone(listenDataReport.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataReport(listenDataReport.query),
    {
      module: 'listen_data_report',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listen_data_report rejects a null report container', async () => {
  const upstream = structuredClone(listenDataReport.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).listenDataReport(listenDataReport.query),
    {
      module: 'listen_data_report',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('listen_data_total drops a bad loose message and keeps undeclared fields', async () => {
  const upstream = structuredClone(listenDataTotal.response.body) as Record<
    string,
    unknown
  > & { message: unknown };
  upstream.message = 123;
  upstream.extra = { seeded: true };

  const result = await replay(upstream).listenDataTotal(listenDataTotal.query);

  expect(result.body).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('extra', { seeded: true });
});

test('listen_data_today_song drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(listenDataTodaySong.response.body) as {
    data: {
      songDTOs: Array<
        Record<string, unknown> & {
          aliasName: unknown;
          redStar?: unknown;
          songName: unknown;
        }
      >;
    };
  };
  const song = upstream.data.songDTOs[0]!;
  song.aliasName = 42;
  delete song.redStar;
  song.songName = null;
  song.extra = { seeded: true };

  const result = await replay(upstream).listenDataTodaySong(
    listenDataTodaySong.query,
  );
  const returned = result.body.data.songDTOs[0]!;

  expect(returned).not.toHaveProperty('aliasName');
  expect(returned).not.toHaveProperty('redStar');
  expect(returned.songName as unknown).toBeNull();
  expect(returned as unknown).toHaveProperty('extra', { seeded: true });
});

test('listen_data_year_report drops bad loose counters and keeps undeclared ones', async () => {
  const upstream = structuredClone(listenDataYearReport.response.body) as {
    data: Record<string, unknown> & {
      displayYear: unknown;
      yearItems: Array<Record<string, unknown> & { playNum: unknown }>;
    };
  };
  upstream.data.displayYear = '2025';
  upstream.data.yearItems[0]!.playNum = '4385';
  upstream.data.extra = { seeded: true };

  const result = await replay(upstream).listenDataYearReport(
    listenDataYearReport.query,
  );
  const returned = result.body;

  expect(returned.data as unknown).not.toHaveProperty('displayYear');
  expect(returned.data as unknown).toHaveProperty('extra', { seeded: true });
  expect(returned.data.yearItems[0] as unknown).not.toHaveProperty('playNum');
  expect(returned.data.yearItems[0]!.year).toBe(2025);
});

test('listen_data_realtime_report keeps null blocks and drops a broken loose container', async () => {
  const upstream = structuredClone(listenDataRealtimeReport.response.body) as {
    data: Record<string, unknown> & {
      weekTodayListenBlock: unknown;
      listenTimeDistributionBlock: Record<string, unknown> & {
        listenDays: unknown;
      };
    };
  };
  upstream.data.weekTodayListenBlock = null;
  upstream.data.listenTimeDistributionBlock.durationDetails = 'broken';
  upstream.data.listenTimeDistributionBlock.listenDays = 7;
  upstream.data.extra = { seeded: true };

  const result = await replay(upstream).listenDataRealtimeReport(
    listenDataRealtimeReport.query,
  );
  const returned = result.body;

  expect(returned.data.weekTodayListenBlock as unknown).toBeNull();
  expect(returned.data.extra as unknown).toEqual({ seeded: true });
  const distribution = returned.data.listenTimeDistributionBlock!;
  expect(distribution as unknown).not.toHaveProperty('durationDetails');
  expect(distribution.listenDays).toBe(7);
});

test('listen_data_report keeps the empty week and drops broken loose block fields', async () => {
  const empty = await replay(
    listenDataReportEmpty.response.body,
  ).listenDataReport(listenDataReportEmpty.query);
  expect(empty.body).toEqual(listenDataReportEmpty.response.body as never);
  expect(empty.body.data.topSongBlock).toBeNull();

  const upstream = structuredClone(listenDataReport.response.body) as {
    data: Record<string, unknown> & {
      topStyleBlock: Record<string, unknown> & {
        genreId: unknown;
        sections: unknown;
        songName: unknown;
      };
    };
  };
  const topStyle = upstream.data.topStyleBlock;
  topStyle.genreId = '1252';
  topStyle.sections = 'broken';
  topStyle.songName = null;
  upstream.data.extra = { seeded: true };

  const result = await replay(upstream).listenDataReport(
    listenDataReport.query,
  );
  const returned = result.body;
  const block = returned.data.topStyleBlock!;

  expect(returned.data.extra as unknown).toEqual({ seeded: true });
  expect(block as unknown).not.toHaveProperty('genreId');
  expect(block as unknown).not.toHaveProperty('sections');
  expect(block.songName as unknown).toBeNull();
  expect(block.genreName).toBe('二次元');
});

test('listen list modules accept a constructed empty list', async () => {
  // 空账号没有可用录制：用真实录制把列表替换成 [] 验证空列表边界。
  const today = structuredClone(listenDataTodaySong.response.body) as {
    data: { songDTOs: Array<unknown> };
  };
  today.data.songDTOs = [];
  const todayResult = await replay(today).listenDataTodaySong(
    listenDataTodaySong.query,
  );
  expect(todayResult.body).toEqual(today as never);

  const years = structuredClone(listenDataYearReport.response.body) as {
    data: { yearItems: Array<unknown> };
  };
  years.data.yearItems = [];
  const yearResult = await replay(years).listenDataYearReport(
    listenDataYearReport.query,
  );
  expect(yearResult.body).toEqual(years as never);
});

type AnonymousCase = {
  readonly name: string;
  readonly recording: Recording;
  readonly call: (body: unknown, status: number) => Promise<unknown>;
};

const anonymousCases: Array<AnonymousCase> = [
  {
    name: 'listen_data_total',
    recording: listenDataTotalAnonymous,
    call: (body: unknown, status: number) =>
      replay(body, status).listenDataTotal(listenDataTotalAnonymous.query),
  },
  {
    name: 'listen_data_today_song',
    recording: listenDataTodaySongAnonymous,
    call: (body: unknown, status: number) =>
      replay(body, status).listenDataTodaySong(
        listenDataTodaySongAnonymous.query,
      ),
  },
  {
    name: 'listen_data_year_report',
    recording: listenDataYearReportAnonymous,
    call: (body: unknown, status: number) =>
      replay(body, status).listenDataYearReport(
        listenDataYearReportAnonymous.query,
      ),
  },
  {
    name: 'listen_data_realtime_report',
    recording: listenDataRealtimeReportAnonymous,
    call: (body: unknown, status: number) =>
      replay(body, status).listenDataRealtimeReport(
        listenDataRealtimeReportAnonymous.query,
      ),
  },
  {
    name: 'listen_data_report',
    recording: listenDataReportAnonymous,
    call: (body: unknown, status: number) =>
      replay(body, status).listenDataReport(listenDataReportAnonymous.query),
  },
];

test.each(anonymousCases)(
  '$name rejects the anonymous business error with the original body',
  async ({ recording, call }) => {
    expect(
      await settle(call(recording.response.body, recording.response.status)),
    ).toEqual({
      rejected: {
        status: 302,
        cookie: [],
        body: recording.response.body,
      },
    });
  },
);

test('listen_data_report rejects a non-object input before calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(listenDataReport.response.body);
    },
  });

  const outcome = await settle(api.listenDataReport('week' as never));

  expect('rejected' in outcome && outcome.rejected.status).toBe(400);
  expect(requests).toBe(0);
});
