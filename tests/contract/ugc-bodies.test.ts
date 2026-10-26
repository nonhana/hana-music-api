import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  UgcAlbumGetBody,
  UgcArtistGetBody,
  UgcArtistSearchBody,
  UgcDetailBody,
  UgcMvGetBody,
  UgcSongGetBody,
  UgcUserDevoteBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import ugcAlbumGet from '../fixtures/netease/ugc/ugc_album_get.default.json';
import ugcAlbumGetMissing from '../fixtures/netease/ugc/ugc_album_get.missing.json';
import ugcArtistGet from '../fixtures/netease/ugc/ugc_artist_get.default.json';
import ugcArtistGetMissing from '../fixtures/netease/ugc/ugc_artist_get.missing.json';
import ugcArtistSearchArtistId from '../fixtures/netease/ugc/ugc_artist_search.artist-id.json';
import ugcArtistSearchEmpty from '../fixtures/netease/ugc/ugc_artist_search.empty.json';
import ugcArtistSearchKeyword from '../fixtures/netease/ugc/ugc_artist_search.keyword.json';
import ugcDetailAnonymous from '../fixtures/netease/ugc/ugc_detail.anonymous.json';
import ugcDetail from '../fixtures/netease/ugc/ugc_detail.default.json';
import ugcMvGet from '../fixtures/netease/ugc/ugc_mv_get.default.json';
import ugcMvGetMissing from '../fixtures/netease/ugc/ugc_mv_get.missing.json';
import ugcSongGet from '../fixtures/netease/ugc/ugc_song_get.default.json';
import ugcSongGetMissing from '../fixtures/netease/ugc/ugc_song_get.missing.json';
import ugcUserDevoteAnonymous from '../fixtures/netease/ugc/ugc_user_devote.anonymous.json';
import ugcUserDevote from '../fixtures/netease/ugc/ugc_user_devote.default.json';

// issue #102 B42 的录制：UGC 百科只读接口。登录对照先确认 login_status 的
// account.anonimousUser 为 false；未知专辑、歌手、歌曲返回 code 200 但没有 data，
// 未知 MV 是 code 404 的业务拒绝。ugc_detail 的当前账号没有贡献，列表只见过空数组。
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
  ) => Promise<{ readonly status: number; readonly body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'ugc_album_get',
    recording: ugcAlbumGet,
    bodySchema: UgcAlbumGetBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcAlbumGet(ugcAlbumGet.query),
  },
  {
    name: 'ugc_album_get for an unknown album',
    recording: ugcAlbumGetMissing,
    bodySchema: UgcAlbumGetBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcAlbumGet(ugcAlbumGetMissing.query),
  },
  {
    name: 'ugc_artist_get',
    recording: ugcArtistGet,
    bodySchema: UgcArtistGetBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcArtistGet(ugcArtistGet.query),
  },
  {
    name: 'ugc_artist_get for an unknown artist',
    recording: ugcArtistGetMissing,
    bodySchema: UgcArtistGetBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcArtistGet(ugcArtistGetMissing.query),
  },
  {
    name: 'ugc_artist_search by keyword',
    recording: ugcArtistSearchKeyword,
    bodySchema: UgcArtistSearchBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcArtistSearch(ugcArtistSearchKeyword.query),
  },
  {
    name: 'ugc_artist_search by artist id',
    recording: ugcArtistSearchArtistId,
    bodySchema: UgcArtistSearchBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcArtistSearch(ugcArtistSearchArtistId.query),
  },
  {
    name: 'ugc_artist_search without results',
    recording: ugcArtistSearchEmpty,
    bodySchema: UgcArtistSearchBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcArtistSearch(ugcArtistSearchEmpty.query),
  },
  {
    name: 'ugc_mv_get',
    recording: ugcMvGet,
    bodySchema: UgcMvGetBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcMvGet(ugcMvGet.query),
  },
  {
    name: 'ugc_song_get',
    recording: ugcSongGet,
    bodySchema: UgcSongGetBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcSongGet(ugcSongGet.query),
  },
  {
    name: 'ugc_song_get for an unknown song',
    recording: ugcSongGetMissing,
    bodySchema: UgcSongGetBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcSongGet(ugcSongGetMissing.query),
  },
  {
    name: 'ugc_detail',
    recording: ugcDetail,
    bodySchema: UgcDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcDetail(ugcDetail.query),
  },
  {
    name: 'ugc_detail anonymously',
    recording: ugcDetailAnonymous,
    bodySchema: UgcDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcDetail(ugcDetailAnonymous.query),
  },
  {
    name: 'ugc_user_devote',
    recording: ugcUserDevote,
    bodySchema: UgcUserDevoteBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcUserDevote(ugcUserDevote.query),
  },
  {
    name: 'ugc_user_devote anonymously',
    recording: ugcUserDevoteAnonymous,
    bodySchema: UgcUserDevoteBody,
    call: (upstream, status) =>
      replay(upstream, status).ugcUserDevote(ugcUserDevoteAnonymous.query),
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

test('ugc_detail rejects a body without contribution data', async () => {
  const withoutData = structuredClone(ugcDetail.response.body) as {
    data?: unknown;
  };
  delete withoutData.data;

  await expectUpstreamShapeRejection(
    replay(withoutData).ugcDetail(ugcDetail.query),
    {
      module: 'ugc_detail',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );

  const withNull = structuredClone(ugcDetail.response.body) as {
    data?: unknown;
  };
  withNull.data = null;

  await expectUpstreamShapeRejection(
    replay(withNull).ugcDetail(ugcDetail.query),
    {
      module: 'ugc_detail',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('ugc_mv_get rejects an unknown mv with the upstream business code', async () => {
  expect(
    await settle(
      replay(ugcMvGetMissing.response.body).ugcMvGet(ugcMvGetMissing.query),
    ),
  ).toEqual({
    rejected: {
      status: 404,
      cookie: [],
      body: ugcMvGetMissing.response.body,
    },
  });
});

test('ugc bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    NonNullable<UgcAlbumGetBody['data']>['albumId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<UgcAlbumGetBody['data']>['production']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    NonNullable<UgcArtistGetBody['data']>['artistId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    UgcArtistSearchBody['data']['list'][number]['artistId']
  >().toEqualTypeOf<number>();
  expectTypeOf<UgcArtistSearchBody['data']['totalCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<UgcMvGetBody['data']['mvId']>().toEqualTypeOf<number>();
  expectTypeOf<UgcMvGetBody['data']['desc']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    NonNullable<UgcSongGetBody['data']>['songId']
  >().toEqualTypeOf<number>();
  expectTypeOf<UgcDetailBody['data']['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<UgcUserDevoteBody['data']['userId']>().toEqualTypeOf<number>();
  expectTypeOf<UgcUserDevoteBody['data']['ugcCount']>().toEqualTypeOf<
    number | null | undefined
  >();
});

test('ugc modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.ugcAlbumGet(null as never),
    () => api.ugcArtistGet(null as never),
    () => api.ugcArtistSearch(null as never),
    () => api.ugcDetail(null as never),
    () => api.ugcMvGet(null as never),
    () => api.ugcSongGet(null as never),
    () => api.ugcUserDevote(null as never),
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

test('ugc_album_get accepts a null album and rejects one without an album id', async () => {
  const withNull = structuredClone(ugcAlbumGet.response.body) as {
    data?: unknown;
  };
  withNull.data = null;

  const nullResult = await replay(withNull).ugcAlbumGet(ugcAlbumGet.query);
  expect(nullResult.status).toBe(200);
  expect(nullResult.body as unknown).toHaveProperty('data', null);

  const withoutId = structuredClone(ugcAlbumGet.response.body) as {
    data: { albumId?: unknown };
  };
  delete withoutId.data.albumId;

  await expectUpstreamShapeRejection(
    replay(withoutId).ugcAlbumGet(ugcAlbumGet.query),
    {
      module: 'ugc_album_get',
      path: 'body.data.albumId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('ugc_album_get rejects a non-numeric album id', async () => {
  const upstream = structuredClone(ugcAlbumGet.response.body) as {
    data: { albumId: unknown };
  };
  upstream.data.albumId = '168223858';

  await expectUpstreamShapeRejection(
    replay(upstream).ugcAlbumGet(ugcAlbumGet.query),
    {
      module: 'ugc_album_get',
      path: 'body.data.albumId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('ugc_album_get drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(ugcAlbumGet.response.body) as {
    data: {
      albumId: number;
      company?: unknown;
      language: string | null;
      production: unknown;
      transName: string | null;
      songRepVos: Array<{ songTags?: unknown }>;
    };
    extra?: unknown;
  };
  upstream.data.production = 22;
  upstream.data.language = null;
  delete upstream.data.company;
  upstream.data.transName = '未来前夜';
  upstream.data.songRepVos[0]!.songTags = 'tags';
  upstream.extra = { albumId: 1 };

  const result = await replay(upstream).ugcAlbumGet(ugcAlbumGet.query);

  expect(result.body as unknown).not.toHaveProperty('data.production');
  expect(result.body as unknown).toHaveProperty('data.language', null);
  expect(result.body as unknown).not.toHaveProperty('data.company');
  expect(result.body as unknown).toHaveProperty('data.transName', '未来前夜');
  expect(result.body as unknown).not.toHaveProperty(
    'data.songRepVos[0].songTags',
  );
  expect(result.body as unknown).toHaveProperty('data.songRepVos[0].songId');
  expect(result.body as unknown).toHaveProperty('extra', { albumId: 1 });
});

test('ugc_artist_get accepts a null artist and rejects one without an artist id', async () => {
  const withNull = structuredClone(ugcArtistGet.response.body) as {
    data?: unknown;
  };
  withNull.data = null;

  const nullResult = await replay(withNull).ugcArtistGet(ugcArtistGet.query);
  expect(nullResult.status).toBe(200);
  expect(nullResult.body as unknown).toHaveProperty('data', null);

  const withoutId = structuredClone(ugcArtistGet.response.body) as {
    data: { artistId?: unknown };
  };
  delete withoutId.data.artistId;

  await expectUpstreamShapeRejection(
    replay(withoutId).ugcArtistGet(ugcArtistGet.query),
    {
      module: 'ugc_artist_get',
      path: 'body.data.artistId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('ugc_artist_get drops a bad loose field and keeps undeclared fields', async () => {
  const upstream = structuredClone(ugcArtistGet.response.body) as {
    data: { area: unknown; transName?: string | null };
  };
  upstream.data.area = '8';
  upstream.data.transName = 'ささくれ';

  const result = await replay(upstream).ugcArtistGet(ugcArtistGet.query);

  expect(result.body as unknown).not.toHaveProperty('data.area');
  expect(result.body as unknown).toHaveProperty('data.artistName');
  expect(result.body as unknown).toHaveProperty('data.transName', 'ささくれ');
});

test('ugc_artist_search rejects a result without an artist id', async () => {
  const upstream = structuredClone(ugcArtistSearchKeyword.response.body) as {
    data: { list: Array<{ artistId?: unknown }> };
  };
  delete upstream.data.list[0]!.artistId;

  await expectUpstreamShapeRejection(
    replay(upstream).ugcArtistSearch(ugcArtistSearchKeyword.query),
    {
      module: 'ugc_artist_search',
      path: 'body.data.list[0].artistId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('ugc_artist_search rejects a non-array result list', async () => {
  const upstream = structuredClone(ugcArtistSearchEmpty.response.body) as {
    data: { list: unknown };
  };
  upstream.data.list = null;

  await expectUpstreamShapeRejection(
    replay(upstream).ugcArtistSearch(ugcArtistSearchEmpty.query),
    {
      module: 'ugc_artist_search',
      path: 'body.data.list',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('ugc_artist_search drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(ugcArtistSearchKeyword.response.body) as {
    data: {
      list: Array<{ artistAvatarPicUrl: unknown; note?: string }>;
      totalCount: unknown;
      extraCount: unknown;
    };
  };
  upstream.data.totalCount = '1';
  upstream.data.list[0]!.artistAvatarPicUrl = 6;
  upstream.data.list[0]!.note = 'wiki';
  upstream.data.extraCount = { reviewed: 0 };

  const result = await replay(upstream).ugcArtistSearch(
    ugcArtistSearchKeyword.query,
  );

  expect(result.body as unknown).not.toHaveProperty('data.totalCount');
  expect(result.body as unknown).toHaveProperty('data.list[0].artistId');
  expect(result.body as unknown).not.toHaveProperty(
    'data.list[0].artistAvatarPicUrl',
  );
  expect(result.body as unknown).toHaveProperty('data.list[0].note', 'wiki');
  expect(result.body as unknown).toHaveProperty('data.extraCount', {
    reviewed: 0,
  });
});

test('ugc_mv_get rejects an mv without an mv id', async () => {
  const upstream = structuredClone(ugcMvGet.response.body) as {
    data: { mvId?: unknown };
  };
  delete upstream.data.mvId;

  await expectUpstreamShapeRejection(
    replay(upstream).ugcMvGet(ugcMvGet.query),
    {
      module: 'ugc_mv_get',
      path: 'body.data.mvId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('ugc_mv_get drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(ugcMvGet.response.body) as {
    data: {
      desc: unknown;
      mvSongVos: unknown;
      coverComment?: unknown;
    };
  };
  upstream.data.desc = 1;
  upstream.data.mvSongVos = 'songs';
  upstream.data.coverComment = { commentCount: 4 };

  const result = await replay(upstream).ugcMvGet(ugcMvGet.query);

  expect(result.body as unknown).not.toHaveProperty('data.desc');
  expect(result.body as unknown).not.toHaveProperty('data.mvSongVos');
  expect(result.body as unknown).toHaveProperty('data.mvName');
  expect(result.body as unknown).toHaveProperty('data.coverComment', {
    commentCount: 4,
  });
});

test('ugc_song_get accepts a null song and rejects one without a song id', async () => {
  const withNull = structuredClone(ugcSongGet.response.body) as {
    data?: unknown;
  };
  withNull.data = null;

  const nullResult = await replay(withNull).ugcSongGet(ugcSongGet.query);
  expect(nullResult.status).toBe(200);
  expect(nullResult.body as unknown).toHaveProperty('data', null);

  const withoutId = structuredClone(ugcSongGet.response.body) as {
    data: { songId?: unknown };
  };
  delete withoutId.data.songId;

  await expectUpstreamShapeRejection(
    replay(withoutId).ugcSongGet(ugcSongGet.query),
    {
      module: 'ugc_song_get',
      path: 'body.data.songId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('ugc_song_get drops a bad lyric and keeps undeclared fields', async () => {
  const upstream = structuredClone(ugcSongGet.response.body) as {
    data: { lyricContent: unknown; songTags?: unknown };
  };
  upstream.data.lyricContent = 1;
  upstream.data.songTags = [{ id: 1252, name: '二次元' }];

  const result = await replay(upstream).ugcSongGet(ugcSongGet.query);

  expect(result.body as unknown).not.toHaveProperty('data.lyricContent');
  expect(result.body as unknown).toHaveProperty('data.transLyricContent');
  expect(result.body as unknown).toHaveProperty('data.songTags', [
    { id: 1252, name: '二次元' },
  ]);
});

test('ugc_detail drops a bad total and keeps the undeclared contribution list', async () => {
  const upstream = structuredClone(ugcDetail.response.body) as {
    data: { total: unknown; wikiDetailResultVoList: unknown };
  };
  upstream.data.total = '0';
  upstream.data.wikiDetailResultVoList = [{ id: 1, type: 3, auditStatus: 5 }];

  const result = await replay(upstream).ugcDetail(ugcDetail.query);

  expect(result.body as unknown).not.toHaveProperty('data.total');
  expect(result.body as unknown).toHaveProperty('data.wikiDetailResultVoList', [
    { id: 1, type: 3, auditStatus: 5 },
  ]);
});

test('ugc_user_devote rejects a non-numeric user id', async () => {
  const upstream = structuredClone(ugcUserDevote.response.body) as {
    data: { userId: unknown };
  };
  upstream.data.userId = '10000001';

  await expectUpstreamShapeRejection(
    replay(upstream).ugcUserDevote(ugcUserDevote.query),
    {
      module: 'ugc_user_devote',
      path: 'body.data.userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('ugc_user_devote drops bad counts and keeps undeclared fields', async () => {
  const upstream = structuredClone(ugcUserDevote.response.body) as {
    data: { ugcCount: unknown; cloudShell: unknown; extra?: unknown };
  };
  upstream.data.ugcCount = '0';
  upstream.data.cloudShell = '0';
  upstream.data.extra = { rank: 1 };

  const result = await replay(upstream).ugcUserDevote(ugcUserDevote.query);

  expect(result.body as unknown).not.toHaveProperty('data.ugcCount');
  expect(result.body as unknown).not.toHaveProperty('data.cloudShell');
  expect(result.body as unknown).toHaveProperty('data.userId', 10000001);
  expect(result.body as unknown).toHaveProperty('data.extra', { rank: 1 });
});
