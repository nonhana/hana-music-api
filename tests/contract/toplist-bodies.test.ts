import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  TopAlbumBody,
  TopArtistsBody,
  ToplistArtistBody,
  TopListBody,
  ToplistBody,
  ToplistDetailBody,
  TopPlaylistHighqualityBody,
  TopSongBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import topAlbumAll from '../fixtures/netease/album/top_album.area-all.json';
import topAlbumJp from '../fixtures/netease/album/top_album.area-jp.json';
import topAlbumEmpty from '../fixtures/netease/album/top_album.empty.json';
import topArtistsVip from '../fixtures/netease/artist/top_artists.default-vip.json';
import topArtistsDefault from '../fixtures/netease/artist/top_artists.default.json';
import topArtistsEmpty from '../fixtures/netease/artist/top_artists.empty.json';
import topPlaylistHighqualityDefault from '../fixtures/netease/playlist/top_playlist_highquality.default.json';
import topPlaylistHighqualityEmpty from '../fixtures/netease/playlist/top_playlist_highquality.empty.json';
import topListChart from '../fixtures/netease/toplist/top_list.chart-19723756.json';
import topSongType0Vip from '../fixtures/netease/toplist/top_song.type-0-vip.json';
import topSongType0 from '../fixtures/netease/toplist/top_song.type-0.json';
import topSongType96 from '../fixtures/netease/toplist/top_song.type-96.json';
import topSongType999 from '../fixtures/netease/toplist/top_song.type-999.json';
import toplistDefault from '../fixtures/netease/toplist/toplist.default.json';
import toplistArtistType1 from '../fixtures/netease/toplist/toplist_artist.type-1.json';
import toplistArtistType2 from '../fixtures/netease/toplist/toplist_artist.type-2.json';
import toplistDetailDefault from '../fixtures/netease/toplist/toplist_detail.default.json';

// issue #102 B15 的匿名录制，以及 top_artists 关注字段、top_song 付费字段的登录对照。
type TopListSuccess = Extract<TopListBody, { code: 200 }>;

type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (upstream: unknown) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'toplist',
    recording: toplistDefault,
    bodySchema: ToplistBody,
    call: (upstream) => replay(upstream).toplist({}),
  },
  {
    name: 'top_album',
    recording: topAlbumAll,
    bodySchema: TopAlbumBody,
    call: (upstream) => replay(upstream).topAlbum(topAlbumAll.query),
  },
  {
    name: 'top_album for japan with weekData missing',
    recording: topAlbumJp,
    bodySchema: TopAlbumBody,
    call: (upstream) => replay(upstream).topAlbum(topAlbumJp.query),
  },
  {
    name: 'top_album without releases',
    recording: topAlbumEmpty,
    bodySchema: TopAlbumBody,
    call: (upstream) => replay(upstream).topAlbum(topAlbumEmpty.query),
  },
  {
    name: 'top_artists',
    recording: topArtistsDefault,
    bodySchema: TopArtistsBody,
    call: (upstream) => replay(upstream).topArtists(topArtistsDefault.query),
  },
  {
    name: 'top_artists with login',
    recording: topArtistsVip,
    bodySchema: TopArtistsBody,
    call: (upstream) => replay(upstream).topArtists(topArtistsVip.query),
  },
  {
    name: 'top_artists without results',
    recording: topArtistsEmpty,
    bodySchema: TopArtistsBody,
    call: (upstream) => replay(upstream).topArtists(topArtistsEmpty.query),
  },
  {
    name: 'top_list',
    recording: topListChart,
    bodySchema: TopListBody,
    call: (upstream) => replay(upstream).topList(topListChart.query),
  },
  {
    name: 'top_playlist_highquality',
    recording: topPlaylistHighqualityDefault,
    bodySchema: TopPlaylistHighqualityBody,
    call: (upstream) =>
      replay(upstream).topPlaylistHighquality(
        topPlaylistHighqualityDefault.query,
      ),
  },
  {
    name: 'top_playlist_highquality without results',
    recording: topPlaylistHighqualityEmpty,
    bodySchema: TopPlaylistHighqualityBody,
    call: (upstream) =>
      replay(upstream).topPlaylistHighquality(
        topPlaylistHighqualityEmpty.query,
      ),
  },
  {
    name: 'top_song',
    recording: topSongType0,
    bodySchema: TopSongBody,
    call: (upstream) => replay(upstream).topSong(topSongType0.query),
  },
  {
    name: 'top_song for europe',
    recording: topSongType96,
    bodySchema: TopSongBody,
    call: (upstream) => replay(upstream).topSong(topSongType96.query),
  },
  {
    name: 'top_song with login',
    recording: topSongType0Vip,
    bodySchema: TopSongBody,
    call: (upstream) => replay(upstream).topSong(topSongType0Vip.query),
  },
  {
    name: 'top_song without results',
    recording: topSongType999,
    bodySchema: TopSongBody,
    call: (upstream) => replay(upstream).topSong(topSongType999.query),
  },
  {
    name: 'toplist_artist',
    recording: toplistArtistType1,
    bodySchema: ToplistArtistBody,
    call: (upstream) =>
      replay(upstream).toplistArtist(toplistArtistType1.query),
  },
  {
    name: 'toplist_artist for europe',
    recording: toplistArtistType2,
    bodySchema: ToplistArtistBody,
    call: (upstream) =>
      replay(upstream).toplistArtist(toplistArtistType2.query),
  },
  {
    name: 'toplist_detail',
    recording: toplistDetailDefault,
    bodySchema: ToplistDetailBody,
    call: (upstream) => replay(upstream).toplistDetail({}),
  },
];

test.each(cases)(
  '$name returns and preserves its recording',
  async ({ recording, bodySchema, call }) => {
    const result = await call(recording.response.body);

    expect(result.body).toEqual(recording.response.body);
    const validated = validateSync(bodySchema, recording.response.body);
    expect(validated.issues).toBeUndefined();
    expect(validated.value).toEqual(recording.response.body);
  },
);

test('toplist bodies tighten the identifiers and keep loose fields loose', () => {
  expectTypeOf<ToplistBody['list'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<ToplistBody['list'][number]['tsSongCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    NonNullable<TopAlbumBody['monthData']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<TopAlbumBody['monthData']>[number]['areaId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    NonNullable<TopAlbumBody['monthData']>[number]['exclusive']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<
    NonNullable<TopAlbumBody['weekData']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    TopArtistsBody['artists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<TopListSuccess['playlist']['id']>().toEqualTypeOf<number>();
  expectTypeOf<
    TopListSuccess['playlist']['trackIds'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    TopPlaylistHighqualityBody['playlists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<TopPlaylistHighqualityBody['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<TopSongBody['data'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<TopSongBody['data'][number]['popularity']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    ToplistArtistBody['list']['artists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    ToplistArtistBody['list']['artists'][number]['lastRank']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    ToplistDetailBody['list'][number]['id']
  >().toEqualTypeOf<number>();
});

test('toplist rejects a chart without an id', async () => {
  const upstream = structuredClone(toplistDefault.response.body);
  delete (upstream.list[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(replay(upstream).toplist({}), {
    module: 'toplist',
    path: 'body.list[0].id',
    expected: 'present',
    actual: 'missing',
  });
});

test('toplist drops a chart play count that is text and keeps a null subscription', async () => {
  const upstream = structuredClone(toplistDefault.response.body);
  (upstream.list[0] as { playCount: unknown }).playCount = '6516825088';
  (upstream.list[0] as { subscribed: unknown }).subscribed = null;

  const result = await replay(upstream).toplist({});

  expect(result.body.list[0] as unknown).not.toHaveProperty('playCount');
  expect(result.body.list[0]?.subscribed).toBeNull();
});

test('toplist drops an artist chart block that is not an object', async () => {
  const upstream = structuredClone(toplistDefault.response.body) as {
    artistToplist: unknown;
  };
  upstream.artistToplist = 42;

  const result = await replay(upstream).toplist({});

  expect(result.body as unknown).not.toHaveProperty('artistToplist');
});

test('top_album rejects releases without a month list', async () => {
  const upstream = structuredClone(topAlbumAll.response.body);
  delete (upstream as { monthData?: unknown }).monthData;

  await expectUpstreamShapeRejection(
    replay(upstream).topAlbum(topAlbumAll.query),
    {
      module: 'top_album',
      path: 'body.monthData',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('top_album rejects a weekly release with a nonnumeric id', async () => {
  const upstream = structuredClone(topAlbumAll.response.body);
  (upstream.weekData[0] as { id: unknown }).id = '405170609';

  await expectUpstreamShapeRejection(
    replay(upstream).topAlbum(topAlbumAll.query),
    {
      module: 'top_album',
      path: 'body.weekData[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('top_album accepts weekly releases that are missing or null', async () => {
  const missing = structuredClone(topAlbumAll.response.body);
  delete (missing as { weekData?: unknown }).weekData;
  const missingResult = await replay(missing).topAlbum(topAlbumAll.query);
  expect(missingResult.status).toBe(200);
  expect(missingResult.body as unknown).not.toHaveProperty('weekData');

  const nulled = structuredClone(topAlbumAll.response.body) as {
    weekData: unknown;
  };
  nulled.weekData = null;
  const nulledResult = await replay(nulled).topAlbum(topAlbumAll.query);
  expect(nulledResult.status).toBe(200);
  expect(nulledResult.body.weekData as unknown).toBeNull();
});

test('top_album returns a recorded empty month unchanged', async () => {
  const result = await replay(topAlbumEmpty.response.body).topAlbum(
    topAlbumEmpty.query,
  );

  expect(result.status).toBe(200);
  expect(result.body.monthData as unknown).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('weekData');
});

test('top_album drops a release company that is not text', async () => {
  const upstream = structuredClone(topAlbumAll.response.body);
  (upstream.monthData[0] as { company: unknown }).company = 123;

  const result = await replay(upstream).topAlbum(topAlbumAll.query);

  expect(result.body.monthData[0] as unknown).not.toHaveProperty('company');
});

test('top_artists rejects an artist list whose id is text', async () => {
  const upstream = structuredClone(topArtistsDefault.response.body);
  (upstream.artists[0] as { id: unknown }).id = '3684';

  await expectUpstreamShapeRejection(
    replay(upstream).topArtists(topArtistsDefault.query),
    {
      module: 'top_artists',
      path: 'body.artists[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('top_artists drops a fan count that is text and keeps a null follow flag', async () => {
  const upstream = structuredClone(topArtistsDefault.response.body);
  (upstream.artists[0] as { fansCount: unknown }).fansCount = '16842739';
  (upstream.artists[0] as { followed: unknown }).followed = null;

  const result = await replay(upstream).topArtists(topArtistsDefault.query);

  expect(result.body.artists[0] as unknown).not.toHaveProperty('fansCount');
  expect(result.body.artists[0]?.followed).toBeNull();
});

test('top_list rejects a chart playlist without a track id list', async () => {
  const upstream = structuredClone(topListChart.response.body);
  delete (upstream.playlist as { trackIds?: unknown }).trackIds;

  await expectUpstreamShapeRejection(
    replay(upstream).topList(topListChart.query),
    {
      module: 'top_list',
      path: 'body.playlist.trackIds',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('top_list rejects a track reference without an id', async () => {
  const upstream = structuredClone(topListChart.response.body);
  delete (upstream.playlist.trackIds[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).topList(topListChart.query),
    {
      module: 'top_list',
      path: 'body.playlist.trackIds[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('top_list keeps rejecting the idx form locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(topListChart.response.body);
    },
  });

  const result = await api.topList({
    id: topListChart.query.id,
    idx: 1,
  });

  expect(requests).toBe(0);
  expect(result).toEqual({
    status: 500,
    cookie: [],
    body: { code: 500, msg: '不支持此方式调用,只支持id调用' },
  });
  const validated = validateSync(TopListBody, result.body);
  expect(validated.issues).toBeUndefined();
});

test('top_list drops a play count that is text and keeps null tracks', async () => {
  const upstream = structuredClone(topListChart.response.body);
  (upstream.playlist as { playCount: unknown }).playCount = '6515681280';
  (upstream.playlist as { tracks: unknown }).tracks = null;

  const result = await replay(upstream).topList(topListChart.query);
  const body = result.body as TopListSuccess;

  expect(body.playlist as unknown).not.toHaveProperty('playCount');
  expect(body.playlist.tracks as unknown).toBeNull();
});

test('top_playlist_highquality rejects a playlist without an id', async () => {
  const upstream = structuredClone(topPlaylistHighqualityDefault.response.body);
  delete (upstream.playlists[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).topPlaylistHighquality(
      topPlaylistHighqualityDefault.query,
    ),
    {
      module: 'top_playlist_highquality',
      path: 'body.playlists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('top_playlist_highquality drops a text cursor and a text total', async () => {
  const upstream = structuredClone(topPlaylistHighqualityDefault.response.body);
  (upstream as { lasttime: unknown }).lasttime = '1638864996000';
  (upstream as { total: unknown }).total = '402';
  (upstream as { more: unknown }).more = null;

  const result = await replay(upstream).topPlaylistHighquality(
    topPlaylistHighqualityDefault.query,
  );

  expect(result.body as unknown).not.toHaveProperty('lasttime');
  expect(result.body as unknown).not.toHaveProperty('total');
  expect(result.body.more as unknown).toBeNull();
});

test('top_playlist_highquality drops a numeric copywriter', async () => {
  const upstream = structuredClone(topPlaylistHighqualityDefault.response.body);
  (upstream.playlists[0] as { copywriter: unknown }).copywriter = 12;

  const result = await replay(upstream).topPlaylistHighquality(
    topPlaylistHighqualityDefault.query,
  );

  expect(result.body.playlists[0] as unknown).not.toHaveProperty('copywriter');
});

test('top_song rejects new songs without an id', async () => {
  const upstream = structuredClone(topSongType0.response.body);
  delete (upstream.data[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).topSong(topSongType0.query),
    {
      module: 'top_song',
      path: 'body.data[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('top_song drops a fee and popularity that are text and keeps undeclared fields', async () => {
  const upstream = structuredClone(topSongType0.response.body);
  (upstream.data[0] as { fee: unknown }).fee = 'free';
  (upstream.data[0] as { popularity: unknown }).popularity = '95';
  (upstream.data[0] as { brandNew?: unknown }).brandNew = { tags: ['新'] };

  const result = await replay(upstream).topSong(topSongType0.query);

  expect(result.body.data[0] as unknown).not.toHaveProperty('fee');
  expect(result.body.data[0] as unknown).not.toHaveProperty('popularity');
  expect(result.body.data[0]?.brandNew as unknown).toEqual({ tags: ['新'] });
});

test('top_song returns a recorded empty new song list unchanged', async () => {
  const result = await replay(topSongType999.response.body).topSong(
    topSongType999.query,
  );

  expect(result.status).toBe(200);
  expect(result.body.data as unknown).toEqual([]);
});

test('toplist_artist rejects a ranked artist without an id', async () => {
  const upstream = structuredClone(toplistArtistType1.response.body);
  delete (upstream.list.artists[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).toplistArtist(toplistArtistType1.query),
    {
      module: 'toplist_artist',
      path: 'body.list.artists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('toplist_artist drops a score that is text and keeps a null last rank', async () => {
  const upstream = structuredClone(toplistArtistType1.response.body);
  (upstream.list.artists[0] as { score: unknown }).score = '63600336';
  (upstream.list.artists[0] as { lastRank: unknown }).lastRank = null;

  const result = await replay(upstream).toplistArtist(toplistArtistType1.query);

  expect(result.body.list.artists[0] as unknown).not.toHaveProperty('score');
  expect(result.body.list.artists[0]?.lastRank as unknown).toBeNull();
});

test('toplist_artist keeps a recording without lastRank as loose evidence', async () => {
  const result = await replay(toplistArtistType1.response.body).toplistArtist(
    toplistArtistType1.query,
  );

  expect(
    result.body.list.artists.some((artist) => !('lastRank' in artist)),
  ).toBe(true);
});

test('toplist_detail rejects a chart summary whose id is text', async () => {
  const upstream = structuredClone(toplistDetailDefault.response.body);
  (upstream.list[0] as { id: unknown }).id = '19723756';

  await expectUpstreamShapeRejection(replay(upstream).toplistDetail({}), {
    module: 'toplist_detail',
    path: 'body.list[0].id',
    expected: 'number',
    actual: 'string',
  });
});

test('toplist_detail drops auxiliary toplist blocks that do not decode', async () => {
  const upstream = structuredClone(toplistDetailDefault.response.body) as {
    artistToplist: unknown;
  };
  upstream.artistToplist = '云音乐歌手榜';

  const result = await replay(upstream).toplistDetail({});

  expect(result.body as unknown).not.toHaveProperty('artistToplist');
});

test('toplist_detail drops only the reward songs when they are not objects', async () => {
  const upstream = structuredClone(toplistDetailDefault.response.body);
  (upstream.rewardToplist as { songs: unknown }).songs = '你';

  const result = await replay(upstream).toplistDetail({});

  expect(result.body.rewardToplist as unknown).not.toHaveProperty('songs');
  expect(result.body.rewardToplist?.name).toBe(
    toplistDetailDefault.response.body.rewardToplist.name,
  );
});
