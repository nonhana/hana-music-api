import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  DjDifmAllStyleChannelBody,
  DjDifmPlayingTracksListBody,
  DjDifmSubscribeChannelsGetBody,
  DjPersonalizeRecommendBody,
  DjProgramBody,
  DjProgramDetailBody,
  DjProgramToplistBody,
  DjProgramToplistHoursBody,
  DjTodayPerferedBody,
  PersonalizedDjprogramBody,
  ProgramRecommendBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import djDifmAllStyleChannel from '../fixtures/netease/dj/dj_difm_all_style_channel.default.json';
import djDifmAllStyleChannelEmpty from '../fixtures/netease/dj/dj_difm_all_style_channel.empty.json';
import djDifmPlayingTracksList from '../fixtures/netease/dj/dj_difm_playing_tracks_list.default.json';
import djDifmPlayingTracksListUnknown from '../fixtures/netease/dj/dj_difm_playing_tracks_list.unknown.json';
import djDifmSubscribeChannelsGet from '../fixtures/netease/dj/dj_difm_subscribe_channels_get.empty.json';
import djPersonalizeRecommend from '../fixtures/netease/dj/dj_personalize_recommend.default.json';
import djProgram from '../fixtures/netease/dj/dj_program.default.json';
import djProgramEmpty from '../fixtures/netease/dj/dj_program.empty.json';
import djProgramMissingRid from '../fixtures/netease/dj/dj_program.missing-rid.json';
import djProgramDetailAnchors from '../fixtures/netease/dj/dj_program_detail.anchors.json';
import djProgramDetail from '../fixtures/netease/dj/dj_program_detail.default.json';
import djProgramDetailUnknown from '../fixtures/netease/dj/dj_program_detail.unknown.json';
import djProgramToplist from '../fixtures/netease/dj/dj_program_toplist.default.json';
import djProgramToplistHours from '../fixtures/netease/dj/dj_program_toplist_hours.default.json';
import djTodayPerfered from '../fixtures/netease/dj/dj_today_perfered.empty.json';
import personalizedDjprogram from '../fixtures/netease/dj/personalized_djprogram.default.json';
import programRecommend from '../fixtures/netease/dj/program_recommend.default.json';
import programRecommendEmpty from '../fixtures/netease/dj/program_recommend.empty.json';

// issue #102 B12 的匿名录制。11 个模块都带 Cookie 重录过：登录录制能通过同一结构校验，宽松字段的值和覆盖
// 有差异（如 aiGenerated 的 null/boolean、descPicList 的 null/数组、mMusic 的 null/对象），因此没有保留
// 登录对照，也不对公开结构作相同性断言。dj_program、program_recommend、personalized_djprogram、
// dj_program_toplist 的录制是按字段覆盖截取的非连续子集。
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
    name: 'dj_program',
    recording: djProgram,
    bodySchema: DjProgramBody,
    call: (upstream, status) =>
      replay(upstream, status).djProgram(djProgram.query),
  },
  {
    name: 'dj_program past the last program',
    recording: djProgramEmpty,
    bodySchema: DjProgramBody,
    call: (upstream, status) =>
      replay(upstream, status).djProgram(djProgramEmpty.query),
  },
  {
    name: 'dj_program_detail',
    recording: djProgramDetail,
    bodySchema: DjProgramDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).djProgramDetail(djProgramDetail.query),
  },
  {
    name: 'dj_program_detail with participating anchors',
    recording: djProgramDetailAnchors,
    bodySchema: DjProgramDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).djProgramDetail(djProgramDetailAnchors.query),
  },
  {
    name: 'dj_program_toplist',
    recording: djProgramToplist,
    bodySchema: DjProgramToplistBody,
    call: (upstream, status) =>
      replay(upstream, status).djProgramToplist(djProgramToplist.query),
  },
  {
    name: 'dj_program_toplist_hours',
    recording: djProgramToplistHours,
    bodySchema: DjProgramToplistHoursBody,
    call: (upstream, status) =>
      replay(upstream, status).djProgramToplistHours(
        djProgramToplistHours.query,
      ),
  },
  {
    name: 'program_recommend',
    recording: programRecommend,
    bodySchema: ProgramRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).programRecommend(programRecommend.query),
  },
  {
    name: 'program_recommend past the last program',
    recording: programRecommendEmpty,
    bodySchema: ProgramRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).programRecommend(programRecommendEmpty.query),
  },
  {
    name: 'dj_personalize_recommend',
    recording: djPersonalizeRecommend,
    bodySchema: DjPersonalizeRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).djPersonalizeRecommend(
        djPersonalizeRecommend.query,
      ),
  },
  {
    name: 'personalized_djprogram',
    recording: personalizedDjprogram,
    bodySchema: PersonalizedDjprogramBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedDjprogram(
        personalizedDjprogram.query,
      ),
  },
  {
    name: 'dj_difm_all_style_channel',
    recording: djDifmAllStyleChannel,
    bodySchema: DjDifmAllStyleChannelBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmAllStyleChannel(
        djDifmAllStyleChannel.query,
      ),
  },
  {
    name: 'dj_difm_all_style_channel with empty sources',
    recording: djDifmAllStyleChannelEmpty,
    bodySchema: DjDifmAllStyleChannelBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmAllStyleChannel(
        djDifmAllStyleChannelEmpty.query,
      ),
  },
  {
    name: 'dj_difm_playing_tracks_list',
    recording: djDifmPlayingTracksList,
    bodySchema: DjDifmPlayingTracksListBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmPlayingTracksList(
        djDifmPlayingTracksList.query,
      ),
  },
  {
    name: 'dj_difm_playing_tracks_list for an unknown channel',
    recording: djDifmPlayingTracksListUnknown,
    bodySchema: DjDifmPlayingTracksListBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmPlayingTracksList(
        djDifmPlayingTracksListUnknown.query,
      ),
  },
  {
    name: 'dj_difm_subscribe_channels_get',
    recording: djDifmSubscribeChannelsGet,
    bodySchema: DjDifmSubscribeChannelsGetBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmSubscribeChannelsGet(
        djDifmSubscribeChannelsGet.query,
      ),
  },
  {
    name: 'dj_today_perfered',
    recording: djTodayPerfered,
    bodySchema: DjTodayPerferedBody,
    call: (upstream, status) =>
      replay(upstream, status).djTodayPerfered(djTodayPerfered.query),
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
    name: 'dj_program without a radio id',
    status: 400,
    recording: djProgramMissingRid,
    call: (upstream, status) =>
      replay(upstream, status).djProgram(djProgramMissingRid.query),
  },
  {
    name: 'dj_program_detail for an unknown program',
    status: 404,
    recording: djProgramDetailUnknown,
    call: (upstream, status) =>
      replay(upstream, status).djProgramDetail(djProgramDetailUnknown.query),
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

test('dj_program rejects a body without the program list', async () => {
  const upstream = structuredClone(djProgram.response.body) as {
    programs: unknown;
  };
  upstream.programs = {};

  await expectUpstreamShapeRejection(
    replay(upstream).djProgram(djProgram.query),
    {
      module: 'dj_program',
      path: 'body.programs',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('dj_program rejects a program without an id', async () => {
  const upstream = structuredClone(djProgram.response.body);
  delete (upstream.programs[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djProgram(djProgram.query),
    {
      module: 'dj_program',
      path: 'body.programs[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_program drops bad program fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(djProgram.response.body) as unknown as {
    count?: unknown;
    more: unknown;
    extraSource?: unknown;
    programs: Array<Record<string, unknown>>;
  };
  delete upstream.count;
  upstream.more = null;
  upstream.extraSource = 'probe';
  upstream.programs[0]!.name = 42;
  upstream.programs[0]!.dj = 'none';
  upstream.programs[0]!.customFlag = { enabled: true };

  const result = await replay(upstream).djProgram(djProgram.query);

  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body as unknown).toHaveProperty('extraSource', 'probe');
  expect((result.body as { more: unknown }).more).toBeNull();
  const [program] = (
    result.body as unknown as { programs: Array<Record<string, unknown>> }
  ).programs;
  expect(program).not.toHaveProperty('name');
  expect(program).not.toHaveProperty('dj');
  expect(program).toHaveProperty('customFlag', { enabled: true });
  expect(program!.id).toBe(djProgram.response.body.programs[0]!.id);
});

test('dj_program_detail rejects a body without the program', async () => {
  const upstream = structuredClone(djProgramDetail.response.body) as {
    program: unknown;
  };
  upstream.program = null;

  await expectUpstreamShapeRejection(
    replay(upstream).djProgramDetail(djProgramDetail.query),
    {
      module: 'dj_program_detail',
      path: 'body.program',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('dj_program_detail rejects a program whose id is text', async () => {
  const upstream = structuredClone(djProgramDetail.response.body);
  (upstream.program as { id: unknown }).id = '2066770638';

  await expectUpstreamShapeRejection(
    replay(upstream).djProgramDetail(djProgramDetail.query),
    {
      module: 'dj_program_detail',
      path: 'body.program.id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_program_toplist rejects a ranked program without an id', async () => {
  const upstream = structuredClone(djProgramToplist.response.body);
  delete (upstream.toplist[0]!.program as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djProgramToplist(djProgramToplist.query),
    {
      module: 'dj_program_toplist',
      path: 'body.toplist[0].program.id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_program_toplist_hours rejects a body without list data', async () => {
  const upstream = structuredClone(djProgramToplistHours.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).djProgramToplistHours(djProgramToplistHours.query),
    {
      module: 'dj_program_toplist_hours',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('program_recommend rejects a body without the program list', async () => {
  const upstream = structuredClone(programRecommend.response.body) as {
    programs?: unknown;
  };
  delete upstream.programs;

  await expectUpstreamShapeRejection(
    replay(upstream).programRecommend(programRecommend.query),
    {
      module: 'program_recommend',
      path: 'body.programs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_personalize_recommend rejects a radio without an id', async () => {
  const upstream = structuredClone(djPersonalizeRecommend.response.body);
  delete (upstream.data[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djPersonalizeRecommend(djPersonalizeRecommend.query),
    {
      module: 'dj_personalize_recommend',
      path: 'body.data[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_djprogram rejects a recommendation whose id is text', async () => {
  const upstream = structuredClone(personalizedDjprogram.response.body);
  (upstream.result[0] as { id: unknown }).id = '3729953121';

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedDjprogram(personalizedDjprogram.query),
    {
      module: 'personalized_djprogram',
      path: 'body.result[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('personalized_djprogram drops a bad nested program field and keeps the item', async () => {
  const upstream = structuredClone(
    personalizedDjprogram.response.body,
  ) as unknown as {
    result: Array<{
      program: Record<string, unknown> & { radio: Record<string, unknown> };
    }>;
  };
  upstream.result[0]!.program.publish = 'yes';
  upstream.result[0]!.program.radio = {
    ...upstream.result[0]!.program.radio,
    whiteList: 'no',
    hightQuality: true,
  };
  upstream.result[0]!.program.extraField = 7;

  const result = await replay(upstream).personalizedDjprogram(
    personalizedDjprogram.query,
  );

  const program = (
    result.body as unknown as {
      result: Array<{ program: Record<string, unknown> }>;
    }
  ).result[0]!.program;
  expect(program).not.toHaveProperty('publish');
  expect(program).toHaveProperty('extraField', 7);
  expect(program.radio).toHaveProperty('hightQuality', true);
  expect(program.radio).not.toHaveProperty('whiteList');
});

test('dj_difm_all_style_channel rejects a style without channels', async () => {
  const upstream = structuredClone(
    djDifmAllStyleChannel.response.body,
  ) as unknown as {
    data: Array<{ styles: Array<{ channels?: unknown }> }>;
  };
  delete upstream.data[0]!.styles[0]!.channels;

  await expectUpstreamShapeRejection(
    replay(upstream).djDifmAllStyleChannel(djDifmAllStyleChannel.query),
    {
      module: 'dj_difm_all_style_channel',
      path: 'body.data[0].styles[0].channels',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_difm_all_style_channel drops a bad channel description and keeps the channel', async () => {
  const upstream = structuredClone(
    djDifmAllStyleChannel.response.body,
  ) as unknown as {
    data: Array<{
      styles: Array<{ channels: Array<Record<string, unknown>> }>;
    }>;
  };
  const [channel] = upstream.data[0]!.styles[0]!.channels;
  channel!.description = 42;
  channel!.radar = 'none';

  const result = await replay(upstream).djDifmAllStyleChannel(
    djDifmAllStyleChannel.query,
  );

  const [tightened] = (
    result.body as unknown as {
      data: Array<{
        styles: Array<{ channels: Array<Record<string, unknown>> }>;
      }>;
    }
  ).data[0]!.styles[0]!.channels;
  expect(tightened).not.toHaveProperty('description');
  expect(tightened).not.toHaveProperty('radar');
  expect(tightened!.id).toBe(
    djDifmAllStyleChannel.response.body.data[0]!.styles[0]!.channels[0]!.id,
  );
});

test('dj_difm_playing_tracks_list rejects a body without the track list', async () => {
  const upstream = structuredClone(
    djDifmPlayingTracksList.response.body,
  ) as unknown as {
    data: Record<string, unknown>;
  };
  delete upstream.data.list;

  await expectUpstreamShapeRejection(
    replay(upstream).djDifmPlayingTracksList(djDifmPlayingTracksList.query),
    {
      module: 'dj_difm_playing_tracks_list',
      path: 'body.data.list',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_difm_playing_tracks_list drops a bad waveform and keeps the track', async () => {
  const upstream = structuredClone(
    djDifmPlayingTracksList.response.body,
  ) as unknown as {
    data: { list: Array<Record<string, unknown>> };
  };
  const [track] = upstream.data.list;
  track!.wave = 'none';
  track!.artist = null;
  track!.customSource = 'difm';

  const result = await replay(upstream).djDifmPlayingTracksList(
    djDifmPlayingTracksList.query,
  );

  const [tightened] = (
    result.body as unknown as { data: { list: Array<Record<string, unknown>> } }
  ).data.list;
  expect(tightened).not.toHaveProperty('wave');
  expect(tightened).toHaveProperty('artist', null);
  expect(tightened).toHaveProperty('customSource', 'difm');
  expect(tightened!.id).toBe(
    djDifmPlayingTracksList.response.body.data.list[0]!.id,
  );
});

test('dj_difm_subscribe_channels_get rejects a body without a return code', async () => {
  const upstream = structuredClone(
    djDifmSubscribeChannelsGet.response.body,
  ) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).djDifmSubscribeChannelsGet(
      djDifmSubscribeChannelsGet.query,
    ),
    {
      module: 'dj_difm_subscribe_channels_get',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_today_perfered rejects a body without a return code', async () => {
  const upstream = structuredClone(djTodayPerfered.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).djTodayPerfered(djTodayPerfered.query),
    {
      module: 'dj_today_perfered',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_program rejects a non-boolean asc without calling upstream', async () => {
  let calls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      calls += 1;
      return Response.json(djProgram.response.body);
    },
  });

  expect(await settle(api.djProgram({ rid: 792544462, asc: {} }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'asc must be a boolean, number or string' },
    },
  });
  expect(calls).toBe(0);
});

test('dj_program_detail drops bad fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(
    djProgramDetail.response.body,
  ) as unknown as {
    program: Record<string, unknown>;
  };
  upstream.program.listenerCount = '2791801';
  upstream.program.dj = 'none';
  upstream.program.specialTags = 42;
  upstream.program.programDesc = 'none';
  upstream.program.songs = [{ id: 1 }];
  upstream.program.customSource = 'detail';

  const result = await replay(upstream).djProgramDetail(djProgramDetail.query);

  const program = (
    result.body as unknown as { program: Record<string, unknown> }
  ).program;
  expect(program).not.toHaveProperty('listenerCount');
  expect(program).not.toHaveProperty('dj');
  expect(program).not.toHaveProperty('specialTags');
  expect(program).not.toHaveProperty('programDesc');
  expect(program).toHaveProperty('customSource', 'detail');
  expect(program.songs).toEqual([{ id: 1 }]);
  expect(program.id).toBe(djProgramDetail.response.body.program.id);
});

test('dj_program_detail drops a bad anchor info and keeps undeclared anchor fields', async () => {
  const upstream = structuredClone(
    djProgramDetailAnchors.response.body,
  ) as unknown as {
    program: { participateAnchors: Array<Record<string, unknown>> };
  };
  upstream.program.participateAnchors[0]!.anchorInfo = 'none';
  upstream.program.participateAnchors[0]!.basicDivide = 0.5;

  const result = await replay(upstream).djProgramDetail(
    djProgramDetailAnchors.query,
  );

  const [anchor] = (
    result.body as unknown as {
      program: { participateAnchors: Array<Record<string, unknown>> };
    }
  ).program.participateAnchors;
  expect(anchor).not.toHaveProperty('anchorInfo');
  expect(anchor).toHaveProperty('basicDivide', 0.5);
  expect(anchor!.userId).toBe(
    djProgramDetailAnchors.response.body.program.participateAnchors[0]!.userId,
  );
  expect(anchor!.type).toBe(6);
});

test('dj_program_toplist drops a bad rank and keeps undeclared entry fields', async () => {
  const upstream = structuredClone(
    djProgramToplist.response.body,
  ) as unknown as {
    toplist: Array<Record<string, unknown>>;
  };
  upstream.toplist[0]!.rank = '1';
  upstream.toplist[0]!.programFeeType = 'free';
  upstream.toplist[0]!.lastRank = null;
  upstream.toplist[0]!.customSource = 'toplist';

  const result = await replay(upstream).djProgramToplist(
    djProgramToplist.query,
  );

  const [entry] = (
    result.body as unknown as { toplist: Array<Record<string, unknown>> }
  ).toplist;
  expect(entry).not.toHaveProperty('rank');
  expect(entry).not.toHaveProperty('programFeeType');
  expect(entry).toHaveProperty('lastRank', null);
  expect(entry).toHaveProperty('customSource', 'toplist');
  expect((entry!.program as { id: number }).id).toBe(
    djProgramToplist.response.body.toplist[0]!.program.id,
  );
});

test('dj_program_toplist_hours drops bad stats and keeps the ranked program', async () => {
  const upstream = structuredClone(
    djProgramToplistHours.response.body,
  ) as unknown as {
    data: Record<string, unknown> & {
      list: Array<Record<string, unknown>>;
    };
  };
  upstream.data.total = '99';
  upstream.data.updateTime = null;
  upstream.data.customSource = 'hours';
  upstream.data.list[0]!.score = '662431';
  upstream.data.list[0]!.programFeeType = {};

  const result = await replay(upstream).djProgramToplistHours(
    djProgramToplistHours.query,
  );

  const data = (
    result.body as unknown as {
      data: Record<string, unknown> & {
        list: Array<Record<string, unknown>>;
      };
    }
  ).data;
  expect(data).not.toHaveProperty('total');
  expect(data).toHaveProperty('updateTime', null);
  expect(data).toHaveProperty('customSource', 'hours');
  expect(data.list[0]).not.toHaveProperty('score');
  expect(data.list[0]).not.toHaveProperty('programFeeType');
  expect((data.list[0]!.program as { id: number }).id).toBe(
    djProgramToplistHours.response.body.data.list[0]!.program.id,
  );
});

test('program_recommend drops a bad name and more and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    programRecommend.response.body,
  ) as unknown as {
    more: unknown;
    name: unknown;
    customSource?: unknown;
  };
  upstream.name = 3073100386;
  upstream.more = 'no';
  upstream.customSource = 'recommend';

  const result = await replay(upstream).programRecommend(
    programRecommend.query,
  );

  expect(result.body as unknown).not.toHaveProperty('name');
  expect(result.body as unknown).not.toHaveProperty('more');
  expect(result.body as unknown).toHaveProperty('customSource', 'recommend');
  expect(
    (result.body as unknown as { programs: Array<{ id: number }> }).programs[0]!
      .id,
  ).toBe(programRecommend.response.body.programs[0]!.id);
});

test('dj_personalize_recommend drops a bad radio field and keeps the radio', async () => {
  const upstream = structuredClone(
    djPersonalizeRecommend.response.body,
  ) as unknown as {
    data: Array<Record<string, unknown>>;
  };
  upstream.data[0]!.desc = 123;
  upstream.data[0]!.dj = 'none';
  upstream.data[0]!.customSource = 'personalize';

  const result = await replay(upstream).djPersonalizeRecommend(
    djPersonalizeRecommend.query,
  );

  const [radio] = (
    result.body as unknown as { data: Array<Record<string, unknown>> }
  ).data;
  expect(radio).not.toHaveProperty('desc');
  expect(radio).not.toHaveProperty('dj');
  expect(radio).toHaveProperty('customSource', 'personalize');
  expect(radio!.id).toBe(djPersonalizeRecommend.response.body.data[0]!.id);
});

test('dj_difm_subscribe_channels_get drops a bad message and keeps undeclared data', async () => {
  const upstream = structuredClone(
    djDifmSubscribeChannelsGet.response.body,
  ) as unknown as {
    data?: unknown;
    message: unknown;
  };
  upstream.message = {};
  upstream.data = [{ channelId: 10505 }];

  const result = await replay(upstream).djDifmSubscribeChannelsGet(
    djDifmSubscribeChannelsGet.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('data', [{ channelId: 10505 }]);
});

test('dj_today_perfered keeps undeclared msg and data values', async () => {
  const upstream = structuredClone(
    djTodayPerfered.response.body,
  ) as unknown as {
    data?: unknown;
    msg?: unknown;
  };
  upstream.msg = { reason: 'empty' };
  upstream.data = [{ id: 1 }];

  const result = await replay(upstream).djTodayPerfered(djTodayPerfered.query);

  expect(result.body as unknown).toHaveProperty('msg', { reason: 'empty' });
  expect(result.body as unknown).toHaveProperty('data', [{ id: 1 }]);
  expect((result.body as { code: number }).code).toBe(200);
});

test('program bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    DjProgramBody['programs'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<DjProgramBody['programs'][number]['name']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<DjProgramBody['count']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<DjProgramDetailBody['program']['id']>().toEqualTypeOf<number>();
  expectTypeOf<
    DjProgramToplistBody['toplist'][number]['program']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<DjProgramToplistBody['toplist'][number]['rank']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    DjProgramToplistHoursBody['data']['list'][number]['program']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    ProgramRecommendBody['programs'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjPersonalizeRecommendBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    PersonalizedDjprogramBody['result'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<
      PersonalizedDjprogramBody['result'][number]['program']
    >['publish']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<
    DjDifmAllStyleChannelBody['data'][number]['styles'][number]['channels'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjDifmPlayingTracksListBody['data']['list'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<DjTodayPerferedBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<DjDifmSubscribeChannelsGetBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    NonNullable<
      DjProgramBody['programs'][number]['participateAnchors']
    >[number]['userId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    DjProgramToplistBody['toplist'][number]['programFeeType']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    DjProgramToplistHoursBody['data']['list'][number]['programFeeType']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    DjProgramBody['programs'][number]['specialTags']
  >().toEqualTypeOf<ReadonlyArray<string> | null | undefined>();
  expectTypeOf<
    NonNullable<
      DjProgramBody['programs'][number]['programDesc']
    >[number]['content']
  >().toEqualTypeOf<string | null | undefined>();
});
