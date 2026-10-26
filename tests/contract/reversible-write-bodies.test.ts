import { expect, expectTypeOf, test } from 'bun:test';

import {
  CloudMatchBody,
  createHanaMusicApi,
  DjDifmChannelSubscribeBody,
  DjDifmChannelUnsubscribeBody,
  FmTrashBody,
  RecommendSongsDislikeBody,
  SongLyricsMarkAddBody,
  SongLyricsMarkDelBody,
  UserSocialStatusEditBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import djDifmChannelSubscribeAgain from '../fixtures/netease/dj/dj_difm_channel_subscribe.subscribe-again.json';
import djDifmChannelSubscribe from '../fixtures/netease/dj/dj_difm_channel_subscribe.subscribe.json';
import djDifmChannelUnsubscribeAgain from '../fixtures/netease/dj/dj_difm_channel_unsubscribe.unsubscribe-again.json';
import djDifmChannelUnsubscribeFinal from '../fixtures/netease/dj/dj_difm_channel_unsubscribe.unsubscribe-final.json';
import djDifmChannelUnsubscribe from '../fixtures/netease/dj/dj_difm_channel_unsubscribe.unsubscribe.json';
import songLyricsMarkAddUpdate from '../fixtures/netease/lyric/song_lyrics_mark_add.add-update.json';
import songLyricsMarkAddAdd from '../fixtures/netease/lyric/song_lyrics_mark_add.add.json';
import songLyricsMarkDelAgain from '../fixtures/netease/lyric/song_lyrics_mark_del.del-again.json';
import songLyricsMarkDelDel from '../fixtures/netease/lyric/song_lyrics_mark_del.del.json';
import fmTrashTrash from '../fixtures/netease/other/fm_trash.trash.json';
import recommendSongsDislikeDislike from '../fixtures/netease/recommend/recommend_songs_dislike.dislike.json';
import cloudMatchInvalidAsid from '../fixtures/netease/user/cloud_match.invalid-asid.json';
import cloudMatchMatch from '../fixtures/netease/user/cloud_match.match.json';
import cloudMatchUnmatch from '../fixtures/netease/user/cloud_match.unmatch.json';
import userSocialStatusEditClearRejected from '../fixtures/netease/user/user_social_status_edit.clear-rejected.json';
import userSocialStatusEditSet from '../fixtures/netease/user/user_social_status_edit.set.json';

// issue #102 B47 的写操作录制。dj_difm_channel_subscribe/unsubscribe 对频道 10505 录订阅、
// 未订阅时的重复取消、清空后重新订阅和最终取消，并用 dj_difm_subscribe_channels_get 回读
// 核对（已订阅时重复订阅的幂等分支未录制）；song_lyrics_mark_add/del 对
// 歌曲 1394617453 各录新建/更新与删除/重复删除，并用 song_lyrics_mark 回读核对；
// user_social_status_edit 只有设置成功的正文，清空字段的调用被上游拒绝（code 500），状态用
// 接口之外的原始请求恢复为空；recommend_songs_dislike 与 fm_trash 是单次写入，没有撤销调用。
// 各录制的写前/写后状态记在文件的 context.note。
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
    name: 'dj_difm_channel_subscribe subscribe',
    recording: djDifmChannelSubscribe,
    bodySchema: DjDifmChannelSubscribeBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmChannelSubscribe(
        djDifmChannelSubscribe.query,
      ),
  },
  {
    name: 'dj_difm_channel_subscribe subscribe again',
    recording: djDifmChannelSubscribeAgain,
    bodySchema: DjDifmChannelSubscribeBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmChannelSubscribe(
        djDifmChannelSubscribeAgain.query,
      ),
  },
  {
    name: 'dj_difm_channel_unsubscribe unsubscribe',
    recording: djDifmChannelUnsubscribe,
    bodySchema: DjDifmChannelUnsubscribeBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmChannelUnsubscribe(
        djDifmChannelUnsubscribe.query,
      ),
  },
  {
    name: 'dj_difm_channel_unsubscribe unsubscribe again',
    recording: djDifmChannelUnsubscribeAgain,
    bodySchema: DjDifmChannelUnsubscribeBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmChannelUnsubscribe(
        djDifmChannelUnsubscribeAgain.query,
      ),
  },
  {
    name: 'dj_difm_channel_unsubscribe final unsubscribe',
    recording: djDifmChannelUnsubscribeFinal,
    bodySchema: DjDifmChannelUnsubscribeBody,
    call: (upstream, status) =>
      replay(upstream, status).djDifmChannelUnsubscribe(
        djDifmChannelUnsubscribeFinal.query,
      ),
  },
  {
    name: 'song_lyrics_mark_add add',
    recording: songLyricsMarkAddAdd,
    bodySchema: SongLyricsMarkAddBody,
    call: (upstream, status) =>
      replay(upstream, status).songLyricsMarkAdd(songLyricsMarkAddAdd.query),
  },
  {
    name: 'song_lyrics_mark_add update',
    recording: songLyricsMarkAddUpdate,
    bodySchema: SongLyricsMarkAddBody,
    call: (upstream, status) =>
      replay(upstream, status).songLyricsMarkAdd(songLyricsMarkAddUpdate.query),
  },
  {
    name: 'song_lyrics_mark_del delete',
    recording: songLyricsMarkDelDel,
    bodySchema: SongLyricsMarkDelBody,
    call: (upstream, status) =>
      replay(upstream, status).songLyricsMarkDel(songLyricsMarkDelDel.query),
  },
  {
    name: 'song_lyrics_mark_del delete again',
    recording: songLyricsMarkDelAgain,
    bodySchema: SongLyricsMarkDelBody,
    call: (upstream, status) =>
      replay(upstream, status).songLyricsMarkDel(songLyricsMarkDelAgain.query),
  },
  {
    name: 'user_social_status_edit set',
    recording: userSocialStatusEditSet,
    bodySchema: UserSocialStatusEditBody,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatusEdit(
        userSocialStatusEditSet.query,
      ),
  },
  {
    name: 'recommend_songs_dislike dislike',
    recording: recommendSongsDislikeDislike,
    bodySchema: RecommendSongsDislikeBody,
    call: (upstream, status) =>
      replay(upstream, status).recommendSongsDislike(
        recommendSongsDislikeDislike.query,
      ),
  },
  {
    name: 'fm_trash trash',
    recording: fmTrashTrash,
    bodySchema: FmTrashBody,
    call: (upstream, status) =>
      replay(upstream, status).fmTrash(fmTrashTrash.query),
  },
  {
    name: 'cloud_match match',
    recording: cloudMatchMatch,
    bodySchema: CloudMatchBody,
    call: (upstream, status) =>
      replay(upstream, status).cloudMatch(cloudMatchMatch.query),
  },
  {
    name: 'cloud_match unmatch',
    recording: cloudMatchUnmatch,
    bodySchema: CloudMatchBody,
    call: (upstream, status) =>
      replay(upstream, status).cloudMatch(cloudMatchUnmatch.query),
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
    name: 'user_social_status_edit clearing the status',
    recording: userSocialStatusEditClearRejected,
    call: (upstream, status) =>
      replay(upstream, status).userSocialStatusEdit(
        userSocialStatusEditClearRejected.query,
      ),
  },
  {
    name: 'cloud_match invalid adjust song',
    recording: cloudMatchInvalidAsid,
    call: (upstream, status) =>
      replay(upstream, status).cloudMatch(cloudMatchInvalidAsid.query),
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

test('write action bodies type the tightened fields and loose hints', () => {
  expectTypeOf<DjDifmChannelSubscribeBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<DjDifmChannelSubscribeBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<DjDifmChannelUnsubscribeBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    SongLyricsMarkAddBody['data']['markId']
  >().toEqualTypeOf<number>();
  expectTypeOf<SongLyricsMarkAddBody['data']['success']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    SongLyricsMarkDelBody['data']['success']
  >().toEqualTypeOf<boolean>();
  expectTypeOf<UserSocialStatusEditBody['data']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    RecommendSongsDislikeBody['data']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<FmTrashBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<FmTrashBody['count']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<CloudMatchBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<CloudMatchBody['data']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<CloudMatchBody['matchData']['songId']>().toEqualTypeOf<number>();
});

test('a non-object input is rejected before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(await settle(api.fmTrash(null as never))).toMatchObject({
    rejected: { status: 400 },
  });
  expect(await settle(api.cloudMatch([] as never))).toMatchObject({
    rejected: { status: 400 },
  });
  expect(upstreamCalls).toBe(0);
});

test.each<{
  name: string;
  module: string;
  recording: Recording;
  call: (upstream: unknown) => Promise<unknown>;
}>([
  {
    name: 'dj_difm_channel_subscribe',
    module: 'dj_difm_channel_subscribe',
    recording: djDifmChannelSubscribe,
    call: (upstream) =>
      replay(upstream).djDifmChannelSubscribe(djDifmChannelSubscribe.query),
  },
  {
    name: 'dj_difm_channel_unsubscribe',
    module: 'dj_difm_channel_unsubscribe',
    recording: djDifmChannelUnsubscribe,
    call: (upstream) =>
      replay(upstream).djDifmChannelUnsubscribe(djDifmChannelUnsubscribe.query),
  },
  {
    name: 'song_lyrics_mark_add',
    module: 'song_lyrics_mark_add',
    recording: songLyricsMarkAddAdd,
    call: (upstream) =>
      replay(upstream).songLyricsMarkAdd(songLyricsMarkAddAdd.query),
  },
  {
    name: 'song_lyrics_mark_del',
    module: 'song_lyrics_mark_del',
    recording: songLyricsMarkDelDel,
    call: (upstream) =>
      replay(upstream).songLyricsMarkDel(songLyricsMarkDelDel.query),
  },
  {
    name: 'user_social_status_edit',
    module: 'user_social_status_edit',
    recording: userSocialStatusEditSet,
    call: (upstream) =>
      replay(upstream).userSocialStatusEdit(userSocialStatusEditSet.query),
  },
  {
    name: 'recommend_songs_dislike',
    module: 'recommend_songs_dislike',
    recording: recommendSongsDislikeDislike,
    call: (upstream) =>
      replay(upstream).recommendSongsDislike(
        recommendSongsDislikeDislike.query,
      ),
  },
  {
    name: 'fm_trash',
    module: 'fm_trash',
    recording: fmTrashTrash,
    call: (upstream) => replay(upstream).fmTrash(fmTrashTrash.query),
  },
  {
    name: 'cloud_match',
    module: 'cloud_match',
    recording: cloudMatchMatch,
    call: (upstream) => replay(upstream).cloudMatch(cloudMatchMatch.query),
  },
])('$name rejects a body without a return code', async (entry) => {
  const upstream = structuredClone(entry.recording.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(entry.call(upstream), {
    module: entry.module,
    path: 'body.code',
    expected: 'present',
    actual: 'missing',
  });
});

test.each<{
  name: string;
  module: string;
  path: string;
  recording: Recording;
  mutate: (upstream: Record<string, unknown>) => void;
  call: (upstream: unknown) => Promise<unknown>;
}>([
  {
    name: 'song_lyrics_mark_add without markId',
    module: 'song_lyrics_mark_add',
    path: 'body.data.markId',
    recording: songLyricsMarkAddAdd,
    mutate: (upstream) => {
      delete (upstream.data as Record<string, unknown>).markId;
    },
    call: (upstream) =>
      replay(upstream).songLyricsMarkAdd(songLyricsMarkAddAdd.query),
  },
  {
    name: 'song_lyrics_mark_del without success',
    module: 'song_lyrics_mark_del',
    path: 'body.data.success',
    recording: songLyricsMarkDelDel,
    mutate: (upstream) => {
      delete (upstream.data as Record<string, unknown>).success;
    },
    call: (upstream) =>
      replay(upstream).songLyricsMarkDel(songLyricsMarkDelDel.query),
  },
  {
    name: 'recommend_songs_dislike without the replacement song id',
    module: 'recommend_songs_dislike',
    path: 'body.data.id',
    recording: recommendSongsDislikeDislike,
    mutate: (upstream) => {
      delete (upstream.data as Record<string, unknown>).id;
    },
    call: (upstream) =>
      replay(upstream).recommendSongsDislike(
        recommendSongsDislikeDislike.query,
      ),
  },
  {
    name: 'cloud_match without matchData',
    module: 'cloud_match',
    path: 'body.matchData',
    recording: cloudMatchMatch,
    mutate: (upstream) => {
      delete upstream.matchData;
    },
    call: (upstream) => replay(upstream).cloudMatch(cloudMatchMatch.query),
  },
  {
    name: 'cloud_match without the matched song id',
    module: 'cloud_match',
    path: 'body.matchData.songId',
    recording: cloudMatchMatch,
    mutate: (upstream) => {
      delete (upstream.matchData as Record<string, unknown>).songId;
    },
    call: (upstream) => replay(upstream).cloudMatch(cloudMatchMatch.query),
  },
])('$name is rejected', async (entry) => {
  const upstream = structuredClone(entry.recording.response.body) as Record<
    string,
    unknown
  >;
  entry.mutate(upstream);

  await expectUpstreamShapeRejection(entry.call(upstream), {
    module: entry.module,
    path: entry.path,
    expected: 'present',
    actual: 'missing',
  });
});

test('song_lyrics_mark_add rejects a non-numeric markId', async () => {
  const upstream = structuredClone(songLyricsMarkAddAdd.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.markId = 'mark';

  await expectUpstreamShapeRejection(
    replay(upstream).songLyricsMarkAdd(songLyricsMarkAddAdd.query),
    {
      module: 'song_lyrics_mark_add',
      path: 'body.data.markId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_difm_channel_subscribe drops a bad loose hint and keeps undeclared fields', async () => {
  const upstream = structuredClone(djDifmChannelSubscribe.response.body) as {
    data?: unknown;
    message?: unknown;
    toast?: unknown;
  };
  upstream.message = 42;
  upstream.toast = { text: '已收藏' };

  const result = await replay(upstream).djDifmChannelSubscribe(
    djDifmChannelSubscribe.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('data', {});
  expect(result.body as unknown).toHaveProperty('toast', { text: '已收藏' });

  const missing = structuredClone(djDifmChannelSubscribe.response.body) as {
    message?: unknown;
  };
  delete missing.message;

  const missingResult = await replay(missing).djDifmChannelSubscribe(
    djDifmChannelSubscribe.query,
  );

  expect(missingResult.body as unknown).not.toHaveProperty('message');
});

test('song_lyrics_mark_add drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(songLyricsMarkAddAdd.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.success = 'yes';
  upstream.data.updateTime = 'now';
  upstream.data.extra = { source: 'lyrics' };

  const result = await replay(upstream).songLyricsMarkAdd(
    songLyricsMarkAddAdd.query,
  );

  const body = result.body as { data: Record<string, unknown> };
  expect(body.data).not.toHaveProperty('success');
  expect(body.data).not.toHaveProperty('updateTime');
  expect(body.data).toHaveProperty('markId', 32538120);
  expect(body.data).toHaveProperty('extra', { source: 'lyrics' });
});

test('user_social_status_edit drops a bad data hint and keeps undeclared fields', async () => {
  const upstream = structuredClone(userSocialStatusEditSet.response.body) as {
    data?: unknown;
    message?: unknown;
    noticeToast?: unknown;
  };
  upstream.data = 200;
  upstream.message = null;
  upstream.noticeToast = { type: 'toast' };

  const result = await replay(upstream).userSocialStatusEdit(
    userSocialStatusEditSet.query,
  );

  expect(result.body as unknown).not.toHaveProperty('data');
  expect(result.body as unknown).toHaveProperty('message', null);
  expect(result.body as unknown).toHaveProperty('noticeToast', {
    type: 'toast',
  });
});

test('recommend_songs_dislike drops a bad loose song field and keeps the tightened id', async () => {
  const upstream = structuredClone(
    recommendSongsDislikeDislike.response.body,
  ) as {
    data: Record<string, unknown>;
  };
  upstream.data.name = 42;
  upstream.data.albumNote = 'replacement';

  const result = await replay(upstream).recommendSongsDislike(
    recommendSongsDislikeDislike.query,
  );

  const body = result.body as { data: Record<string, unknown> };
  expect(body.data).not.toHaveProperty('name');
  expect(body.data).toHaveProperty('id', 3423975341);
  expect(body.data).toHaveProperty('albumNote', 'replacement');
});

test('fm_trash drops a bad count hint and keeps undeclared songs', async () => {
  const upstream = structuredClone(fmTrashTrash.response.body) as {
    count?: unknown;
    songs?: unknown;
  };
  upstream.count = '0';
  upstream.songs = [{ id: 347230 }];

  const result = await replay(upstream).fmTrash(fmTrashTrash.query);

  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body as unknown).toHaveProperty('songs', [{ id: 347230 }]);

  const missing = structuredClone(fmTrashTrash.response.body) as {
    count?: unknown;
  };
  delete missing.count;

  const missingResult = await replay(missing).fmTrash(fmTrashTrash.query);

  expect(missingResult.body as unknown).not.toHaveProperty('count');
});

test('cloud_match drops bad loose hints and keeps undeclared fields', async () => {
  const upstream = structuredClone(cloudMatchMatch.response.body) as {
    data?: unknown;
    message?: unknown;
    matchData: Record<string, unknown>;
  };
  upstream.data = 'yes';
  upstream.message = 'ok';
  upstream.matchData.matchType = 42;
  upstream.matchData.albumNote = 'match';

  const result = await replay(upstream).cloudMatch(cloudMatchMatch.query);

  expect(result.body as unknown).not.toHaveProperty('data');
  expect(result.body as unknown).not.toHaveProperty('message');
  const body = result.body as {
    matchData: Record<string, unknown>;
  };
  expect(body.matchData).not.toHaveProperty('matchType');
  expect(body.matchData).toHaveProperty('songId', 347230);
  expect(body.matchData).toHaveProperty('albumNote', 'match');
});

test('dj_difm_channel_unsubscribe drops a bad loose hint and keeps undeclared fields', async () => {
  const upstream = structuredClone(djDifmChannelUnsubscribe.response.body) as {
    message?: unknown;
    toast?: unknown;
  };
  upstream.message = 200;
  upstream.toast = { text: '已取消收藏' };

  const result = await replay(upstream).djDifmChannelUnsubscribe(
    djDifmChannelUnsubscribe.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('data', {});
  expect(result.body as unknown).toHaveProperty('toast', {
    text: '已取消收藏',
  });

  const missing = structuredClone(djDifmChannelUnsubscribe.response.body) as {
    message?: unknown;
  };
  delete missing.message;

  const missingResult = await replay(missing).djDifmChannelUnsubscribe(
    djDifmChannelUnsubscribe.query,
  );

  expect(missingResult.body as unknown).not.toHaveProperty('message');
});

test('song_lyrics_mark_del drops a bad loose message and keeps undeclared fields', async () => {
  const upstream = structuredClone(songLyricsMarkDelDel.response.body) as {
    message?: unknown;
    noticeToast?: unknown;
  };
  upstream.message = 200;
  upstream.noticeToast = { type: 'toast' };

  const result = await replay(upstream).songLyricsMarkDel(
    songLyricsMarkDelDel.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('noticeToast', {
    type: 'toast',
  });
  expect(result.body as unknown).toHaveProperty('data', { success: true });

  const missing = structuredClone(songLyricsMarkDelDel.response.body) as {
    message?: unknown;
  };
  delete missing.message;

  const missingResult = await replay(missing).songLyricsMarkDel(
    songLyricsMarkDelDel.query,
  );

  expect(missingResult.body as unknown).not.toHaveProperty('message');
});
