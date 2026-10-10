import { expect, test } from 'bun:test';

import {
  AlbumBody,
  AlbumSublistBody,
  ArtistAlbumBody,
  ArtistSublistBody,
  ArtistTopSongBody,
  createHanaMusicApi,
  LikelistBody,
  PlaylistDetailBody,
  PlaylistTrackAllBody,
  RecommendSongsBody,
  SongDetailBody,
  UserPlaylistBody,
} from '../../index.ts';
import type { UpstreamShape } from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection } from '../_kit/assertions.ts';
import album from '../fixtures/netease/library/album.json';
import albumSublist from '../fixtures/netease/library/album_sublist.json';
import artistAlbum from '../fixtures/netease/library/artist_album.json';
import artistSublist from '../fixtures/netease/library/artist_sublist.json';
import artistSublistPage2 from '../fixtures/netease/library/artist_sublist.page2.json';
import artistTopSong from '../fixtures/netease/library/artist_top_song.json';
import likelist from '../fixtures/netease/library/likelist.json';
import detailLiked from '../fixtures/netease/library/playlist_detail.liked.json';
import detailOwn from '../fixtures/netease/library/playlist_detail.own-small.json';
import detailSubscribed from '../fixtures/netease/library/playlist_detail.subscribed.json';
import trackAll from '../fixtures/netease/library/playlist_track_all.json';
import recommendSongs from '../fixtures/netease/library/recommend_songs.json';
import songDetailAnonymous from '../fixtures/netease/library/song_detail.anon.json';
import songDetailVip from '../fixtures/netease/library/song_detail.vip.json';
import userPlaylist from '../fixtures/netease/library/user_playlist.json';

type Recording = {
  readonly response: { readonly body: object };
};

type Validator = {
  readonly '~standard': { readonly validate: (value: unknown) => unknown };
};

// 每个用例按请求顺序回放验证关卡①录下、脱敏后的网易云返回（nonhana/hana-music-api#19）。
const replay = (...upstream: ReadonlyArray<unknown>) => {
  const queue = [...upstream];
  return createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(queue.shift()),
  });
};

test('userPlaylist returns the recorded playlists', async () => {
  const result = await replay(userPlaylist.response.body).userPlaylist(
    userPlaylist.query,
  );

  expect(result.body as unknown).toEqual(userPlaylist.response.body);
});

test.each<{ name: string; recording: Recording; query: { id: number } }>([
  { name: 'liked', recording: detailLiked, query: detailLiked.query },
  { name: 'own', recording: detailOwn, query: detailOwn.query },
  {
    name: 'subscribed',
    recording: detailSubscribed,
    query: detailSubscribed.query,
  },
])(
  'playlistDetail returns the recorded $name playlist',
  async ({ recording, query }) => {
    const result = await replay(recording.response.body).playlistDetail(query);

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('playlistTrackAll returns the recorded songs of the recorded playlist', async () => {
  const result = await replay(
    detailOwn.response.body,
    trackAll.response.body,
  ).playlistTrackAll(trackAll.query);

  expect(result.body as unknown).toEqual(trackAll.response.body);
});

test.each<{ name: string; recording: Recording; query: { ids: string } }>([
  { name: 'member', recording: songDetailVip, query: songDetailVip.query },
  {
    name: 'anonymous',
    recording: songDetailAnonymous,
    query: songDetailAnonymous.query,
  },
])(
  'songDetail returns the recorded $name songs',
  async ({ recording, query }) => {
    const result = await replay(recording.response.body).songDetail(query);

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('album returns the recorded album and its songs', async () => {
  const result = await replay(album.response.body).album(album.query);

  expect(result.body as unknown).toEqual(album.response.body);
});

test('albumSublist returns the recorded subscribed albums', async () => {
  const result = await replay(albumSublist.response.body).albumSublist(
    albumSublist.query,
  );

  expect(result.body as unknown).toEqual(albumSublist.response.body);
});

test.each<{ name: string; recording: Recording; query: object }>([
  { name: 'first', recording: artistSublist, query: artistSublist.query },
  {
    name: 'second',
    recording: artistSublistPage2,
    query: artistSublistPage2.query,
  },
])(
  'artistSublist returns the recorded $name page',
  async ({ recording, query }) => {
    const result = await replay(recording.response.body).artistSublist(query);

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('artistTopSong returns the recorded songs', async () => {
  const result = await replay(artistTopSong.response.body).artistTopSong(
    artistTopSong.query,
  );

  expect(result.body as unknown).toEqual(artistTopSong.response.body);
});

test('artistAlbum returns the recorded albums', async () => {
  const result = await replay(artistAlbum.response.body).artistAlbum(
    artistAlbum.query,
  );

  expect(result.body as unknown).toEqual(artistAlbum.response.body);
});

test('recommendSongs returns the recorded daily songs', async () => {
  const result = await replay(recommendSongs.response.body).recommendSongs();

  expect(result.body as unknown).toEqual(recommendSongs.response.body);
});

test('likelist returns the recorded liked song identifiers', async () => {
  const result = await replay(likelist.response.body).likelist(likelist.query);

  expect(result.body as unknown).toEqual(likelist.response.body);
});

test.each<{ name: string; schema: Validator; recording: Recording }>([
  {
    name: 'UserPlaylistBody',
    schema: UserPlaylistBody,
    recording: userPlaylist,
  },
  {
    name: 'PlaylistDetailBody',
    schema: PlaylistDetailBody,
    recording: detailLiked,
  },
  {
    name: 'PlaylistTrackAllBody',
    schema: PlaylistTrackAllBody,
    recording: trackAll,
  },
  { name: 'SongDetailBody', schema: SongDetailBody, recording: songDetailVip },
  { name: 'AlbumBody', schema: AlbumBody, recording: album },
  {
    name: 'AlbumSublistBody',
    schema: AlbumSublistBody,
    recording: albumSublist,
  },
  {
    name: 'ArtistSublistBody',
    schema: ArtistSublistBody,
    recording: artistSublist,
  },
  {
    name: 'ArtistTopSongBody',
    schema: ArtistTopSongBody,
    recording: artistTopSong,
  },
  {
    name: 'ArtistAlbumBody',
    schema: ArtistAlbumBody,
    recording: artistAlbum,
  },
  {
    name: 'RecommendSongsBody',
    schema: RecommendSongsBody,
    recording: recommendSongs,
  },
  { name: 'LikelistBody', schema: LikelistBody, recording: likelist },
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
    name: 'userPlaylist: a playlist without its track update time',
    call: () => {
      const upstream = structuredClone(userPlaylist.response.body);
      delete (upstream.playlist[0] as { trackUpdateTime?: number })
        .trackUpdateTime;
      return replay(upstream).userPlaylist(userPlaylist.query);
    },
    shape: {
      module: 'user_playlist',
      path: 'body.playlist[0].trackUpdateTime',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'playlistDetail: no track identifiers',
    call: () => {
      const upstream = structuredClone(detailOwn.response.body);
      delete (upstream.playlist as { trackIds?: unknown }).trackIds;
      return replay(upstream).playlistDetail(detailOwn.query);
    },
    shape: {
      module: 'playlist_detail',
      path: 'body.playlist.trackIds',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'playlistTrackAll: a song without its album',
    call: () => {
      const songs = structuredClone(trackAll.response.body);
      delete (songs.songs[0] as { al?: unknown }).al;
      return replay(detailOwn.response.body, songs).playlistTrackAll(
        trackAll.query,
      );
    },
    shape: {
      module: 'playlist_track_all',
      path: 'body.songs[0].al',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'songDetail: a song without its artists',
    call: () => {
      const upstream = structuredClone(songDetailAnonymous.response.body);
      delete (upstream.songs[0] as { ar?: unknown }).ar;
      return replay(upstream).songDetail(songDetailAnonymous.query);
    },
    shape: {
      module: 'song_detail',
      path: 'body.songs[0].ar',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'album: no album information',
    call: () => {
      const { album: _album, ...upstream } = album.response.body;
      return replay(upstream).album(album.query);
    },
    shape: {
      module: 'album',
      path: 'body.album',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'albumSublist: an album without its cover',
    call: () => {
      const upstream = structuredClone(albumSublist.response.body);
      delete (upstream.data[0] as { picUrl?: string }).picUrl;
      return replay(upstream).albumSublist(albumSublist.query);
    },
    shape: {
      module: 'album_sublist',
      path: 'body.data[0].picUrl',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'artistSublist: an artist without its name',
    call: () => {
      const upstream = structuredClone(artistSublist.response.body);
      delete (upstream.data[0] as { name?: string }).name;
      return replay(upstream).artistSublist(artistSublist.query);
    },
    shape: {
      module: 'artist_sublist',
      path: 'body.data[0].name',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'artistTopSong: a song without its duration',
    call: () => {
      const upstream = structuredClone(artistTopSong.response.body);
      delete (upstream.songs[0] as { dt?: number }).dt;
      return replay(upstream).artistTopSong(artistTopSong.query);
    },
    shape: {
      module: 'artist_top_song',
      path: 'body.songs[0].dt',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'artistAlbum: no albums',
    call: () => {
      const { hotAlbums: _hotAlbums, ...upstream } = artistAlbum.response.body;
      return replay(upstream).artistAlbum(artistAlbum.query);
    },
    shape: {
      module: 'artist_album',
      path: 'body.hotAlbums',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'recommendSongs: daily songs outside data',
    call: () => {
      const { data, ...upstream } = recommendSongs.response.body;
      return replay({ ...upstream, ...data }).recommendSongs();
    },
    shape: {
      module: 'recommend_songs',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'likelist: no liked song identifiers',
    call: () => {
      const { ids: _ids, ...upstream } = likelist.response.body;
      return replay(upstream).likelist(likelist.query);
    },
    shape: {
      module: 'likelist',
      path: 'body.ids',
      expected: 'present',
      actual: 'missing',
    },
  },
])('$name rejects as an upstream shape change', ({ call, shape }) =>
  expectUpstreamShapeRejection(call(), shape),
);
