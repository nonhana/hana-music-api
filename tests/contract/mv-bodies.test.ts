import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  MvAllBody,
  MvDetailBody,
  MvDetailInfoBody,
  MvExclusiveRcmdBody,
  MvFirstBody,
  MvSublistBody,
  MvUrlBody,
  TopMvBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import mvAll from '../fixtures/netease/mv/mv_all.default.json';
import mvAllPageTwo from '../fixtures/netease/mv/mv_all.page-two.json';
import mvDetail from '../fixtures/netease/mv/mv_detail.default.json';
import mvDetailNullDesc from '../fixtures/netease/mv/mv_detail.null-desc.json';
import mvDetailInfo from '../fixtures/netease/mv/mv_detail_info.default.json';
import mvExclusiveRcmd from '../fixtures/netease/mv/mv_exclusive_rcmd.default.json';
import mvExclusiveRcmdNoResult from '../fixtures/netease/mv/mv_exclusive_rcmd.no-result.json';
import mvFirst from '../fixtures/netease/mv/mv_first.default.json';
import mvFirstEmptyArea from '../fixtures/netease/mv/mv_first.empty-area.json';
import mvSublistAnonymous from '../fixtures/netease/mv/mv_sublist.anonymous.json';
import mvSublist from '../fixtures/netease/mv/mv_sublist.default.json';
import mvUrl720p from '../fixtures/netease/mv/mv_url.720p.json';
import mvUrl from '../fixtures/netease/mv/mv_url.default.json';
import mvUrlUnavailable from '../fixtures/netease/mv/mv_url.unavailable.json';
import topMv from '../fixtures/netease/mv/top_mv.default.json';

// issue #102 B9 的匿名录制；mv_sublist 的非空录制来自本机已登录账号（context.viewer 是 authenticated），
// anonymous 录制只用于空列表证据。匿名与登录逐字段 diff 无结构差异。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

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
    name: 'mv_all',
    recording: mvAll,
    bodySchema: MvAllBody,
    call: (upstream, status) => replay(upstream, status).mvAll(mvAll.query),
  },
  {
    name: 'mv_all second page without a count',
    recording: mvAllPageTwo,
    bodySchema: MvAllBody,
    call: (upstream, status) =>
      replay(upstream, status).mvAll(mvAllPageTwo.query),
  },
  {
    name: 'mv_first',
    recording: mvFirst,
    bodySchema: MvFirstBody,
    call: (upstream, status) => replay(upstream, status).mvFirst(mvFirst.query),
  },
  {
    name: 'mv_first without records',
    recording: mvFirstEmptyArea,
    bodySchema: MvFirstBody,
    call: (upstream, status) =>
      replay(upstream, status).mvFirst(mvFirstEmptyArea.query),
  },
  {
    name: 'mv_exclusive_rcmd',
    recording: mvExclusiveRcmd,
    bodySchema: MvExclusiveRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).mvExclusiveRcmd(mvExclusiveRcmd.query),
  },
  {
    name: 'mv_exclusive_rcmd without records',
    recording: mvExclusiveRcmdNoResult,
    bodySchema: MvExclusiveRcmdBody,
    call: (upstream, status) =>
      replay(upstream, status).mvExclusiveRcmd(mvExclusiveRcmdNoResult.query),
  },
  {
    name: 'top_mv',
    recording: topMv,
    bodySchema: TopMvBody,
    call: (upstream, status) => replay(upstream, status).topMv(topMv.query),
  },
  {
    name: 'mv_detail',
    recording: mvDetail,
    bodySchema: MvDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).mvDetail(mvDetail.query),
  },
  {
    name: 'mv_detail with a null description',
    recording: mvDetailNullDesc,
    bodySchema: MvDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).mvDetail(mvDetailNullDesc.query),
  },
  {
    name: 'mv_detail_info',
    recording: mvDetailInfo,
    bodySchema: MvDetailInfoBody,
    call: (upstream, status) =>
      replay(upstream, status).mvDetailInfo(mvDetailInfo.query),
  },
  {
    name: 'mv_url',
    recording: mvUrl,
    bodySchema: MvUrlBody,
    call: (upstream, status) => replay(upstream, status).mvUrl(mvUrl.query),
  },
  {
    name: 'mv_url at 720p',
    recording: mvUrl720p,
    bodySchema: MvUrlBody,
    call: (upstream, status) => replay(upstream, status).mvUrl(mvUrl720p.query),
  },
  {
    name: 'mv_url without a playable address',
    recording: mvUrlUnavailable,
    bodySchema: MvUrlBody,
    call: (upstream, status) =>
      replay(upstream, status).mvUrl(mvUrlUnavailable.query),
  },
  {
    name: 'mv_sublist',
    recording: mvSublist,
    bodySchema: MvSublistBody,
    call: (upstream, status) =>
      replay(upstream, status).mvSublist(mvSublist.query),
  },
  {
    name: 'mv_sublist when anonymous',
    recording: mvSublistAnonymous,
    bodySchema: MvSublistBody,
    call: (upstream, status) =>
      replay(upstream, status).mvSublist(mvSublistAnonymous.query),
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

test('mv_all rejects an MV whose id is text', async () => {
  const upstream = structuredClone(mvAll.response.body);
  (upstream.data[0] as { id: unknown }).id = '5643323';

  await expectUpstreamShapeRejection(replay(upstream).mvAll(mvAll.query), {
    module: 'mv_all',
    path: 'body.data[0].id',
    expected: 'number',
    actual: 'string',
  });
});

test('mv_first rejects an MV without an id', async () => {
  const upstream = structuredClone(mvFirst.response.body);
  delete (upstream.data[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(replay(upstream).mvFirst(mvFirst.query), {
    module: 'mv_first',
    path: 'body.data[0].id',
    expected: 'present',
    actual: 'missing',
  });
});

test('mv_exclusive_rcmd rejects an MV whose id is null', async () => {
  const upstream = structuredClone(mvExclusiveRcmd.response.body);
  (upstream.data[0] as { id: unknown }).id = null;

  await expectUpstreamShapeRejection(
    replay(upstream).mvExclusiveRcmd(mvExclusiveRcmd.query),
    {
      module: 'mv_exclusive_rcmd',
      path: 'body.data[0].id',
      expected: 'number',
      actual: 'null',
    },
  );
});

test('top_mv rejects a ranked MV whose id is text', async () => {
  const upstream = structuredClone(topMv.response.body);
  (upstream.data[0] as { id: unknown }).id = '34810579';

  await expectUpstreamShapeRejection(replay(upstream).topMv(topMv.query), {
    module: 'top_mv',
    path: 'body.data[0].id',
    expected: 'number',
    actual: 'string',
  });
});

test('mv_detail rejects a detail whose id is text', async () => {
  const upstream = structuredClone(mvDetail.response.body);
  (upstream.data as { id: unknown }).id = '14634962';

  await expectUpstreamShapeRejection(
    replay(upstream).mvDetail(mvDetail.query),
    {
      module: 'mv_detail',
      path: 'body.data.id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('mv_url rejects an address that is not text or null', async () => {
  const upstream = structuredClone(mvUrl.response.body);
  (upstream.data as { url: unknown }).url = 1080;

  await expectUpstreamShapeRejection(replay(upstream).mvUrl(mvUrl.query), {
    module: 'mv_url',
    path: 'body.data.url',
    expected: 'string | null',
    actual: 'number',
  });
});

test('mv_detail_info rejects a comment count that is text', async () => {
  const upstream = structuredClone(mvDetailInfo.response.body);
  (upstream as { commentCount: unknown }).commentCount = '544';

  await expectUpstreamShapeRejection(
    replay(upstream).mvDetailInfo(mvDetailInfo.query),
    {
      module: 'mv_detail_info',
      path: 'body.commentCount',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('mv_sublist rejects a video whose id is a number', async () => {
  const upstream = structuredClone(mvSublist.response.body);
  (upstream.data[0] as { vid: unknown }).vid = 419296;

  await expectUpstreamShapeRejection(
    replay(upstream).mvSublist(mvSublist.query),
    {
      module: 'mv_sublist',
      path: 'body.data[0].vid',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('mv_all drops an MV play count that is text and keeps a null name', async () => {
  const upstream = structuredClone(mvAll.response.body);
  (upstream.data[0] as { playCount: unknown }).playCount = '219552';
  (upstream.data[0] as { name: unknown }).name = null;

  const result = await replay(upstream).mvAll(mvAll.query);

  expect(result.body.data[0] as unknown).not.toHaveProperty('playCount');
  expect(result.body.data[0]?.name).toBeNull();
});

test('mv_first drops an alias list that is not an array and keeps a null cover', async () => {
  const upstream = structuredClone(mvFirst.response.body);
  (upstream.data[0] as { alias: unknown }).alias = '诗画中国';
  (upstream.data[0] as { cover: unknown }).cover = null;

  const result = await replay(upstream).mvFirst(mvFirst.query);

  expect(result.body.data[0] as unknown).not.toHaveProperty('alias');
  expect(result.body.data[0]?.cover).toBeNull();
});

test('mv_exclusive_rcmd drops a non-boolean more flag', async () => {
  const upstream = structuredClone(mvExclusiveRcmd.response.body);
  (upstream as { more: unknown }).more = 'true';

  const result = await replay(upstream).mvExclusiveRcmd(mvExclusiveRcmd.query);

  expect(result.body as unknown).not.toHaveProperty('more');
});

test('top_mv drops a nested MV score that is text and keeps a null rank', async () => {
  const upstream = structuredClone(topMv.response.body);
  const record = upstream.data[0] as {
    lastRank: unknown;
    mv: { score: unknown };
  };
  record.mv.score = '260';
  record.lastRank = null;

  const result = await replay(upstream).topMv(topMv.query);

  expect(result.body.data[0]?.mv as unknown).not.toHaveProperty('score');
  expect(result.body.data[0]?.lastRank).toBeNull();
});

test('mv_detail drops a bitrate size that is text and keeps undeclared fields', async () => {
  const upstream = structuredClone(mvDetail.response.body);
  (upstream.data.brs[0] as { size: unknown }).size = '11667742';
  (upstream.data.brs[0] as Record<string, unknown>).extra = 'kept';

  const result = await replay(upstream).mvDetail(mvDetail.query);

  expect(result.body.data.brs?.[0] as unknown).not.toHaveProperty('size');
  expect(result.body.data.brs?.[0] as unknown).toHaveProperty('extra', 'kept');
  expect(result.body.data.price).toBeNull();
  expect(result.body.data.videoGroup as unknown).toEqual([]);
});

test('mv_url drops an md5 that is not text and keeps a null message', async () => {
  const upstream = structuredClone(mvUrl.response.body);
  (upstream.data as { md5: unknown }).md5 = 1;
  (upstream.data as { msg: unknown }).msg = null;

  const result = await replay(upstream).mvUrl(mvUrl.query);

  expect(result.body.data as unknown).not.toHaveProperty('md5');
  expect(result.body.data.msg).toBeNull();
  expect(result.body.data.promotionVo as unknown).toBeNull();
});

test('mv_sublist drops a play time that is text and keeps a null alias', async () => {
  const upstream = structuredClone(mvSublist.response.body);
  (upstream.data[0] as { playTime: unknown }).playTime = '4040516';
  (upstream.data[0] as { aliaName: unknown }).aliaName = null;

  const result = await replay(upstream).mvSublist(mvSublist.query);

  expect(result.body.data[0] as unknown).not.toHaveProperty('playTime');
  expect(result.body.data[0]?.aliaName).toBeNull();
  expect(result.body.data[0]?.alg as unknown).toBeNull();
});

test('mv_detail_info drops a liked flag that is not boolean', async () => {
  const upstream = structuredClone(mvDetailInfo.response.body);
  (upstream as { liked: unknown }).liked = 'false';

  const result = await replay(upstream).mvDetailInfo(mvDetailInfo.query);

  expect(result.body as unknown).not.toHaveProperty('liked');
});

test('mv_detail_info rejects a non-primitive mvid locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(mvDetailInfo.response.body);
    },
  });

  expect(await settle(api.mvDetailInfo({ mvid: {} }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'mvid must be a primitive value' },
    },
  });
  expect(requests).toBe(0);
});

test('MV bodies type tightened ids and loose fields', () => {
  expectTypeOf<MvAllBody['data'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<MvAllBody['count']>().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<MvFirstBody['data'][number]['alias']>().toEqualTypeOf<
    ReadonlyArray<string> | null | undefined
  >();
  expectTypeOf<MvExclusiveRcmdBody['more']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<TopMvBody['data'][number]['lastRank']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<MvDetailBody['data']['id']>().toEqualTypeOf<number>();
  expectTypeOf<MvUrlBody['data']['url']>().toEqualTypeOf<string | null>();
  expectTypeOf<MvSublistBody['data'][number]['vid']>().toEqualTypeOf<string>();
  expectTypeOf<MvDetailInfoBody['commentCount']>().toEqualTypeOf<number>();
});
