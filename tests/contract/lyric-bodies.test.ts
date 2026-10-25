import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  LyricBody,
  SongChorusBody,
  SongLyricsMarkBody,
  SongLyricsMarkUserPageBody,
  SongMusicDetailBody,
  SongWikiSummaryBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import lyricAllForms from '../fixtures/netease/lyric/lyric.all-forms.json';
import lyricCn from '../fixtures/netease/lyric/lyric.cn.json';
import lyricLyricUser from '../fixtures/netease/lyric/lyric.lyric-user.json';
import lyricPureMusic from '../fixtures/netease/lyric/lyric.pure-music.json';
import lyricUncollected from '../fixtures/netease/lyric/lyric.uncollected.json';
import songChorusDefault from '../fixtures/netease/lyric/song_chorus.default.json';
import songChorusEmpty from '../fixtures/netease/lyric/song_chorus.empty.json';
import songLyricsMarkEmpty from '../fixtures/netease/lyric/song_lyrics_mark.empty.json';
import songLyricsMarkUserPageEmpty from '../fixtures/netease/lyric/song_lyrics_mark_user_page.empty.json';
import songMusicDetailDefault from '../fixtures/netease/lyric/song_music_detail.default.json';
import songMusicDetailUnknown from '../fixtures/netease/lyric/song_music_detail.unknown.json';
import songWikiSummaryActions from '../fixtures/netease/lyric/song_wiki_summary.actions.json';
import songWikiSummaryDefault from '../fixtures/netease/lyric/song_wiki_summary.default.json';
import songWikiSummaryUnknown from '../fixtures/netease/lyric/song_wiki_summary.unknown.json';

// issue #102 B4 的匿名录制；本次登录对照未发现结构差异，登录录制没有保留。
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
    name: 'lyric with every lyric form',
    recording: lyricAllForms,
    bodySchema: LyricBody,
    call: (upstream, status) =>
      replay(upstream, status).lyric(lyricAllForms.query),
  },
  {
    name: 'lyric for a song whose translation and romaji are empty',
    recording: lyricCn,
    bodySchema: LyricBody,
    call: (upstream, status) => replay(upstream, status).lyric(lyricCn.query),
  },
  {
    name: 'lyric for a pure music track',
    recording: lyricPureMusic,
    bodySchema: LyricBody,
    call: (upstream, status) =>
      replay(upstream, status).lyric(lyricPureMusic.query),
  },
  {
    name: 'lyric for an uncollected song',
    recording: lyricUncollected,
    bodySchema: LyricBody,
    call: (upstream, status) =>
      replay(upstream, status).lyric(lyricUncollected.query),
  },
  {
    name: 'lyric with a lyric contributor',
    recording: lyricLyricUser,
    bodySchema: LyricBody,
    call: (upstream, status) =>
      replay(upstream, status).lyric(lyricLyricUser.query),
  },
  {
    name: 'song_chorus',
    recording: songChorusDefault,
    bodySchema: SongChorusBody,
    call: (upstream, status) =>
      replay(upstream, status).songChorus(songChorusDefault.query),
  },
  {
    name: 'song_chorus without chorus info',
    recording: songChorusEmpty,
    bodySchema: SongChorusBody,
    call: (upstream, status) =>
      replay(upstream, status).songChorus(songChorusEmpty.query),
  },
  {
    name: 'song_music_detail',
    recording: songMusicDetailDefault,
    bodySchema: SongMusicDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).songMusicDetail(songMusicDetailDefault.query),
  },
  {
    name: 'song_wiki_summary',
    recording: songWikiSummaryDefault,
    bodySchema: SongWikiSummaryBody,
    call: (upstream, status) =>
      replay(upstream, status).songWikiSummary(songWikiSummaryDefault.query),
  },
  {
    name: 'song_wiki_summary with button tags',
    recording: songWikiSummaryActions,
    bodySchema: SongWikiSummaryBody,
    call: (upstream, status) =>
      replay(upstream, status).songWikiSummary(songWikiSummaryActions.query),
  },
  {
    name: 'song_wiki_summary for an unknown song',
    recording: songWikiSummaryUnknown,
    bodySchema: SongWikiSummaryBody,
    call: (upstream, status) =>
      replay(upstream, status).songWikiSummary(songWikiSummaryUnknown.query),
  },
  {
    name: 'song_lyrics_mark without marks',
    recording: songLyricsMarkEmpty,
    bodySchema: SongLyricsMarkBody,
    call: (upstream, status) =>
      replay(upstream, status).songLyricsMark(songLyricsMarkEmpty.query),
  },
  {
    name: 'song_lyrics_mark_user_page without marks',
    recording: songLyricsMarkUserPageEmpty,
    bodySchema: SongLyricsMarkUserPageBody,
    call: (upstream, status) =>
      replay(upstream, status).songLyricsMarkUserPage(
        songLyricsMarkUserPageEmpty.query,
      ),
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

test('song_music_detail passes an unknown song code through', async () => {
  expect(
    await settle(
      replay(songMusicDetailUnknown.response.body).songMusicDetail(
        songMusicDetailUnknown.query,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: songMusicDetailUnknown.response.body,
    },
  });
});

test('lyric bodies type their tightened records and loose fields', () => {
  expectTypeOf<LyricBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<LyricBody['lrc']['lyric']>().toEqualTypeOf<string>();
  expectTypeOf<LyricBody['pureMusic']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    SongChorusBody['chorus'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<SongMusicDetailBody['data']['songId']>().toEqualTypeOf<number>();
  expectTypeOf<
    SongWikiSummaryBody['data']['blocks'][number]['id']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    SongWikiSummaryBody['data']['blocks'][number]['showType']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<SongLyricsMarkBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<SongLyricsMarkUserPageBody['data']['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
});

test('lyric rejects a body without lrc', async () => {
  const upstream = structuredClone(lyricAllForms.response.body) as {
    lrc?: unknown;
  };
  delete upstream.lrc;

  await expectUpstreamShapeRejection(
    replay(upstream).lyric(lyricAllForms.query),
    {
      module: 'lyric',
      path: 'body.lrc',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('lyric rejects a lyric text that is not a string', async () => {
  const upstream = structuredClone(lyricAllForms.response.body) as {
    lrc: { lyric: unknown };
  };
  upstream.lrc.lyric = 29;

  await expectUpstreamShapeRejection(
    replay(upstream).lyric(lyricAllForms.query),
    {
      module: 'lyric',
      path: 'body.lrc.lyric',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('lyric drops a bad lyric form and keeps undeclared fields', async () => {
  const upstream = structuredClone(lyricAllForms.response.body) as {
    tlyric: unknown;
    sgc: unknown;
    lrc: Record<string, unknown>;
  };
  upstream.tlyric = 1;
  upstream.sgc = 'no';
  upstream.lrc.offset = 0;

  const result = await replay(upstream).lyric(lyricAllForms.query);

  expect(result.body as unknown).not.toHaveProperty('tlyric');
  expect(result.body as unknown).not.toHaveProperty('sgc');
  expect(result.body.lrc).toHaveProperty('offset', 0);
  expect(result.body.romalrc).toEqual(lyricAllForms.response.body.romalrc);
});

test('lyric keeps a null loose flag', async () => {
  const upstream = structuredClone(lyricPureMusic.response.body) as {
    needDesc: unknown;
    pureMusic?: unknown;
  };
  upstream.needDesc = null;
  delete upstream.pureMusic;

  const result = await replay(upstream).lyric(lyricPureMusic.query);

  expect(result.body.needDesc as unknown).toBeNull();
  expect(result.body as unknown).not.toHaveProperty('pureMusic');
  expect(result.body.uncollected).toBeUndefined();
});

test('song_chorus rejects a body without its chorus list', async () => {
  const upstream = structuredClone(songChorusDefault.response.body) as {
    chorus?: unknown;
  };
  delete upstream.chorus;

  await expectUpstreamShapeRejection(
    replay(upstream).songChorus(songChorusDefault.query),
    {
      module: 'song_chorus',
      path: 'body.chorus',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_chorus rejects a chorus record without an id', async () => {
  const upstream = structuredClone(songChorusDefault.response.body) as {
    chorus: Array<{ id?: unknown }>;
  };
  delete upstream.chorus[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).songChorus(songChorusDefault.query),
    {
      module: 'song_chorus',
      path: 'body.chorus[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_chorus rejects a data block that is not an array', async () => {
  const upstream = structuredClone(songChorusDefault.response.body) as {
    data: unknown;
  };
  upstream.data = {};

  await expectUpstreamShapeRejection(
    replay(upstream).songChorus(songChorusDefault.query),
    {
      module: 'song_chorus',
      path: 'body.data',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('song_chorus drops a bad time range and keeps undeclared fields', async () => {
  const upstream = structuredClone(songChorusDefault.response.body) as {
    chorus: Array<Record<string, unknown>>;
  };
  upstream.chorus[0]!.startTime = '58';
  upstream.chorus[0]!.confidence = 0.9;

  const result = await replay(upstream).songChorus(songChorusDefault.query);

  expect(result.body.chorus[0] as unknown).not.toHaveProperty('startTime');
  expect(result.body.chorus[0]).toHaveProperty('confidence', 0.9);
  expect(result.body.chorus[0]!.id).toBe(
    songChorusDefault.response.body.chorus[0]!.id,
  );
});

test('song_music_detail rejects a body without detail data', async () => {
  const upstream = structuredClone(songMusicDetailDefault.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).songMusicDetail(songMusicDetailDefault.query),
    {
      module: 'song_music_detail',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_music_detail rejects a detail record whose songId is text', async () => {
  const upstream = structuredClone(songMusicDetailDefault.response.body) as {
    data: { songId: unknown };
  };
  upstream.data.songId = '1466598056';

  await expectUpstreamShapeRejection(
    replay(upstream).songMusicDetail(songMusicDetailDefault.query),
    {
      module: 'song_music_detail',
      path: 'body.data.songId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('song_music_detail drops bad quality records and keeps undeclared fields', async () => {
  const upstream = structuredClone(songMusicDetailDefault.response.body) as {
    data: Record<string, unknown>;
    error: unknown;
  };
  upstream.data.h = 'lossless';
  upstream.data.sks = ['aac'];
  upstream.data.trackId = 1466598056;
  upstream.error = 'false';

  const result = await replay(upstream).songMusicDetail(
    songMusicDetailDefault.query,
  );

  expect(result.body.data as unknown).not.toHaveProperty('h');
  expect(result.body.data as unknown).not.toHaveProperty('sks');
  expect(result.body.data).toHaveProperty('trackId', 1466598056);
  expect(result.body as unknown).not.toHaveProperty('error');
  expect(result.body.data.songId).toBe(1466598056);
});

test('song_wiki_summary rejects a body without wiki data', async () => {
  const upstream = structuredClone(songWikiSummaryDefault.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).songWikiSummary(songWikiSummaryDefault.query),
    {
      module: 'song_wiki_summary',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_wiki_summary rejects blocks that are not an array', async () => {
  const upstream = structuredClone(songWikiSummaryDefault.response.body) as {
    data: { blocks: unknown };
  };
  upstream.data.blocks = {};

  await expectUpstreamShapeRejection(
    replay(upstream).songWikiSummary(songWikiSummaryDefault.query),
    {
      module: 'song_wiki_summary',
      path: 'body.data.blocks',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('song_wiki_summary rejects a block without its string id', async () => {
  const upstream = structuredClone(songWikiSummaryDefault.response.body) as {
    data: { blocks: Array<{ id?: unknown }> };
  };
  delete upstream.data.blocks[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).songWikiSummary(songWikiSummaryDefault.query),
    {
      module: 'song_wiki_summary',
      path: 'body.data.blocks[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_wiki_summary rejects a block id that is not a string', async () => {
  const upstream = structuredClone(songWikiSummaryDefault.response.body) as {
    data: { blocks: Array<{ id: unknown }> };
  };
  upstream.data.blocks[0]!.id = 35999;

  await expectUpstreamShapeRejection(
    replay(upstream).songWikiSummary(songWikiSummaryDefault.query),
    {
      module: 'song_wiki_summary',
      path: 'body.data.blocks[0].id',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('song_wiki_summary drops bad block fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(songWikiSummaryDefault.response.body) as {
    data: {
      blocks: Array<Record<string, unknown>>;
      cursor: unknown;
      hasMore: unknown;
    };
  };
  const [first] = upstream.data.blocks;
  (first!.uiElement as Record<string, unknown>).mainTitle = 'title';
  first!.creatives = 'none';
  first!.blockConfig = { refresh: 1 };
  upstream.data.cursor = 0;
  upstream.data.hasMore = 'false';

  const result = await replay(upstream).songWikiSummary(
    songWikiSummaryDefault.query,
  );

  expect(
    (
      result.body.data.blocks[0]!.uiElement as unknown as Record<
        string,
        unknown
      >
    ).mainTitle,
  ).toBeUndefined();
  expect(result.body.data.blocks[0] as unknown).not.toHaveProperty('creatives');
  expect(result.body.data.blocks[0]).toHaveProperty('blockConfig', {
    refresh: 1,
  });
  expect(result.body.data as unknown).not.toHaveProperty('cursor');
  expect(result.body.data as unknown).not.toHaveProperty('hasMore');
  expect(result.body.data.blocks[0]!.id).toBe(
    songWikiSummaryDefault.response.body.data.blocks[0]!.id,
  );
});

test('song_lyrics_mark rejects a body without its data object', async () => {
  const upstream = structuredClone(songLyricsMarkEmpty.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).songLyricsMark(songLyricsMarkEmpty.query),
    {
      module: 'song_lyrics_mark',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_lyrics_mark rejects a null data object', async () => {
  const upstream = structuredClone(songLyricsMarkEmpty.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).songLyricsMark(songLyricsMarkEmpty.query),
    {
      module: 'song_lyrics_mark',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('song_lyrics_mark drops a bad message and keeps undeclared fields', async () => {
  const upstream = structuredClone(songLyricsMarkEmpty.response.body) as {
    message: unknown;
    data: Record<string, unknown>;
  };
  upstream.message = 0;
  upstream.data.markVOList = [{ markId: 'm1' }];

  const result = await replay(upstream).songLyricsMark(
    songLyricsMarkEmpty.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body.data).toHaveProperty('markVOList', [{ markId: 'm1' }]);
});

test('song_lyrics_mark_user_page rejects a data block that is not an object', async () => {
  const upstream = structuredClone(
    songLyricsMarkUserPageEmpty.response.body,
  ) as { data: unknown };
  upstream.data = [];

  await expectUpstreamShapeRejection(
    replay(upstream).songLyricsMarkUserPage(songLyricsMarkUserPageEmpty.query),
    {
      module: 'song_lyrics_mark_user_page',
      path: 'body.data',
      expected: 'object',
      actual: 'array',
    },
  );
});

test('song_lyrics_mark_user_page drops bad pagination and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    songLyricsMarkUserPageEmpty.response.body,
  ) as { data: Record<string, unknown> };
  upstream.data.offset = '0';
  upstream.data.hasMore = null;
  upstream.data.markVOList = [{ markId: 'm1' }];

  const result = await replay(upstream).songLyricsMarkUserPage(
    songLyricsMarkUserPageEmpty.query,
  );

  expect(result.body.data as unknown).not.toHaveProperty('offset');
  expect(result.body.data.hasMore as unknown).toBeNull();
  expect(result.body.data as unknown).toHaveProperty('markVOList', [
    { markId: 'm1' },
  ]);
});
