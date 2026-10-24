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
import detailDeleted from '../fixtures/netease/playlist-edit/playlist_detail.deleted.json';

// 每个用例按请求顺序回放脱敏后的网易云返回：验证关卡①②和 #48 的录制，来源见各录制的 context。
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

test.each<{
  name: string;
  recording: Recording;
  query: { id: number };
  status: number;
}>([
  {
    name: 'liked',
    recording: detailLiked,
    query: detailLiked.query,
    status: 0,
  },
  { name: 'own', recording: detailOwn, query: detailOwn.query, status: 0 },
  {
    name: 'subscribed',
    recording: detailSubscribed,
    query: detailSubscribed.query,
    status: 0,
  },
  {
    name: 'invalid-cookie',
    recording: detailInvalidCookie,
    query: detailInvalidCookie.query,
    status: 0,
  },
  {
    name: 'deleted',
    recording: detailDeleted,
    query: detailDeleted.query,
    status: 10,
  },
])(
  'playlistDetail returns the recorded $name playlist',
  async ({ recording, query, status }) => {
    const result = await replay(recording.response.body).playlistDetail(query);

    expect(result.status).toBe(200);
    expect(result.body as unknown).toEqual(recording.response.body);
    expect(result.body.playlist.status).toBe(status);
    expectTypeOf(result.body.playlist.status).toEqualTypeOf<
      number | null | undefined
    >();
    expect(
      PlaylistDetailBody['~standard'].validate(
        recording.response.body,
      ) as unknown,
    ).toEqual({ value: recording.response.body });
  },
);

test('playlistDetail exposes tags, playCount and status and preserves extra fields', async () => {
  const upstream = {
    ...detailSubscribed.response.body,
    futureTopLevelField: { preserved: true },
    playlist: {
      ...detailSubscribed.response.body.playlist,
      futurePlaylistField: ['preserved'],
    },
  };
  const result = await replay(upstream).playlistDetail(detailSubscribed.query);

  expect(result.body as unknown).toEqual(upstream);
  expect(PlaylistDetailBody['~standard'].validate(upstream) as unknown).toEqual(
    {
      value: upstream,
    },
  );
  expect(result.body.playlist.tags).toEqual(['夜晚']);
  expect(result.body.playlist.playCount).toBe(29012708);
  expect(result.body.playlist.status).toBe(0);
  expectTypeOf<PlaylistDetailBody['playlist']['tags']>().toEqualTypeOf<
    ReadonlyArray<string> | null | undefined
  >();
  expectTypeOf<PlaylistDetailBody['playlist']['playCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<PlaylistDetailBody['playlist']['status']>().toEqualTypeOf<
    number | null | undefined
  >();
});

test.each(['tags', 'playCount', 'status'])(
  'playlistDetail treats a missing playlist.%s as absent',
  async (field) => {
    const playlist: Record<string, unknown> = {
      ...detailOwn.response.body.playlist,
    };
    delete playlist[field];

    const result = await replay({
      ...detailOwn.response.body,
      playlist,
    }).playlistDetail(detailOwn.query);

    expect(result.status).toBe(200);
    expect(result.body.playlist as unknown).not.toHaveProperty(field);
  },
);

test.each([
  { field: 'tags', value: 123 },
  { field: 'playCount', value: '20' },
  { field: 'status', value: '10' },
])(
  'playlistDetail treats playlist.$field with the wrong type as absent',
  async ({ field, value }) => {
    const upstream = {
      ...detailOwn.response.body,
      playlist: { ...detailOwn.response.body.playlist, [field]: value },
    };

    const result = await replay(upstream).playlistDetail(detailOwn.query);

    expect(result.status).toBe(200);
    expect(result.body.playlist as unknown).not.toHaveProperty(field);
  },
);

test.each(['tags', 'playCount', 'status'])(
  'playlistDetail keeps a null playlist.%s',
  async (field) => {
    const upstream = {
      ...detailOwn.response.body,
      playlist: { ...detailOwn.response.body.playlist, [field]: null },
    };

    const result = await replay(upstream).playlistDetail(detailOwn.query);

    expect(result.status).toBe(200);
    expect(result.body.playlist[field]).toBeNull();
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
    SongDetailBody['privileges'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<SongDetailBody['privileges'][number]['st']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<SongDetailBody['privileges'][number]['pl']>().toEqualTypeOf<
    number | null | undefined
  >();
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
    NonNullable<AlbumBody['songs'][number]['privilege']>['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<AlbumBody['songs'][number]['privilege']>['st']
  >().toEqualTypeOf<number | null | undefined>();
});

test('album treats a song without its privilege as absent', async () => {
  const songs = album.response.body.songs.map(
    ({ privilege: _privilege, ...song }) => song,
  );

  const result = await replay({ ...album.response.body, songs }).album(
    album.query,
  );

  expect(result.status).toBe(200);
  expect(result.body.songs[0] as unknown).not.toHaveProperty('privilege');
});

test('album returns the recorded album without a description and preserves its songs', async () => {
  const result = await replay(albumNoDescription.response.body).album(
    albumNoDescription.query,
  );

  expect(result.body as unknown).toEqual(albumNoDescription.response.body);
  expect(result.body.album.description).toBeNull();
  expectTypeOf<AlbumBody['album']['description']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf(result.body.album.description).toEqualTypeOf<
    string | null | undefined
  >();
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
    NonNullable<ArtistTopSongBody['songs'][number]['privilege']>['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<ArtistTopSongBody['songs'][number]['privilege']>['st']
  >().toEqualTypeOf<number | null | undefined>();
});

test('artistTopSong treats a song without its privilege as absent', async () => {
  const songs = artistTopSong.response.body.songs.map(
    ({ privilege: _privilege, ...song }) => song,
  );

  const result = await replay({
    ...artistTopSong.response.body,
    songs,
  }).artistTopSong(artistTopSong.query);

  expect(result.status).toBe(200);
  expect(result.body.songs[0] as unknown).not.toHaveProperty('privilege');
});

for (const {
  module,
  path,
  privilege,
  schema,
  withPrivilege,
  readPrivilege,
  call,
} of [
  {
    module: 'song_detail',
    path: 'body.privileges[0]',
    privilege: songDetailAnonymous.response.body.privileges[0],
    schema: SongDetailBody,
    withPrivilege: (replacement: unknown) => ({
      ...songDetailAnonymous.response.body,
      privileges: [replacement],
    }),
    readPrivilege: (body: { privileges: Array<Record<string, unknown>> }) =>
      body.privileges[0],
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
    readPrivilege: (body: {
      songs: Array<{ privilege: Record<string, unknown> }>;
    }) => body.songs[0]?.privilege,
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
    readPrivilege: (body: {
      songs: Array<{ privilege: Record<string, unknown> }>;
    }) => body.songs[0]?.privilege,
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
    readPrivilege: (body: {
      data: { dailySongs: Array<{ privilege: Record<string, unknown> }> };
    }) => body.data.dailySongs[0]?.privilege,
  },
]) {
  const privilegeIsLoose = !path.startsWith('body.privileges');

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

  test(`${module} handles a missing privilege.id`, async () => {
    const incomplete: Record<string, unknown> = { ...privilege };
    delete incomplete.id;
    const upstream = withPrivilege(incomplete);

    if (privilegeIsLoose) {
      const result = await call(upstream);
      const embedded = readPrivilege(
        (result as { body: unknown }).body as never,
      );
      expect(embedded).toBeDefined();
      expect(embedded).not.toHaveProperty('id');
      return;
    }

    expect(schema['~standard'].validate(upstream)).toHaveProperty('issues');
    await expectUpstreamShapeRejection(call(upstream), {
      module,
      path: `${path}.id`,
      expected: 'present',
      actual: 'missing',
    });
  });

  test.each(['st', 'pl'])(
    `${module} treats a missing privilege.%s as absent`,
    async (field) => {
      const incomplete: Record<string, unknown> = { ...privilege };
      delete incomplete[field];
      const upstream = withPrivilege(incomplete);

      const result = await call(upstream);
      expect(
        readPrivilege((result as { body: unknown }).body as never),
      ).not.toHaveProperty(field);
    },
  );

  test(`${module} handles a nonnumeric privilege.id`, async () => {
    const upstream = withPrivilege({ ...privilege, id: '0' });

    if (privilegeIsLoose) {
      const result = await call(upstream);
      const embedded = readPrivilege(
        (result as { body: unknown }).body as never,
      );
      expect(embedded).toBeDefined();
      expect(embedded).not.toHaveProperty('id');
      return;
    }

    expect(schema['~standard'].validate(upstream)).toHaveProperty('issues');
    await expectUpstreamShapeRejection(call(upstream), {
      module,
      path: `${path}.id`,
      expected: 'number',
      actual: 'string',
    });
  });

  test.each(['st', 'pl'])(
    `${module} treats a nonnumeric privilege.%s as absent`,
    async (field) => {
      const upstream = withPrivilege({ ...privilege, [field]: '0' });

      const result = await call(upstream);
      expect(
        readPrivilege((result as { body: unknown }).body as never),
      ).not.toHaveProperty(field);
    },
  );

  test.each(['st', 'pl'])(
    `${module} keeps a null privilege.%s`,
    async (field) => {
      const upstream = withPrivilege({ ...privilege, [field]: null });

      const result = await call(upstream);
      expect(
        readPrivilege((result as { body: unknown }).body as never)?.[field],
      ).toBeNull();
    },
  );

  test(`${module} handles a null privilege`, async () => {
    const upstream = withPrivilege(null);

    if (privilegeIsLoose) {
      const result = await call(upstream);
      expect(
        readPrivilege((result as { body: unknown }).body as never),
      ).toBeNull();
      return;
    }

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
  'artistAlbum treats a missing artist.%s as absent',
  async (field) => {
    const artist: Record<string, unknown> = {
      ...artistAlbum.response.body.artist,
    };
    delete artist[field];

    const result = await replay({
      ...artistAlbum.response.body,
      artist,
    }).artistAlbum(artistAlbum.query);

    expect(result.status).toBe(200);
    expect(result.body.artist as unknown).not.toHaveProperty(field);
  },
);

test.each([
  { field: 'id', value: '33927412' },
  { field: 'name', value: null },
  { field: 'img1v1Url', value: 123 },
  { field: 'musicSize', value: '148' },
  { field: 'albumSize', value: '65' },
])(
  'artistAlbum treats artist.$field with an unusable value as absent',
  async ({ field, value }) => {
    const upstream = {
      ...artistAlbum.response.body,
      artist: { ...artistAlbum.response.body.artist, [field]: value },
    };

    const result = await replay(upstream).artistAlbum(artistAlbum.query);

    expect(result.status).toBe(200);
    if (value === null) {
      expect((result.body.artist as Record<string, unknown>)[field]).toBeNull();
    } else {
      expect(result.body.artist as unknown).not.toHaveProperty(field);
    }
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
    NonNullable<
      RecommendSongsBody['data']['dailySongs'][number]['privilege']
    >['id']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<
      RecommendSongsBody['data']['dailySongs'][number]['privilege']
    >['st']
  >().toEqualTypeOf<number | null | undefined>();
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
