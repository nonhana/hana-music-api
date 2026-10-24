import { expect, expectTypeOf, test } from 'bun:test';

import {
  CloudsearchBody,
  createHanaMusicApi,
  SearchSuggestBody,
} from '../../index.ts';
import type {
  Recording,
  UpstreamShape,
  Validator,
} from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection } from '../_kit/assertions.ts';
import searchAlbum from '../fixtures/netease/search/cloudsearch.album.json';
import searchAlbumNone from '../fixtures/netease/search/cloudsearch.album.no-result.json';
import searchArtist from '../fixtures/netease/search/cloudsearch.artist.json';
import searchArtistNoAvatar from '../fixtures/netease/search/cloudsearch.artist.no-avatar.json';
import searchArtistNone from '../fixtures/netease/search/cloudsearch.artist.no-result.json';
import searchPlaylist from '../fixtures/netease/search/cloudsearch.playlist.json';
import searchPlaylistNone from '../fixtures/netease/search/cloudsearch.playlist.no-result.json';
import searchSong from '../fixtures/netease/search/cloudsearch.song.json';
import searchSongMissingAlbumHieroglyphs from '../fixtures/netease/search/cloudsearch.song.missing-album-name.hieroglyphs.json';
import searchSongMissingAlbumSymbols from '../fixtures/netease/search/cloudsearch.song.missing-album-name.symbols.json';
import searchSongNone from '../fixtures/netease/search/cloudsearch.song.no-result.json';
import suggestPlaylists from '../fixtures/netease/search/kinds/001-search_suggest.json';
import suggestAllCategories from '../fixtures/netease/search/kinds/002-search_suggest.json';
import searchPlayCounts from '../fixtures/netease/search/kinds/004-cloudsearch.json';
import suggestWeb from '../fixtures/netease/search/search_suggest.json';
import suggestMobile from '../fixtures/netease/search/search_suggest.mobile.json';
import suggestMobileNone from '../fixtures/netease/search/search_suggest.mobile.no-result.json';
import suggestWebNone from '../fixtures/netease/search/search_suggest.no-result.json';

// 回放验证关卡①、#21 匿名补录和 #82 搜索歌单的脱敏录制。
const replay = (upstream: unknown) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream),
  });

test('searchSuggest treats a playlist suggestion whose id is text as absent', async () => {
  const upstream = structuredClone(suggestPlaylists.response.body);
  (upstream.result.playlists[0] as { id: unknown }).id = '3172143658';

  const result = await replay(upstream).searchSuggest(suggestPlaylists.query);

  expect(result.status).toBe(200);
  expect(result.body.result as unknown).not.toHaveProperty('playlists');
});

test('cloudsearch treats a playlist result whose play count is text as absent', async () => {
  const upstream = structuredClone(searchPlayCounts.response.body);
  (upstream.result.playlists[0] as { playCount: unknown }).playCount = '912088';

  const result = await replay(upstream).cloudsearch(searchPlayCounts.query);

  expect(result.status).toBe(200);
  expect(result.body.result.playlists?.[0] as unknown).not.toHaveProperty(
    'playCount',
  );
});

test.each<{ name: string; recording: Recording }>([
  { name: 'song', recording: searchSong },
  {
    name: 'song with missing album name for symbols',
    recording: searchSongMissingAlbumSymbols,
  },
  {
    name: 'song with missing album name for hieroglyphs',
    recording: searchSongMissingAlbumHieroglyphs,
  },
  { name: 'album', recording: searchAlbum },
  { name: 'artist', recording: searchArtist },
  { name: 'playlist', recording: searchPlaylist },
  { name: 'playlist with play counts', recording: searchPlayCounts },
  { name: 'avatar-less artist', recording: searchArtistNoAvatar },
  { name: 'empty song', recording: searchSongNone },
  { name: 'empty album', recording: searchAlbumNone },
  { name: 'empty artist', recording: searchArtistNone },
  { name: 'empty playlist', recording: searchPlaylistNone },
])(
  'cloudsearch returns the recorded $name results, keeping undeclared fields',
  async ({ recording }) => {
    const result = await replay(recording.response.body).cloudsearch(
      recording.query,
    );

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('cloudsearch preserves null album names', async () => {
  const upstream = structuredClone(searchSong.response.body);
  (upstream.result.songs[0]!.al as { name: unknown }).name = null;

  const result = await replay(upstream).cloudsearch(searchSong.query);

  expect(result.body as unknown).toEqual(upstream);
  expectTypeOf<
    NonNullable<
      NonNullable<CloudsearchBody['result']['songs']>[number]['al']
    >['name']
  >().toEqualTypeOf<string | null | undefined>();
});

test('cloudsearch treats a numeric album name as absent', async () => {
  const upstream = structuredClone(searchSong.response.body);
  (upstream.result.songs[0]!.al as { name: unknown }).name = 123;

  const result = await replay(upstream).cloudsearch(searchSong.query);

  expect(result.status).toBe(200);
  expect(result.body.result.songs?.[0]?.al as unknown).not.toHaveProperty(
    'name',
  );
});

test('cloudsearch exposes numeric song privileges', async () => {
  const result = await replay(searchSong.response.body).cloudsearch(
    searchSong.query,
  );

  expect(result.body.result.songs?.[0]?.privilege).toMatchObject({
    id: 1409311773,
    st: -100,
    pl: 0,
  });
  expectTypeOf<
    NonNullable<
      NonNullable<CloudsearchBody['result']['songs']>[number]['privilege']
    >['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<
      NonNullable<CloudsearchBody['result']['songs']>[number]['privilege']
    >['st']
  >().toEqualTypeOf<number | null | undefined>();
});

test('cloudsearch treats an artist with a nonnumeric id as an unusable result', async () => {
  const upstream = structuredClone(searchArtist.response.body);
  (upstream.result.artists[0] as { id: unknown }).id = '37063847';

  const result = await replay(upstream).cloudsearch(searchArtist.query);

  expect(result.status).toBe(200);
  expect(result.body.result as unknown).not.toHaveProperty('artists');
});

test('cloudsearch exposes numeric playlist play counts', async () => {
  const result = await replay(searchPlayCounts.response.body).cloudsearch(
    searchPlayCounts.query,
  );

  expect(result.body.result.playlists?.[0]?.playCount).toBe(912088);
  expectTypeOf<
    NonNullable<CloudsearchBody['result']['playlists']>[number]['playCount']
  >().toEqualTypeOf<number | null | undefined>();
});

test('searchSuggest exposes playlist ids and names', async () => {
  const result = await replay(suggestPlaylists.response.body).searchSuggest(
    suggestPlaylists.query,
  );

  expect(result.body.result.playlists?.[0]).toMatchObject({
    id: 3172143658,
    name: 'ずっと真夜中でいいのに。歌曲合辑',
  });
  expectTypeOf<
    NonNullable<SearchSuggestBody['result']['playlists']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SearchSuggestBody['result']['playlists']>[number]['name']
  >().toEqualTypeOf<string | null | undefined>();
});

test('searchSuggest treats an artist whose id is text as an unusable category', async () => {
  const upstream = structuredClone(suggestAllCategories.response.body);
  (upstream.result.artists[0] as { id: unknown }).id = '37063847';

  const result = await replay(upstream).searchSuggest(
    suggestAllCategories.query,
  );

  expect(result.status).toBe(200);
  expect(result.body.result as unknown).not.toHaveProperty('artists');
});

test.each<{ name: string; recording: Recording }>([
  { name: 'categorized', recording: suggestWeb },
  {
    name: 'categorized with playlists but no artists',
    recording: suggestPlaylists,
  },
  { name: 'all four categories', recording: suggestAllCategories },
  { name: 'keyword', recording: suggestMobile },
  { name: 'empty categorized', recording: suggestWebNone },
  { name: 'empty keyword', recording: suggestMobileNone },
])(
  'searchSuggest returns the recorded $name suggestions, keeping undeclared fields',
  async ({ recording }) => {
    const result = await replay(recording.response.body).searchSuggest(
      recording.query,
    );

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test.each<{ name: string; schema: Validator; recording: Recording }>([
  { name: 'CloudsearchBody', schema: CloudsearchBody, recording: searchSong },
  {
    name: 'CloudsearchBody with missing album name for symbols',
    schema: CloudsearchBody,
    recording: searchSongMissingAlbumSymbols,
  },
  {
    name: 'CloudsearchBody with missing album name for hieroglyphs',
    schema: CloudsearchBody,
    recording: searchSongMissingAlbumHieroglyphs,
  },
  {
    name: 'CloudsearchBody with play counts',
    schema: CloudsearchBody,
    recording: searchPlayCounts,
  },
  {
    name: 'SearchSuggestBody with playlists',
    schema: SearchSuggestBody,
    recording: suggestPlaylists,
  },
  {
    name: 'SearchSuggestBody with all categories',
    schema: SearchSuggestBody,
    recording: suggestAllCategories,
  },
  {
    name: 'SearchSuggestBody',
    schema: SearchSuggestBody,
    recording: suggestWeb,
  },
])(
  'exported $name validates the recording through Standard Schema',
  ({ schema, recording }) => {
    expect(schema['~standard'].validate(recording.response.body)).toEqual({
      value: recording.response.body,
    });
  },
);

test.each<{
  name: string;
  call: () => Promise<unknown>;
  shape: UpstreamShape;
}>([
  {
    name: 'searchSuggest: suggestions that are null',
    call: () =>
      replay({ code: 200, result: null }).searchSuggest(suggestWeb.query),
    shape: {
      module: 'search_suggest',
      path: 'body.result',
      expected: 'object',
      actual: 'null',
    },
  },
])('$name rejects as an upstream shape change', ({ call, shape }) =>
  expectUpstreamShapeRejection(call(), shape),
);

test('cloudsearch treats a song with a nonnumeric privilege id as absent id', async () => {
  const upstream = structuredClone(searchSong.response.body);
  (upstream.result.songs[0]!.privilege as Record<string, unknown>).id = '0';

  const result = await replay(upstream).cloudsearch(searchSong.query);

  expect(result.status).toBe(200);
  expect(result.body.result.songs?.[0]?.privilege as unknown).toBeDefined();
  expect(
    result.body.result.songs?.[0]?.privilege as unknown,
  ).not.toHaveProperty('id');
});

test.each(['st', 'pl'])(
  'cloudsearch treats a nonnumeric song privilege.%s as absent',
  async (field) => {
    const upstream = structuredClone(searchSong.response.body);
    (upstream.result.songs[0]!.privilege as Record<string, unknown>)[field] =
      '0';

    const result = await replay(upstream).cloudsearch(searchSong.query);

    expect(result.status).toBe(200);
    expect(
      result.body.result.songs?.[0]?.privilege as unknown,
    ).not.toHaveProperty(field);
  },
);
