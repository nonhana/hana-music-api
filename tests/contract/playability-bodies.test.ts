import { expect, expectTypeOf, test } from 'bun:test';

import {
  AudioMatchBody,
  CheckMusicBody,
  createHanaMusicApi,
  SettingBody,
  SongDynamicCoverBody,
  SongLikeCheckBody,
  SongRedCountBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import songLikeCheckAnonymous from '../fixtures/netease/like-collect/song_like_check.anonymous.json';
import songLikeCheckEmptyIds from '../fixtures/netease/like-collect/song_like_check.empty-ids.json';
import songLikeCheckMixed from '../fixtures/netease/like-collect/song_like_check.mixed.json';
import songLikeCheckNone from '../fixtures/netease/like-collect/song_like_check.none.json';
import audioMatchMatchLogin from '../fixtures/netease/playback/audio_match.match-login.json';
import audioMatchMatch from '../fixtures/netease/playback/audio_match.match.json';
import audioMatchNoMatch from '../fixtures/netease/playback/audio_match.no-match.json';
import checkMusicAnonymous from '../fixtures/netease/playback/check_music.anonymous.json';
import checkMusicNoCopyright from '../fixtures/netease/playback/check_music.no-copyright.json';
import checkMusicNonexistent from '../fixtures/netease/playback/check_music.nonexistent.json';
import checkMusicPlayable from '../fixtures/netease/playback/check_music.playable.json';
import songDynamicCoverAnonymous from '../fixtures/netease/song/song_dynamic_cover.anonymous.json';
import songDynamicCoverDefault from '../fixtures/netease/song/song_dynamic_cover.default.json';
import songDynamicCoverEmpty from '../fixtures/netease/song/song_dynamic_cover.empty.json';
import songRedCountAnonymous from '../fixtures/netease/song/song_red_count.anonymous.json';
import songRedCountDefault from '../fixtures/netease/song/song_red_count.default.json';
import songRedCountZero from '../fixtures/netease/song/song_red_count.zero.json';
import settingAnonymous from '../fixtures/netease/user/setting.anonymous.json';
import settingDefault from '../fixtures/netease/user/setting.default.json';

// issue #102 B38 的录制：播放可用性、音频识别与用户设置。登录对照先确认 login_status 的
// account.anonimousUser 为 false；audio_match 的 match 录制只能靠真实歌曲指纹取得，no-match 用
// 合成的 440Hz 音频指纹，`data.result` 是 `null`。check_music 的公开返回体由 SDK 合成，
// 录制保存的是上游原文，最终体写在 `context.expect`；回放按录制原文断言最终体。
test.each<{
  name: string;
  recording: Recording;
  bodySchema: Validator;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'audio_match with a match',
    recording: audioMatchMatch,
    bodySchema: AudioMatchBody,
    call: (upstream, status) =>
      replay(upstream, status).audioMatch(audioMatchMatch.query),
  },
  {
    name: 'audio_match with a match while logged in',
    recording: audioMatchMatchLogin,
    bodySchema: AudioMatchBody,
    call: (upstream, status) =>
      replay(upstream, status).audioMatch(audioMatchMatchLogin.query),
  },
  {
    name: 'audio_match without a match',
    recording: audioMatchNoMatch,
    bodySchema: AudioMatchBody,
    call: (upstream, status) =>
      replay(upstream, status).audioMatch(audioMatchNoMatch.query),
  },
  {
    name: 'song_like_check with liked songs',
    recording: songLikeCheckMixed,
    bodySchema: SongLikeCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).songLikeCheck(songLikeCheckMixed.query),
  },
  {
    name: 'song_like_check without liked songs',
    recording: songLikeCheckNone,
    bodySchema: SongLikeCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).songLikeCheck(songLikeCheckNone.query),
  },
  {
    name: 'song_like_check anonymously',
    recording: songLikeCheckAnonymous,
    bodySchema: SongLikeCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).songLikeCheck(songLikeCheckAnonymous.query),
  },
  {
    name: 'song_red_count',
    recording: songRedCountDefault,
    bodySchema: SongRedCountBody,
    call: (upstream, status) =>
      replay(upstream, status).songRedCount(songRedCountDefault.query),
  },
  {
    name: 'song_red_count anonymously',
    recording: songRedCountAnonymous,
    bodySchema: SongRedCountBody,
    call: (upstream, status) =>
      replay(upstream, status).songRedCount(songRedCountAnonymous.query),
  },
  {
    name: 'song_red_count without red hearts',
    recording: songRedCountZero,
    bodySchema: SongRedCountBody,
    call: (upstream, status) =>
      replay(upstream, status).songRedCount(songRedCountZero.query),
  },
  {
    name: 'song_dynamic_cover with a cover',
    recording: songDynamicCoverDefault,
    bodySchema: SongDynamicCoverBody,
    call: (upstream, status) =>
      replay(upstream, status).songDynamicCover(songDynamicCoverDefault.query),
  },
  {
    name: 'song_dynamic_cover without a cover',
    recording: songDynamicCoverEmpty,
    bodySchema: SongDynamicCoverBody,
    call: (upstream, status) =>
      replay(upstream, status).songDynamicCover(songDynamicCoverEmpty.query),
  },
  {
    name: 'song_dynamic_cover anonymously',
    recording: songDynamicCoverAnonymous,
    bodySchema: SongDynamicCoverBody,
    call: (upstream, status) =>
      replay(upstream, status).songDynamicCover(
        songDynamicCoverAnonymous.query,
      ),
  },
  {
    name: 'setting',
    recording: settingDefault,
    bodySchema: SettingBody,
    call: (upstream, status) =>
      replay(upstream, status).setting(settingDefault.query),
  },
  {
    name: 'setting anonymously',
    recording: settingAnonymous,
    bodySchema: SettingBody,
    call: (upstream, status) =>
      replay(upstream, status).setting(settingAnonymous.query),
  },
])(
  '$name returns the recorded body',
  async ({ recording, bodySchema, call }) => {
    const result = (await call(
      recording.response.body,
      recording.response.status,
    )) as { readonly status: number; readonly body: unknown };

    expect(result.status).toBe(recording.response.status);
    expect(result.body).toEqual(recording.response.body);

    const validated = validateSync(bodySchema, recording.response.body);
    expect(validated.issues).toBeUndefined();
    expect(validated.value).toEqual(recording.response.body);
  },
);

// check_music 的公开体由 SDK 合成：回放录制里的上游原文，断言最终体等于 `context.expect`。
test.each([
  { name: 'playable', recording: checkMusicPlayable },
  { name: 'anonymously', recording: checkMusicAnonymous },
  { name: 'without copyright', recording: checkMusicNoCopyright },
  { name: 'for a nonexistent song', recording: checkMusicNonexistent },
])('check_music $name builds the expected body', async ({ recording }) => {
  const result = await replay(recording.response.body).checkMusic(
    recording.query,
  );

  expect(result.status).toBe(200);
  expect(result.body as unknown).toEqual(recording.context.expect);

  const validated = validateSync(CheckMusicBody, result.body);
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(recording.context.expect);
});

test('check_music hands a non-200 upstream code back as a rejection', async () => {
  expect(await settle(replay({ code: 400 }).checkMusic({ id: 1 }))).toEqual({
    rejected: { status: 400, cookie: [], body: { code: 400 } },
  });
});

test('check_music only needs the playback entry code', async () => {
  const result = await replay({ code: 200, data: [{ code: 200 }] }).checkMusic(
    checkMusicPlayable.query,
  );

  expect(result.body).toEqual({ code: 200, success: true, message: 'ok' });
});

test('check_music rejects data that is not an array or null', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200, data: null }).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body.data',
      expected: 'array',
      actual: 'null',
    },
  );

  await expectUpstreamShapeRejection(
    replay({ code: 200, data: {} }).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body.data',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('check_music rejects a playback entry that is not an object', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200, data: [null] }).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body.data[0]',
      expected: 'object',
      actual: 'null',
    },
  );

  await expectUpstreamShapeRejection(
    replay({ code: 200, data: ['200'] }).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body.data[0]',
      expected: 'object',
      actual: 'string',
    },
  );
});

test('check_music ignores an empty data array and later entries', async () => {
  const empty = await replay({ code: 200, data: [] }).checkMusic(
    checkMusicPlayable.query,
  );
  expect(empty.body).toEqual({
    code: 200,
    success: false,
    message: '亲爱的,暂无版权',
  });

  const later = await replay({
    code: 200,
    data: [{ code: 200 }, { code: 'not-a-number' }],
  }).checkMusic(checkMusicPlayable.query);
  expect(later.body).toEqual({ code: 200, success: true, message: 'ok' });
});

test('check_music rejects a non-object upstream body', async () => {
  // 模拟探测 id=abc 时的非 JSON 正文：上游返回被当成字符串。
  const upstream = '{"msg":"参数错误","code":400}{"msg":"参数错误","code":400}';

  await expectUpstreamShapeRejection(
    replay(upstream).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body',
      expected: 'object',
      actual: 'string',
    },
  );
});

test('check_music rejects playback data without a usable entry code', async () => {
  const withoutData = structuredClone(checkMusicPlayable.response.body) as {
    data?: unknown;
  };
  delete withoutData.data;
  await expectUpstreamShapeRejection(
    replay(withoutData).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );

  const withoutCode = structuredClone(checkMusicPlayable.response.body) as {
    data: Array<Record<string, unknown>>;
  };
  delete withoutCode.data[0]?.code;
  await expectUpstreamShapeRejection(
    replay(withoutCode).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body.data[0].code',
      expected: 'present',
      actual: 'missing',
    },
  );

  const stringCode = structuredClone(checkMusicPlayable.response.body) as {
    data: Array<Record<string, unknown>>;
  };
  if (stringCode.data[0] !== undefined) stringCode.data[0].code = '200';
  await expectUpstreamShapeRejection(
    replay(stringCode).checkMusic(checkMusicPlayable.query),
    {
      module: 'check_music',
      path: 'body.data[0].code',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('song_like_check hands an empty id list rejection back', async () => {
  expect(
    await settle(
      replay(songLikeCheckEmptyIds.response.body).songLikeCheck(
        songLikeCheckEmptyIds.query,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: songLikeCheckEmptyIds.response.body,
    },
  });
});

test('audio_match rejects a body without the match data', async () => {
  const upstream = structuredClone(audioMatchMatch.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).audioMatch(audioMatchMatch.query),
    {
      module: 'audio_match',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('audio_match keeps a null result and rejects a bad match record', async () => {
  const withoutResult = structuredClone(audioMatchMatch.response.body) as {
    data: Record<string, unknown>;
  };
  delete withoutResult.data.result;
  const missing = await replay(withoutResult).audioMatch(audioMatchMatch.query);
  expect(missing.body.data as unknown).not.toHaveProperty('result');

  const nullResult = structuredClone(audioMatchMatch.response.body) as {
    data: Record<string, unknown>;
  };
  nullResult.data.result = null;
  const result = await replay(nullResult).audioMatch(audioMatchMatch.query);
  expect(result.body.data).toHaveProperty('result', null);

  const badRecord = structuredClone(audioMatchMatch.response.body) as {
    data: { result: Array<{ song: Record<string, unknown> }> };
  };
  delete badRecord.data.result[0]?.song.id;
  await expectUpstreamShapeRejection(
    replay(badRecord).audioMatch(audioMatchMatch.query),
    {
      module: 'audio_match',
      path: 'body.data.result[0].song.id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('audio_match drops bad loose values and keeps undeclared fields', async () => {
  const upstream = structuredClone(audioMatchMatch.response.body) as {
    data: Record<string, unknown> & {
      result: Array<{
        song: Record<string, unknown>;
        startTime: unknown;
      }>;
    };
  };
  upstream.data.queryId = null;
  upstream.data.noMatchReason = '10';
  upstream.data.moduleList = { relatedSongs: true };
  upstream.data.mv = null;
  const [first] = upstream.data.result;
  if (first === undefined) throw new Error('recording has no match');
  first.startTime = '1060';
  first.song.customField = { text: 'kept' };

  const result = await replay(upstream).audioMatch(audioMatchMatch.query);
  const data = result.body.data as unknown as Record<string, unknown>;
  expect(data).toHaveProperty('queryId', null);
  expect(data).not.toHaveProperty('noMatchReason');
  expect(data).not.toHaveProperty('moduleList');
  expect(data).toHaveProperty('mv', null);
  const keptEntry = (data.result as Array<Record<string, unknown>>)[0];
  expect(keptEntry).not.toHaveProperty('startTime');
  expect(keptEntry?.song).toHaveProperty('customField', { text: 'kept' });
});

test('audio_match keeps a null top-level message', async () => {
  const upstream = {
    ...structuredClone(audioMatchNoMatch.response.body),
    message: null,
  };

  const result = await replay(upstream).audioMatch(audioMatchNoMatch.query);
  expect(result.body).toHaveProperty('message', null);
});

test('audio_match keeps undeclared top-level fields', async () => {
  const upstream = {
    ...structuredClone(audioMatchNoMatch.response.body),
    future: { enabled: true },
  };

  const result = await replay(upstream).audioMatch(audioMatchNoMatch.query);
  expect(result.body as unknown).toHaveProperty('future', { enabled: true });
});

test('song_like_check rejects a body without ids and a bad id', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200 }).songLikeCheck(songLikeCheckMixed.query),
    {
      module: 'song_like_check',
      path: 'body.ids',
      expected: 'present',
      actual: 'missing',
    },
  );

  await expectUpstreamShapeRejection(
    replay({ code: 200, ids: [1394617453, '1394617453'] }).songLikeCheck(
      songLikeCheckMixed.query,
    ),
    {
      module: 'song_like_check',
      path: 'body.ids[1]',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('song_like_check keeps undeclared fields', async () => {
  const upstream = {
    ...structuredClone(songLikeCheckMixed.response.body),
    checkPoint: 1394617453,
  };

  const result = await replay(upstream).songLikeCheck(songLikeCheckMixed.query);
  expect(result.body as unknown).toHaveProperty('checkPoint', 1394617453);
});

test('song_red_count rejects a body without the count path', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200 }).songRedCount(songRedCountDefault.query),
    {
      module: 'song_red_count',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );

  await expectUpstreamShapeRejection(
    replay({ code: 200, data: { count: '315386' } }).songRedCount(
      songRedCountDefault.query,
    ),
    {
      module: 'song_red_count',
      path: 'body.data.count',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('song_red_count drops a bad count description and keeps undeclared fields', async () => {
  const upstream = {
    code: 200,
    data: {
      count: 315386,
      countDesc: null,
      futureCount: 1,
    },
  };

  const result = await replay(upstream).songRedCount(songRedCountDefault.query);
  expect(result.body.data as unknown).toHaveProperty('countDesc', null);
  expect(result.body.data as unknown).toHaveProperty('futureCount', 1);

  const wrongType = {
    code: 200,
    data: { count: 315386, countDesc: 315386 },
  };
  const dropped = await replay(wrongType).songRedCount(
    songRedCountDefault.query,
  );
  expect(dropped.body.data as unknown).not.toHaveProperty('countDesc');
});

test('song_dynamic_cover keeps an empty cover and rejects a bad url type', async () => {
  const result = await replay(
    songDynamicCoverEmpty.response.body,
  ).songDynamicCover(songDynamicCoverEmpty.query);
  expect(result.body.data as unknown).not.toHaveProperty('videoPlayUrl');

  const nullUrl = structuredClone(songDynamicCoverDefault.response.body) as {
    data: Record<string, unknown>;
  };
  nullUrl.data.videoPlayUrl = null;
  const nullResult = await replay(nullUrl).songDynamicCover(
    songDynamicCoverDefault.query,
  );
  expect(nullResult.body.data).toHaveProperty('videoPlayUrl', null);

  const badUrl = structuredClone(songDynamicCoverDefault.response.body) as {
    data: Record<string, unknown>;
  };
  badUrl.data.videoPlayUrl = 42;
  await expectUpstreamShapeRejection(
    replay(badUrl).songDynamicCover(songDynamicCoverDefault.query),
    {
      module: 'song_dynamic_cover',
      path: 'body.data.videoPlayUrl',
      expected: 'string | null',
      actual: 'number',
    },
  );
});

test('song_dynamic_cover rejects a body without the cover path', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200 }).songDynamicCover(songDynamicCoverDefault.query),
    {
      module: 'song_dynamic_cover',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_dynamic_cover drops bad loose values and keeps undeclared fields', async () => {
  const upstream = structuredClone(songDynamicCoverDefault.response.body) as {
    data: Record<string, unknown>;
    message?: unknown;
  };
  upstream.data.height = '0';
  upstream.data.needTransition = 'yes';
  upstream.data.futureTransition = 1;
  upstream.message = null;

  const result = await replay(upstream).songDynamicCover(
    songDynamicCoverDefault.query,
  );
  expect(result.body as unknown).toHaveProperty('message', null);
  expect(result.body.data as unknown).not.toHaveProperty('height');
  expect(result.body.data as unknown).not.toHaveProperty('needTransition');
  expect(result.body.data as unknown).toHaveProperty('futureTransition', 1);
});

test('setting rejects a missing setting and a bad account id', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200 }).setting(settingDefault.query),
    {
      module: 'setting',
      path: 'body.setting',
      expected: 'present',
      actual: 'missing',
    },
  );

  const withoutUserId = structuredClone(settingDefault.response.body) as {
    setting: Record<string, unknown>;
  };
  delete withoutUserId.setting.userId;
  await expectUpstreamShapeRejection(
    replay(withoutUserId).setting(settingDefault.query),
    {
      module: 'setting',
      path: 'body.setting.userId',
      expected: 'present',
      actual: 'missing',
    },
  );

  const badUserId = structuredClone(settingDefault.response.body) as {
    setting: Record<string, unknown>;
  };
  badUserId.setting.userId = '10000001';
  await expectUpstreamShapeRejection(
    replay(badUserId).setting(settingDefault.query),
    {
      module: 'setting',
      path: 'body.setting.userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('setting drops bad loose values and keeps undeclared fields', async () => {
  const upstream = structuredClone(settingDefault.response.body) as {
    setting: Record<string, unknown>;
  };
  upstream.setting.allowKtvRoomNotify = 'true';
  upstream.setting.phoneFriendSetting = null;
  upstream.setting.futureFlag = 1;

  const result = await replay(upstream).setting(settingDefault.query);
  expect(result.body.setting as unknown).not.toHaveProperty(
    'allowKtvRoomNotify',
  );
  expect(result.body.setting as unknown).toHaveProperty(
    'phoneFriendSetting',
    null,
  );
  expect(result.body.setting as unknown).toHaveProperty('futureFlag', 1);
  expect(result.body.setting as unknown).toHaveProperty(
    'newSongDiskSetting',
    null,
  );
});

test('playability bodies type their tightened fields', () => {
  expectTypeOf<CheckMusicBody['success']>().toEqualTypeOf<boolean>();
  expectTypeOf<CheckMusicBody['message']>().toEqualTypeOf<string>();
  expectTypeOf<AudioMatchBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    NonNullable<AudioMatchBody['data']['result']>[number]['song']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<AudioMatchBody['data']['result']>[number]['startTime']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<SongLikeCheckBody['ids']>().toEqualTypeOf<
    ReadonlyArray<number>
  >();
  expectTypeOf<SongRedCountBody['data']['count']>().toEqualTypeOf<number>();
  expectTypeOf<SongRedCountBody['data']['countDesc']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<SongDynamicCoverBody['data']['videoPlayUrl']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<SettingBody['setting']['userId']>().toEqualTypeOf<number>();
  expectTypeOf<SettingBody['setting']['allowKtvRoomNotify']>().toEqualTypeOf<
    boolean | null | undefined
  >();
});

test('playability modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.audioMatch(null as never),
    () => api.checkMusic(null as never),
    () => api.songLikeCheck(null as never),
    () => api.songRedCount(null as never),
    () => api.songDynamicCover(null as never),
    () => api.setting(null as never),
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
