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

test('searchSuggest rejects a playlist suggestion whose id is text', async () => {
  const upstream = structuredClone(suggestPlaylists.response.body);
  (upstream.result.playlists[0] as { id: unknown }).id = '3172143658';

  await expectUpstreamShapeRejection(
    replay(upstream).searchSuggest(suggestPlaylists.query),
    {
      module: 'search_suggest',
      path: 'body.result.playlists[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('cloudsearch rejects a playlist result whose play count is text', async () => {
  const upstream = structuredClone(searchPlayCounts.response.body);
  (upstream.result.playlists[0] as { playCount: unknown }).playCount = '912088';

  await expectUpstreamShapeRejection(
    replay(upstream).cloudsearch(searchPlayCounts.query),
    {
      module: 'cloudsearch',
      path: 'body.result.playlists[0].playCount',
      expected: 'number',
      actual: 'string',
    },
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
    NonNullable<CloudsearchBody['result']['songs']>[number]['al']['name']
  >().toEqualTypeOf<string | null | undefined>();
});

test('cloudsearch rejects numeric album names', async () => {
  const upstream = structuredClone(searchSong.response.body);
  (upstream.result.songs[0]!.al as { name: unknown }).name = 123;

  await expectUpstreamShapeRejection(
    replay(upstream).cloudsearch(searchSong.query),
    {
      module: 'cloudsearch',
      path: 'body.result.songs[0].al.name',
      expected: 'string | null',
      actual: 'number',
    },
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
    NonNullable<CloudsearchBody['result']['songs']>[number]['privilege'][
      | 'id'
      | 'st'
      | 'pl']
  >().toEqualTypeOf<number>();
});

test('cloudsearch exposes numeric playlist play counts', async () => {
  const result = await replay(searchPlayCounts.response.body).cloudsearch(
    searchPlayCounts.query,
  );

  expect(result.body.result.playlists?.[0]?.playCount).toBe(912088);
  expectTypeOf<
    NonNullable<CloudsearchBody['result']['playlists']>[number]['playCount']
  >().toEqualTypeOf<number>();
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
  >().toEqualTypeOf<string>();
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
    name: 'cloudsearch: a song result without its album',
    call: () => {
      const upstream = structuredClone(searchSong.response.body);
      delete (upstream.result.songs[0] as { al?: unknown }).al;
      return replay(upstream).cloudsearch(searchSong.query);
    },
    shape: {
      module: 'cloudsearch',
      path: 'body.result.songs[0].al',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'cloudsearch: an album result without its cover',
    call: () => {
      const upstream = structuredClone(searchAlbum.response.body);
      delete (upstream.result.albums[1] as { picUrl?: string }).picUrl;
      return replay(upstream).cloudsearch(searchAlbum.query);
    },
    shape: {
      module: 'cloudsearch',
      path: 'body.result.albums[1].picUrl',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'cloudsearch: an artist result whose song count is text',
    call: () => {
      const upstream = structuredClone(searchArtist.response.body);
      (upstream.result.artists[2] as { musicSize: unknown }).musicSize = '148';
      return replay(upstream).cloudsearch(searchArtist.query);
    },
    shape: {
      module: 'cloudsearch',
      path: 'body.result.artists[2].musicSize',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: "cloudsearch: a playlist result without its creator's nickname",
    call: () => {
      const upstream = structuredClone(searchPlaylist.response.body);
      delete (
        upstream.result.playlists[4] as { creator: { nickname?: string } }
      ).creator.nickname;
      return replay(upstream).cloudsearch(searchPlaylist.query);
    },
    shape: {
      module: 'cloudsearch',
      path: 'body.result.playlists[4].creator.nickname',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'cloudsearch: a total that is text',
    call: () => {
      const upstream = structuredClone(searchSong.response.body);
      (upstream.result as { songCount: unknown }).songCount = '300';
      return replay(upstream).cloudsearch(searchSong.query);
    },
    shape: {
      module: 'cloudsearch',
      path: 'body.result.songCount',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: 'cloudsearch: a playlist result without its play count',
    call: () => {
      const upstream = structuredClone(searchPlayCounts.response.body);
      delete (upstream.result.playlists[0] as { playCount?: number }).playCount;
      return replay(upstream).cloudsearch(searchPlayCounts.query);
    },
    shape: {
      module: 'cloudsearch',
      path: 'body.result.playlists[0].playCount',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'cloudsearch: a song result without its privilege',
    call: () => {
      const upstream = structuredClone(searchSong.response.body);
      delete (upstream.result.songs[0] as { privilege?: unknown }).privilege;
      return replay(upstream).cloudsearch(searchSong.query);
    },
    shape: {
      module: 'cloudsearch',
      path: 'body.result.songs[0].privilege',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'searchSuggest: a song suggestion without its name',
    call: () => {
      const upstream = structuredClone(suggestWeb.response.body);
      delete (upstream.result.songs[2] as { name?: string }).name;
      return replay(upstream).searchSuggest(suggestWeb.query);
    },
    shape: {
      module: 'search_suggest',
      path: 'body.result.songs[2].name',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'searchSuggest: a keyword suggestion without the keyword',
    call: () => {
      const upstream = structuredClone(suggestMobile.response.body);
      delete (upstream.result.allMatch[0] as { keyword?: string }).keyword;
      return replay(upstream).searchSuggest(suggestMobile.query);
    },
    shape: {
      module: 'search_suggest',
      path: 'body.result.allMatch[0].keyword',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'searchSuggest: a playlist suggestion whose name is numeric',
    call: () => {
      const upstream = structuredClone(suggestPlaylists.response.body);
      (upstream.result.playlists[0] as { name: unknown }).name = 123;
      return replay(upstream).searchSuggest(suggestPlaylists.query);
    },
    shape: {
      module: 'search_suggest',
      path: 'body.result.playlists[0].name',
      expected: 'string',
      actual: 'number',
    },
  },
  {
    name: 'searchSuggest: a playlist suggestion without its id',
    call: () => {
      const upstream = structuredClone(suggestPlaylists.response.body);
      delete (upstream.result.playlists[0] as { id?: number }).id;
      return replay(upstream).searchSuggest(suggestPlaylists.query);
    },
    shape: {
      module: 'search_suggest',
      path: 'body.result.playlists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'searchSuggest: a playlist suggestion without its name',
    call: () => {
      const upstream = structuredClone(suggestPlaylists.response.body);
      delete (upstream.result.playlists[0] as { name?: string }).name;
      return replay(upstream).searchSuggest(suggestPlaylists.query);
    },
    shape: {
      module: 'search_suggest',
      path: 'body.result.playlists[0].name',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'searchSuggest: playlist suggestions that are null',
    call: () => {
      const upstream = structuredClone(suggestPlaylists.response.body);
      (upstream.result as { playlists: unknown }).playlists = null;
      return replay(upstream).searchSuggest(suggestPlaylists.query);
    },
    shape: {
      module: 'search_suggest',
      path: 'body.result.playlists',
      expected: 'array',
      actual: 'null',
    },
  },
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

test.each(['id', 'st', 'pl'])(
  'cloudsearch rejects a nonnumeric song privilege.%s',
  async (field) => {
    const upstream = structuredClone(searchSong.response.body);
    (upstream.result.songs[0]!.privilege as Record<string, unknown>)[field] =
      '0';

    await expectUpstreamShapeRejection(
      replay(upstream).cloudsearch(searchSong.query),
      {
        module: 'cloudsearch',
        path: `body.result.songs[0].privilege.${field}`,
        expected: 'number',
        actual: 'string',
      },
    );
  },
);
