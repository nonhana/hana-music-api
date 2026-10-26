import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  SheetListBody,
  SheetPreviewBody,
  StarpickCommentsSummaryBody,
  SummaryAnnualBody,
} from '../../index.ts';
import { getRuntimeState, setRuntimeState } from '../../src/core/runtime.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import starpickCommentsSummary from '../fixtures/netease/comment/starpick_comments_summary.default.json';
import sheetList from '../fixtures/netease/other/sheet_list.default.json';
import sheetListEmpty from '../fixtures/netease/other/sheet_list.empty.json';
import sheetPreviewAnonymous from '../fixtures/netease/other/sheet_preview.anonymous.json';
import sheetPreview from '../fixtures/netease/other/sheet_preview.default.json';
import sheetPreviewEmpty from '../fixtures/netease/other/sheet_preview.empty.json';
import summaryAnnual2018 from '../fixtures/netease/record/summary_annual.2018.json';
import summaryAnnual2019 from '../fixtures/netease/record/summary_annual.2019.json';
import summaryAnnual2022 from '../fixtures/netease/record/summary_annual.2022.json';
import summaryAnnual2023 from '../fixtures/netease/record/summary_annual.2023.json';
import summaryAnnualNoReport from '../fixtures/netease/record/summary_annual.no-report.json';

// issue #102 B44 的录制：乐谱、年度听歌报告和云村星评馆。登录对照先确认 login_status 的
// account.anonimousUser 为 false；年度报告录了 2018/2019（`userdata` 短键，2018 的
// `data.mlc` 是字符串）和 2022/2023（`data` 长键），无报告的 2025 只录业务拒绝；
// `sheet_preview` 另保留无 cookie 的匿名录制（6 页）。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

const replayAnonymous = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    fetcher: async (input) => {
      const target =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      return target.includes('/register/anonimous')
        ? Response.json(
            { code: 200 },
            { headers: { 'set-cookie': 'MUSIC_A=anonymous-token; Path=/' } },
          )
        : Response.json(upstream, { status });
    },
  });

// 匿名注册会把令牌写进进程级运行时状态；调用后恢复，避免污染同进程的其它测试。
const withRestoredRuntimeState = async <T>(
  run: () => Promise<T>,
): Promise<T> => {
  const previous = getRuntimeState();
  try {
    return await run();
  } finally {
    setRuntimeState(previous);
  }
};

type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ readonly status: number; readonly body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'sheet_list',
    recording: sheetList,
    bodySchema: SheetListBody,
    call: (upstream, status) =>
      replay(upstream, status).sheetList(sheetList.query),
  },
  {
    name: 'sheet_list without sheets',
    recording: sheetListEmpty,
    bodySchema: SheetListBody,
    call: (upstream, status) =>
      replay(upstream, status).sheetList(sheetListEmpty.query),
  },
  {
    name: 'sheet_preview',
    recording: sheetPreview,
    bodySchema: SheetPreviewBody,
    call: (upstream, status) =>
      replay(upstream, status).sheetPreview(sheetPreview.query),
  },
  {
    name: 'sheet_preview without pages',
    recording: sheetPreviewEmpty,
    bodySchema: SheetPreviewBody,
    call: (upstream, status) =>
      replay(upstream, status).sheetPreview(sheetPreviewEmpty.query),
  },
  {
    name: 'sheet_preview anonymously',
    recording: sheetPreviewAnonymous,
    bodySchema: SheetPreviewBody,
    call: (upstream, status) =>
      withRestoredRuntimeState(() =>
        replayAnonymous(upstream, status).sheetPreview(
          sheetPreviewAnonymous.query,
        ),
      ),
  },
  {
    name: 'summary_annual 2023',
    recording: summaryAnnual2023,
    bodySchema: SummaryAnnualBody,
    call: (upstream, status) =>
      replay(upstream, status).summaryAnnual(summaryAnnual2023.query),
  },
  {
    name: 'summary_annual 2022',
    recording: summaryAnnual2022,
    bodySchema: SummaryAnnualBody,
    call: (upstream, status) =>
      replay(upstream, status).summaryAnnual(summaryAnnual2022.query),
  },
  {
    name: 'summary_annual 2019',
    recording: summaryAnnual2019,
    bodySchema: SummaryAnnualBody,
    call: (upstream, status) =>
      replay(upstream, status).summaryAnnual(summaryAnnual2019.query),
  },
  {
    name: 'summary_annual 2018',
    recording: summaryAnnual2018,
    bodySchema: SummaryAnnualBody,
    call: (upstream, status) =>
      replay(upstream, status).summaryAnnual(summaryAnnual2018.query),
  },
  {
    name: 'starpick_comments_summary',
    recording: starpickCommentsSummary,
    bodySchema: StarpickCommentsSummaryBody,
    call: (upstream, status) =>
      replay(upstream, status).starpickCommentsSummary(
        starpickCommentsSummary.query,
      ),
  },
];

test.each(cases)('$name returns the recorded body', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.status).toBe(entry.recording.response.status);
  expect(result.body).toEqual(entry.recording.response.body);

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

test('summary_annual passes a year without a report through', async () => {
  expect(
    await settle(
      replay(
        summaryAnnualNoReport.response.body,
        summaryAnnualNoReport.response.status,
      ).summaryAnnual(summaryAnnualNoReport.query),
    ),
  ).toEqual({
    rejected: {
      status: 404,
      cookie: [],
      body: summaryAnnualNoReport.response.body,
    },
  });
});

test('sheet_list rejects a sheet without an id', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data: { musicSheetSimpleInfoVOS: Array<{ id?: unknown }> };
  };
  delete upstream.data.musicSheetSimpleInfoVOS[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).sheetList(sheetList.query),
    {
      module: 'sheet_list',
      path: 'body.data.musicSheetSimpleInfoVOS[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('sheet_list rejects a non-numeric sheet id', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data: { musicSheetSimpleInfoVOS: Array<{ id: unknown }> };
  };
  upstream.data.musicSheetSimpleInfoVOS[0]!.id = '245207';

  await expectUpstreamShapeRejection(
    replay(upstream).sheetList(sheetList.query),
    {
      module: 'sheet_list',
      path: 'body.data.musicSheetSimpleInfoVOS[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('sheet_list rejects a body without data', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).sheetList(sheetList.query),
    {
      module: 'sheet_list',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('sheet_list accepts null or missing sheet lists', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data: {
      musicSheetSimpleInfoVOS?: unknown;
      sheetInstrumentTypeVOList?: unknown;
    };
  };
  upstream.data.musicSheetSimpleInfoVOS = null;
  delete upstream.data.sheetInstrumentTypeVOList;

  const result = await replay(upstream).sheetList(sheetList.query);

  expect(result.status).toBe(200);
  expect(result.body.data).toHaveProperty('musicSheetSimpleInfoVOS', null);
  expect(result.body.data).not.toHaveProperty('sheetInstrumentTypeVOList');
});

test('sheet_list rejects a bad record in an optional sheet list', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data: { musicSheetSimpleInfoVOS: Array<{ id?: unknown }> };
  };
  delete upstream.data.musicSheetSimpleInfoVOS[1]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).sheetList(sheetList.query),
    {
      module: 'sheet_list',
      path: 'body.data.musicSheetSimpleInfoVOS[1].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('sheet_list rejects a bad record in an optional instrument list', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data: { sheetInstrumentTypeVOList: Array<unknown> };
  };
  upstream.data.sheetInstrumentTypeVOList[0] = 'piano';

  await expectUpstreamShapeRejection(
    replay(upstream).sheetList(sheetList.query),
    {
      module: 'sheet_list',
      path: 'body.data.sheetInstrumentTypeVOList[0]',
      expected: 'object',
      actual: 'string',
    },
  );
});

test('sheet_list drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data: {
      findSheet: unknown;
      sheetInstrumentTypeVOList: Array<{ name?: unknown }>;
      extra?: unknown;
    };
  };
  upstream.data.findSheet = '1';
  upstream.data.sheetInstrumentTypeVOList[0]!.name = 1;
  upstream.data.extra = { source: 'fixture' };

  const result = await replay(upstream).sheetList(sheetList.query);
  const data = result.body.data as unknown as Record<string, unknown>;
  const instrument = (
    data.sheetInstrumentTypeVOList as Array<Record<string, unknown>>
  )[0]!;

  expect(data).not.toHaveProperty('findSheet');
  expect(instrument).not.toHaveProperty('name');
  expect(data).toHaveProperty('extra', { source: 'fixture' });
});

test('sheet_list keeps a loose field as null', async () => {
  const upstream = structuredClone(sheetList.response.body) as {
    data: { findSheet: unknown };
  };
  upstream.data.findSheet = null;

  const result = await replay(upstream).sheetList(sheetList.query);

  expect(result.body.data).toHaveProperty('findSheet', null);
});

test('sheet_preview rejects a page without an id', async () => {
  const upstream = structuredClone(sheetPreview.response.body) as {
    data: Array<{ id?: unknown }>;
  };
  delete upstream.data[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).sheetPreview(sheetPreview.query),
    {
      module: 'sheet_preview',
      path: 'body.data[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('sheet_preview rejects a non-string page url', async () => {
  const upstream = structuredClone(sheetPreview.response.body) as {
    data: Array<{ url: unknown }>;
  };
  upstream.data[1]!.url = 42;

  await expectUpstreamShapeRejection(
    replay(upstream).sheetPreview(sheetPreview.query),
    {
      module: 'sheet_preview',
      path: 'body.data[1].url',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('sheet_preview rejects a body without pages', async () => {
  const upstream = structuredClone(sheetPreview.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).sheetPreview(sheetPreview.query),
    {
      module: 'sheet_preview',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('sheet_preview drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(sheetPreview.response.body) as {
    data: Array<{ md5: unknown; size: unknown; extra?: unknown }>;
  };
  upstream.data[0]!.size = '689409';
  upstream.data[0]!.md5 = null;
  upstream.data[0]!.extra = { source: 'fixture' };

  const result = await replay(upstream).sheetPreview(sheetPreview.query);
  const page = (result.body.data as ReadonlyArray<Record<string, unknown>>)[0]!;

  expect(page).not.toHaveProperty('size');
  expect(page).toHaveProperty('md5', null);
  expect(page).toHaveProperty('extra', { source: 'fixture' });
});

test('summary_annual rejects a body without data', async () => {
  const upstream = structuredClone(summaryAnnual2023.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).summaryAnnual(summaryAnnual2023.query),
    {
      module: 'summary_annual',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('summary_annual rejects a non-object data', async () => {
  const upstream = structuredClone(summaryAnnual2023.response.body) as {
    data: unknown;
  };
  upstream.data = 'report';

  await expectUpstreamShapeRejection(
    replay(upstream).summaryAnnual(summaryAnnual2023.query),
    {
      module: 'summary_annual',
      path: 'body.data',
      expected: 'object',
      actual: 'string',
    },
  );
});

test('summary_annual drops bad loose sections and keeps undeclared fields', async () => {
  const upstream = structuredClone(summaryAnnual2023.response.body) as {
    data: {
      encUserId: unknown;
      musician: unknown;
      yearOverview: unknown;
      customSection?: unknown;
    };
  };
  upstream.data.encUserId = 1;
  upstream.data.musician = null;
  upstream.data.yearOverview = 'report';
  upstream.data.customSection = { title: 'fixture' };

  const result = await replay(upstream).summaryAnnual(summaryAnnual2023.query);
  const data = result.body.data as unknown as Record<string, unknown>;

  expect(data).not.toHaveProperty('encUserId');
  expect(data).toHaveProperty('musician', null);
  expect(data).not.toHaveProperty('yearOverview');
  expect(data).toHaveProperty('customSection', { title: 'fixture' });
});

test('summary_annual rejects a non-primitive year before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json(summaryAnnual2023.response.body);
    },
  });

  expect(await settle(api.summaryAnnual({ year: {} }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'year must be a primitive value' },
    },
  });
  expect(upstreamCalls).toBe(0);
});

test('starpick_comments_summary rejects a block without a code', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: { blocks: Array<{ blockCode?: unknown }> };
  };
  delete upstream.data.blocks[0]!.blockCode;

  await expectUpstreamShapeRejection(
    replay(upstream).starpickCommentsSummary(starpickCommentsSummary.query),
    {
      module: 'starpick_comments_summary',
      path: 'body.data.blocks[0].blockCode',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('starpick_comments_summary rejects a non-string block code', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: { blocks: Array<{ blockCode: unknown }> };
  };
  upstream.data.blocks[1]!.blockCode = 1;

  await expectUpstreamShapeRejection(
    replay(upstream).starpickCommentsSummary(starpickCommentsSummary.query),
    {
      module: 'starpick_comments_summary',
      path: 'body.data.blocks[1].blockCode',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('starpick_comments_summary rejects a body without blocks', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: { blocks?: unknown };
  };
  delete upstream.data.blocks;

  await expectUpstreamShapeRejection(
    replay(upstream).starpickCommentsSummary(starpickCommentsSummary.query),
    {
      module: 'starpick_comments_summary',
      path: 'body.data.blocks',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('starpick_comments_summary accepts null or missing creatives', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: { blocks: Array<{ creatives?: unknown }> };
  };
  upstream.data.blocks[1]!.creatives = null;
  delete upstream.data.blocks[2]!.creatives;

  const result = await replay(upstream).starpickCommentsSummary(
    starpickCommentsSummary.query,
  );
  const blocks = result.body.data.blocks as ReadonlyArray<
    Record<string, unknown>
  >;

  expect(result.status).toBe(200);
  expect(blocks[1]).toHaveProperty('creatives', null);
  expect(blocks[2]).not.toHaveProperty('creatives');
});

test('starpick_comments_summary drops bad resources and keeps other fields', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: {
      blocks: Array<{
        creatives?: Array<{ resources?: unknown; creativeId?: unknown }>;
      }>;
    };
  };
  upstream.data.blocks[2]!.creatives![0]!.resources = ['comment'];

  const result = await replay(upstream).starpickCommentsSummary(
    starpickCommentsSummary.query,
  );
  const creative = (
    result.body.data.blocks as ReadonlyArray<{
      creatives?: ReadonlyArray<Record<string, unknown>>;
    }>
  )[2]!.creatives![0]!;

  expect(result.status).toBe(200);
  expect(creative).not.toHaveProperty('resources');
  expect(creative).toHaveProperty('creativeId');
});

test('starpick_comments_summary keeps null or missing resources as loose fields', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: {
      blocks: Array<{
        creatives?: Array<{ resources?: unknown }>;
      }>;
    };
  };
  upstream.data.blocks[2]!.creatives![0]!.resources = null;
  delete upstream.data.blocks[2]!.creatives![1]!.resources;

  const result = await replay(upstream).starpickCommentsSummary(
    starpickCommentsSummary.query,
  );
  const creatives = (
    result.body.data.blocks as ReadonlyArray<{
      creatives?: ReadonlyArray<Record<string, unknown>>;
    }>
  )[2]!.creatives!;

  expect(result.status).toBe(200);
  expect(creatives[0]).toHaveProperty('resources', null);
  expect(creatives[1]).not.toHaveProperty('resources');
});

test('starpick_comments_summary drops a bad creative uiElement and keeps the rest', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: {
      blocks: Array<{
        creatives?: Array<{ uiElement?: unknown; creativeId?: unknown }>;
      }>;
    };
  };
  upstream.data.blocks[2]!.creatives![0]!.uiElement = 'element';

  const result = await replay(upstream).starpickCommentsSummary(
    starpickCommentsSummary.query,
  );
  const creative = (
    result.body.data.blocks as ReadonlyArray<{
      creatives?: ReadonlyArray<Record<string, unknown>>;
    }>
  )[2]!.creatives![0]!;

  expect(result.status).toBe(200);
  expect(creative).not.toHaveProperty('uiElement');
  expect(creative).toHaveProperty('creativeId');
});

test('starpick_comments_summary rejects a bad record in optional creatives', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: { blocks: Array<{ creatives?: unknown }> };
  };
  upstream.data.blocks[2]!.creatives = ['comment'];

  await expectUpstreamShapeRejection(
    replay(upstream).starpickCommentsSummary(starpickCommentsSummary.query),
    {
      module: 'starpick_comments_summary',
      path: 'body.data.blocks[2].creatives[0]',
      expected: 'object',
      actual: 'string',
    },
  );
});

test('starpick_comments_summary drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(starpickCommentsSummary.response.body) as {
    data: {
      hasMore: unknown;
      pageConfig: unknown;
      blocks: Array<{ extInfo?: unknown; extra?: unknown }>;
      extra?: unknown;
    };
  };
  upstream.data.hasMore = 'false';
  upstream.data.pageConfig = 'config';
  upstream.data.extra = { source: 'fixture' };

  const result = await replay(upstream).starpickCommentsSummary(
    starpickCommentsSummary.query,
  );
  const data = result.body.data as unknown as Record<string, unknown>;

  expect(data).not.toHaveProperty('hasMore');
  expect(data).not.toHaveProperty('pageConfig');
  expect(data).toHaveProperty('extra', { source: 'fixture' });
  expect(
    (data.blocks as ReadonlyArray<Record<string, unknown>>)[0],
  ).toHaveProperty('extInfo');
});

test('sheet and annual bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    NonNullable<SheetListBody['data']['musicSheetSimpleInfoVOS']>[number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<SheetListBody['data']['findSheet']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    SheetPreviewBody['data'][number]['url']
  >().toEqualTypeOf<string>();
  expectTypeOf<SheetPreviewBody['data'][number]['size']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<SummaryAnnualBody['data']['encUserId']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<SummaryAnnualBody['data']['mlc']>().toEqualTypeOf<
    number | string | null | undefined
  >();
  expectTypeOf<
    StarpickCommentsSummaryBody['data']['blocks'][number]['blockCode']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    NonNullable<
      StarpickCommentsSummaryBody['data']['blocks'][number]['creatives']
    >[number]['creativeId']
  >().toEqualTypeOf<string | null | undefined>();
});
