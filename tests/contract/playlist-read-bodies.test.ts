import { expect, expectTypeOf, test } from 'bun:test';

import {
  PlaylistDetailDynamicBody,
  PlaylistDetailRcmdGetBody,
  PlaylistHighqualityTagsBody,
  PlaylistHotBody,
  PlaylistMylikeBody,
  PlaylistSubscribersBody,
  PlaylistVideoRecentBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import playlistDetailDynamicCollected from '../fixtures/netease/playlist/playlist_detail_dynamic.collected.json';
import playlistDetailDynamic from '../fixtures/netease/playlist/playlist_detail_dynamic.default.json';
import playlistDetailRcmdGet from '../fixtures/netease/playlist/playlist_detail_rcmd_get.default.json';
import playlistDetailRcmdGetEmpty from '../fixtures/netease/playlist/playlist_detail_rcmd_get.empty.json';
import playlistHighqualityTags from '../fixtures/netease/playlist/playlist_highquality_tags.default.json';
import playlistHot from '../fixtures/netease/playlist/playlist_hot.default.json';
import playlistMylikeAnonymous from '../fixtures/netease/playlist/playlist_mylike.anonymous.json';
import playlistMylike from '../fixtures/netease/playlist/playlist_mylike.empty.json';
import playlistSubscribersPageTwo from '../fixtures/netease/playlist/playlist_subscribers.anonymous-page-two.json';
import playlistSubscribersAuthenticated from '../fixtures/netease/playlist/playlist_subscribers.authenticated-page-one.json';
import playlistSubscribers from '../fixtures/netease/playlist/playlist_subscribers.default.json';
import playlistSubscribersEmpty from '../fixtures/netease/playlist/playlist_subscribers.empty.json';
import playlistVideoRecentAnonymous from '../fixtures/netease/playlist/playlist_video_recent.anonymous.json';
import playlistVideoRecent from '../fixtures/netease/playlist/playlist_video_recent.default.json';

// issue #102 B5 的录制。playlist_mylike 的录制来自本机登录账号（context.viewer 是 authenticated），
// playlist_video_recent 的非空录制同样登录录制，anonymous 录制只用于空列表证据。
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
    name: 'playlist_detail_dynamic',
    recording: playlistDetailDynamic,
    bodySchema: PlaylistDetailDynamicBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistDetailDynamic(
        playlistDetailDynamic.query,
      ),
  },
  {
    name: 'playlist_detail_dynamic for a playlist the account collected (anonymous view)',
    recording: playlistDetailDynamicCollected,
    bodySchema: PlaylistDetailDynamicBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistDetailDynamic(
        playlistDetailDynamicCollected.query,
      ),
  },
  {
    name: 'playlist_detail_rcmd_get',
    recording: playlistDetailRcmdGet,
    bodySchema: PlaylistDetailRcmdGetBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistDetailRcmdGet(
        playlistDetailRcmdGet.query,
      ),
  },
  {
    name: 'playlist_detail_rcmd_get without recommendations',
    recording: playlistDetailRcmdGetEmpty,
    bodySchema: PlaylistDetailRcmdGetBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistDetailRcmdGet(
        playlistDetailRcmdGetEmpty.query,
      ),
  },
  {
    name: 'playlist_highquality_tags',
    recording: playlistHighqualityTags,
    bodySchema: PlaylistHighqualityTagsBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistHighqualityTags(
        playlistHighqualityTags.query,
      ),
  },
  {
    name: 'playlist_hot',
    recording: playlistHot,
    bodySchema: PlaylistHotBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistHot(playlistHot.query),
  },
  {
    name: 'playlist_mylike without liked videos',
    recording: playlistMylike,
    bodySchema: PlaylistMylikeBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistMylike(playlistMylike.query),
  },
  {
    name: 'playlist_subscribers',
    recording: playlistSubscribers,
    bodySchema: PlaylistSubscribersBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistSubscribers(playlistSubscribers.query),
  },
  {
    name: 'playlist_subscribers for an anonymous second page',
    recording: playlistSubscribersPageTwo,
    bodySchema: PlaylistSubscribersBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistSubscribers(
        playlistSubscribersPageTwo.query,
      ),
  },
  {
    name: 'playlist_subscribers for an authenticated first page',
    recording: playlistSubscribersAuthenticated,
    bodySchema: PlaylistSubscribersBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistSubscribers(
        playlistSubscribersAuthenticated.query,
      ),
  },
  {
    name: 'playlist_subscribers past the last page',
    recording: playlistSubscribersEmpty,
    bodySchema: PlaylistSubscribersBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistSubscribers(
        playlistSubscribersEmpty.query,
      ),
  },
  {
    name: 'playlist_video_recent',
    recording: playlistVideoRecent,
    bodySchema: PlaylistVideoRecentBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistVideoRecent(playlistVideoRecent.query),
  },
  {
    name: 'playlist_video_recent when anonymous',
    recording: playlistVideoRecentAnonymous,
    bodySchema: PlaylistVideoRecentBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistVideoRecent(
        playlistVideoRecentAnonymous.query,
      ),
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

test('playlist_detail_dynamic rejects a body without a return code', async () => {
  const upstream = structuredClone(playlistDetailDynamic.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistDetailDynamic(playlistDetailDynamic.query),
    {
      module: 'playlist_detail_dynamic',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_detail_dynamic drops bad counters and keeps undeclared fields', async () => {
  const upstream = structuredClone(playlistDetailDynamic.response.body) as {
    playCount: unknown;
    commentCount: unknown;
    remarkName: unknown;
    remixVideo: unknown;
  };
  upstream.playCount = '24379';
  upstream.commentCount = null;
  upstream.remarkName = 'night';
  upstream.remixVideo = { id: 1 };

  const result = await replay(upstream).playlistDetailDynamic(
    playlistDetailDynamic.query,
  );

  expect(result.body as unknown).not.toHaveProperty('playCount');
  expect(result.body.commentCount as unknown).toBeNull();
  expect(result.body as unknown).toHaveProperty('remarkName', 'night');
  expect(result.body as unknown).toHaveProperty('remixVideo', { id: 1 });
});

test('playlist_detail_rcmd_get rejects a recommended playlist whose id is text', async () => {
  const upstream = structuredClone(playlistDetailRcmdGet.response.body);
  const record = upstream.data?.recPlaylist[0] as {
    playlist: { id: unknown };
  };
  record.playlist.id = '110759778';

  await expectUpstreamShapeRejection(
    replay(upstream).playlistDetailRcmdGet(playlistDetailRcmdGet.query),
    {
      module: 'playlist_detail_rcmd_get',
      path: 'body.data.recPlaylist[0].playlist.id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('playlist_detail_rcmd_get rejects recommendations without a playlist list', async () => {
  const upstream = structuredClone(playlistDetailRcmdGet.response.body) as {
    data?: { recPlaylist?: unknown };
  };
  delete upstream.data?.recPlaylist;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistDetailRcmdGet(playlistDetailRcmdGet.query),
    {
      module: 'playlist_detail_rcmd_get',
      path: 'body.data.recPlaylist',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_detail_rcmd_get returns a body without recommendations', async () => {
  const upstream = structuredClone(playlistDetailRcmdGet.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  const result = await replay(upstream).playlistDetailRcmdGet(
    playlistDetailRcmdGet.query,
  );

  expect(result.body as unknown).not.toHaveProperty('data');
  expect(result.body.message).toBe(playlistDetailRcmdGet.response.body.message);
});

test('playlist_detail_rcmd_get drops a bad play count and keeps undeclared fields', async () => {
  const upstream = structuredClone(playlistDetailRcmdGet.response.body);
  const record = upstream.data?.recPlaylist[0] as unknown as {
    playlist: { playCount: unknown; action: unknown; extra: unknown };
  };
  record.playlist.playCount = '47344968';
  record.playlist.action = null;
  record.playlist.extra = 'kept';

  const result = await replay(upstream).playlistDetailRcmdGet(
    playlistDetailRcmdGet.query,
  );

  const playlist = result.body.data?.recPlaylist[0]?.playlist;
  expect(playlist as unknown).not.toHaveProperty('playCount');
  expect(playlist?.action as unknown).toBeNull();
  expect(playlist as unknown).toHaveProperty('extra', 'kept');
});

test('playlist_highquality_tags rejects a tag without an id', async () => {
  const upstream = structuredClone(playlistHighqualityTags.response.body);
  delete (upstream.tags[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistHighqualityTags(playlistHighqualityTags.query),
    {
      module: 'playlist_highquality_tags',
      path: 'body.tags[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_highquality_tags drops a bad hot flag and keeps undeclared fields', async () => {
  const upstream = structuredClone(playlistHighqualityTags.response.body);
  const tag = upstream.tags[0] as unknown as {
    hot: unknown;
    category: unknown;
    extra: unknown;
  };
  tag.hot = 'false';
  tag.category = null;
  tag.extra = 7;

  const result = await replay(upstream).playlistHighqualityTags(
    playlistHighqualityTags.query,
  );

  expect(result.body.tags[0] as unknown).not.toHaveProperty('hot');
  expect(result.body.tags[0]?.category as unknown).toBeNull();
  expect(result.body.tags[0] as unknown).toHaveProperty('extra', 7);
});

test('playlist_hot rejects a tag whose id is text', async () => {
  const upstream = structuredClone(playlistHot.response.body);
  (upstream.tags[0] as { id: unknown }).id = '5001';

  await expectUpstreamShapeRejection(
    replay(upstream).playlistHot(playlistHot.query),
    {
      module: 'playlist_hot',
      path: 'body.tags[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('playlist_hot drops a bad nested tag and keeps undeclared fields', async () => {
  const upstream = structuredClone(playlistHot.response.body);
  const tag = upstream.tags[0] as unknown as {
    playlistTag: unknown;
    usedCount: unknown;
    extra: unknown;
  };
  tag.playlistTag = '华语';
  tag.usedCount = '10596949';
  tag.extra = 'kept';

  const result = await replay(upstream).playlistHot(playlistHot.query);

  expect(result.body.tags[0] as unknown).not.toHaveProperty('playlistTag');
  expect(result.body.tags[0] as unknown).not.toHaveProperty('usedCount');
  expect(result.body.tags[0] as unknown).toHaveProperty('extra', 'kept');
  expect(result.body.tags[0]?.hot).toBe(playlistHot.response.body.tags[0]!.hot);
});

test('playlist_mylike rejects a body without the like feed', async () => {
  const upstream = structuredClone(playlistMylike.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistMylike(playlistMylike.query),
    {
      module: 'playlist_mylike',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_mylike drops a bad more flag and keeps the undeclared feed list', async () => {
  const upstream = structuredClone(playlistMylike.response.body) as unknown as {
    data: { feeds: unknown; more: unknown; extra: unknown };
  };
  upstream.data.feeds = [{ id: 14403533 }];
  upstream.data.more = 'false';
  upstream.data.extra = 'kept';

  const result = await replay(upstream).playlistMylike(playlistMylike.query);

  expect(result.body.data as unknown).not.toHaveProperty('more');
  expect(result.body.data as unknown).toHaveProperty('feeds', [
    { id: 14403533 },
  ]);
  expect(result.body.data as unknown).toHaveProperty('extra', 'kept');
});

test('playlist_mylike rejects an anonymous call with the upstream login code', async () => {
  const result = await settle(
    replay(
      playlistMylikeAnonymous.response.body,
      playlistMylikeAnonymous.response.status,
    ).playlistMylike(playlistMylikeAnonymous.query),
  );

  expect(result).toEqual({
    rejected: {
      status: 302,
      cookie: [],
      body: { code: 302, message: null },
    },
  });
});

test('playlist_subscribers rejects a subscriber without a user id', async () => {
  const upstream = structuredClone(playlistSubscribers.response.body);
  delete (upstream.subscribers[0] as { userId?: unknown }).userId;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistSubscribers(playlistSubscribers.query),
    {
      module: 'playlist_subscribers',
      path: 'body.subscribers[0].userId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_subscribers rejects a subscriber list that is not an array', async () => {
  const upstream = structuredClone(playlistSubscribers.response.body) as {
    subscribers: unknown;
  };
  upstream.subscribers = null;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistSubscribers(playlistSubscribers.query),
    {
      module: 'playlist_subscribers',
      path: 'body.subscribers',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('playlist_subscribers drops bad pagination fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(playlistSubscribers.response.body) as {
    total: unknown;
    subscribers: Array<{
      subscribeTime: unknown;
      nickname: unknown;
      remarkName: unknown;
      vipRights: unknown;
    }>;
  };
  upstream.total = '30';
  upstream.subscribers[0]!.subscribeTime = '1792931554221';
  upstream.subscribers[0]!.nickname = null;
  upstream.subscribers[0]!.remarkName = 'fan';
  upstream.subscribers[0]!.vipRights = { musicPackage: { rights: true } };

  const result = await replay(upstream).playlistSubscribers(
    playlistSubscribers.query,
  );

  const subscriber = result.body.subscribers[0];
  expect(result.body as unknown).not.toHaveProperty('total');
  expect(subscriber as unknown).not.toHaveProperty('subscribeTime');
  expect(subscriber?.nickname as unknown).toBeNull();
  expect(subscriber as unknown).toHaveProperty('remarkName', 'fan');
  expect(subscriber as unknown).toHaveProperty('vipRights', {
    musicPackage: { rights: true },
  });
});

test('playlist_video_recent rejects a video id that is a number', async () => {
  const upstream = structuredClone(playlistVideoRecent.response.body);
  (upstream.data.videos[0]!.mlogBaseData as { id: unknown }).id = 14403533;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistVideoRecent(playlistVideoRecent.query),
    {
      module: 'playlist_video_recent',
      path: 'body.data.videos[0].mlogBaseData.id',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('playlist_video_recent rejects a video without base data', async () => {
  const upstream = structuredClone(playlistVideoRecent.response.body);
  delete (upstream.data.videos[0] as { mlogBaseData?: unknown }).mlogBaseData;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistVideoRecent(playlistVideoRecent.query),
    {
      module: 'playlist_video_recent',
      path: 'body.data.videos[0].mlogBaseData',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_video_recent drops bad counters and keeps null-only fields', async () => {
  const upstream = structuredClone(playlistVideoRecent.response.body);
  const video = upstream.data.videos[0]!;
  const ext = video.mlogExtVO as {
    commentCount: unknown;
    playCount: unknown;
  };
  ext.commentCount = '1';
  video.mlogBaseData.desc = null;
  (video.mlogBaseData as { videos: unknown }).videos = 'none';
  (video.mlogBaseData as { audio: unknown }).audio = { url: 'kept' };

  const result = await replay(upstream).playlistVideoRecent(
    playlistVideoRecent.query,
  );

  const record = result.body.data.videos[0]!;
  expect(record.mlogExtVO as unknown).not.toHaveProperty('commentCount');
  expect(record.mlogExtVO?.playCount).toBe(
    playlistVideoRecent.response.body.data.videos[0]!.mlogExtVO.playCount,
  );
  expect(record.mlogBaseData.desc as unknown).toBeNull();
  expect(record.mlogBaseData as unknown).not.toHaveProperty('videos');
  expect(record.mlogBaseData as unknown).toHaveProperty('audio', {
    url: 'kept',
  });
});

test('playlist read bodies type tightened records and loose fields', () => {
  expectTypeOf<PlaylistDetailDynamicBody['playCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    NonNullable<
      PlaylistDetailRcmdGetBody['data']
    >['recPlaylist'][number]['playlist']['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<PlaylistDetailRcmdGetBody['data']>['recPlaylist'][number]['alg']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    PlaylistHighqualityTagsBody['tags'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    PlaylistHighqualityTagsBody['tags'][number]['hot']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<PlaylistHotBody['tags'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<PlaylistHotBody['tags'][number]['hot']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    PlaylistSubscribersBody['subscribers'][number]['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<PlaylistSubscribersBody['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    PlaylistVideoRecentBody['data']['videos'][number]['mlogBaseData']['id']
  >().toEqualTypeOf<string>();
  expectTypeOf<PlaylistMylikeBody['data']['more']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<PlaylistMylikeBody['data']['time']>().toEqualTypeOf<
    number | null | undefined
  >();
});
