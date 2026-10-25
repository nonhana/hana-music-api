import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  SearchBody,
  SearchDefaultBody,
  SearchHotBody,
  SearchHotDetailBody,
  SearchMatchBody,
  SearchMultimatchBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  validateSync,
} from '../_kit/assertions.ts';
import searchAlbum from '../fixtures/netease/search/search.album.json';
import searchArtist from '../fixtures/netease/search/search.artist.json';
import searchCn from '../fixtures/netease/search/search.cn.json';
import searchEmptyAlbums from '../fixtures/netease/search/search.empty-albums.json';
import searchEmptyArtists from '../fixtures/netease/search/search.empty-artists.json';
import searchEmptyMvs from '../fixtures/netease/search/search.empty-mvs.json';
import searchEmptyPlaylists from '../fixtures/netease/search/search.empty-playlists.json';
import searchEn from '../fixtures/netease/search/search.en.json';
import searchMv from '../fixtures/netease/search/search.mv.json';
import searchNoResult from '../fixtures/netease/search/search.no-result.json';
import searchOffset from '../fixtures/netease/search/search.offset.json';
import searchPinyin from '../fixtures/netease/search/search.pinyin.json';
import searchPlaylist from '../fixtures/netease/search/search.playlist.json';
import searchDefault from '../fixtures/netease/search/search_default.default.json';
import searchHot from '../fixtures/netease/search/search_hot.default.json';
import searchHotDetail from '../fixtures/netease/search/search_hot_detail.default.json';
import searchHotDetailSecond from '../fixtures/netease/search/search_hot_detail.second.json';
import searchMatch from '../fixtures/netease/search/search_match.default.json';
import searchMatchNone from '../fixtures/netease/search/search_match.no-result.json';
import searchMultimatch from '../fixtures/netease/search/search_multimatch.default.json';
import searchMultimatchNone from '../fixtures/netease/search/search_multimatch.no-result.json';

// issue #102 B14 的匿名录制：中文、英文、拼音、无结果、分页和五种 type。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

const replayRecording = (recording: Recording) =>
  replay(recording.response.body, recording.response.status);

type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (recording: Recording) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'search songs in Chinese',
    recording: searchCn,
    bodySchema: SearchBody,
    call: (recording) => replayRecording(recording).search(searchCn.query),
  },
  {
    name: 'search songs in English',
    recording: searchEn,
    bodySchema: SearchBody,
    call: (recording) => replayRecording(recording).search(searchEn.query),
  },
  {
    name: 'search songs in pinyin',
    recording: searchPinyin,
    bodySchema: SearchBody,
    call: (recording) => replayRecording(recording).search(searchPinyin.query),
  },
  {
    name: 'search songs with an offset',
    recording: searchOffset,
    bodySchema: SearchBody,
    call: (recording) => replayRecording(recording).search(searchOffset.query),
  },
  {
    name: 'search without results',
    recording: searchNoResult,
    bodySchema: SearchBody,
    call: (recording) =>
      replayRecording(recording).search(searchNoResult.query),
  },
  {
    name: 'search albums',
    recording: searchAlbum,
    bodySchema: SearchBody,
    call: (recording) => replayRecording(recording).search(searchAlbum.query),
  },
  {
    name: 'search artists',
    recording: searchArtist,
    bodySchema: SearchBody,
    call: (recording) => replayRecording(recording).search(searchArtist.query),
  },
  {
    name: 'search playlists',
    recording: searchPlaylist,
    bodySchema: SearchBody,
    call: (recording) =>
      replayRecording(recording).search(searchPlaylist.query),
  },
  {
    name: 'search mvs',
    recording: searchMv,
    bodySchema: SearchBody,
    call: (recording) => replayRecording(recording).search(searchMv.query),
  },
  {
    name: 'search with no albums',
    recording: searchEmptyAlbums,
    bodySchema: SearchBody,
    call: (recording) =>
      replayRecording(recording).search(searchEmptyAlbums.query),
  },
  {
    name: 'search with no artists',
    recording: searchEmptyArtists,
    bodySchema: SearchBody,
    call: (recording) =>
      replayRecording(recording).search(searchEmptyArtists.query),
  },
  {
    name: 'search with no playlists',
    recording: searchEmptyPlaylists,
    bodySchema: SearchBody,
    call: (recording) =>
      replayRecording(recording).search(searchEmptyPlaylists.query),
  },
  {
    name: 'search with no mvs',
    recording: searchEmptyMvs,
    bodySchema: SearchBody,
    call: (recording) =>
      replayRecording(recording).search(searchEmptyMvs.query),
  },
  {
    name: 'search_default',
    recording: searchDefault,
    bodySchema: SearchDefaultBody,
    call: (recording) =>
      replayRecording(recording).searchDefault(searchDefault.query),
  },
  {
    name: 'search_hot',
    recording: searchHot,
    bodySchema: SearchHotBody,
    call: (recording) => replayRecording(recording).searchHot(searchHot.query),
  },
  {
    name: 'search_hot_detail',
    recording: searchHotDetail,
    bodySchema: SearchHotDetailBody,
    call: (recording) =>
      replayRecording(recording).searchHotDetail(searchHotDetail.query),
  },
  {
    name: 'search_hot_detail with an alg and trp',
    recording: searchHotDetailSecond,
    bodySchema: SearchHotDetailBody,
    call: (recording) =>
      replayRecording(recording).searchHotDetail(searchHotDetailSecond.query),
  },
  {
    name: 'search_match',
    recording: searchMatch,
    bodySchema: SearchMatchBody,
    call: (recording) =>
      replayRecording(recording).searchMatch(searchMatch.query),
  },
  {
    name: 'search_match without results',
    recording: searchMatchNone,
    bodySchema: SearchMatchBody,
    call: (recording) =>
      replayRecording(recording).searchMatch(searchMatchNone.query),
  },
  {
    name: 'search_multimatch',
    recording: searchMultimatch,
    bodySchema: SearchMultimatchBody,
    call: (recording) =>
      replayRecording(recording).searchMultimatch(searchMultimatch.query),
  },
  {
    name: 'search_multimatch without results',
    recording: searchMultimatchNone,
    bodySchema: SearchMultimatchBody,
    call: (recording) =>
      replayRecording(recording).searchMultimatch(searchMultimatchNone.query),
  },
];

test.each(cases)(
  '$name returns and preserves its recording',
  async ({ recording, bodySchema, call }) => {
    const result = await call(recording);

    expect(result.body).toEqual(recording.response.body);
    const validated = validateSync(bodySchema, recording.response.body);
    expect(validated.issues).toBeUndefined();
    expect(validated.value).toEqual(recording.response.body);
  },
);

test('search bodies tighten the identifiers and keep loose fields loose', () => {
  type SearchResult = NonNullable<SearchBody['result']>;

  expectTypeOf<
    NonNullable<SearchResult['songs']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchResult['albums']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchResult['artists']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchResult['playlists']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchResult['mvs']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<SearchResult['songCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<SearchResult['hlWords']>().toEqualTypeOf<
    ReadonlyArray<string> | null | undefined
  >();
  expectTypeOf<
    SearchDefaultBody['data']['showKeyword']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    SearchDefaultBody['data']['realkeyword']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    SearchHotBody['result']['hots'][number]['first']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    SearchHotDetailBody['data'][number]['searchWord']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    SearchMatchBody['result']['ids'][number]
  >().toEqualTypeOf<string>();
  expectTypeOf<
    SearchMatchBody['result']['songs'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchMultimatchBody['result']['artist']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchMultimatchBody['result']['playlist']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<
      SearchMultimatchBody['result']['new_mlog']
    >[number]['resourceId']
  >().toEqualTypeOf<string>();
  expectTypeOf<SearchMultimatchBody['result']['orders']>().toEqualTypeOf<
    ReadonlyArray<string> | null | undefined
  >();
});

test('search rejects a song without an id', async () => {
  const upstream = structuredClone(searchCn.response.body);
  delete (upstream.result.songs[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(replay(upstream).search(searchCn.query), {
    module: 'search',
    path: 'body.result.songs[0].id',
    expected: 'present',
    actual: 'missing',
  });
});

test('search rejects an album whose id is text', async () => {
  const upstream = structuredClone(searchAlbum.response.body);
  (upstream.result.albums[0] as { id: unknown }).id = '260499608';

  await expectUpstreamShapeRejection(
    replay(upstream).search(searchAlbum.query),
    {
      module: 'search',
      path: 'body.result.albums[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('search rejects an artist whose id is text', async () => {
  const upstream = structuredClone(searchArtist.response.body);
  (upstream.result.artists[0] as { id: unknown }).id = '6452';

  await expectUpstreamShapeRejection(
    replay(upstream).search(searchArtist.query),
    {
      module: 'search',
      path: 'body.result.artists[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('search rejects a playlist without an id', async () => {
  const upstream = structuredClone(searchPlaylist.response.body);
  delete (upstream.result.playlists[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).search(searchPlaylist.query),
    {
      module: 'search',
      path: 'body.result.playlists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('search rejects an mv whose id is text', async () => {
  const upstream = structuredClone(searchMv.response.body);
  (upstream.result.mvs[0] as { id: unknown }).id = '14514682';

  await expectUpstreamShapeRejection(replay(upstream).search(searchMv.query), {
    module: 'search',
    path: 'body.result.mvs[0].id',
    expected: 'number',
    actual: 'string',
  });
});

test('search accepts a missing or null result and a missing or null song list', async () => {
  const missingResult = structuredClone(searchNoResult.response.body);
  delete (missingResult as { result?: unknown }).result;
  const missingResultResponse = await replay(missingResult).search(
    searchNoResult.query,
  );
  expect(missingResultResponse.status).toBe(200);
  expect(missingResultResponse.body as unknown).not.toHaveProperty('result');

  const nullResult = structuredClone(searchNoResult.response.body) as {
    result: unknown;
  };
  nullResult.result = null;
  const nullResultResponse = await replay(nullResult).search(
    searchNoResult.query,
  );
  expect(nullResultResponse.status).toBe(200);
  expect(nullResultResponse.body.result as unknown).toBeNull();

  const missingSongs = structuredClone(searchCn.response.body);
  delete (missingSongs.result as { songs?: unknown }).songs;
  const missingSongsResponse = await replay(missingSongs).search(
    searchCn.query,
  );
  expect(missingSongsResponse.status).toBe(200);
  expect(missingSongsResponse.body.result as unknown).not.toHaveProperty(
    'songs',
  );

  const nullSongs = structuredClone(searchCn.response.body) as {
    result: { songs: unknown };
  };
  nullSongs.result.songs = null;
  const nullSongsResponse = await replay(nullSongs).search(searchCn.query);
  expect(nullSongsResponse.status).toBe(200);
  expect(nullSongsResponse.body.result?.songs as unknown).toBeNull();
});

test('search drops loose fields that do not decode and keeps undeclared fields', async () => {
  const upstream = structuredClone(searchCn.response.body);
  const resultBody = upstream.result as unknown as Record<string, unknown>;
  resultBody.songCount = '337';
  resultBody.hlWords = null;
  (upstream as { trp?: unknown }).trp = 'rules';
  (upstream.result.songs[0] as { fee: unknown }).fee = 'free';
  (
    upstream.result.songs[0] as unknown as {
      album: Record<string, unknown>;
    }
  ).album.picUrl = 123;
  (upstream.result.songs[0] as { brandNew?: unknown }).brandNew = {
    tags: ['新'],
  };

  const result = await replay(upstream).search(searchCn.query);

  expect(result.body.result as unknown).not.toHaveProperty('songCount');
  expect(result.body as unknown).not.toHaveProperty('trp');
  expect(result.body.result?.hlWords as unknown).toBeNull();
  expect(result.body.result?.songs?.[0] as unknown).not.toHaveProperty('fee');
  expect(result.body.result?.songs?.[0]?.album as unknown).not.toHaveProperty(
    'picUrl',
  );
  expect(result.body.result?.songs?.[0]?.brandNew as unknown).toEqual({
    tags: ['新'],
  });
});

test('search keeps an undeclared playlist score', async () => {
  const upstream = structuredClone(searchPlaylist.response.body);
  (upstream.result.playlists[0] as { score: unknown }).score = 'high';

  const result = await replay(upstream).search(searchPlaylist.query);

  expect(result.body.result?.playlists?.[0]?.score as unknown).toBe('high');
});

test('search drops a non-string contained song', async () => {
  const upstream = structuredClone(searchAlbum.response.body);
  (upstream.result.albums[0] as { containedSong: unknown }).containedSong = 1;

  const result = await replay(upstream).search(searchAlbum.query);

  expect(result.body.result?.albums?.[0] as unknown).not.toHaveProperty(
    'containedSong',
  );
});

test('search preserves the undeclared voice search shape', async () => {
  const upstream = {
    code: 200 as const,
    data: { resources: [{ resourceId: '1' }] },
    message: '',
  };

  const result = await replay(upstream).search({
    keywords: '晴天',
    type: 2000,
  });

  expect(result.status).toBe(200);
  expect(result.body).toEqual(upstream);
});

test('search_default rejects a missing display keyword and a text real keyword', async () => {
  const missing = structuredClone(searchDefault.response.body);
  delete (missing.data as { showKeyword?: unknown }).showKeyword;
  await expectUpstreamShapeRejection(
    replay(missing).searchDefault(searchDefault.query),
    {
      module: 'search_default',
      path: 'body.data.showKeyword',
      expected: 'present',
      actual: 'missing',
    },
  );

  const wrong = structuredClone(searchDefault.response.body);
  (wrong.data as { realkeyword: unknown }).realkeyword = 1;
  await expectUpstreamShapeRejection(
    replay(wrong).searchDefault(searchDefault.query),
    {
      module: 'search_default',
      path: 'body.data.realkeyword',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('search_default drops loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(searchDefault.response.body);
  (upstream.data as { alg: unknown }).alg = 1;
  (upstream.data as { gap: unknown }).gap = '0';
  (upstream.data as { styleKeyword: unknown }).styleKeyword = 'keyword';
  (upstream.data as { brandNew?: unknown }).brandNew = { tags: ['新'] };

  const result = await replay(upstream).searchDefault(searchDefault.query);

  expect(result.body.data as unknown).not.toHaveProperty('alg');
  expect(result.body.data as unknown).not.toHaveProperty('gap');
  expect(result.body.data as unknown).not.toHaveProperty('styleKeyword');
  expect(result.body.data?.brandNew as unknown).toEqual({ tags: ['新'] });
  expect(result.body as unknown).toHaveProperty('message', null);
});

test('search_default keeps an undeclared style keyword description', async () => {
  const upstream = structuredClone(searchDefault.response.body);
  (upstream.data.styleKeyword as unknown as Record<string, unknown>).descWord =
    123;

  const result = await replay(upstream).searchDefault(searchDefault.query);

  expect(
    result.body.data.styleKeyword as unknown as Record<string, unknown>,
  ).toHaveProperty('descWord', 123);
});

test('search_hot rejects a hot search word without its text', async () => {
  const upstream = structuredClone(searchHot.response.body);
  delete (upstream.result.hots[0] as { first?: unknown }).first;

  await expectUpstreamShapeRejection(replay(upstream).searchHot({}), {
    module: 'search_hot',
    path: 'body.result.hots[0].first',
    expected: 'present',
    actual: 'missing',
  });
});

test('search_hot drops a text rank and keeps a null third field', async () => {
  const upstream = structuredClone(searchHot.response.body);
  (upstream.result.hots[0] as { second: unknown }).second = '1';
  (upstream.result.hots[0] as { third: unknown }).third = null;
  (upstream.result.hots[0] as { brandNew?: unknown }).brandNew = {
    tags: ['新'],
  };

  const result = await replay(upstream).searchHot({});

  expect(result.body.result.hots[0] as unknown).not.toHaveProperty('second');
  expect(result.body.result.hots[0]?.third as unknown).toBeNull();
  expect(result.body.result.hots[0]?.brandNew as unknown).toEqual({
    tags: ['新'],
  });
});

test('search_hot rejects a missing result list', async () => {
  const upstream = structuredClone(searchHot.response.body);
  delete (upstream as { result?: unknown }).result;

  await expectUpstreamShapeRejection(replay(upstream).searchHot({}), {
    module: 'search_hot',
    path: 'body.result',
    expected: 'present',
    actual: 'missing',
  });
});

test('search_hot_detail rejects a detail without its search word', async () => {
  const upstream = structuredClone(searchHotDetail.response.body);
  delete (upstream.data[0] as { searchWord?: unknown }).searchWord;

  await expectUpstreamShapeRejection(replay(upstream).searchHotDetail({}), {
    module: 'search_hot_detail',
    path: 'body.data[0].searchWord',
    expected: 'present',
    actual: 'missing',
  });
});

test('search_hot_detail drops a numeric icon url and keeps a null content', async () => {
  const upstream = structuredClone(searchHotDetail.response.body);
  (upstream.data[0] as { iconUrl: unknown }).iconUrl = 12;
  (upstream.data[0] as { content: unknown }).content = null;
  (upstream.data[0] as { alg: unknown }).alg = 'hot';
  (upstream.data[0] as { brandNew?: unknown }).brandNew = { tags: ['新'] };

  const result = await replay(upstream).searchHotDetail({});

  expect(result.body.data[0] as unknown).not.toHaveProperty('iconUrl');
  expect(result.body.data[0]?.content as unknown).toBeNull();
  expect(result.body.data[0]?.alg as unknown).toBe('hot');
  expect(result.body.data[0]?.brandNew as unknown).toEqual({ tags: ['新'] });
});

test('search_hot_detail drops a numeric alg and a non-object trp', async () => {
  const upstream = structuredClone(searchHotDetail.response.body);
  (upstream.data[0] as { alg: unknown }).alg = 1;
  (upstream as { trp?: unknown }).trp = 'rules';

  const result = await replay(upstream).searchHotDetail({});

  expect(result.body.data[0] as unknown).not.toHaveProperty('alg');
  expect(result.body as unknown).not.toHaveProperty('trp');
});

test('search_match rejects a matched song without an id and a text file id', async () => {
  const missingId = structuredClone(searchMatch.response.body);
  delete (missingId.result.songs[0] as { id?: unknown }).id;
  await expectUpstreamShapeRejection(
    replay(missingId).searchMatch(searchMatch.query),
    {
      module: 'search_match',
      path: 'body.result.songs[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );

  const textId = structuredClone(searchMatch.response.body);
  (textId.result.ids as Array<unknown>)[0] = 1;
  await expectUpstreamShapeRejection(
    replay(textId).searchMatch(searchMatch.query),
    {
      module: 'search_match',
      path: 'body.result.ids[0]',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('search_match drops loose song fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(searchMatch.response.body);
  (upstream.result.songs[0] as { popularity: unknown }).popularity = '100';
  (upstream.result.songs[0] as { hMusic: unknown }).hMusic = '320k';
  (upstream.result.songs[0] as { brandNew?: unknown }).brandNew = {
    tags: ['新'],
  };

  const result = await replay(upstream).searchMatch(searchMatch.query);

  expect(result.body.result.songs[0] as unknown).not.toHaveProperty(
    'popularity',
  );
  expect(result.body.result.songs[0] as unknown).not.toHaveProperty('hMusic');
  expect(result.body.result.songs[0]?.brandNew as unknown).toEqual({
    tags: ['新'],
  });
});

test('search_match returns a recorded empty match unchanged', async () => {
  const result = await replay(searchMatchNone.response.body).searchMatch(
    searchMatchNone.query,
  );

  expect(result.status).toBe(200);
  expect(result.body.result.songs as unknown).toEqual([]);
  expect(result.body.result.ids as unknown).toEqual([]);
});

test('search_multimatch rejects a suggested artist whose id is text', async () => {
  const upstream = structuredClone(searchMultimatch.response.body);
  (upstream.result.artist[0] as { id: unknown }).id = '6452';

  await expectUpstreamShapeRejection(
    replay(upstream).searchMultimatch(searchMultimatch.query),
    {
      module: 'search_multimatch',
      path: 'body.result.artist[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('search_multimatch rejects an mlog without a resource id and a playlist without an id', async () => {
  const missingMlogId = structuredClone(searchMultimatch.response.body);
  delete (missingMlogId.result.new_mlog[0] as { resourceId?: unknown })
    .resourceId;
  await expectUpstreamShapeRejection(
    replay(missingMlogId).searchMultimatch(searchMultimatch.query),
    {
      module: 'search_multimatch',
      path: 'body.result.new_mlog[0].resourceId',
      expected: 'present',
      actual: 'missing',
    },
  );

  const missingPlaylistId = structuredClone(searchMultimatch.response.body);
  delete (missingPlaylistId.result.playlist[0] as { id?: unknown }).id;
  await expectUpstreamShapeRejection(
    replay(missingPlaylistId).searchMultimatch(searchMultimatch.query),
    {
      module: 'search_multimatch',
      path: 'body.result.playlist[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('search_multimatch drops missing and non-string orders', async () => {
  const missing = structuredClone(searchMultimatch.response.body);
  delete (missing.result as { orders?: unknown }).orders;
  const missingResponse = await replay(missing).searchMultimatch(
    searchMultimatch.query,
  );
  expect(missingResponse.status).toBe(200);
  expect(missingResponse.body.result as unknown).not.toHaveProperty('orders');

  const wrong = structuredClone(searchMultimatch.response.body) as unknown as {
    result: { orders: Array<unknown> };
  };
  wrong.result.orders[0] = 1;
  const wrongResponse = await replay(wrong).searchMultimatch(
    searchMultimatch.query,
  );
  expect(wrongResponse.status).toBe(200);
  expect(wrongResponse.body.result as unknown).not.toHaveProperty('orders');

  const nulled = structuredClone(searchMultimatch.response.body) as unknown as {
    result: { orders: unknown };
  };
  nulled.result.orders = null;
  const nulledResponse = await replay(nulled).searchMultimatch(
    searchMultimatch.query,
  );
  expect(nulledResponse.status).toBe(200);
  expect(nulledResponse.body.result?.orders as unknown).toBeNull();
});

test('search_multimatch accepts missing or null suggestion categories', async () => {
  for (const category of ['artist', 'new_mlog', 'playlist'] as const) {
    const missing = structuredClone(searchMultimatch.response.body);
    delete (missing.result as Record<string, unknown>)[category];
    const missingResponse = await replay(missing).searchMultimatch(
      searchMultimatch.query,
    );
    expect(missingResponse.status).toBe(200);
    expect(missingResponse.body.result as unknown).not.toHaveProperty(category);

    const nulled = structuredClone(searchMultimatch.response.body) as {
      result: Record<string, unknown>;
    };
    nulled.result[category] = null;
    const nulledResponse = await replay(nulled).searchMultimatch(
      searchMultimatch.query,
    );
    expect(nulledResponse.status).toBe(200);
    expect(nulledResponse.body.result?.[category] as unknown).toBeNull();
  }
});

test('search_multimatch drops loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(searchMultimatch.response.body);
  (upstream.result.artist[0] as { fansSize: unknown }).fansSize = '1';
  (upstream.result.new_mlog[0] as { baseInfo: unknown }).baseInfo = 'video';
  (upstream.result.playlist[0] as { tsSongCount: unknown }).tsSongCount = '0';
  (upstream.result as { brandNew?: unknown }).brandNew = { tags: ['新'] };

  const result = await replay(upstream).searchMultimatch(
    searchMultimatch.query,
  );

  const artist = result.body.result?.artist?.[0];
  const mlog = result.body.result?.new_mlog?.[0];
  const playlist = result.body.result?.playlist?.[0];

  expect(artist).toBeDefined();
  expect(mlog).toBeDefined();
  expect(playlist).toBeDefined();
  expect(artist as unknown).not.toHaveProperty('fansSize');
  expect(mlog as unknown).not.toHaveProperty('baseInfo');
  expect(playlist as unknown).not.toHaveProperty('tsSongCount');
  expect(result.body.result?.brandNew as unknown).toEqual({ tags: ['新'] });
});

test('search_multimatch returns a recorded empty suggestion unchanged', async () => {
  const result = await replay(
    searchMultimatchNone.response.body,
  ).searchMultimatch(searchMultimatchNone.query);

  expect(result.status).toBe(200);
  expect(result.body.result.orders as unknown).toEqual([]);
  expect(result.body.result as unknown).not.toHaveProperty('artist');
  expect(result.body.result as unknown).not.toHaveProperty('new_mlog');
  expect(result.body.result as unknown).not.toHaveProperty('playlist');
});

test('search rejects a missing keyword locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(searchCn.response.body);
    },
  });

  const result = await api
    .search({} as unknown as { keywords: string })
    .catch((error: unknown) => error);

  expect(requests).toBe(0);
  expect(result).toEqual({
    status: 400,
    cookie: [],
    body: { code: 400, msg: 'Missing key\n  at ["keywords"]' },
  });
});
