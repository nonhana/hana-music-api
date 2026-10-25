import { expect, test } from 'bun:test';

import {
  createHanaMusicApi,
  HistoryRecommendSongsBody,
  HistoryRecommendSongsDetailBody,
  MusicFirstListenInfoBody,
  RecordRecentAlbumBody,
  RecordRecentDjBody,
  RecordRecentPlaylistBody,
  RecordRecentSongBody,
  RecordRecentVideoBody,
  RecordRecentVoiceBody,
} from '../../index.ts';
import type {
  RawRecording,
  UpstreamShape,
  Validator,
} from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import historyRecommendSongsAnonymous from '../fixtures/netease/record/history_recommend_songs.anonymous.json';
import historyRecommendSongs from '../fixtures/netease/record/history_recommend_songs.default.json';
import historyRecommendSongsDetailAnonymous from '../fixtures/netease/record/history_recommend_songs_detail.anonymous.json';
import historyRecommendSongsDetail from '../fixtures/netease/record/history_recommend_songs_detail.default.json';
import historyRecommendSongsDetailInvalid from '../fixtures/netease/record/history_recommend_songs_detail.invalid-date.json';
import musicFirstListenInfoAnonymous from '../fixtures/netease/record/music_first_listen_info.anonymous.json';
import musicFirstListenInfo from '../fixtures/netease/record/music_first_listen_info.default.json';
import musicFirstListenInfoMissingId from '../fixtures/netease/record/music_first_listen_info.missing-id.json';
import recordRecentAlbumAnonymous from '../fixtures/netease/record/record_recent_album.anonymous.json';
import recordRecentAlbum from '../fixtures/netease/record/record_recent_album.default.json';
import recordRecentAlbumInvalid from '../fixtures/netease/record/record_recent_album.invalid-limit.json';
import recordRecentDjAnonymous from '../fixtures/netease/record/record_recent_dj.anonymous.json';
import recordRecentDj from '../fixtures/netease/record/record_recent_dj.default.json';
import recordRecentDjInvalid from '../fixtures/netease/record/record_recent_dj.invalid-limit.json';
import recordRecentPlaylistAnonymous from '../fixtures/netease/record/record_recent_playlist.anonymous.json';
import recordRecentPlaylist from '../fixtures/netease/record/record_recent_playlist.default.json';
import recordRecentPlaylistInvalid from '../fixtures/netease/record/record_recent_playlist.invalid-limit.json';
import recordRecentSongAnonymous from '../fixtures/netease/record/record_recent_song.anonymous.json';
import recordRecentSong from '../fixtures/netease/record/record_recent_song.default.json';
import recordRecentSongInvalid from '../fixtures/netease/record/record_recent_song.invalid-limit.json';
import recordRecentVideoAnonymous from '../fixtures/netease/record/record_recent_video.anonymous.json';
import recordRecentVideo from '../fixtures/netease/record/record_recent_video.default.json';
import recordRecentVideoInvalid from '../fixtures/netease/record/record_recent_video.invalid-limit.json';
import recordRecentVoiceAnonymous from '../fixtures/netease/record/record_recent_voice.anonymous.json';
import recordRecentVoice from '../fixtures/netease/record/record_recent_voice.default.json';
import recordRecentVoiceInvalid from '../fixtures/netease/record/record_recent_voice.invalid-limit.json';

// issue #102 B34 的播放记录读取录制：9 个模块，18 份成功录制（正常 + 空结果/匿名），
// 6 份非法 `limit` 的 HTTP 400 空正文、1 份缺少 id 的空正文和 1 份非法 `date` 的业务拒绝。
// 录制前用 login_status 确认 account.anonimousUser: false；匿名录制只用来证明空列表和缺席路径。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

const replayRaw = (body: string, status: number) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => new Response(body, { status }),
  });

type Case = {
  readonly name: string;
  readonly recording: RawRecording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ status: number; body: unknown }>;
};

type RecentRecord = Readonly<Record<string, unknown>> & {
  readonly resourceId: string;
  readonly data: Record<string, unknown>;
};
type RecentListBody = {
  readonly data: { readonly list: ReadonlyArray<RecentRecord> };
};

const cases: Array<Case> = [
  {
    name: 'record_recent_song returns the recorded songs',
    recording: recordRecentSong,
    bodySchema: RecordRecentSongBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentSong(recordRecentSong.query),
  },
  {
    name: 'record_recent_song returns an empty list anonymously',
    recording: recordRecentSongAnonymous,
    bodySchema: RecordRecentSongBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentSong(
        recordRecentSongAnonymous.query,
      ),
  },
  {
    name: 'record_recent_playlist returns the recorded playlists',
    recording: recordRecentPlaylist,
    bodySchema: RecordRecentPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentPlaylist(recordRecentPlaylist.query),
  },
  {
    name: 'record_recent_playlist returns an empty list anonymously',
    recording: recordRecentPlaylistAnonymous,
    bodySchema: RecordRecentPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentPlaylist(
        recordRecentPlaylistAnonymous.query,
      ),
  },
  {
    name: 'record_recent_album returns the recorded albums',
    recording: recordRecentAlbum,
    bodySchema: RecordRecentAlbumBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentAlbum(recordRecentAlbum.query),
  },
  {
    name: 'record_recent_album returns an empty list anonymously',
    recording: recordRecentAlbumAnonymous,
    bodySchema: RecordRecentAlbumBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentAlbum(
        recordRecentAlbumAnonymous.query,
      ),
  },
  {
    name: 'record_recent_video returns the recorded videos',
    recording: recordRecentVideo,
    bodySchema: RecordRecentVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentVideo(recordRecentVideo.query),
  },
  {
    name: 'record_recent_video returns an empty list anonymously',
    recording: recordRecentVideoAnonymous,
    bodySchema: RecordRecentVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentVideo(
        recordRecentVideoAnonymous.query,
      ),
  },
  {
    name: 'record_recent_dj returns the recorded radios',
    recording: recordRecentDj,
    bodySchema: RecordRecentDjBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentDj(recordRecentDj.query),
  },
  {
    name: 'record_recent_dj returns an empty list anonymously',
    recording: recordRecentDjAnonymous,
    bodySchema: RecordRecentDjBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentDj(recordRecentDjAnonymous.query),
  },
  {
    name: 'record_recent_voice returns the recorded voices',
    recording: recordRecentVoice,
    bodySchema: RecordRecentVoiceBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentVoice(recordRecentVoice.query),
  },
  {
    name: 'record_recent_voice returns an empty list anonymously',
    recording: recordRecentVoiceAnonymous,
    bodySchema: RecordRecentVoiceBody,
    call: (upstream, status) =>
      replay(upstream, status).recordRecentVoice(
        recordRecentVoiceAnonymous.query,
      ),
  },
  {
    name: 'history_recommend_songs returns the recorded dates',
    recording: historyRecommendSongs,
    bodySchema: HistoryRecommendSongsBody,
    call: (upstream, status) =>
      replay(upstream, status).historyRecommendSongs(),
  },
  {
    name: 'history_recommend_songs returns no dates anonymously',
    recording: historyRecommendSongsAnonymous,
    bodySchema: HistoryRecommendSongsBody,
    call: (upstream, status) =>
      replay(upstream, status).historyRecommendSongs(),
  },
  {
    name: 'history_recommend_songs_detail returns the recorded songs',
    recording: historyRecommendSongsDetail,
    bodySchema: HistoryRecommendSongsDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).historyRecommendSongsDetail(
        historyRecommendSongsDetail.query,
      ),
  },
  {
    name: 'history_recommend_songs_detail returns an empty list anonymously',
    recording: historyRecommendSongsDetailAnonymous,
    bodySchema: HistoryRecommendSongsDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).historyRecommendSongsDetail(
        historyRecommendSongsDetailAnonymous.query,
      ),
  },
  {
    name: 'music_first_listen_info returns the recorded recall',
    recording: musicFirstListenInfo,
    bodySchema: MusicFirstListenInfoBody,
    call: (upstream, status) =>
      replay(upstream, status).musicFirstListenInfo(musicFirstListenInfo.query),
  },
  {
    name: 'music_first_listen_info returns data without the blocks anonymously',
    recording: musicFirstListenInfoAnonymous,
    bodySchema: MusicFirstListenInfoBody,
    call: (upstream, status) =>
      replay(upstream, status).musicFirstListenInfo(
        musicFirstListenInfoAnonymous.query,
      ),
  },
];

test.each(cases)('$name', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.status).toBe(200);
  expect(result.body).toEqual(entry.recording.response.body);

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

type RawCase = {
  readonly name: string;
  readonly recording: RawRecording & {
    readonly response: { readonly status: number; readonly body: string };
  };
  readonly bodySchema: Validator;
  readonly call: (
    body: string,
    status: number,
  ) => Promise<{
    status: number;
    cookie: ReadonlyArray<unknown>;
    body: unknown;
  }>;
};

const rawCases: Array<RawCase> = [
  {
    name: 'record_recent_song keeps the normalized empty HTTP 400 body',
    recording: recordRecentSongInvalid,
    bodySchema: RecordRecentSongBody,
    call: (body, status) =>
      replayRaw(body, status).recordRecentSong(recordRecentSongInvalid.query),
  },
  {
    name: 'record_recent_playlist keeps the normalized empty HTTP 400 body',
    recording: recordRecentPlaylistInvalid,
    bodySchema: RecordRecentPlaylistBody,
    call: (body, status) =>
      replayRaw(body, status).recordRecentPlaylist(
        recordRecentPlaylistInvalid.query,
      ),
  },
  {
    name: 'record_recent_album keeps the normalized empty HTTP 400 body',
    recording: recordRecentAlbumInvalid,
    bodySchema: RecordRecentAlbumBody,
    call: (body, status) =>
      replayRaw(body, status).recordRecentAlbum(recordRecentAlbumInvalid.query),
  },
  {
    name: 'record_recent_video keeps the normalized empty HTTP 400 body',
    recording: recordRecentVideoInvalid,
    bodySchema: RecordRecentVideoBody,
    call: (body, status) =>
      replayRaw(body, status).recordRecentVideo(recordRecentVideoInvalid.query),
  },
  {
    name: 'record_recent_dj keeps the normalized empty HTTP 400 body',
    recording: recordRecentDjInvalid,
    bodySchema: RecordRecentDjBody,
    call: (body, status) =>
      replayRaw(body, status).recordRecentDj(recordRecentDjInvalid.query),
  },
  {
    name: 'record_recent_voice keeps the normalized empty HTTP 400 body',
    recording: recordRecentVoiceInvalid,
    bodySchema: RecordRecentVoiceBody,
    call: (body, status) =>
      replayRaw(body, status).recordRecentVoice(recordRecentVoiceInvalid.query),
  },
  {
    name: 'music_first_listen_info keeps the normalized empty HTTP 400 body',
    recording: musicFirstListenInfoMissingId,
    bodySchema: MusicFirstListenInfoBody,
    call: (body, status) =>
      replayRaw(body, status).musicFirstListenInfo(
        musicFirstListenInfoMissingId.query,
      ),
  },
];

test.each(rawCases)('$name', async ({ recording, bodySchema, call }) => {
  const result = await settle(
    call(recording.response.body, recording.response.status),
  );

  expect(result).toEqual({
    resolved: { status: 200, cookie: [], body: '' },
  });
  const validated = validateSync(bodySchema, recording.response.body);
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toBe('');
});

const expectShape = async (promise: Promise<unknown>, shape: UpstreamShape) =>
  expectUpstreamShapeRejection(promise, shape);

test('record_recent_song rejects a body without data.list', async () => {
  const upstream = structuredClone(recordRecentSong.response.body) as {
    data?: Record<string, unknown>;
  };
  delete upstream.data?.list;

  await expectShape(replay(upstream).recordRecentSong({}), {
    module: 'record_recent_song',
    path: 'body.data.list',
    expected: 'present',
    actual: 'missing',
  });
});

test('record_recent_song rejects a song id that is text', async () => {
  const upstream = structuredClone(recordRecentSong.response.body);
  (upstream.data.list[0]!.data as { id: unknown }).id = '1896365460';

  await expectShape(replay(upstream).recordRecentSong({}), {
    module: 'record_recent_song',
    path: 'body.data.list[0].data.id',
    expected: 'number',
    actual: 'string',
  });
});

test('record_recent_playlist rejects a playlist without an id', async () => {
  const upstream = structuredClone(recordRecentPlaylist.response.body);
  delete (upstream.data.list[0]!.data as { id?: unknown }).id;

  await expectShape(replay(upstream).recordRecentPlaylist({}), {
    module: 'record_recent_playlist',
    path: 'body.data.list[0].data.id',
    expected: 'present',
    actual: 'missing',
  });
});

test('record_recent_album rejects an album without an id', async () => {
  const upstream = structuredClone(recordRecentAlbum.response.body);
  delete (upstream.data.list[0]!.data as { id?: unknown }).id;

  await expectShape(replay(upstream).recordRecentAlbum({}), {
    module: 'record_recent_album',
    path: 'body.data.list[0].data.id',
    expected: 'present',
    actual: 'missing',
  });
});

test('record_recent_video rejects a video id that is null', async () => {
  const upstream = structuredClone(recordRecentVideo.response.body);
  (upstream.data.list[0]!.data as { id: unknown }).id = null;

  await expectShape(replay(upstream).recordRecentVideo({}), {
    module: 'record_recent_video',
    path: 'body.data.list[0].data.id',
    expected: 'string | number',
    actual: 'null',
  });
});

test('record_recent_dj rejects a radio without an id', async () => {
  const upstream = structuredClone(recordRecentDj.response.body);
  delete (upstream.data.list[0]!.data as { id?: unknown }).id;

  await expectShape(replay(upstream).recordRecentDj({}), {
    module: 'record_recent_dj',
    path: 'body.data.list[0].data.id',
    expected: 'present',
    actual: 'missing',
  });
});

test('record_recent_voice rejects a program without an id', async () => {
  const upstream = structuredClone(recordRecentVoice.response.body);
  delete (upstream.data.list[0]!.data.pubDJProgramData as { id?: unknown }).id;

  await expectShape(replay(upstream).recordRecentVoice({}), {
    module: 'record_recent_voice',
    path: 'body.data.list[0].data.pubDJProgramData.id',
    expected: 'present',
    actual: 'missing',
  });
});

test('history_recommend_songs rejects a body without dates', async () => {
  const upstream = structuredClone(historyRecommendSongs.response.body) as {
    data?: Record<string, unknown>;
  };
  delete upstream.data?.dates;

  await expectShape(replay(upstream).historyRecommendSongs(), {
    module: 'history_recommend_songs',
    path: 'body.data.dates',
    expected: 'present',
    actual: 'missing',
  });
});

test('history_recommend_songs rejects a date that is a number', async () => {
  const upstream = structuredClone(historyRecommendSongs.response.body);
  (upstream.data.dates as Array<unknown>)[0] = 20261025;

  await expectShape(replay(upstream).historyRecommendSongs(), {
    module: 'history_recommend_songs',
    path: 'body.data.dates[0]',
    expected: 'string',
    actual: 'number',
  });
});

test('history_recommend_songs_detail rejects a body without songs', async () => {
  const upstream = structuredClone(
    historyRecommendSongsDetail.response.body,
  ) as {
    data?: Record<string, unknown>;
  };
  delete upstream.data?.songs;

  await expectShape(
    replay(upstream).historyRecommendSongsDetail({ date: 'x' }),
    {
      module: 'history_recommend_songs_detail',
      path: 'body.data.songs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('history_recommend_songs_detail rejects a song without an id', async () => {
  const upstream = structuredClone(historyRecommendSongsDetail.response.body);
  delete (upstream.data.songs[0] as { id?: unknown }).id;

  await expectShape(
    replay(upstream).historyRecommendSongsDetail({ date: 'x' }),
    {
      module: 'history_recommend_songs_detail',
      path: 'body.data.songs[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('music_first_listen_info rejects a songId that is text', async () => {
  const upstream = structuredClone(musicFirstListenInfo.response.body);
  (upstream.data.songInfoDto as { songId: unknown }).songId = '1896365460';

  await expectShape(replay(upstream).musicFirstListenInfo({ id: 1 }), {
    module: 'music_first_listen_info',
    path: 'body.data.songInfoDto.songId',
    expected: 'number',
    actual: 'string',
  });
});

test('music_first_listen_info rejects a first listen without a date', async () => {
  const upstream = structuredClone(musicFirstListenInfo.response.body);
  delete (upstream.data.musicFirstListenDto as { date?: unknown }).date;

  await expectShape(replay(upstream).musicFirstListenInfo({ id: 1 }), {
    module: 'music_first_listen_info',
    path: 'body.data.musicFirstListenDto.date',
    expected: 'present',
    actual: 'missing',
  });
});

test('record_recent_song drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(recordRecentSong.response.body);
  const record = upstream.data.list[0]!;
  delete (record as { playTime?: unknown }).playTime;
  (record as { banned: unknown }).banned = 'no';
  (record.data as { songJumpInfo: unknown }).songJumpInfo = {
    reason: 'kept',
  };
  (record as { multiTerminalInfo: unknown }).multiTerminalInfo = null;

  const result = await replay(upstream).recordRecentSong({});
  const returned = (result.body as RecentListBody).data.list[0]!;

  expect(returned).not.toHaveProperty('playTime');
  expect(returned).not.toHaveProperty('banned');
  expect(returned.multiTerminalInfo).toBeNull();
  expect(returned.data.songJumpInfo).toEqual({ reason: 'kept' });
  expect(returned.resourceId).toBe('1896365460');
  expect(returned.data.id).toBe(1896365460);
});

test('record_recent_playlist drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(recordRecentPlaylist.response.body);
  const record = upstream.data.list[0]!;
  (record.data as { name: unknown }).name = 1;
  (record.data as { lastSong: unknown }).lastSong = 'lost';
  (record.data as { creator: Record<string, unknown> }).creator.extProperties =
    {
      avatarImgId_str: 'kept',
    };

  const result = await replay(upstream).recordRecentPlaylist({});
  const returned = (result.body as RecentListBody).data.list[0]!;

  expect(returned.data).not.toHaveProperty('name');
  expect(returned.data).not.toHaveProperty('lastSong');
  expect(
    (returned.data as { creator: { extProperties: unknown } }).creator
      .extProperties,
  ).toEqual({ avatarImgId_str: 'kept' });
  expect(returned.data.id).toBe(6819787243);
  expect(returned.resourceId).toBe('6819787243');
});

test('record_recent_album drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(recordRecentAlbum.response.body);
  const record = upstream.data.list[0]!;
  (record.data as { company: unknown }).company = 1;
  (record.data as { songs: unknown }).songs = 'lost';
  (record.data as unknown as { info: unknown }).info = { custom: 'kept' };

  const result = await replay(upstream).recordRecentAlbum({});
  const returned = (result.body as RecentListBody).data.list[0]!;

  expect(returned.data).not.toHaveProperty('company');
  expect(returned.data).not.toHaveProperty('songs');
  expect((returned.data as { info: unknown }).info).toEqual({
    custom: 'kept',
  });
  expect(returned.data.id).toBe(174003615);
  expect(returned.resourceId).toBe('174003615');
});

test('record_recent_video drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(recordRecentVideo.response.body);
  const record = upstream.data.list[0]!;
  (record.data as { title: unknown }).title = 1;
  (record.data as { creator: unknown }).creator = 'lost';
  (record.data as unknown as { mlogExtVO: unknown }).mlogExtVO = {
    kind: 'kept',
  };

  const result = await replay(upstream).recordRecentVideo({});
  const returned = (result.body as RecentListBody).data.list[0]!;

  expect(returned.data).not.toHaveProperty('title');
  expect(returned.data).not.toHaveProperty('creator');
  expect((returned.data as { mlogExtVO: unknown }).mlogExtVO).toEqual({
    kind: 'kept',
  });
  expect(returned.data.id).toBe('a1evZ7wUgCmYgQl0');
  expect(returned.resourceId).toBe('a1evZ7wUgCmYgQl0');
});

test('record_recent_dj drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(recordRecentDj.response.body);
  const record = upstream.data.list[0]!;
  (record.data as { name: unknown }).name = 1;
  (record.data as { dj: unknown }).dj = 'lost';
  (record.data as { replaceName: unknown }).replaceName = { kind: 'kept' };

  const result = await replay(upstream).recordRecentDj({});
  const returned = (result.body as RecentListBody).data.list[0]!;

  expect(returned.data).not.toHaveProperty('name');
  expect(returned.data).not.toHaveProperty('dj');
  expect((returned.data as { replaceName: unknown }).replaceName).toEqual({
    kind: 'kept',
  });
  expect(returned.data.id).toBe(977654404);
  expect(returned.resourceId).toBe('977654404');
});

test('record_recent_voice drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(recordRecentVoice.response.body);
  const record = upstream.data.list[0]!;
  (record.data as { commentCount: unknown }).commentCount = 'lost';
  (record.data.pubDJProgramData as { name: unknown }).name = 1;
  (record.data.pubDJProgramData as { algReason: unknown }).algReason = {
    kind: 'kept',
  };

  const result = await replay(upstream).recordRecentVoice({});
  const returned = (result.body as RecentListBody).data.list[0]!;
  const program = returned.data.pubDJProgramData as Record<string, unknown> & {
    id: number;
    algReason: unknown;
  };

  expect(returned.data).not.toHaveProperty('commentCount');
  expect(program).not.toHaveProperty('name');
  expect(program.algReason).toEqual({ kind: 'kept' });
  expect(program.id).toBe(3064901323);
});

test('history_recommend_songs drops bad loose fields and keeps undeclared songs', async () => {
  const upstream = structuredClone(historyRecommendSongs.response.body) as {
    data: Record<string, unknown>;
    message?: unknown;
  };
  upstream.data.description = 1;
  upstream.data.songs = [{ id: 1 }];
  upstream.message = 1;

  const result = await replay(upstream).historyRecommendSongs();
  const body = result.body as {
    data: Record<string, unknown>;
    message?: unknown;
  };

  expect(body.data).not.toHaveProperty('description');
  expect(body.message).toBe(1);
  expect(body.data.songs).toEqual([{ id: 1 }]);
  expect(body.data.dates).toHaveLength(5);
});

test('history_recommend_songs_detail drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(
    historyRecommendSongsDetail.response.body,
  ) as {
    data: Record<string, unknown>;
    message?: unknown;
  };
  upstream.data.purchaseUrl = 1;
  upstream.data.dates = ['2026-10-25'];
  upstream.data.description = { custom: 'kept' };
  upstream.message = 1;

  const result = await replay(upstream).historyRecommendSongsDetail({
    date: '2026-10-25',
  });
  const body = result.body as {
    data: Record<string, unknown>;
    message?: unknown;
  };

  expect(body.data).not.toHaveProperty('purchaseUrl');
  expect(body.message).toBe(1);
  expect(body.data.dates).toEqual(['2026-10-25']);
  expect(body.data.description).toEqual({ custom: 'kept' });
  expect((body.data.songs as Array<{ id: number }>)[0]!.id).toBe(22699130);
});

test('music_first_listen_info drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(musicFirstListenInfo.response.body) as {
    data: Record<string, unknown>;
    message?: unknown;
  };
  (upstream.data.musicLikeSongDto as { redTime: unknown }).redTime = 1;
  upstream.data.title = { custom: 'kept' };
  upstream.message = 1;

  const result = await replay(upstream).musicFirstListenInfo({ id: 1 });
  const body = result.body as { data: Record<string, unknown> };

  expect(body.data.musicLikeSongDto).not.toHaveProperty('redTime');
  expect(body.data.title).toEqual({ custom: 'kept' });
  expect(result.body).not.toHaveProperty('message');
  expect((body.data.songInfoDto as { songId: number }).songId).toBe(1896365460);
});

test('music_first_listen_info returns normally when a block is missing or null', async () => {
  const upstream = structuredClone(musicFirstListenInfo.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.songInfoDto;
  upstream.data.musicFirstListenDto = null;

  const result = await replay(upstream).musicFirstListenInfo({ id: 1 });
  const body = result.body as { data: Record<string, unknown> };

  expect(body.data).not.toHaveProperty('songInfoDto');
  expect(body.data.musicFirstListenDto).toBeNull();
  expect((body.data.musicLikeSongDto as { like: boolean }).like).toBe(true);
});

test('history_recommend_songs_detail rejects an invalid date as a business failure', async () => {
  const result = await settle(
    replay(
      historyRecommendSongsDetailInvalid.response.body,
      historyRecommendSongsDetailInvalid.response.status,
    ).historyRecommendSongsDetail(historyRecommendSongsDetailInvalid.query),
  );

  expect(result).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: historyRecommendSongsDetailInvalid.response.body,
    },
  });
});

const localRejections: Array<{
  readonly name: string;
  readonly call: (
    api: ReturnType<typeof createHanaMusicApi>,
  ) => Promise<unknown>;
}> = [
  {
    name: 'record_recent_song',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.recordRecentSong(null as never),
  },
  {
    name: 'record_recent_playlist',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.recordRecentPlaylist(null as never),
  },
  {
    name: 'record_recent_album',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.recordRecentAlbum(null as never),
  },
  {
    name: 'record_recent_video',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.recordRecentVideo(null as never),
  },
  {
    name: 'record_recent_dj',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.recordRecentDj(null as never),
  },
  {
    name: 'record_recent_voice',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.recordRecentVoice(null as never),
  },
  {
    name: 'history_recommend_songs',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.historyRecommendSongs(null as never),
  },
  {
    name: 'history_recommend_songs_detail',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.historyRecommendSongsDetail(null as never),
  },
  {
    name: 'music_first_listen_info',
    call: (api: ReturnType<typeof createHanaMusicApi>) =>
      api.musicFirstListenInfo(null as never),
  },
];

test.each(localRejections)(
  '$name rejects a non-object input locally without calling upstream',
  async (entry) => {
    let requests = 0;
    const api = createHanaMusicApi({
      cookie: 'MUSIC_U=listener',
      fetcher: async () => {
        requests += 1;
        return Response.json({ code: 200 });
      },
    });

    expect(await settle(entry.call(api))).toEqual({
      rejected: {
        status: 400,
        cookie: [],
        body: { code: 400, msg: 'Expected <Declaration>' },
      },
    });
    expect(requests).toBe(0);
  },
);
