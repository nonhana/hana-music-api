import { expect, expectTypeOf, test } from 'bun:test';

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
import type {
  Recording,
  UpstreamShape,
  Validator,
} from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection } from '../_kit/assertions.ts';
import album from '../fixtures/netease/library/album.json';
import albumNoDescription from '../fixtures/netease/library/album.no-description.json';
import albumSublist from '../fixtures/netease/library/album_sublist.json';
import artistAlbum from '../fixtures/netease/library/artist_album.json';
import artistSublist from '../fixtures/netease/library/artist_sublist.json';
import artistSublistPage2 from '../fixtures/netease/library/artist_sublist.page2.json';
import artistTopSong from '../fixtures/netease/library/artist_top_song.json';
import likelist from '../fixtures/netease/library/likelist.json';
import detailInvalidCookie from '../fixtures/netease/library/playlist_detail.invalid-cookie.json';
import detailLiked from '../fixtures/netease/library/playlist_detail.liked.json';
import detailOwn from '../fixtures/netease/library/playlist_detail.own-small.json';
import detailSubscribed from '../fixtures/netease/library/playlist_detail.subscribed.json';
import trackAll from '../fixtures/netease/library/playlist_track_all.json';
import recommendSongs from '../fixtures/netease/library/recommend_songs.json';
import songDetailAnonymous from '../fixtures/netease/library/song_detail.anon.json';
import songDetailPrivileges from '../fixtures/netease/library/song_detail.privileges.json';
import songDetailUploaded from '../fixtures/netease/library/song_detail.uploaded.json';
import songDetailVip from '../fixtures/netease/library/song_detail.vip.json';
import userPlaylistInvalidCookie from '../fixtures/netease/library/user_playlist.invalid-cookie.json';
import userPlaylist from '../fixtures/netease/library/user_playlist.json';

// 每个用例按请求顺序回放脱敏后的网易云返回：验证关卡①（nonhana/hana-music-api#19）和 #48 的录制，来源见各录制的 context。
const replay = (...upstream: ReadonlyArray<unknown>) => {
  const queue = [...upstream];
  return createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(queue.shift()),
  });
};

test.each<{
  name: string;
  recording: Recording;
  query: { limit: number; uid: number };
}>([
  { name: 'signed-in', recording: userPlaylist, query: userPlaylist.query },
  {
    name: 'invalid-cookie',
    recording: userPlaylistInvalidCookie,
    query: userPlaylistInvalidCookie.query,
  },
])(
  'userPlaylist returns the recorded $name playlists',
  async ({ recording, query }) => {
    const result = await replay(recording.response.body).userPlaylist(query);

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test.each<{ name: string; recording: Recording; query: { id: number } }>([
  { name: 'liked', recording: detailLiked, query: detailLiked.query },
  { name: 'own', recording: detailOwn, query: detailOwn.query },
  {
    name: 'subscribed',
    recording: detailSubscribed,
    query: detailSubscribed.query,
  },
  {
    name: 'invalid-cookie',
    recording: detailInvalidCookie,
    query: detailInvalidCookie.query,
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
    name: 'restricted',
    recording: songDetailPrivileges,
    query: songDetailPrivileges.query,
  },
  {
    name: 'anonymous',
    recording: songDetailAnonymous,
    query: songDetailAnonymous.query,
  },
  {
    name: 'uploaded',
    recording: songDetailUploaded,
    query: songDetailUploaded.query,
  },
])(
  'songDetail returns the recorded $name songs',
  async ({ recording, query }) => {
    const result = await replay(recording.response.body).songDetail(query);

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('songDetail rejects missing privileges', async () => {
  const { privileges: _privileges, ...upstream } =
    songDetailAnonymous.response.body;

  await expectUpstreamShapeRejection(
    replay(upstream).songDetail(songDetailAnonymous.query),
    {
      module: 'song_detail',
      path: 'body.privileges',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('songDetail exposes numeric privileges without changing their recorded values', async () => {
  const { body } = await replay(songDetailPrivileges.response.body).songDetail(
    songDetailPrivileges.query,
  );

  expect(body.privileges.map(({ id, st, pl }) => ({ id, st, pl }))).toEqual([
    { id: 2636391253, st: 0, pl: 0 },
    { id: 2108191414, st: -200, pl: 0 },
  ]);
  expectTypeOf<
    SongDetailBody['privileges'][number]['id' | 'st' | 'pl']
  >().toEqualTypeOf<number>();
  expectTypeOf(body.privileges).toEqualTypeOf<SongDetailBody['privileges']>();
});

test('songDetail rejects privileges that are not an array', async () => {
  const upstream = { ...songDetailAnonymous.response.body, privileges: {} };

  expect(SongDetailBody['~standard'].validate(upstream)).toHaveProperty(
    'issues',
  );
  await expectUpstreamShapeRejection(
    replay(upstream).songDetail(songDetailAnonymous.query),
    {
      module: 'song_detail',
      path: 'body.privileges',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('album returns the recorded album and its songs', async () => {
  const result = await replay(album.response.body).album(album.query);

  expect(result.body as unknown).toEqual(album.response.body);
  expect(result.body.songs[0]?.privilege).toMatchObject({
    id: 1409311773,
    st: 0,
    pl: 0,
  });
  expectTypeOf<
    AlbumBody['songs'][number]['privilege']['id' | 'st' | 'pl']
  >().toEqualTypeOf<number>();
});

test('album rejects a song without its privilege', async () => {
  const songs = album.response.body.songs.map(
    ({ privilege: _privilege, ...song }) => song,
  );

  await expectUpstreamShapeRejection(
    replay({ ...album.response.body, songs }).album(album.query),
    {
      module: 'album',
      path: 'body.songs[0].privilege',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('album returns the recorded album without a description and preserves its songs', async () => {
  const result = await replay(albumNoDescription.response.body).album(
    albumNoDescription.query,
  );

  expect(result.body as unknown).toEqual(albumNoDescription.response.body);
  expect(result.body.album.description).toBeNull();
  expectTypeOf<AlbumBody['album']['description']>().toEqualTypeOf<
    string | null
  >();
  expectTypeOf(result.body.album.description).toEqualTypeOf<string | null>();
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
  expect(result.body.songs[0]?.privilege).toMatchObject({
    id: 1472480890,
    st: 0,
    pl: 0,
  });
  expectTypeOf<
    ArtistTopSongBody['songs'][number]['privilege']['id' | 'st' | 'pl']
  >().toEqualTypeOf<number>();
});

test('artistTopSong rejects a song without its privilege', async () => {
  const songs = artistTopSong.response.body.songs.map(
    ({ privilege: _privilege, ...song }) => song,
  );

  await expectUpstreamShapeRejection(
    replay({ ...artistTopSong.response.body, songs }).artistTopSong(
      artistTopSong.query,
    ),
    {
      module: 'artist_top_song',
      path: 'body.songs[0].privilege',
      expected: 'present',
      actual: 'missing',
    },
  );
});

for (const { module, path, privilege, schema, withPrivilege, call } of [
  {
    module: 'song_detail',
    path: 'body.privileges[0]',
    privilege: songDetailAnonymous.response.body.privileges[0],
    schema: SongDetailBody,
    withPrivilege: (replacement: unknown) => ({
      ...songDetailAnonymous.response.body,
      privileges: [replacement],
    }),
    call: (body: unknown) => replay(body).songDetail(songDetailAnonymous.query),
  },
  {
    module: 'album',
    path: 'body.songs[0].privilege',
    privilege: album.response.body.songs[0]?.privilege,
    schema: AlbumBody,
    withPrivilege: (replacement: unknown) => ({
      ...album.response.body,
      songs: [{ ...album.response.body.songs[0], privilege: replacement }],
    }),
    call: (body: unknown) => replay(body).album(album.query),
  },
  {
    module: 'artist_top_song',
    path: 'body.songs[0].privilege',
    privilege: artistTopSong.response.body.songs[0]?.privilege,
    schema: ArtistTopSongBody,
    withPrivilege: (replacement: unknown) => ({
      ...artistTopSong.response.body,
      songs: [
        { ...artistTopSong.response.body.songs[0], privilege: replacement },
      ],
    }),
    call: (body: unknown) => replay(body).artistTopSong(artistTopSong.query),
  },
  {
    module: 'recommend_songs',
    path: 'body.data.dailySongs[0].privilege',
    privilege: recommendSongs.response.body.data.dailySongs[0]?.privilege,
    schema: RecommendSongsBody,
    withPrivilege: (replacement: unknown) => ({
      ...recommendSongs.response.body,
      data: {
        ...recommendSongs.response.body.data,
        dailySongs: [
          {
            ...recommendSongs.response.body.data.dailySongs[0],
            privilege: replacement,
          },
        ],
      },
    }),
    call: (body: unknown) => replay(body).recommendSongs(),
  },
]) {
  test(`${module} preserves undeclared privilege fields through both public boundaries`, async () => {
    const upstream = withPrivilege({
      ...privilege,
      futurePrivilege: { enabled: true, levels: [null, 1, 'trial'] },
    });

    expect((await call(upstream)).body as unknown).toEqual(upstream);
    expect(schema['~standard'].validate(upstream) as unknown).toEqual({
      value: upstream,
    });
  });

  test.each(['id', 'st', 'pl'])(
    `${module} rejects a missing privilege.%s`,
    async (field) => {
      const incomplete: Record<string, unknown> = { ...privilege };
      delete incomplete[field];
      const upstream = withPrivilege(incomplete);

      expect(schema['~standard'].validate(upstream)).toHaveProperty('issues');
      await expectUpstreamShapeRejection(call(upstream), {
        module,
        path: `${path}.${field}`,
        expected: 'present',
        actual: 'missing',
      });
    },
  );

  test.each(['id', 'st', 'pl'])(
    `${module} rejects a nonnumeric privilege.%s`,
    async (field) => {
      const upstream = withPrivilege({ ...privilege, [field]: '0' });

      expect(schema['~standard'].validate(upstream)).toHaveProperty('issues');
      await expectUpstreamShapeRejection(call(upstream), {
        module,
        path: `${path}.${field}`,
        expected: 'number',
        actual: 'string',
      });
    },
  );

  test(`${module} rejects a null privilege`, async () => {
    const upstream = withPrivilege(null);

    expect(schema['~standard'].validate(upstream)).toHaveProperty('issues');
    await expectUpstreamShapeRejection(call(upstream), {
      module,
      path,
      expected: 'object',
      actual: 'null',
    });
  });
}

test('artistAlbum returns the recorded artist and albums with undeclared fields', async () => {
  const result = await replay(artistAlbum.response.body).artistAlbum(
    artistAlbum.query,
  );

  expect(result.body as unknown).toEqual(artistAlbum.response.body);
  expect(result.body.artist).toEqual(artistAlbum.response.body.artist);
});

test.each(['id', 'name', 'img1v1Url', 'musicSize', 'albumSize'])(
  'artistAlbum rejects a missing artist.%s',
  async (field) => {
    const artist: Record<string, unknown> = {
      ...artistAlbum.response.body.artist,
    };
    delete artist[field];

    await expectUpstreamShapeRejection(
      replay({ ...artistAlbum.response.body, artist }).artistAlbum(
        artistAlbum.query,
      ),
      {
        module: 'artist_album',
        path: `body.artist.${field}`,
        expected: 'present',
        actual: 'missing',
      },
    );
  },
);

test.each([
  { field: 'id', value: '33927412', expected: 'number', actual: 'string' },
  { field: 'name', value: null, expected: 'string', actual: 'null' },
  { field: 'img1v1Url', value: 123, expected: 'string', actual: 'number' },
  { field: 'musicSize', value: '148', expected: 'number', actual: 'string' },
  { field: 'albumSize', value: '65', expected: 'number', actual: 'string' },
])(
  'artistAlbum rejects artist.$field with the wrong type',
  async ({ field, value, expected, actual }) => {
    const upstream = {
      ...artistAlbum.response.body,
      artist: { ...artistAlbum.response.body.artist, [field]: value },
    };

    await expectUpstreamShapeRejection(
      replay(upstream).artistAlbum(artistAlbum.query),
      {
        module: 'artist_album',
        path: `body.artist.${field}`,
        expected,
        actual,
      },
    );
  },
);

test('recommendSongs returns the recorded daily songs', async () => {
  const result = await replay(recommendSongs.response.body).recommendSongs();

  expect(result.body as unknown).toEqual(recommendSongs.response.body);
  expect(result.body.data.dailySongs[0]?.privilege).toMatchObject({
    id: 28953086,
    st: 0,
    pl: 999000,
  });
  expectTypeOf<
    RecommendSongsBody['data']['dailySongs'][number]['privilege'][
      | 'id'
      | 'st'
      | 'pl']
  >().toEqualTypeOf<number>();
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
  {
    name: 'SongDetailBody with restricted privileges',
    schema: SongDetailBody,
    recording: songDetailPrivileges,
  },
  { name: 'AlbumBody', schema: AlbumBody, recording: album },
  {
    name: 'AlbumBody with no description',
    schema: AlbumBody,
    recording: albumNoDescription,
  },
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
    // 匿名或凭据失效时，云盘上传的歌连歌名也是 null；只有上传者本人能看到歌名（#48）。
    name: 'songDetail: an uploaded song seen without its uploader',
    call: () => {
      const upstream = structuredClone(songDetailUploaded.response.body);
      (upstream.songs[0] as { name: string | null }).name = null;
      return replay(upstream).songDetail(songDetailUploaded.query);
    },
    shape: {
      module: 'song_detail',
      path: 'body.songs[0].name',
      expected: 'string',
      actual: 'null',
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
    name: 'album: a numeric description',
    call: () =>
      replay({
        ...albumNoDescription.response.body,
        album: { ...albumNoDescription.response.body.album, description: 123 },
      }).album(albumNoDescription.query),
    shape: {
      module: 'album',
      path: 'body.album.description',
      expected: 'string | null',
      actual: 'number',
    },
  },
  {
    name: 'album: a missing description',
    call: () => {
      const { description: _description, ...information } =
        albumNoDescription.response.body.album;
      return replay({
        ...albumNoDescription.response.body,
        album: information,
      }).album(albumNoDescription.query);
    },
    shape: {
      module: 'album',
      path: 'body.album.description',
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
    name: 'artistAlbum: no artist',
    call: () => {
      const { artist: _artist, ...upstream } = artistAlbum.response.body;
      return replay(upstream).artistAlbum(artistAlbum.query);
    },
    shape: {
      module: 'artist_album',
      path: 'body.artist',
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
