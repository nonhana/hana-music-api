import { expect, test } from 'bun:test';

import {
  CloudsearchBody,
  createHanaMusicApi,
  SearchSuggestBody,
} from '../../index.ts';
import type { UpstreamShape } from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection } from '../_kit/assertions.ts';
import searchAlbum from '../fixtures/netease/search/cloudsearch.album.json';
import searchAlbumNone from '../fixtures/netease/search/cloudsearch.album.no-result.json';
import searchArtist from '../fixtures/netease/search/cloudsearch.artist.json';
import searchArtistNoAvatar from '../fixtures/netease/search/cloudsearch.artist.no-avatar.json';
import searchArtistNone from '../fixtures/netease/search/cloudsearch.artist.no-result.json';
import searchPlaylist from '../fixtures/netease/search/cloudsearch.playlist.json';
import searchPlaylistNone from '../fixtures/netease/search/cloudsearch.playlist.no-result.json';
import searchSong from '../fixtures/netease/search/cloudsearch.song.json';
import searchSongNone from '../fixtures/netease/search/cloudsearch.song.no-result.json';
import suggestWeb from '../fixtures/netease/search/search_suggest.json';
import suggestMobile from '../fixtures/netease/search/search_suggest.mobile.json';
import suggestMobileNone from '../fixtures/netease/search/search_suggest.mobile.no-result.json';
import suggestWebNone from '../fixtures/netease/search/search_suggest.no-result.json';

type Recording = {
  readonly query: Record<string, unknown>;
  readonly response: { readonly body: object };
};

type Validator = {
  readonly '~standard': { readonly validate: (value: unknown) => unknown };
};

// 每个用例回放验证关卡①录下、脱敏后的网易云返回，以及匿名补录的“没有结果”和“歌手没有头像”（nonhana/hana-music-api#21）。
const replay = (upstream: unknown) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream),
  });

test.each<{ name: string; recording: Recording }>([
  { name: 'song', recording: searchSong },
  { name: 'album', recording: searchAlbum },
  { name: 'artist', recording: searchArtist },
  { name: 'playlist', recording: searchPlaylist },
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

test.each<{ name: string; recording: Recording }>([
  { name: 'categorized', recording: suggestWeb },
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
