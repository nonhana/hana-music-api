import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  DjBannerBody,
  DjCategoryExcludehotBody,
  DjCategoryRecommendBody,
  DjCatelistBody,
  DjDetailBody,
  DjHotBody,
  DjPaygiftBody,
  DjRadioHotBody,
  DjRecommendBody,
  DjRecommendTypeBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import djBanner from '../fixtures/netease/dj/dj_banner.default.json';
import djCategoryExcludehot from '../fixtures/netease/dj/dj_category_excludehot.default.json';
import djCategoryRecommend from '../fixtures/netease/dj/dj_category_recommend.default.json';
import djCatelist from '../fixtures/netease/dj/dj_catelist.default.json';
import djDetail from '../fixtures/netease/dj/dj_detail.default.json';
import djDetailMissingParam from '../fixtures/netease/dj/dj_detail.missing-param.json';
import djDetailOfficial from '../fixtures/netease/dj/dj_detail.official.json';
import djDetailPaid from '../fixtures/netease/dj/dj_detail.paid.json';
import djDetailUnknownRid from '../fixtures/netease/dj/dj_detail.unknown-rid.json';
import djHot from '../fixtures/netease/dj/dj_hot.default.json';
import djHotEmpty from '../fixtures/netease/dj/dj_hot.empty.json';
import djHotInvalidLimit from '../fixtures/netease/dj/dj_hot.invalid-limit.json';
import djPaygift from '../fixtures/netease/dj/dj_paygift.default.json';
import djPaygiftEmpty from '../fixtures/netease/dj/dj_paygift.empty.json';
import djPaygiftInvalidLimit from '../fixtures/netease/dj/dj_paygift.invalid-limit.json';
import djRadioHot from '../fixtures/netease/dj/dj_radio_hot.default.json';
import djRadioHotEmptyCate from '../fixtures/netease/dj/dj_radio_hot.empty-cate.json';
import djRadioHotEmpty from '../fixtures/netease/dj/dj_radio_hot.empty.json';
import djRadioHotInvalidLimit from '../fixtures/netease/dj/dj_radio_hot.invalid-limit.json';
import djRadioHotMissingParam from '../fixtures/netease/dj/dj_radio_hot.missing-param.json';
import djRecommend from '../fixtures/netease/dj/dj_recommend.default.json';
import djRecommendType from '../fixtures/netease/dj/dj_recommend_type.default.json';
import djRecommendTypeEmpty from '../fixtures/netease/dj/dj_recommend_type.empty.json';
import djRecommendTypeMissingParam from '../fixtures/netease/dj/dj_recommend_type.missing-param.json';

// issue #102 B11 的匿名录制：10 个模块，17 份正常/空结果录制和 7 份异常路径录制。本批未保留
// 登录对照，不对公开结构作相同性断言。dj_radio_hot 的录制是按字段覆盖截取的非连续子集。
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
    name: 'dj_banner',
    recording: djBanner,
    bodySchema: DjBannerBody,
    call: (upstream, status) =>
      replay(upstream, status).djBanner(djBanner.query),
  },
  {
    name: 'dj_catelist',
    recording: djCatelist,
    bodySchema: DjCatelistBody,
    call: (upstream, status) =>
      replay(upstream, status).djCatelist(djCatelist.query),
  },
  {
    name: 'dj_category_excludehot',
    recording: djCategoryExcludehot,
    bodySchema: DjCategoryExcludehotBody,
    call: (upstream, status) =>
      replay(upstream, status).djCategoryExcludehot(djCategoryExcludehot.query),
  },
  {
    name: 'dj_category_recommend',
    recording: djCategoryRecommend,
    bodySchema: DjCategoryRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).djCategoryRecommend(djCategoryRecommend.query),
  },
  {
    name: 'dj_detail',
    recording: djDetail,
    bodySchema: DjDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).djDetail(djDetail.query),
  },
  {
    name: 'dj_detail for the official account radio',
    recording: djDetailOfficial,
    bodySchema: DjDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).djDetail(djDetailOfficial.query),
  },
  {
    name: 'dj_detail for a paid radio',
    recording: djDetailPaid,
    bodySchema: DjDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).djDetail(djDetailPaid.query),
  },
  {
    name: 'dj_hot',
    recording: djHot,
    bodySchema: DjHotBody,
    call: (upstream, status) => replay(upstream, status).djHot(djHot.query),
  },
  {
    name: 'dj_hot past the last page',
    recording: djHotEmpty,
    bodySchema: DjHotBody,
    call: (upstream, status) =>
      replay(upstream, status).djHot(djHotEmpty.query),
  },
  {
    name: 'dj_radio_hot',
    recording: djRadioHot,
    bodySchema: DjRadioHotBody,
    call: (upstream, status) =>
      replay(upstream, status).djRadioHot(djRadioHot.query),
  },
  {
    name: 'dj_radio_hot past the last page',
    recording: djRadioHotEmpty,
    bodySchema: DjRadioHotBody,
    call: (upstream, status) =>
      replay(upstream, status).djRadioHot(djRadioHotEmpty.query),
  },
  {
    name: 'dj_radio_hot for an unknown category',
    recording: djRadioHotEmptyCate,
    bodySchema: DjRadioHotBody,
    call: (upstream, status) =>
      replay(upstream, status).djRadioHot(djRadioHotEmptyCate.query),
  },
  {
    name: 'dj_recommend',
    recording: djRecommend,
    bodySchema: DjRecommendBody,
    call: (upstream, status) =>
      replay(upstream, status).djRecommend(djRecommend.query),
  },
  {
    name: 'dj_recommend_type',
    recording: djRecommendType,
    bodySchema: DjRecommendTypeBody,
    call: (upstream, status) =>
      replay(upstream, status).djRecommendType(djRecommendType.query),
  },
  {
    name: 'dj_recommend_type for an unknown category',
    recording: djRecommendTypeEmpty,
    bodySchema: DjRecommendTypeBody,
    call: (upstream, status) =>
      replay(upstream, status).djRecommendType(djRecommendTypeEmpty.query),
  },
  {
    name: 'dj_paygift',
    recording: djPaygift,
    bodySchema: DjPaygiftBody,
    call: (upstream, status) =>
      replay(upstream, status).djPaygift(djPaygift.query),
  },
  {
    name: 'dj_paygift past the last page',
    recording: djPaygiftEmpty,
    bodySchema: DjPaygiftBody,
    call: (upstream, status) =>
      replay(upstream, status).djPaygift(djPaygiftEmpty.query),
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
  status: number;
  call: (upstream: unknown, status: number) => Promise<unknown>;
  recording: Recording;
}>([
  {
    name: 'dj_detail without rid',
    status: 400,
    recording: djDetailMissingParam,
    call: (upstream, status) =>
      replay(upstream, status).djDetail(djDetailMissingParam.query),
  },
  {
    name: 'dj_detail for an unknown rid',
    status: 404,
    recording: djDetailUnknownRid,
    call: (upstream, status) =>
      replay(upstream, status).djDetail(djDetailUnknownRid.query),
  },
  {
    name: 'dj_hot with a non-numeric limit',
    status: 400,
    recording: djHotInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djHot(djHotInvalidLimit.query),
  },
  {
    name: 'dj_radio_hot without cateId',
    status: 400,
    recording: djRadioHotMissingParam,
    call: (upstream, status) =>
      replay(upstream, status).djRadioHot(djRadioHotMissingParam.query),
  },
  {
    name: 'dj_radio_hot with a non-numeric limit',
    status: 400,
    recording: djRadioHotInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djRadioHot(djRadioHotInvalidLimit.query),
  },
  {
    name: 'dj_recommend_type without type',
    status: 400,
    recording: djRecommendTypeMissingParam,
    call: (upstream, status) =>
      replay(upstream, status).djRecommendType(
        djRecommendTypeMissingParam.query,
      ),
  },
  {
    name: 'dj_paygift with a non-numeric limit',
    status: 400,
    recording: djPaygiftInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).djPaygift(djPaygiftInvalidLimit.query),
  },
])('$name is rejected with the upstream status', async (entry) => {
  expect(await settle(entry.call(entry.recording.response.body, 200))).toEqual({
    rejected: {
      status: entry.status,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('dj_banner rejects a body without the banner list', async () => {
  const upstream = structuredClone(djBanner.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).djBanner(djBanner.query),
    {
      module: 'dj_banner',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_catelist rejects a category without an id', async () => {
  const upstream = structuredClone(djCatelist.response.body);
  delete (upstream.categories[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djCatelist(djCatelist.query),
    {
      module: 'dj_catelist',
      path: 'body.categories[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_category_excludehot rejects a category whose id is text', async () => {
  const upstream = structuredClone(djCategoryExcludehot.response.body);
  (upstream.data[0] as { id: unknown }).id = '11';

  await expectUpstreamShapeRejection(
    replay(upstream).djCategoryExcludehot(djCategoryExcludehot.query),
    {
      module: 'dj_category_excludehot',
      path: 'body.data[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_category_recommend rejects a category without a category id', async () => {
  const upstream = structuredClone(djCategoryRecommend.response.body);
  delete (upstream.data[0] as { categoryId?: unknown }).categoryId;

  await expectUpstreamShapeRejection(
    replay(upstream).djCategoryRecommend(djCategoryRecommend.query),
    {
      module: 'dj_category_recommend',
      path: 'body.data[0].categoryId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_category_recommend rejects a radio without an id', async () => {
  const upstream = structuredClone(djCategoryRecommend.response.body);
  delete (upstream.data[0]!.radios[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djCategoryRecommend(djCategoryRecommend.query),
    {
      module: 'dj_category_recommend',
      path: 'body.data[0].radios[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_detail rejects a detail whose id is text', async () => {
  const upstream = structuredClone(djDetail.response.body);
  (upstream.data as { id: unknown }).id = '792544462';

  await expectUpstreamShapeRejection(
    replay(upstream).djDetail(djDetail.query),
    {
      module: 'dj_detail',
      path: 'body.data.id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('dj_detail rejects a body without detail data', async () => {
  const upstream = structuredClone(djDetail.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).djDetail(djDetail.query),
    {
      module: 'dj_detail',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('dj_hot rejects a radio without an id', async () => {
  const upstream = structuredClone(djHot.response.body);
  delete (upstream.djRadios[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(replay(upstream).djHot(djHot.query), {
    module: 'dj_hot',
    path: 'body.djRadios[0].id',
    expected: 'present',
    actual: 'missing',
  });
});

test('dj_hot rejects a body without a return code', async () => {
  const upstream = structuredClone(djHot.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(replay(upstream).djHot(djHot.query), {
    module: 'dj_hot',
    path: 'body.code',
    expected: 'present',
    actual: 'missing',
  });
});

test('dj_radio_hot rejects a radio whose id is null', async () => {
  const upstream = structuredClone(djRadioHot.response.body);
  (upstream.djRadios[0] as { id: unknown }).id = null;

  await expectUpstreamShapeRejection(
    replay(upstream).djRadioHot(djRadioHot.query),
    {
      module: 'dj_radio_hot',
      path: 'body.djRadios[0].id',
      expected: 'number',
      actual: 'null',
    },
  );
});

test('dj_recommend rejects a body without the radio list', async () => {
  const upstream = structuredClone(djRecommend.response.body) as {
    djRadios?: unknown;
  };
  delete upstream.djRadios;

  await expectUpstreamShapeRejection(
    replay(upstream).djRecommend(djRecommend.query),
    {
      module: 'dj_recommend',
      path: 'body.djRadios',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_recommend_type rejects a radio list that is not an array', async () => {
  const upstream = structuredClone(djRecommendType.response.body) as {
    djRadios: unknown;
  };
  upstream.djRadios = {};

  await expectUpstreamShapeRejection(
    replay(upstream).djRecommendType(djRecommendType.query),
    {
      module: 'dj_recommend_type',
      path: 'body.djRadios',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('dj_paygift rejects a paid radio without an id', async () => {
  const upstream = structuredClone(djPaygift.response.body);
  delete (upstream.data.list[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).djPaygift(djPaygift.query),
    {
      module: 'dj_paygift',
      path: 'body.data.list[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('dj_banner drops a bad picture and keeps undeclared fields', async () => {
  const upstream = structuredClone(djBanner.response.body);
  (upstream.data[0] as { pic: unknown }).pic = 1;
  (upstream.data[0] as Record<string, unknown>).trace = 'kept';

  const result = await replay(upstream).djBanner(djBanner.query);

  expect(result.body.data[0] as unknown).not.toHaveProperty('pic');
  expect((result.body.data[0] as Record<string, unknown>).trace).toBe('kept');
});

test('dj_banner drops a missing loose field', async () => {
  const upstream = structuredClone(djBanner.response.body);
  delete (upstream.data[0] as { typeTitle?: unknown }).typeTitle;

  const result = await replay(upstream).djBanner(djBanner.query);

  expect(result.body.data[0] as unknown).not.toHaveProperty('typeTitle');
  expect((result.body.data[0] as Record<string, unknown>).url).toBe(
    'orpheus://program/3730800343',
  );
});

test('dj_catelist drops a bad name and keeps an undeclared field', async () => {
  const upstream = structuredClone(djCatelist.response.body);
  (upstream.categories[0] as { name: unknown }).name = 1;
  (upstream.categories[0] as Record<string, unknown>).extra = 'kept';

  const result = await replay(upstream).djCatelist(djCatelist.query);

  expect(result.body.categories[0] as unknown).not.toHaveProperty('name');
  expect((result.body.categories[0] as Record<string, unknown>).extra).toBe(
    'kept',
  );
});

test('dj_category_excludehot drops a bad picture url and keeps a null field', async () => {
  const upstream = structuredClone(djCategoryExcludehot.response.body);
  (upstream.data[0] as { picWebUrl: unknown }).picWebUrl = 123;

  const result = await replay(upstream).djCategoryExcludehot(
    djCategoryExcludehot.query,
  );

  expect(result.body.data[0] as unknown).not.toHaveProperty('picWebUrl');
  expect((result.body.data[0] as Record<string, unknown>).name).toBe('知识');
});

test('dj_category_recommend drops a bad icon and keeps null price fields', async () => {
  const upstream = structuredClone(djCategoryRecommend.response.body);
  (upstream.data[0]!.radios[0] as { icon: unknown }).icon = 'exclusive';

  const result = await replay(upstream).djCategoryRecommend(
    djCategoryRecommend.query,
  );
  const radio = result.body.data[0]?.radios[0] as
    | Record<string, unknown>
    | undefined;

  expect(radio).not.toHaveProperty('icon');
  expect(radio?.originalPrice).toBeNull();
  expect(radio?.discountPrice).toBeNull();
});

test('dj_detail drops comment data with a bad element and keeps undeclared fields', async () => {
  const upstream = structuredClone(djDetail.response.body);
  (upstream.data.commentDatas as Array<unknown>)[0] = 'bad';
  (upstream.data as Record<string, unknown>).labels = ['kept'];

  const result = await replay(upstream).djDetail(djDetail.query);

  expect(result.body.data as unknown).not.toHaveProperty('commentDatas');
  expect((result.body.data as Record<string, unknown>).labels).toEqual([
    'kept',
  ]);
});

test('dj_detail keeps the paid fee info structure', async () => {
  const result = await replay(djDetailPaid.response.body).djDetail(
    djDetailPaid.query,
  );
  const feeInfo = result.body.data.feeInfo as
    | Record<string, unknown>
    | null
    | undefined;
  const modules = (feeInfo?.modules ?? []) as ReadonlyArray<{
    data: unknown;
  }>;
  const programs = modules.flatMap((module_) =>
    Array.isArray(module_.data) ? module_.data : [],
  );

  expect(feeInfo?.price).toBe(1290);
  expect(feeInfo?.finished).toBe(true);
  expect(modules).toHaveLength(4);
  expect(programs).toHaveLength(5);
  expect((programs[0] as Record<string, unknown>).name).toBe('青梅屿 第12集');
  const withSong = programs.find(
    (program) => (program as Record<string, unknown>).mainSong !== null,
  ) as { mainSong: { name: string } } | undefined;
  expect(withSong?.mainSong.name).toBe('青梅屿 预告');
  expect(feeInfo?.videos).toEqual({});
});

test('dj_hot drops a bad copywriter and keeps undeclared radio fields', async () => {
  const upstream = structuredClone(djHot.response.body);
  (upstream.djRadios[0] as { copywriter: unknown }).copywriter = 1;
  (upstream as { hasMore: unknown }).hasMore = 'true';
  (upstream.djRadios[0] as Record<string, unknown>).shortName = 'kept';

  const result = await replay(upstream).djHot(djHot.query);

  expect(result.body.djRadios[0] as unknown).not.toHaveProperty('copywriter');
  expect(result.body as unknown).not.toHaveProperty('hasMore');
  expect((result.body.djRadios[0] as Record<string, unknown>).shortName).toBe(
    'kept',
  );
});

test('dj_radio_hot drops bad description fields and keeps a null short name', async () => {
  const upstream = structuredClone(djRadioHot.response.body);
  const withDescription = upstream.djRadios.findIndex(
    (radio) => radio.descPicList !== null,
  );
  expect(withDescription).toBeGreaterThanOrEqual(0);
  (upstream.djRadios[withDescription] as { descPicList: unknown }).descPicList =
    [{ type: 'image', content: 1 }];

  const result = await replay(upstream).djRadioHot(djRadioHot.query);
  const descPic = (
    result.body.djRadios[withDescription] as Record<string, unknown>
  ).descPicList;

  expect(descPic).toEqual([{}]);
  expect(
    (result.body.djRadios[0] as Record<string, unknown>).shortName,
  ).toBeNull();
});

test('dj_recommend drops a bad name and keeps undeclared expert tags', async () => {
  const upstream = structuredClone(djRecommend.response.body);
  (upstream as { name: unknown }).name = 1;
  (upstream.djRadios[0] as { dj: Record<string, unknown> }).dj.remarkName =
    'kept';

  const result = await replay(upstream).djRecommend(djRecommend.query);
  const firstRadio = result.body.djRadios[0] as {
    dj: Record<string, unknown>;
  };

  expect(result.body as unknown).not.toHaveProperty('name');
  expect(firstRadio.dj.remarkName).toBe('kept');
});

test('dj_recommend_type drops a bad nested description and keeps its siblings', async () => {
  const upstream = structuredClone(djRecommendType.response.body);
  const withDescription = upstream.djRadios.findIndex(
    (radio) => radio.descPicList !== null,
  );
  expect(withDescription).toBeGreaterThanOrEqual(0);
  (
    upstream.djRadios[withDescription]!.descPicList![0] as {
      nestedData: unknown;
    }
  ).nestedData = 'text';

  const result = await replay(upstream).djRecommendType(djRecommendType.query);
  const descPic = (
    result.body.djRadios[withDescription] as Record<string, unknown>
  ).descPicList as Array<Record<string, unknown>>;

  expect(descPic[0]).not.toHaveProperty('nestedData');
  expect(descPic[0]?.type).toBeGreaterThanOrEqual(1);
});

test('dj_paygift drops a bad has more flag and keeps null trace ids', async () => {
  const upstream = structuredClone(djPaygift.response.body);
  (upstream.data as { hasMore: unknown }).hasMore = 'true';

  const result = await replay(upstream).djPaygift(djPaygift.query);

  expect(result.body.data as unknown).not.toHaveProperty('hasMore');
  expect(
    (result.body.data.list[0] as Record<string, unknown>).traceId,
  ).toBeNull();
});

test('dj_hot keeps the recorded empty page unchanged', async () => {
  const result = await replay(djHotEmpty.response.body).djHot(djHotEmpty.query);

  expect(result.body.djRadios).toEqual([]);
  expect(result.body.hasMore).toBe(false);
});

test('dj_radio_hot keeps the recorded empty page unchanged', async () => {
  const result = await replay(djRadioHotEmpty.response.body).djRadioHot(
    djRadioHotEmpty.query,
  );

  expect(result.body.djRadios).toEqual([]);
  expect(result.body.hasMore).toBe(false);
  expect(result.body.count).toBe(1000);
});

test('dj_radio_hot keeps the recorded unknown-category page unchanged', async () => {
  const result = await replay(djRadioHotEmptyCate.response.body).djRadioHot(
    djRadioHotEmptyCate.query,
  );

  expect(result.body.djRadios).toEqual([]);
  expect(result.body.hasMore).toBe(false);
  expect(result.body.count).toBe(0);
});

test('dj_radio_hot keeps the recorded uid lists', async () => {
  const result = await replay(djRadioHot.response.body).djRadioHot(
    djRadioHot.query,
  );

  expect(result.body.djRadios[2]?.participateUidList).toEqual([488757513]);
  expect(result.body.djRadios[3]?.operateUidList).toEqual([260352155]);
});

test('dj_recommend_type keeps the recorded empty page unchanged', async () => {
  const result = await replay(
    djRecommendTypeEmpty.response.body,
  ).djRecommendType(djRecommendTypeEmpty.query);

  expect(result.body.djRadios).toEqual([]);
  expect(result.body.hasMore).toBe(false);
});

test('dj_paygift keeps the recorded empty page unchanged', async () => {
  const result = await replay(djPaygiftEmpty.response.body).djPaygift(
    djPaygiftEmpty.query,
  );

  expect(result.body.data.list).toEqual([]);
  expect(result.body.data.hasMore).toBe(false);
});

test('dj bodies type tightened ids and loose fields', () => {
  expectTypeOf<DjBannerBody['data'][number]['targetId']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    DjCatelistBody['categories'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjCategoryExcludehotBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjCategoryRecommendBody['data'][number]['categoryId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjCategoryRecommendBody['data'][number]['radios'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<DjDetailBody['data']['id']>().toEqualTypeOf<number>();
  expectTypeOf<DjDetailBody['data']['subCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<DjHotBody['djRadios'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<DjHotBody['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    DjRadioHotBody['djRadios'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<DjRadioHotBody['count']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<DjRecommendBody['name']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    DjRecommendTypeBody['djRadios'][number]['lastUpdateProgramName']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<
    DjPaygiftBody['data']['list'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    DjRadioHotBody['djRadios'][number]['participateUidList']
  >().toEqualTypeOf<ReadonlyArray<number> | null | undefined>();
  expectTypeOf<
    NonNullable<DjDetailBody['data']['feeInfo']>['price']
  >().toEqualTypeOf<number | null | undefined>();
});
