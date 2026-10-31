import { expect, expectTypeOf, test } from 'bun:test';

import {
  ArtistDescBody,
  ArtistDetailDynamicBody,
  ArtistFansBody,
  ArtistFollowCountBody,
  ArtistListBody,
  ArtistMvBody,
  ArtistNewMvBody,
  ArtistNewSongBody,
  ArtistSongsBody,
  ArtistVideoBody,
  createHanaMusicApi,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import artistDesc from '../fixtures/netease/artist/artist_desc.default.json';
import artistDescEmpty from '../fixtures/netease/artist/artist_desc.empty.json';
import artistDescUnknown from '../fixtures/netease/artist/artist_desc.unknown.json';
import artistDetailDynamic from '../fixtures/netease/artist/artist_detail_dynamic.default.json';
import artistFans from '../fixtures/netease/artist/artist_fans.default.json';
import artistFansEmpty from '../fixtures/netease/artist/artist_fans.empty.json';
import artistFollowCount from '../fixtures/netease/artist/artist_follow_count.default.json';
import artistFollowCountUnknown from '../fixtures/netease/artist/artist_follow_count.unknown.json';
import artistList from '../fixtures/netease/artist/artist_list.default.json';
import artistListEmpty from '../fixtures/netease/artist/artist_list.empty.json';
import artistMv from '../fixtures/netease/artist/artist_mv.default.json';
import artistMvEmpty from '../fixtures/netease/artist/artist_mv.empty.json';
import artistNewMvAnonymous from '../fixtures/netease/artist/artist_new_mv.anonymous-empty.json';
import artistNewMv from '../fixtures/netease/artist/artist_new_mv.default.json';
import artistNewSongAnonymous from '../fixtures/netease/artist/artist_new_song.anonymous-empty.json';
import artistNewSong from '../fixtures/netease/artist/artist_new_song.default.json';
import artistSongs from '../fixtures/netease/artist/artist_songs.default.json';
import artistSongsEmpty from '../fixtures/netease/artist/artist_songs.empty.json';
import artistSongsNoCopyright from '../fixtures/netease/artist/artist_songs.no-copyright.json';
import artistVideo from '../fixtures/netease/artist/artist_video.default.json';
import artistVideoEmpty from '../fixtures/netease/artist/artist_video.empty.json';

// issue #102 B2 的匿名录制；artist_new_mv、artist_new_song 的非空录制来自本机已登录账号，context.viewer 是 authenticated，
// 匿名录制（anonymous-empty）只用于空列表证据。
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
    name: 'artist_desc',
    recording: artistDesc,
    bodySchema: ArtistDescBody,
    call: (upstream, status) =>
      replay(upstream, status).artistDesc(artistDesc.query),
  },
  {
    name: 'artist_desc without introduction sections',
    recording: artistDescEmpty,
    bodySchema: ArtistDescBody,
    call: (upstream, status) =>
      replay(upstream, status).artistDesc(artistDescEmpty.query),
  },
  {
    name: 'artist_detail_dynamic',
    recording: artistDetailDynamic,
    bodySchema: ArtistDetailDynamicBody,
    call: (upstream, status) =>
      replay(upstream, status).artistDetailDynamic(artistDetailDynamic.query),
  },
  {
    name: 'artist_fans',
    recording: artistFans,
    bodySchema: ArtistFansBody,
    call: (upstream, status) =>
      replay(upstream, status).artistFans(artistFans.query),
  },
  {
    name: 'artist_fans without fans',
    recording: artistFansEmpty,
    bodySchema: ArtistFansBody,
    call: (upstream, status) =>
      replay(upstream, status).artistFans(artistFansEmpty.query),
  },
  {
    name: 'artist_follow_count',
    recording: artistFollowCount,
    bodySchema: ArtistFollowCountBody,
    call: (upstream, status) =>
      replay(upstream, status).artistFollowCount(artistFollowCount.query),
  },
  {
    name: 'artist_list',
    recording: artistList,
    bodySchema: ArtistListBody,
    call: (upstream, status) =>
      replay(upstream, status).artistList(artistList.query),
  },
  {
    name: 'artist_list without artists',
    recording: artistListEmpty,
    bodySchema: ArtistListBody,
    call: (upstream, status) =>
      replay(upstream, status).artistList(artistListEmpty.query),
  },
  {
    name: 'artist_mv',
    recording: artistMv,
    bodySchema: ArtistMvBody,
    call: (upstream, status) =>
      replay(upstream, status).artistMv(artistMv.query),
  },
  {
    name: 'artist_mv without MVs',
    recording: artistMvEmpty,
    bodySchema: ArtistMvBody,
    call: (upstream, status) =>
      replay(upstream, status).artistMv(artistMvEmpty.query),
  },
  {
    name: 'artist_new_mv',
    recording: artistNewMv,
    bodySchema: ArtistNewMvBody,
    call: (upstream, status) =>
      replay(upstream, status).artistNewMv(artistNewMv.query),
  },
  {
    name: 'artist_new_mv for an anonymous viewer',
    recording: artistNewMvAnonymous,
    bodySchema: ArtistNewMvBody,
    call: (upstream, status) =>
      replay(upstream, status).artistNewMv(artistNewMvAnonymous.query),
  },
  {
    name: 'artist_new_song',
    recording: artistNewSong,
    bodySchema: ArtistNewSongBody,
    call: (upstream, status) =>
      replay(upstream, status).artistNewSong(artistNewSong.query),
  },
  {
    name: 'artist_new_song for an anonymous viewer',
    recording: artistNewSongAnonymous,
    bodySchema: ArtistNewSongBody,
    call: (upstream, status) =>
      replay(upstream, status).artistNewSong(artistNewSongAnonymous.query),
  },
  {
    name: 'artist_songs',
    recording: artistSongs,
    bodySchema: ArtistSongsBody,
    call: (upstream, status) =>
      replay(upstream, status).artistSongs(artistSongs.query),
  },
  {
    name: 'artist_songs with no-copyright recommendations',
    recording: artistSongsNoCopyright,
    bodySchema: ArtistSongsBody,
    call: (upstream, status) =>
      replay(upstream, status).artistSongs(artistSongsNoCopyright.query),
  },
  {
    name: 'artist_songs without songs',
    recording: artistSongsEmpty,
    bodySchema: ArtistSongsBody,
    call: (upstream, status) =>
      replay(upstream, status).artistSongs(artistSongsEmpty.query),
  },
  {
    name: 'artist_video',
    recording: artistVideo,
    bodySchema: ArtistVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).artistVideo(artistVideo.query),
  },
  {
    name: 'artist_video without records',
    recording: artistVideoEmpty,
    bodySchema: ArtistVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).artistVideo(artistVideoEmpty.query),
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

test('artist_follow_count passes an unknown artist through', async () => {
  expect(
    await settle(
      replay(
        artistFollowCountUnknown.response.body,
        artistFollowCountUnknown.response.status,
      ).artistFollowCount(artistFollowCountUnknown.query),
    ),
  ).toEqual({
    rejected: {
      status: 404,
      cookie: [],
      body: artistFollowCountUnknown.response.body,
    },
  });
});

test('artist_desc passes an unknown artist through', async () => {
  expect(
    await settle(
      replay(
        artistDescUnknown.response.body,
        artistDescUnknown.response.status,
      ).artistDesc(artistDescUnknown.query),
    ),
  ).toEqual({
    rejected: {
      status: 404,
      cookie: [],
      body: artistDescUnknown.response.body,
    },
  });
});

test('artist bodies type their tightened records and loose fields', () => {
  expectTypeOf<ArtistDescBody['introduction'][number]['txt']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<ArtistDescBody['briefDesc']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<ArtistDetailDynamicBody['followed']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    NonNullable<ArtistFansBody['data']>[number]['userProfile']['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<ArtistFollowCountBody['data']['fansCnt']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    ArtistListBody['artists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<ArtistMvBody['mvs'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<ArtistNewMvBody['data']['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    ArtistNewMvBody['data']['newWorks'][number]['mvId']
  >().toEqualTypeOf<number>();
  expectTypeOf<ArtistNewSongBody['data']['newSongCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    ArtistNewSongBody['data']['newWorks'][number]['songLists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    ArtistSongsBody['songs'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<ArtistSongsBody['songs'][number]['eq']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    ArtistVideoBody['data']['records'][number]['id']
  >().toEqualTypeOf<string>();
});

test('artist_desc rejects a body without the introduction sections', async () => {
  const upstream = structuredClone(artistDesc.response.body) as {
    introduction?: unknown;
  };
  delete upstream.introduction;

  await expectUpstreamShapeRejection(
    replay(upstream).artistDesc(artistDesc.query),
    {
      module: 'artist_desc',
      path: 'body.introduction',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_desc rejects an introduction that is not a list', async () => {
  const upstream = structuredClone(artistDesc.response.body) as {
    introduction: unknown;
  };
  upstream.introduction = 'JJ林俊杰的创作来自最深的情感';

  await expectUpstreamShapeRejection(
    replay(upstream).artistDesc(artistDesc.query),
    {
      module: 'artist_desc',
      path: 'body.introduction',
      expected: 'array',
      actual: 'string',
    },
  );
});

test('artist_desc drops a bad summary and keeps undeclared fields', async () => {
  const upstream = structuredClone(artistDesc.response.body) as {
    briefDesc?: unknown;
    count: unknown;
    topicData?: unknown;
  };
  delete upstream.briefDesc;
  delete upstream.topicData;
  upstream.count = '3';
  (upstream as Record<string, unknown>).extra = { from: 'upstream' };

  const result = await replay(upstream).artistDesc(artistDesc.query);

  expect(result.body as unknown).not.toHaveProperty('briefDesc');
  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body as unknown).not.toHaveProperty('topicData');
  expect(result.body as unknown).toHaveProperty('extra', { from: 'upstream' });
  expect(result.body.introduction).toEqual(
    artistDesc.response.body.introduction,
  );
});

test('artist_desc keeps null loose fields and the memo text', async () => {
  const upstream = structuredClone(artistDescEmpty.response.body) as {
    briefDesc: unknown;
    count: unknown;
    topicData: Array<{ memo: unknown; topic: { memo: unknown } }>;
  };
  upstream.briefDesc = null;
  upstream.count = null;
  upstream.topicData[0]!.memo = '';
  upstream.topicData[0]!.topic.memo = '';

  const result = await replay(upstream).artistDesc(artistDescEmpty.query);

  expect(result.body.briefDesc as unknown).toBeNull();
  expect(result.body.count as unknown).toBeNull();
  expect(result.body.topicData?.[0]?.memo).toBe('');
  expect(result.body.topicData?.[0]?.topic?.memo).toBe('');
});

test('artist_detail_dynamic rejects a body without a return code', async () => {
  const upstream = structuredClone(artistDetailDynamic.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).artistDetailDynamic(artistDetailDynamic.query),
    {
      module: 'artist_detail_dynamic',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_detail_dynamic drops bad counters and keeps undeclared fields', async () => {
  const upstream = structuredClone(artistDetailDynamic.response.body) as {
    followed: unknown;
    concert?: unknown;
    videoNum?: unknown;
    rcmdResource: Record<string, unknown>;
  };
  upstream.followed = null;
  delete upstream.concert;
  upstream.videoNum = 'two';
  delete upstream.rcmdResource.buttonName;
  upstream.rcmdResource.resId = 404060139;

  const result = await replay(upstream).artistDetailDynamic(
    artistDetailDynamic.query,
  );

  expect(result.body.followed as unknown).toBeNull();
  expect(result.body as unknown).not.toHaveProperty('concert');
  expect(result.body as unknown).not.toHaveProperty('videoNum');
  expect(result.body.rcmdResource as unknown).not.toHaveProperty('buttonName');
  expect(result.body.rcmdResource).toHaveProperty('resId', 404060139);
});

test('artist_fans accepts a missing or null list', async () => {
  const missing = structuredClone(artistFans.response.body) as {
    data?: unknown;
  };
  delete missing.data;

  const withoutData = await replay(missing).artistFans(artistFans.query);
  expect(withoutData.body as unknown).not.toHaveProperty('data');

  const nulled = structuredClone(artistFans.response.body) as {
    data?: unknown;
  };
  nulled.data = null;

  const withNull = await replay(nulled).artistFans(artistFans.query);
  expect(withNull.body.data as unknown).toBeNull();
});

test('artist_fans rejects a fan without a profile', async () => {
  const upstream = structuredClone(artistFans.response.body) as {
    data: Array<{ userProfile?: unknown }>;
  };
  delete upstream.data[0]!.userProfile;

  await expectUpstreamShapeRejection(
    replay(upstream).artistFans(artistFans.query),
    {
      module: 'artist_fans',
      path: 'body.data[0].userProfile',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_fans rejects a fan whose user id is text', async () => {
  const upstream = structuredClone(artistFans.response.body) as {
    data: Array<{ userProfile: { userId: unknown } }>;
  };
  upstream.data[0]!.userProfile.userId = '3964731168';

  await expectUpstreamShapeRejection(
    replay(upstream).artistFans(artistFans.query),
    {
      module: 'artist_fans',
      path: 'body.data[0].userProfile.userId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('artist_fans drops bad vip rights and keeps undeclared profile fields', async () => {
  const upstream = structuredClone(artistFans.response.body) as {
    data: Array<{
      vipRights?: unknown;
      userProfile: Record<string, unknown>;
    }>;
  };
  delete upstream.data[0]!.vipRights;
  upstream.data[1]!.vipRights = 'vip';
  upstream.data[2]!.vipRights = { redVipLevel: 3 };
  upstream.data[0]!.userProfile.remarkName = '老友';

  const result = await replay(upstream).artistFans(artistFans.query);

  expect(result.body.data?.[0] as unknown).not.toHaveProperty('vipRights');
  expect(result.body.data?.[1] as unknown).not.toHaveProperty('vipRights');
  expect(result.body.data?.[2]?.vipRights).toHaveProperty('redVipLevel', 3);
  expect(result.body.data?.[0]?.userProfile).toHaveProperty(
    'remarkName',
    '老友',
  );
});

test('artist_follow_count rejects a body without counts', async () => {
  const upstream = structuredClone(artistFollowCount.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).artistFollowCount(artistFollowCount.query),
    {
      module: 'artist_follow_count',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_follow_count rejects null counts', async () => {
  const upstream = structuredClone(artistFollowCount.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).artistFollowCount(artistFollowCount.query),
    {
      module: 'artist_follow_count',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('artist_follow_count drops bad counters and keeps undeclared fields', async () => {
  const upstream = structuredClone(artistFollowCount.response.body) as {
    message: unknown;
    data: Record<string, unknown>;
  };
  upstream.message = 500;
  delete upstream.data.followDay;
  upstream.data.fansCnt = 'many';
  upstream.data.recentFans = [1, 2, 3];

  const result = await replay(upstream).artistFollowCount(
    artistFollowCount.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body.data as unknown).not.toHaveProperty('followDay');
  expect(result.body.data as unknown).not.toHaveProperty('fansCnt');
  expect(result.body.data).toHaveProperty('recentFans', [1, 2, 3]);
});

test('artist_list rejects a body without the artist list', async () => {
  const upstream = structuredClone(artistList.response.body) as {
    artists?: unknown;
  };
  delete upstream.artists;

  await expectUpstreamShapeRejection(
    replay(upstream).artistList(artistList.query),
    {
      module: 'artist_list',
      path: 'body.artists',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_list rejects an artist id that is text', async () => {
  const upstream = structuredClone(artistList.response.body) as {
    artists: Array<{ id: unknown }>;
  };
  upstream.artists[0]!.id = '12198387';

  await expectUpstreamShapeRejection(
    replay(upstream).artistList(artistList.query),
    {
      module: 'artist_list',
      path: 'body.artists[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('artist_list drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(artistList.response.body) as {
    more: unknown;
    artists: Array<Record<string, unknown>>;
  };
  upstream.more = 'yes';
  delete upstream.artists[0]!.briefDesc;
  upstream.artists[1]!.fansCount = null;
  upstream.artists[2]!.alias = ['Alias'];
  upstream.artists[3]!.customTag = '新歌';

  const result = await replay(upstream).artistList(artistList.query);

  expect(result.body as unknown).not.toHaveProperty('more');
  expect(result.body.artists[0] as unknown).not.toHaveProperty('briefDesc');
  expect(result.body.artists[1]?.fansCount as unknown).toBeNull();
  expect(result.body.artists[2]?.alias).toEqual(['Alias']);
  expect(result.body.artists[3]).toHaveProperty('customTag', '新歌');
});

test('artist_mv rejects an MV without an id', async () => {
  const upstream = structuredClone(artistMv.response.body) as {
    mvs: Array<{ id?: unknown }>;
  };
  delete upstream.mvs[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).artistMv(artistMv.query),
    {
      module: 'artist_mv',
      path: 'body.mvs[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_mv rejects an MV id that is text', async () => {
  const upstream = structuredClone(artistMv.response.body) as {
    mvs: Array<{ id: unknown }>;
  };
  upstream.mvs[0]!.id = '34734028';

  await expectUpstreamShapeRejection(
    replay(upstream).artistMv(artistMv.query),
    {
      module: 'artist_mv',
      path: 'body.mvs[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('artist_mv rejects a body without the MV list', async () => {
  const upstream = structuredClone(artistMv.response.body) as {
    mvs?: unknown;
  };
  delete upstream.mvs;

  await expectUpstreamShapeRejection(
    replay(upstream).artistMv(artistMv.query),
    {
      module: 'artist_mv',
      path: 'body.mvs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_mv drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(artistMv.response.body) as {
    hasMore: unknown;
    mvs: Array<Record<string, unknown>>;
  };
  upstream.hasMore = null;
  delete upstream.mvs[0]!.playCount;
  upstream.mvs[1]!.publishTime = 1790000000000;
  upstream.mvs[2]!.duration = '272000';
  upstream.mvs[0]!.coverUrl = 'http://example.com/cover.jpg';

  const result = await replay(upstream).artistMv(artistMv.query);

  expect(result.body.hasMore as unknown).toBeNull();
  expect(result.body.mvs[0] as unknown).not.toHaveProperty('playCount');
  expect(result.body.mvs[1] as unknown).not.toHaveProperty('publishTime');
  expect(result.body.mvs[2] as unknown).not.toHaveProperty('duration');
  expect(result.body.mvs[0]).toHaveProperty(
    'coverUrl',
    'http://example.com/cover.jpg',
  );
});

test('artist_new_mv rejects a body without the work data', async () => {
  const upstream = structuredClone(artistNewMv.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewMv(artistNewMv.query),
    {
      module: 'artist_new_mv',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_mv rejects an MV without an id', async () => {
  const upstream = structuredClone(artistNewMv.response.body) as {
    data: { newWorks: Array<{ mvId?: unknown }> };
  };
  delete upstream.data.newWorks[0]!.mvId;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewMv(artistNewMv.query),
    {
      module: 'artist_new_mv',
      path: 'body.data.newWorks[0].mvId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_mv rejects a body without the work list', async () => {
  const upstream = structuredClone(artistNewMv.response.body) as {
    data: { newWorks?: unknown };
  };
  delete upstream.data.newWorks;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewMv(artistNewMv.query),
    {
      module: 'artist_new_mv',
      path: 'body.data.newWorks',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_mv rejects a null work list', async () => {
  const upstream = structuredClone(artistNewMv.response.body) as {
    data: { newWorks?: unknown };
  };
  upstream.data.newWorks = null;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewMv(artistNewMv.query),
    {
      module: 'artist_new_mv',
      path: 'body.data.newWorks',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('artist_new_mv drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(artistNewMv.response.body) as {
    data: {
      hasMore: unknown;
      newWorks: Array<Record<string, unknown>>;
    };
  };
  upstream.data.hasMore = 'false';
  upstream.data.newWorks[0]!.playCount = '0';
  upstream.data.newWorks[1]!.artisTransName = 42;
  upstream.data.newWorks[2]!.shareUrl = 'https://music.163.com/mv/1';

  const result = await replay(upstream).artistNewMv(artistNewMv.query);

  expect(result.body.data as unknown).not.toHaveProperty('hasMore');
  expect(result.body.data.newWorks?.[0] as unknown).not.toHaveProperty(
    'playCount',
  );
  expect(result.body.data.newWorks?.[1] as unknown).not.toHaveProperty(
    'artisTransName',
  );
  expect(result.body.data.newWorks?.[2]).toHaveProperty(
    'shareUrl',
    'https://music.163.com/mv/1',
  );
});

test('artist_new_song rejects a body without a return code', async () => {
  const upstream = structuredClone(artistNewSong.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewSong(artistNewSong.query),
    {
      module: 'artist_new_song',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_song rejects a block without its song data', async () => {
  const upstream = structuredClone(artistNewSong.response.body) as {
    data: { newWorks: Array<{ songLists?: unknown }> };
  };
  delete upstream.data.newWorks[0]!.songLists;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewSong(artistNewSong.query),
    {
      module: 'artist_new_song',
      path: 'body.data.newWorks[0].songLists',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_song rejects a song without an id', async () => {
  const upstream = structuredClone(artistNewSong.response.body) as {
    data: { newWorks: Array<{ songLists: Array<{ id?: unknown }> }> };
  };
  delete upstream.data.newWorks[0]!.songLists[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewSong(artistNewSong.query),
    {
      module: 'artist_new_song',
      path: 'body.data.newWorks[0].songLists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_song rejects a body without the work list', async () => {
  const upstream = structuredClone(artistNewSong.response.body) as {
    data: { newWorks?: unknown };
  };
  delete upstream.data.newWorks;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewSong(artistNewSong.query),
    {
      module: 'artist_new_song',
      path: 'body.data.newWorks',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_song rejects a null work list', async () => {
  const upstream = structuredClone(artistNewSong.response.body) as {
    data: { newWorks?: unknown };
  };
  upstream.data.newWorks = null;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewSong(artistNewSong.query),
    {
      module: 'artist_new_song',
      path: 'body.data.newWorks',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('artist_new_song rejects a body without the work data', async () => {
  const upstream = structuredClone(artistNewSong.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).artistNewSong(artistNewSong.query),
    {
      module: 'artist_new_song',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_new_song drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(artistNewSong.response.body) as {
    data: {
      hasMore: unknown;
      newWorks: Array<{
        accompanimentIds?: unknown;
        blockTitle: Record<string, unknown>;
        songLists: Array<Record<string, unknown>>;
      }>;
    };
  };
  upstream.data.hasMore = 'true';
  upstream.data.newWorks[0]!.accompanimentIds = '3451364416';
  upstream.data.newWorks[0]!.blockTitle.artisTransName = 42;
  upstream.data.newWorks[0]!.songLists[0]!.rtUrl = 'http://example.com/rt.mp3';

  const result = await replay(upstream).artistNewSong(artistNewSong.query);

  expect(result.body.data as unknown).not.toHaveProperty('hasMore');
  expect(result.body.data.newWorks?.[0] as unknown).not.toHaveProperty(
    'accompanimentIds',
  );
  expect(
    result.body.data.newWorks?.[0]?.blockTitle as unknown,
  ).not.toHaveProperty('artisTransName');
  expect(result.body.data.newWorks?.[0]?.songLists[0]).toHaveProperty(
    'rtUrl',
    'http://example.com/rt.mp3',
  );
});

test('artist_songs rejects a song without an id', async () => {
  const upstream = structuredClone(artistSongs.response.body) as {
    songs: Array<{ id?: unknown }>;
  };
  delete upstream.songs[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).artistSongs(artistSongs.query),
    {
      module: 'artist_songs',
      path: 'body.songs[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_songs rejects a song id that is text', async () => {
  const upstream = structuredClone(artistSongs.response.body) as {
    songs: Array<{ id: unknown }>;
  };
  upstream.songs[0]!.id = '108485';

  await expectUpstreamShapeRejection(
    replay(upstream).artistSongs(artistSongs.query),
    {
      module: 'artist_songs',
      path: 'body.songs[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('artist_songs rejects a body without the song list', async () => {
  const upstream = structuredClone(artistSongs.response.body) as {
    songs?: unknown;
  };
  delete upstream.songs;

  await expectUpstreamShapeRejection(
    replay(upstream).artistSongs(artistSongs.query),
    {
      module: 'artist_songs',
      path: 'body.songs',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_songs drops bad pagination and keeps undeclared song fields', async () => {
  const upstream = structuredClone(artistSongs.response.body) as {
    more: unknown;
    total: unknown;
    songs: Array<Record<string, unknown>>;
  };
  upstream.more = 'false';
  upstream.total = null;
  delete upstream.songs[0]!.eq;
  upstream.songs[1]!.rtUrl = 'http://example.com/rt.mp3';

  const result = await replay(upstream).artistSongs(artistSongs.query);

  expect(result.body as unknown).not.toHaveProperty('more');
  expect(result.body.total as unknown).toBeNull();
  expect(result.body.songs[0] as unknown).not.toHaveProperty('eq');
  expect(result.body.songs[1]).toHaveProperty(
    'rtUrl',
    'http://example.com/rt.mp3',
  );
});

test('artist_list rejects a non-primitive initial before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json(artistList.response.body);
    },
  });

  expect(await settle(api.artistList({ initial: { letter: 'a' } }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'initial must be a primitive value' },
    },
  });
  expect(upstreamCalls).toBe(0);
});

test('artist_video rejects a record without an id', async () => {
  const upstream = structuredClone(artistVideo.response.body) as {
    data: { records: Array<{ id?: unknown }> };
  };
  delete upstream.data.records[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).artistVideo(artistVideo.query),
    {
      module: 'artist_video',
      path: 'body.data.records[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_video rejects a body without the record list', async () => {
  const upstream = structuredClone(artistVideo.response.body) as {
    data: { records?: unknown };
  };
  delete upstream.data.records;

  await expectUpstreamShapeRejection(
    replay(upstream).artistVideo(artistVideo.query),
    {
      module: 'artist_video',
      path: 'body.data.records',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('artist_video drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(artistVideo.response.body) as {
    message: unknown;
    data: {
      page?: unknown;
      records: Array<Record<string, unknown>>;
    };
  };
  upstream.message = null;
  delete upstream.data.page;
  upstream.data.records[0]!.sameCity = 'yes';
  upstream.data.records[1]!.resource = 'video';
  upstream.data.records[2]!.srcId = 123456;

  const result = await replay(upstream).artistVideo(artistVideo.query);

  expect(result.body.message as unknown).toBeNull();
  expect(result.body.data as unknown).not.toHaveProperty('page');
  expect(result.body.data.records[0] as unknown).not.toHaveProperty('sameCity');
  expect(result.body.data.records[1] as unknown).not.toHaveProperty('resource');
  expect(result.body.data.records[2]).toHaveProperty('srcId', 123456);
});
