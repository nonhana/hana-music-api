import { expect, expectTypeOf, test } from 'bun:test';

import {
  AidjContentRcmdBody,
  createHanaMusicApi,
  MlogMusicRcmdBody,
  PersonalFmBody,
  PersonalFmModeBody,
  PlaymodeIntelligenceListBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import aidjContentRcmdAnonymous from '../fixtures/netease/recommend/aidj_content_rcmd.anonymous.json';
import aidjContentRcmd from '../fixtures/netease/recommend/aidj_content_rcmd.default.json';
import aidjContentRcmdLocation from '../fixtures/netease/recommend/aidj_content_rcmd.with-location.json';
import mlogMusicRcmd from '../fixtures/netease/recommend/mlog_music_rcmd.default.json';
import mlogMusicRcmdEmpty from '../fixtures/netease/recommend/mlog_music_rcmd.empty.json';
import personalFmAnonymous from '../fixtures/netease/recommend/personal_fm.anonymous.json';
import personalFm from '../fixtures/netease/recommend/personal_fm.default.json';
import personalFmModeAidj from '../fixtures/netease/recommend/personal_fm_mode.aidj.json';
import personalFmModeAnonymous from '../fixtures/netease/recommend/personal_fm_mode.anonymous.json';
import personalFmMode from '../fixtures/netease/recommend/personal_fm_mode.default.json';
import personalFmModeExplore from '../fixtures/netease/recommend/personal_fm_mode.explore.json';
import personalFmModeFamiliar from '../fixtures/netease/recommend/personal_fm_mode.familiar.json';
import personalFmModeSceneExercise from '../fixtures/netease/recommend/personal_fm_mode.scene-exercise.json';
import personalFmModeSceneFocus from '../fixtures/netease/recommend/personal_fm_mode.scene-focus.json';
import personalFmModeSceneNightEmo from '../fixtures/netease/recommend/personal_fm_mode.scene-night-emo.json';
import playmodeIntelligenceList from '../fixtures/netease/recommend/playmode_intelligence_list.default.json';
import playmodeIntelligenceListNoPid from '../fixtures/netease/recommend/playmode_intelligence_list.no-pid.json';
import playmodeIntelligenceListUnsupported from '../fixtures/netease/recommend/playmode_intelligence_list.unsupported-playlist.json';

// issue #102 B40 的录制：私人 FM、心动模式与推荐接口。登录对照先经 login_status 确认
// account.anonimousUser 为 false；personal_fm、personal_fm_mode 和 aidj_content_rcmd
// 另保留匿名录制。列表类接口中只有 mlog_music_rcmd 录到可达空结果；另有缺口见
// website/guide/response-bodies.md。
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
    name: 'personal_fm',
    recording: personalFm,
    bodySchema: PersonalFmBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFm(personalFm.query),
  },
  {
    name: 'personal_fm anonymously',
    recording: personalFmAnonymous,
    bodySchema: PersonalFmBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFm(personalFmAnonymous.query),
  },
  {
    name: 'personal_fm_mode DEFAULT',
    recording: personalFmMode,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(personalFmMode.query),
  },
  {
    name: 'personal_fm_mode FAMILIAR',
    recording: personalFmModeFamiliar,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(personalFmModeFamiliar.query),
  },
  {
    name: 'personal_fm_mode EXPLORE',
    recording: personalFmModeExplore,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(personalFmModeExplore.query),
  },
  {
    name: 'personal_fm_mode aidj',
    recording: personalFmModeAidj,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(personalFmModeAidj.query),
  },
  {
    name: 'personal_fm_mode SCENE_RCMD FOCUS',
    recording: personalFmModeSceneFocus,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(personalFmModeSceneFocus.query),
  },
  {
    name: 'personal_fm_mode SCENE_RCMD EXERCISE',
    recording: personalFmModeSceneExercise,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(
        personalFmModeSceneExercise.query,
      ),
  },
  {
    name: 'personal_fm_mode SCENE_RCMD NIGHT_EMO',
    recording: personalFmModeSceneNightEmo,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(
        personalFmModeSceneNightEmo.query,
      ),
  },
  {
    name: 'personal_fm_mode anonymously',
    recording: personalFmModeAnonymous,
    bodySchema: PersonalFmModeBody,
    call: (upstream, status) =>
      replay(upstream, status).personalFmMode(personalFmModeAnonymous.query),
  },
  {
    name: 'playmode_intelligence_list',
    recording: playmodeIntelligenceList,
    bodySchema: PlaymodeIntelligenceListBody,
    call: (upstream, status) =>
      replay(upstream, status).playmodeIntelligenceList(
        playmodeIntelligenceList.query,
      ),
  },
  {
    name: 'aidj_content_rcmd',
    recording: aidjContentRcmd,
    bodySchema: AidjContentRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).aidjContentRcmd(aidjContentRcmd.query),
  },
  {
    name: 'aidj_content_rcmd with coordinates',
    recording: aidjContentRcmdLocation,
    bodySchema: AidjContentRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).aidjContentRcmd(aidjContentRcmdLocation.query),
  },
  {
    name: 'aidj_content_rcmd anonymously',
    recording: aidjContentRcmdAnonymous,
    bodySchema: AidjContentRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).aidjContentRcmd(aidjContentRcmdAnonymous.query),
  },
  {
    name: 'mlog_music_rcmd',
    recording: mlogMusicRcmd,
    bodySchema: MlogMusicRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).mlogMusicRcmd(mlogMusicRcmd.query),
  },
  {
    name: 'mlog_music_rcmd without related videos',
    recording: mlogMusicRcmdEmpty,
    bodySchema: MlogMusicRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).mlogMusicRcmd(mlogMusicRcmdEmpty.query),
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

test('playmode_intelligence_list passes an unsupported playlist code through', async () => {
  expect(
    await settle(
      replay(
        playmodeIntelligenceListUnsupported.response.body,
        playmodeIntelligenceListUnsupported.response.status,
      ).playmodeIntelligenceList(playmodeIntelligenceListUnsupported.query),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: playmodeIntelligenceListUnsupported.response.body,
    },
  });
});

test('playmode_intelligence_list passes a missing playlist id through', async () => {
  expect(
    await settle(
      replay(
        playmodeIntelligenceListNoPid.response.body,
        playmodeIntelligenceListNoPid.response.status,
      ).playmodeIntelligenceList(playmodeIntelligenceListNoPid.query),
    ),
  ).toEqual({
    rejected: {
      status: 500,
      cookie: [],
      body: {
        ...playmodeIntelligenceListNoPid.response.body,
        code: 500,
      },
    },
  });
});

test('personal FM bodies type tightened songs and loose fields', () => {
  expectTypeOf<PersonalFmBody['data'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<PersonalFmBody['data'][number]['popularity']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<PersonalFmBody['data'][number]['starred']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<PersonalFmBody['data'][number]['fmRecReason']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<PersonalFmBody['popAdjust']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    PersonalFmModeBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    PlaymodeIntelligenceListBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<PlaymodeIntelligenceListBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    NonNullable<PlaymodeIntelligenceListBody['data'][number]['songInfo']>['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    AidjContentRcmdBody['data']['aiDjResources'][number]['type']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    NonNullable<
      AidjContentRcmdBody['data']['aiDjResources'][number]['value']
    >['songId']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    NonNullable<
      NonNullable<
        AidjContentRcmdBody['data']['aiDjResources'][number]['value']
      >['songData']
    >['popularity']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<
      NonNullable<
        AidjContentRcmdBody['data']['aiDjResources'][number]['value']
      >['songData']
    >['starred']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<
    MlogMusicRcmdBody['data']['feeds'][number]['id']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    NonNullable<
      NonNullable<
        MlogMusicRcmdBody['data']['feeds'][number]['resource']
      >['userProfile']
    >['nickname']
  >().toEqualTypeOf<string | null | undefined>();
});

test('personal FM modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.personalFm(null as never),
    () => api.personalFmMode(null as never),
    () => api.playmodeIntelligenceList(null as never),
    () => api.aidjContentRcmd(null as never),
    () => api.mlogMusicRcmd(null as never),
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

test('personal_fm rejects a body without a song list', async () => {
  const upstream = structuredClone(personalFm.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).personalFm(personalFm.query),
    {
      module: 'personal_fm',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personal_fm rejects a non-array song list', async () => {
  const upstream = structuredClone(personalFm.response.body) as unknown as {
    data: unknown;
  };
  upstream.data = {};

  await expectUpstreamShapeRejection(
    replay(upstream).personalFm(personalFm.query),
    {
      module: 'personal_fm',
      path: 'body.data',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('personal_fm rejects a song without an id', async () => {
  const upstream = structuredClone(personalFm.response.body) as {
    data: Array<{ id?: unknown }>;
  };
  delete upstream.data[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).personalFm(personalFm.query),
    {
      module: 'personal_fm',
      path: 'body.data[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personal_fm_mode rejects a song id that is text', async () => {
  const upstream = structuredClone(personalFmMode.response.body) as {
    data: Array<{ id: unknown }>;
  };
  upstream.data[0]!.id = '3429984635';

  await expectUpstreamShapeRejection(
    replay(upstream).personalFmMode(personalFmMode.query),
    {
      module: 'personal_fm_mode',
      path: 'body.data[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('personal_fm_mode drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(personalFmMode.response.body) as {
    extTransMap: unknown;
    popAdjust: unknown;
    tag?: unknown;
  };
  upstream.extTransMap = 'none';
  upstream.popAdjust = 'yes';
  delete upstream.tag;
  (upstream as Record<string, unknown>).extra = { source: 'fm-mode' };

  const result = await replay(upstream).personalFmMode(personalFmMode.query);

  expect(result.body as unknown).not.toHaveProperty('extTransMap');
  expect(result.body as unknown).not.toHaveProperty('popAdjust');
  expect(result.body as unknown).not.toHaveProperty('tag');
  expect(result.body as unknown).toHaveProperty('extra', {
    source: 'fm-mode',
  });
});

test('personal_fm_mode keeps recommendation reason map values', async () => {
  const reasons = personalFmMode.response.body.extTransMap as Record<
    string,
    { fmRecReason: string }
  >;
  const reasonKey = Object.keys(reasons)[0]!;
  const reason = reasons[reasonKey]!.fmRecReason;

  const result = await replay(personalFmMode.response.body).personalFmMode(
    personalFmMode.query,
  );

  expect(result.body.extTransMap?.[reasonKey]?.fmRecReason).toBe(reason);
});

test('personal_fm_mode drops a bad recommendation reason value', async () => {
  const reasons = personalFmMode.response.body.extTransMap as Record<
    string,
    { fmRecReason: string }
  >;
  const reasonKey = Object.keys(reasons)[0]!;
  const upstream = structuredClone(personalFmMode.response.body) as {
    extTransMap: Record<string, { fmRecReason?: unknown; extra?: string }>;
  };
  upstream.extTransMap[reasonKey] = { fmRecReason: 42, extra: 'kept' };

  const result = await replay(upstream).personalFmMode(personalFmMode.query);

  const recorded = result.body.extTransMap?.[reasonKey];
  expect(recorded).not.toHaveProperty('fmRecReason');
  expect(recorded).toHaveProperty('extra', 'kept');
});

test('personal_fm keeps a null extTransMap and undeclared fields', async () => {
  const upstream = structuredClone(personalFmAnonymous.response.body) as {
    extTransMap: unknown;
    tag?: unknown;
  };
  upstream.extTransMap = null;
  (upstream as Record<string, unknown>).extra = 'kept';

  const result = await replay(upstream).personalFm(personalFmAnonymous.query);

  expect((result.body as { extTransMap?: unknown }).extTransMap).toBeNull();
  expect(result.body as unknown).toHaveProperty('tag', null);
  expect(result.body as unknown).toHaveProperty('extra', 'kept');
});

test('playmode_intelligence_list rejects a body without a song list', async () => {
  const upstream = structuredClone(playmodeIntelligenceList.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).playmodeIntelligenceList(playmodeIntelligenceList.query),
    {
      module: 'playmode_intelligence_list',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playmode_intelligence_list rejects a non-array song list', async () => {
  const upstream = structuredClone(
    playmodeIntelligenceList.response.body,
  ) as unknown as {
    data: unknown;
  };
  upstream.data = {};

  await expectUpstreamShapeRejection(
    replay(upstream).playmodeIntelligenceList(playmodeIntelligenceList.query),
    {
      module: 'playmode_intelligence_list',
      path: 'body.data',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('playmode_intelligence_list rejects a recommendation without an id', async () => {
  const upstream = structuredClone(playmodeIntelligenceList.response.body) as {
    data: Array<{ id?: unknown }>;
  };
  delete upstream.data[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).playmodeIntelligenceList(playmodeIntelligenceList.query),
    {
      module: 'playmode_intelligence_list',
      path: 'body.data[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playmode_intelligence_list keeps a songInfo without an id', async () => {
  const upstream = structuredClone(
    playmodeIntelligenceList.response.body,
  ) as unknown as {
    data: Array<{ songInfo?: { id?: unknown; name?: unknown } }>;
  };
  const originalName = upstream.data[0]!.songInfo?.name;
  delete upstream.data[0]!.songInfo!.id;

  const result = await replay(upstream).playmodeIntelligenceList(
    playmodeIntelligenceList.query,
  );

  const songInfo = (
    result.body as unknown as {
      data: Array<{ songInfo?: Record<string, unknown> }>;
    }
  ).data[0]!.songInfo;
  expect(songInfo).not.toHaveProperty('id');
  expect(songInfo).toHaveProperty('name', originalName);
});

test('playmode_intelligence_list keeps a songInfo whose id is text', async () => {
  const upstream = structuredClone(
    playmodeIntelligenceList.response.body,
  ) as unknown as {
    data: Array<{ songInfo?: { id?: unknown; name?: unknown } }>;
  };
  const originalName = upstream.data[0]!.songInfo?.name;
  upstream.data[0]!.songInfo!.id = '190381';

  const result = await replay(upstream).playmodeIntelligenceList(
    playmodeIntelligenceList.query,
  );

  const songInfo = (
    result.body as unknown as {
      data: Array<{ songInfo?: Record<string, unknown> }>;
    }
  ).data[0]!.songInfo;
  expect(songInfo).not.toHaveProperty('id');
  expect(songInfo).toHaveProperty('name', originalName);
});

test('playmode_intelligence_list keeps missing and null loose fields', async () => {
  const upstream = structuredClone(
    playmodeIntelligenceList.response.body,
  ) as unknown as {
    message?: unknown;
    data: Array<{ alg?: unknown; recommended?: unknown }>;
  };
  delete upstream.message;
  upstream.data[0]!.alg = null;
  upstream.data[0]!.recommended = null;

  const result = await replay(upstream).playmodeIntelligenceList(
    playmodeIntelligenceList.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  const first = (
    result.body as unknown as { data: Array<Record<string, unknown>> }
  ).data[0]!;
  expect(first.alg).toBeNull();
  expect(first.recommended).toBeNull();
});

test('playmode_intelligence_list drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    playmodeIntelligenceList.response.body,
  ) as unknown as {
    message: unknown;
    data: Array<Record<string, unknown>>;
  };
  upstream.message = 42;
  upstream.data[0]!.recommended = 'yes';
  upstream.data[0]!.songInfo = 'none';
  upstream.data[0]!.extra = 'kept';

  const result = await replay(upstream).playmodeIntelligenceList(
    playmodeIntelligenceList.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  const first = (
    result.body as unknown as { data: Array<Record<string, unknown>> }
  ).data[0]!;
  expect(first).not.toHaveProperty('recommended');
  expect(first).not.toHaveProperty('songInfo');
  expect(first).toHaveProperty('extra', 'kept');
  expect(first.id).toBe(playmodeIntelligenceList.response.body.data[0]?.id);
});

test('aidj_content_rcmd rejects a body without DJ resources', async () => {
  const upstream = structuredClone(aidjContentRcmd.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).aidjContentRcmd(aidjContentRcmd.query),
    {
      module: 'aidj_content_rcmd',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('aidj_content_rcmd rejects a non-array resource list', async () => {
  const upstream = structuredClone(aidjContentRcmd.response.body) as {
    data: { aiDjResources: unknown };
  };
  upstream.data.aiDjResources = 'none';

  await expectUpstreamShapeRejection(
    replay(upstream).aidjContentRcmd(aidjContentRcmd.query),
    {
      module: 'aidj_content_rcmd',
      path: 'body.data.aiDjResources',
      expected: 'array',
      actual: 'string',
    },
  );
});

test('aidj_content_rcmd drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(aidjContentRcmd.response.body) as {
    trp: { rules: unknown };
    data: Record<string, unknown> & {
      aiDjResources: Array<Record<string, unknown>>;
    };
  };
  upstream.trp = { rules: 'none' };
  upstream.data.tagName = 5;
  upstream.data.extra = 'kept';
  const [first] = upstream.data.aiDjResources;
  first!.value = { extraNested: 'kept' };

  const result = await replay(upstream).aidjContentRcmd(aidjContentRcmd.query);

  expect((result.body as { trp?: unknown }).trp).toEqual({});
  expect(result.body.data as unknown).not.toHaveProperty('tagName');
  expect(result.body.data as unknown).toHaveProperty('extra', 'kept');
  expect(result.body.data.aiDjResources[0]!.value).toEqual({
    extraNested: 'kept',
  });
});

test('aidj_content_rcmd keeps missing and null loose fields', async () => {
  const upstream = structuredClone(aidjContentRcmd.response.body) as {
    message?: unknown;
    trp?: unknown;
    data: Record<string, unknown> & {
      aiDjResources: Array<Record<string, unknown>>;
    };
  };
  delete upstream.message;
  delete upstream.trp;
  delete upstream.data.tagName;
  upstream.data.aiDjResources[0]!.type = null;

  const result = await replay(upstream).aidjContentRcmd(aidjContentRcmd.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).not.toHaveProperty('trp');
  expect(result.body.data as unknown).not.toHaveProperty('tagName');
  expect(result.body.data.aiDjResources[0]!.type).toBeNull();
});

test('aidj_content_rcmd drops a bad value field and keeps the resource', async () => {
  const upstream = structuredClone(aidjContentRcmd.response.body) as {
    data: {
      aiDjResources: Array<{
        type?: unknown;
        value: Record<string, unknown>;
      }>;
    };
  };
  const songResource = upstream.data.aiDjResources.find(
    (resource) => resource.type === 'song',
  )!;
  songResource.value.songId = 123;
  songResource.value.extraNested = 'kept';

  const result = await replay(upstream).aidjContentRcmd(aidjContentRcmd.query);

  const recorded = result.body.data.aiDjResources.find(
    (resource) => resource.value?.songData !== undefined,
  )!;
  expect(recorded.value as unknown).not.toHaveProperty('songId');
  expect(recorded.value as unknown).toHaveProperty('songData');
  expect(recorded.value as unknown).toHaveProperty('extraNested', 'kept');
});

test('mlog_music_rcmd rejects a feed id that is a number', async () => {
  const upstream = structuredClone(mlogMusicRcmd.response.body) as {
    data: { feeds: Array<{ id: unknown }> };
  };
  upstream.data.feeds[0]!.id = 1;

  await expectUpstreamShapeRejection(
    replay(upstream).mlogMusicRcmd(mlogMusicRcmd.query),
    {
      module: 'mlog_music_rcmd',
      path: 'body.data.feeds[0].id',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('mlog_music_rcmd rejects a body without a feed list', async () => {
  const upstream = structuredClone(mlogMusicRcmd.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).mlogMusicRcmd(mlogMusicRcmd.query),
    {
      module: 'mlog_music_rcmd',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('mlog_music_rcmd rejects a non-array feed list', async () => {
  const upstream = structuredClone(mlogMusicRcmd.response.body) as {
    data: { feeds: unknown };
  };
  upstream.data.feeds = 'x';

  await expectUpstreamShapeRejection(
    replay(upstream).mlogMusicRcmd(mlogMusicRcmd.query),
    {
      module: 'mlog_music_rcmd',
      path: 'body.data.feeds',
      expected: 'array',
      actual: 'string',
    },
  );
});

test('mlog_music_rcmd keeps missing and null loose fields', async () => {
  const upstream = structuredClone(mlogMusicRcmd.response.body) as {
    message?: unknown;
    data: { more?: unknown; msg?: unknown };
  };
  delete upstream.message;
  upstream.data.more = null;

  const result = await replay(upstream).mlogMusicRcmd(mlogMusicRcmd.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body.data.more).toBeNull();
  expect(result.body.data as unknown).toHaveProperty('msg', null);
});

test('mlog_music_rcmd keeps undeclared urlInfo.url and urlInfos', async () => {
  const result = await replay(mlogMusicRcmd.response.body).mlogMusicRcmd(
    mlogMusicRcmd.query,
  );

  const video = (
    result.body.data.feeds[0]!.resource!.mlogBaseData as {
      video?: {
        urlInfo?: Record<string, unknown>;
        urlInfos?: Array<Record<string, unknown>>;
      };
    }
  ).video;
  expect(video?.urlInfo).toHaveProperty('url', null);
  expect(video?.urlInfos?.[0]).toHaveProperty('resolution', 0);
});

test('mlog_music_rcmd drops a bad nested field and keeps the resource', async () => {
  const upstream = structuredClone(mlogMusicRcmd.response.body) as {
    data: {
      feeds: Array<{
        resource: {
          mlogBaseData: Record<string, unknown>;
          userProfile: Record<string, unknown>;
        };
      }>;
    };
  };
  const resource = upstream.data.feeds[0]!.resource;
  resource.mlogBaseData.userId = 'x';
  resource.userProfile.nickname = 42;

  const result = await replay(upstream).mlogMusicRcmd(mlogMusicRcmd.query);

  const recorded = result.body.data.feeds[0]!.resource!;
  const baseData = recorded.mlogBaseData as unknown as Record<string, unknown>;
  const userProfile = recorded.userProfile as unknown as Record<
    string,
    unknown
  >;
  expect(baseData).not.toHaveProperty('userId');
  expect(baseData).toHaveProperty('coverColor');
  expect(userProfile).not.toHaveProperty('nickname');
  expect(userProfile).toHaveProperty('userId');
});

test('mlog_music_rcmd drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(mlogMusicRcmd.response.body) as {
    message: unknown;
    data: {
      more: unknown;
      msg?: unknown;
      feeds: Array<Record<string, unknown>>;
    };
  };
  upstream.message = 42;
  upstream.data.more = 'yes';
  const [first] = upstream.data.feeds;
  first!.extra = 'kept';
  (
    first!.resource as { mlogBaseData: Record<string, unknown> }
  ).mlogBaseData.coverColor = 'red';

  const result = await replay(upstream).mlogMusicRcmd(mlogMusicRcmd.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body.data as unknown).not.toHaveProperty('more');
  expect(result.body.data as unknown).toHaveProperty('msg', null);
  const recordedFirst = result.body.data.feeds[0]!;
  expect(recordedFirst).toHaveProperty('extra', 'kept');
  expect(
    (
      recordedFirst.resource as {
        mlogBaseData?: Record<string, unknown>;
      }
    ).mlogBaseData,
  ).not.toHaveProperty('coverColor');
});
