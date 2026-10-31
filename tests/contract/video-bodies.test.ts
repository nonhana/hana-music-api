import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  RelatedAllvideoBody,
  VideoCategoryListBody,
  VideoDetailBody,
  VideoDetailInfoBody,
  VideoGroupBody,
  VideoGroupListBody,
  VideoTimelineAllBody,
  VideoTimelineRecommendBody,
  VideoUrlBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import relatedAllvideo from '../fixtures/netease/video/related_allvideo.default.json';
import relatedAllvideoNumeric from '../fixtures/netease/video/related_allvideo.numeric-id.json';
import videoCategoryList from '../fixtures/netease/video/video_category_list.default.json';
import videoDetail from '../fixtures/netease/video/video_detail.default.json';
import videoDetailInfo from '../fixtures/netease/video/video_detail_info.default.json';
import videoGroup from '../fixtures/netease/video/video_group.default.json';
import videoGroupList from '../fixtures/netease/video/video_group_list.default.json';
import videoTimelineAllAuthenticated from '../fixtures/netease/video/video_timeline_all.authenticated.json';
import videoTimelineAll from '../fixtures/netease/video/video_timeline_all.default.json';
import videoTimelineAllEmpty from '../fixtures/netease/video/video_timeline_all.empty.json';
import videoTimelineRecommendAuthenticated from '../fixtures/netease/video/video_timeline_recommend.authenticated.json';
import videoTimelineRecommend from '../fixtures/netease/video/video_timeline_recommend.default.json';
import videoTimelineRecommendEmpty from '../fixtures/netease/video/video_timeline_recommend.empty.json';
import videoUrl240p from '../fixtures/netease/video/video_url.240p.json';
import videoUrl480p from '../fixtures/netease/video/video_url.480p.json';
import videoUrl from '../fixtures/netease/video/video_url.default.json';
import videoUrlEmpty from '../fixtures/netease/video/video_url.empty.json';

// issue #102 B10 的匿名录制；两条 timeline 登录对照录制的结构差异只在宽松字段（relateSong 出现歌曲记录、
// markTypes 出现值；creator.experts 的键集合差异只在 video_timeline_all，匿名多 experts.2），context.viewer
// 是 authenticated。其余 7 个模块只保留匿名录制，未保留登录对照，不对公开结构作相同性断言。
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
    name: 'video_category_list',
    recording: videoCategoryList,
    bodySchema: VideoCategoryListBody,
    call: (upstream, status) =>
      replay(upstream, status).videoCategoryList(videoCategoryList.query),
  },
  {
    name: 'video_group_list',
    recording: videoGroupList,
    bodySchema: VideoGroupListBody,
    call: (upstream, status) =>
      replay(upstream, status).videoGroupList(videoGroupList.query),
  },
  {
    name: 'video_timeline_all',
    recording: videoTimelineAll,
    bodySchema: VideoTimelineAllBody,
    call: (upstream, status) =>
      replay(upstream, status).videoTimelineAll(videoTimelineAll.query),
  },
  {
    name: 'video_timeline_all past its first page',
    recording: videoTimelineAllEmpty,
    bodySchema: VideoTimelineAllBody,
    call: (upstream, status) =>
      replay(upstream, status).videoTimelineAll(videoTimelineAllEmpty.query),
  },
  {
    name: 'video_timeline_all for an authenticated account',
    recording: videoTimelineAllAuthenticated,
    bodySchema: VideoTimelineAllBody,
    call: (upstream, status) =>
      replay(upstream, status).videoTimelineAll(
        videoTimelineAllAuthenticated.query,
      ),
  },
  {
    name: 'video_timeline_recommend',
    recording: videoTimelineRecommend,
    bodySchema: VideoTimelineRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).videoTimelineRecommend(
        videoTimelineRecommend.query,
      ),
  },
  {
    name: 'video_timeline_recommend for an authenticated account',
    recording: videoTimelineRecommendAuthenticated,
    bodySchema: VideoTimelineRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).videoTimelineRecommend(
        videoTimelineRecommendAuthenticated.query,
      ),
  },
  {
    name: 'video_timeline_recommend past its first page',
    recording: videoTimelineRecommendEmpty,
    bodySchema: VideoTimelineRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).videoTimelineRecommend(
        videoTimelineRecommendEmpty.query,
      ),
  },
  {
    name: 'video_detail',
    recording: videoDetail,
    bodySchema: VideoDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).videoDetail(videoDetail.query),
  },
  {
    name: 'video_detail_info',
    recording: videoDetailInfo,
    bodySchema: VideoDetailInfoBody,
    call: (upstream, status) =>
      replay(upstream, status).videoDetailInfo(videoDetailInfo.query),
  },
  {
    name: 'video_url',
    recording: videoUrl,
    bodySchema: VideoUrlBody,
    call: (upstream, status) =>
      replay(upstream, status).videoUrl(videoUrl.query),
  },
  {
    name: 'video_url at 480p',
    recording: videoUrl480p,
    bodySchema: VideoUrlBody,
    call: (upstream, status) =>
      replay(upstream, status).videoUrl(videoUrl480p.query),
  },
  {
    name: 'video_url at 240p',
    recording: videoUrl240p,
    bodySchema: VideoUrlBody,
    call: (upstream, status) =>
      replay(upstream, status).videoUrl(videoUrl240p.query),
  },
  {
    name: 'video_url for an unknown video',
    recording: videoUrlEmpty,
    bodySchema: VideoUrlBody,
    call: (upstream, status) =>
      replay(upstream, status).videoUrl(videoUrlEmpty.query),
  },
  {
    name: 'video_group',
    recording: videoGroup,
    bodySchema: VideoGroupBody,
    call: (upstream, status) =>
      replay(upstream, status).videoGroup(videoGroup.query),
  },
  {
    name: 'related_allvideo',
    recording: relatedAllvideo,
    bodySchema: RelatedAllvideoBody,
    call: (upstream, status) =>
      replay(upstream, status).relatedAllvideo(relatedAllvideo.query),
  },
  {
    name: 'related_allvideo for a numeric video id',
    recording: relatedAllvideoNumeric,
    bodySchema: RelatedAllvideoBody,
    call: (upstream, status) =>
      replay(upstream, status).relatedAllvideo(relatedAllvideoNumeric.query),
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

test.each<{
  name: string;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'video_detail',
    call: (upstream, status) =>
      replay(upstream, status).videoDetail(videoDetail.query),
  },
  {
    name: 'video_detail_info',
    call: (upstream, status) =>
      replay(upstream, status).videoDetailInfo(videoDetailInfo.query),
  },
])('$name passes a rejected code through', async (entry) => {
  const upstream = { code: 400, message: '参数错误' };

  expect(await settle(entry.call(upstream, 200))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: upstream,
    },
  });
});

test('video_category_list rejects a category whose id is text', async () => {
  const upstream = structuredClone(videoCategoryList.response.body);
  (upstream.data[0] as { id: unknown }).id = '58100';

  await expectUpstreamShapeRejection(
    replay(upstream).videoCategoryList(videoCategoryList.query),
    {
      module: 'video_category_list',
      path: 'body.data[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('video_category_list rejects a body without a category list', async () => {
  const upstream = structuredClone(videoCategoryList.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).videoCategoryList(videoCategoryList.query),
    {
      module: 'video_category_list',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('video_group_list rejects a tag whose id is null', async () => {
  const upstream = structuredClone(videoGroupList.response.body);
  (upstream.data[0] as { id: unknown }).id = null;

  await expectUpstreamShapeRejection(
    replay(upstream).videoGroupList(videoGroupList.query),
    {
      module: 'video_group_list',
      path: 'body.data[0].id',
      expected: 'number',
      actual: 'null',
    },
  );
});

test('video_detail rejects a detail without a video id', async () => {
  const upstream = structuredClone(videoDetail.response.body);
  delete (upstream.data as { vid?: unknown }).vid;

  await expectUpstreamShapeRejection(
    replay(upstream).videoDetail(videoDetail.query),
    {
      module: 'video_detail',
      path: 'body.data.vid',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('video_detail rejects a body without detail data', async () => {
  const upstream = structuredClone(videoDetail.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).videoDetail(videoDetail.query),
    {
      module: 'video_detail',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('video_detail_info rejects a comment count that is text', async () => {
  const upstream = structuredClone(videoDetailInfo.response.body);
  (upstream as { commentCount: unknown }).commentCount = '682';

  await expectUpstreamShapeRejection(
    replay(upstream).videoDetailInfo(videoDetailInfo.query),
    {
      module: 'video_detail_info',
      path: 'body.commentCount',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('video_timeline_all rejects a video whose id is a number', async () => {
  const upstream = structuredClone(videoTimelineAll.response.body);
  const entry = upstream.datas[0] as { data: { vid: unknown } };
  entry.data.vid = 419296;

  await expectUpstreamShapeRejection(
    replay(upstream).videoTimelineAll(videoTimelineAll.query),
    {
      module: 'video_timeline_all',
      path: 'body.datas[0].data.vid',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('video_timeline_all rejects a video entry without data', async () => {
  const upstream = structuredClone(videoTimelineAll.response.body);
  (upstream.datas[0] as { data: unknown }).data = 'BFB0ABD6';

  await expectUpstreamShapeRejection(
    replay(upstream).videoTimelineAll(videoTimelineAll.query),
    {
      module: 'video_timeline_all',
      path: 'body.datas[0].data',
      expected: 'object',
      actual: 'string',
    },
  );
});

test('video_timeline_recommend rejects a recommend list that is not an array', async () => {
  const upstream = structuredClone(videoTimelineRecommend.response.body) as {
    datas: unknown;
  };
  upstream.datas = {};

  await expectUpstreamShapeRejection(
    replay(upstream).videoTimelineRecommend(videoTimelineRecommend.query),
    {
      module: 'video_timeline_recommend',
      path: 'body.datas',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('video_url rejects an address that is null', async () => {
  const upstream = structuredClone(videoUrl.response.body);
  (upstream.urls[0] as { url: unknown }).url = null;

  await expectUpstreamShapeRejection(
    replay(upstream).videoUrl(videoUrl.query),
    {
      module: 'video_url',
      path: 'body.urls[0].url',
      expected: 'string',
      actual: 'null',
    },
  );
});

test('video_url rejects an address list that is not an array', async () => {
  const upstream = structuredClone(videoUrl.response.body) as {
    urls: unknown;
  };
  upstream.urls = null;

  await expectUpstreamShapeRejection(
    replay(upstream).videoUrl(videoUrl.query),
    {
      module: 'video_url',
      path: 'body.urls',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('video_group rejects a body without a return code', async () => {
  const upstream = structuredClone(videoGroup.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).videoGroup(videoGroup.query),
    {
      module: 'video_group',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('related_allvideo rejects a body without a return code', async () => {
  const upstream = structuredClone(relatedAllvideo.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).relatedAllvideo(relatedAllvideo.query),
    {
      module: 'related_allvideo',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('video_timeline_all drops a bad counter and keeps undeclared fields', async () => {
  const upstream = structuredClone(videoTimelineAll.response.body);
  const entry = upstream.datas[0] as {
    data: Record<string, unknown> & {
      commentCount: unknown;
      markTypes: unknown;
    };
  };
  entry.data.commentCount = '682';
  entry.data.markTypes = '110';
  (upstream as { rcmdLimit: unknown }).rcmdLimit = '48';
  entry.data.relatedInfo = { kept: true };

  const result = await replay(upstream).videoTimelineAll(
    videoTimelineAll.query,
  );
  const firstVideo = result.body.datas[0]?.data as
    | Record<string, unknown>
    | undefined;

  expect(firstVideo).not.toHaveProperty('commentCount');
  expect(firstVideo).not.toHaveProperty('markTypes');
  expect(result.body as unknown).not.toHaveProperty('rcmdLimit');
  expect(firstVideo?.relatedInfo).toEqual({ kept: true });
});

test('video_timeline_all keeps a recorded empty page unchanged', async () => {
  const result = await replay(
    videoTimelineAllEmpty.response.body,
  ).videoTimelineAll(videoTimelineAllEmpty.query);

  expect(result.body.datas).toEqual([]);
  expect(result.body.hasmore).toBe(false);
});

test('video_timeline_recommend keeps a recorded empty page unchanged', async () => {
  const result = await replay(
    videoTimelineRecommendEmpty.response.body,
  ).videoTimelineRecommend(videoTimelineRecommendEmpty.query);

  expect(result.body.datas).toEqual([]);
  expect(result.body.hasmore).toBe(false);
  expect(result.body.msg).toBe('暂无推荐视频，请稍后再试');
});

test('video_timeline_recommend drops bad playback info and keeps a null preview url', async () => {
  const upstream = structuredClone(videoTimelineRecommend.response.body);
  const entry = upstream.datas[0] as { data: { urlInfo: unknown } };
  entry.data.urlInfo = '480p';

  const result = await replay(upstream).videoTimelineRecommend(
    videoTimelineRecommend.query,
  );
  const firstVideo = result.body.datas[0]?.data;

  expect(firstVideo as unknown).not.toHaveProperty('urlInfo');
  expect(firstVideo?.previewUrl as unknown).toBeNull();
});

test('video_detail drops a bad resolution list and keeps undeclared fields', async () => {
  const upstream = structuredClone(videoDetail.response.body);
  (upstream.data as { resolutions: unknown }).resolutions = '720';
  (upstream.data as { markTypes: unknown }).markTypes = [110];
  (upstream.data as Record<string, unknown>).extra = 'kept';

  const result = await replay(upstream).videoDetail(videoDetail.query);

  expect(result.body.data as unknown).not.toHaveProperty('resolutions');
  expect((result.body.data as Record<string, unknown>).markTypes).toEqual([
    110,
  ]);
  expect((result.body.data as Record<string, unknown>).extra).toBe('kept');
});

test('video_category_list drops a bad name and keeps a null abExtInfo', async () => {
  const upstream = structuredClone(videoCategoryList.response.body);
  (upstream.data[0] as { name: unknown }).name = 1;

  const result = await replay(upstream).videoCategoryList(
    videoCategoryList.query,
  );

  expect(result.body.data[0] as unknown).not.toHaveProperty('name');
  expect((result.body.data[0] as Record<string, unknown>).abExtInfo).toBeNull();
});

test('video_group_list keeps the undeclared related video type', async () => {
  const upstream = structuredClone(videoGroupList.response.body);
  (upstream.data[0] as { relatedVideoType: unknown }).relatedVideoType =
    'TRANSVERSE';

  const result = await replay(upstream).videoGroupList(videoGroupList.query);

  expect(
    (result.body.data[0] as Record<string, unknown>).relatedVideoType,
  ).toBe('TRANSVERSE');
});

test('video_group drops a bad hasmore flag and keeps the null list', async () => {
  const upstream = structuredClone(videoGroup.response.body);
  (upstream as { hasmore: unknown }).hasmore = 'false';

  const result = await replay(upstream).videoGroup(videoGroup.query);

  expect(result.body as unknown).not.toHaveProperty('hasmore');
  expect((result.body as Record<string, unknown>).datas).toBeNull();
  expect((result.body as Record<string, unknown>).msg).toBeNull();
});

test('related_allvideo keeps an undeclared related list unchanged', async () => {
  const upstream = structuredClone(relatedAllvideo.response.body) as {
    data: unknown;
  };
  upstream.data = [{ vid: 'BFB0ABD6F5B0F069D3AC90021A1E680E' }];

  const result = await replay(upstream).relatedAllvideo(relatedAllvideo.query);

  expect((result.body as Record<string, unknown>).data).toEqual([
    { vid: 'BFB0ABD6F5B0F069D3AC90021A1E680E' },
  ]);
});

test('video_detail_info drops a liked flag that is not boolean', async () => {
  const upstream = structuredClone(videoDetailInfo.response.body);
  (upstream as { liked: unknown }).liked = 'false';

  const result = await replay(upstream).videoDetailInfo(videoDetailInfo.query);

  expect(result.body as unknown).not.toHaveProperty('liked');
});

test('video_detail_info rejects a non-primitive vid locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(videoDetailInfo.response.body);
    },
  });

  expect(await settle(api.videoDetailInfo({ vid: {} }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'vid must be a primitive value' },
    },
  });
  expect(requests).toBe(0);
});

test('video bodies type tightened ids and loose fields', () => {
  expectTypeOf<
    VideoCategoryListBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<VideoCategoryListBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    VideoGroupListBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<VideoDetailBody['data']['vid']>().toEqualTypeOf<string>();
  expectTypeOf<VideoDetailBody['data']['subscribeCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<VideoDetailInfoBody['commentCount']>().toEqualTypeOf<number>();
  expectTypeOf<
    VideoTimelineAllBody['datas'][number]['data']['vid']
  >().toEqualTypeOf<string>();
  expectTypeOf<VideoTimelineAllBody['rcmdLimit']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    NonNullable<
      VideoTimelineRecommendBody['datas'][number]['data']['urlInfo']
    >['url']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<VideoUrlBody['urls'][number]['url']>().toEqualTypeOf<string>();
  expectTypeOf<VideoGroupBody['hasmore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<RelatedAllvideoBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
});
