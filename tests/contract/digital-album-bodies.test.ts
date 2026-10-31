import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  DigitalAlbumDetailBody,
  DigitalAlbumPurchasedBody,
  DigitalAlbumSalesBody,
  VipGrowthpointBody,
  VipGrowthpointDetailsBody,
  VipTasksBody,
  VipTimemachineBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import digitalAlbumDetail from '../fixtures/netease/digital-album/digitalAlbum_detail.default.json';
import digitalAlbumDetailUnknown from '../fixtures/netease/digital-album/digitalAlbum_detail.unknown.json';
import digitalAlbumPurchasedAnonymous from '../fixtures/netease/digital-album/digitalAlbum_purchased.anonymous.json';
import digitalAlbumPurchased from '../fixtures/netease/digital-album/digitalAlbum_purchased.default.json';
import digitalAlbumPurchasedOffset from '../fixtures/netease/digital-album/digitalAlbum_purchased.offset-100000.json';
import digitalAlbumSales from '../fixtures/netease/digital-album/digitalAlbum_sales.default.json';
import digitalAlbumSalesEmpty from '../fixtures/netease/digital-album/digitalAlbum_sales.empty.json';
import digitalAlbumSalesMissingIds from '../fixtures/netease/digital-album/digitalAlbum_sales.missing-ids.json';
import digitalAlbumSalesUnknown from '../fixtures/netease/digital-album/digitalAlbum_sales.unknown.json';
import vipGrowthpointAnonymous from '../fixtures/netease/vip/vip_growthpoint.anonymous.json';
import vipGrowthpoint from '../fixtures/netease/vip/vip_growthpoint.default.json';
import vipGrowthpointDetailsAnonymous from '../fixtures/netease/vip/vip_growthpoint_details.anonymous.json';
import vipGrowthpointDetails from '../fixtures/netease/vip/vip_growthpoint_details.default.json';
import vipGrowthpointDetailsOffset from '../fixtures/netease/vip/vip_growthpoint_details.offset-100000.json';
import vipTasksAnonymous from '../fixtures/netease/vip/vip_tasks.anonymous.json';
import vipTasks from '../fixtures/netease/vip/vip_tasks.default.json';
import vipTimemachine from '../fixtures/netease/vip/vip_timemachine.default.json';
import vipTimemachineEmpty from '../fixtures/netease/vip/vip_timemachine.empty.json';

// issue #102 B23 的录制：数字专辑与会员只读接口。登录对照先确认 login_status 的
// account.anonimousUser 为 false；digitalAlbum_detail 的登录对比只在 vipType 等宽松字段
// 上出现值差异，登录对照未保留录制。vip_growthpoint、vip_growthpoint_details、
// vip_tasks 和 digitalAlbum_purchased 另保留匿名录制，vip_timemachine 匿名时 detail 为
// null；不对匿名与登录的公开结构作相同性断言。
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
    name: 'digitalAlbum_detail',
    recording: digitalAlbumDetail,
    bodySchema: DigitalAlbumDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumDetail(digitalAlbumDetail.query),
  },
  {
    name: 'digitalAlbum_sales',
    recording: digitalAlbumSales,
    bodySchema: DigitalAlbumSalesBody,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumSales(digitalAlbumSales.query),
  },
  {
    name: 'digitalAlbum_sales for an unknown album',
    recording: digitalAlbumSalesUnknown,
    bodySchema: DigitalAlbumSalesBody,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumSales(
        digitalAlbumSalesUnknown.query,
      ),
  },
  {
    name: 'digitalAlbum_purchased without purchases',
    recording: digitalAlbumPurchased,
    bodySchema: DigitalAlbumPurchasedBody,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumPurchased(
        digitalAlbumPurchased.query,
      ),
  },
  {
    name: 'digitalAlbum_purchased with offset 100000',
    recording: digitalAlbumPurchasedOffset,
    bodySchema: DigitalAlbumPurchasedBody,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumPurchased(
        digitalAlbumPurchasedOffset.query,
      ),
  },
  {
    name: 'digitalAlbum_purchased anonymously',
    recording: digitalAlbumPurchasedAnonymous,
    bodySchema: DigitalAlbumPurchasedBody,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumPurchased(
        digitalAlbumPurchasedAnonymous.query,
      ),
  },
  {
    name: 'vip_timemachine',
    recording: vipTimemachine,
    bodySchema: VipTimemachineBody,
    call: (upstream, status) =>
      replay(upstream, status).vipTimemachine(vipTimemachine.query),
  },
  {
    name: 'vip_timemachine without records',
    recording: vipTimemachineEmpty,
    bodySchema: VipTimemachineBody,
    call: (upstream, status) =>
      replay(upstream, status).vipTimemachine(vipTimemachineEmpty.query),
  },
  {
    name: 'vip_growthpoint',
    recording: vipGrowthpoint,
    bodySchema: VipGrowthpointBody,
    call: (upstream, status) =>
      replay(upstream, status).vipGrowthpoint(vipGrowthpoint.query),
  },
  {
    name: 'vip_growthpoint anonymously',
    recording: vipGrowthpointAnonymous,
    bodySchema: VipGrowthpointBody,
    call: (upstream, status) =>
      replay(upstream, status).vipGrowthpoint(vipGrowthpointAnonymous.query),
  },
  {
    name: 'vip_growthpoint_details',
    recording: vipGrowthpointDetails,
    bodySchema: VipGrowthpointDetailsBody,
    call: (upstream, status) =>
      replay(upstream, status).vipGrowthpointDetails(
        vipGrowthpointDetails.query,
      ),
  },
  {
    name: 'vip_growthpoint_details with offset 100000',
    recording: vipGrowthpointDetailsOffset,
    bodySchema: VipGrowthpointDetailsBody,
    call: (upstream, status) =>
      replay(upstream, status).vipGrowthpointDetails(
        vipGrowthpointDetailsOffset.query,
      ),
  },
  {
    name: 'vip_growthpoint_details anonymously',
    recording: vipGrowthpointDetailsAnonymous,
    bodySchema: VipGrowthpointDetailsBody,
    call: (upstream, status) =>
      replay(upstream, status).vipGrowthpointDetails(
        vipGrowthpointDetailsAnonymous.query,
      ),
  },
  {
    name: 'vip_tasks',
    recording: vipTasks,
    bodySchema: VipTasksBody,
    call: (upstream, status) =>
      replay(upstream, status).vipTasks(vipTasks.query),
  },
  {
    name: 'vip_tasks anonymously',
    recording: vipTasksAnonymous,
    bodySchema: VipTasksBody,
    call: (upstream, status) =>
      replay(upstream, status).vipTasks(vipTasksAnonymous.query),
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

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'digitalAlbum_detail',
    recording: digitalAlbumDetailUnknown,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumDetail(
        digitalAlbumDetailUnknown.query,
      ),
  },
  {
    name: 'digitalAlbum_sales',
    recording: digitalAlbumSalesEmpty,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumSales(digitalAlbumSalesEmpty.query),
  },
  {
    name: 'digitalAlbum_sales without ids',
    recording: digitalAlbumSalesMissingIds,
    call: (upstream, status) =>
      replay(upstream, status).digitalAlbumSales(
        digitalAlbumSalesMissingIds.query,
      ),
  },
])('$name passes a rejected code through', async (entry) => {
  expect(
    await settle(
      entry.call(
        entry.recording.response.body,
        entry.recording.response.status,
      ),
    ),
  ).toEqual({
    rejected: {
      status: (entry.recording.response.body as { code: number }).code,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('digital album bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    DigitalAlbumDetailBody['album']['albumId']
  >().toEqualTypeOf<number>();
  expectTypeOf<DigitalAlbumDetailBody['product']['price']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<DigitalAlbumSalesBody['data'][string]>().toEqualTypeOf<number>();
  expectTypeOf<DigitalAlbumPurchasedBody['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    VipGrowthpointBody['data']['userLevel']['userId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    VipGrowthpointBody['data']['userLevel']['growthPoint']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    VipGrowthpointDetailsBody['data']['details'][number]['resourceId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<VipGrowthpointDetailsBody['data']['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    VipTasksBody['data']['taskList'][number]['taskItems'][number]['taskId']
  >().toEqualTypeOf<string>();
  expectTypeOf<VipTasksBody['data']['taskScore']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    NonNullable<VipTimemachineBody['data']['detail']>[number]['rowKey']
  >().toEqualTypeOf<string>();
});

test('digital album modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.digitalAlbumDetail(null as never),
    () => api.digitalAlbumSales(null as never),
    () => api.digitalAlbumPurchased(null as never),
    () => api.vipTimemachine(null as never),
    () => api.vipGrowthpoint(null as never),
    () => api.vipGrowthpointDetails(null as never),
    () => api.vipTasks(null as never),
  ];

  for (const call of calls) {
    expect(await settle(call())).toEqual({
      rejected: {
        status: 400,
        cookie: [],
        body: { code: 400, msg: 'Expected <Declaration>' },
      },
    });
  }
  expect(upstreamCalls).toBe(0);
});

test('digitalAlbum_detail rejects a detail without an album', async () => {
  const upstream = structuredClone(digitalAlbumDetail.response.body) as {
    album?: unknown;
  };
  delete upstream.album;

  await expectUpstreamShapeRejection(
    replay(upstream).digitalAlbumDetail(digitalAlbumDetail.query),
    {
      module: 'digitalAlbum_detail',
      path: 'body.album',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('digitalAlbum_detail drops a bad product price and keeps undeclared fields', async () => {
  const upstream = structuredClone(digitalAlbumDetail.response.body) as {
    canBuy?: unknown;
    album: Record<string, unknown>;
    product: { price: unknown; extInfo: Record<string, unknown> };
  };
  delete upstream.canBuy;
  upstream.product.price = '22';
  upstream.album.customPriceConfig = { price: 22 };
  upstream.product.extInfo.someFlag = true;

  const result = await replay(upstream).digitalAlbumDetail(
    digitalAlbumDetail.query,
  );

  expect(result.body as unknown).not.toHaveProperty('canBuy');
  expect(result.body.product as unknown).not.toHaveProperty('price');
  expect(result.body.album as unknown).toHaveProperty('customPriceConfig', {
    price: 22,
  });
  expect((result.body.product as { extInfo: unknown }).extInfo).toHaveProperty(
    'someFlag',
    true,
  );
});

test('digitalAlbum_sales rejects a non-numeric sale count', async () => {
  const upstream = structuredClone(digitalAlbumSales.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data['396372188'] = '4850';

  await expectUpstreamShapeRejection(
    replay(upstream).digitalAlbumSales(digitalAlbumSales.query),
    {
      module: 'digitalAlbum_sales',
      path: 'body.data.396372188',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('digitalAlbum_sales rejects a body without sales data', async () => {
  const upstream = structuredClone(digitalAlbumSales.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).digitalAlbumSales(digitalAlbumSales.query),
    {
      module: 'digitalAlbum_sales',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('digitalAlbum_sales keeps undeclared fields', async () => {
  const upstream = structuredClone(digitalAlbumSales.response.body) as Record<
    string,
    unknown
  >;
  upstream.extra = { albumName: 'PRESS PLAY' };

  const result = await replay(upstream).digitalAlbumSales(
    digitalAlbumSales.query,
  );

  expect(result.body as unknown).toHaveProperty('extra', {
    albumName: 'PRESS PLAY',
  });
});

test('digitalAlbum_purchased keeps undeclared paidAlbums as null or missing', async () => {
  const withNull = structuredClone(digitalAlbumPurchased.response.body) as {
    paidAlbums?: unknown;
  };
  withNull.paidAlbums = null;

  const nullResult = await replay(withNull).digitalAlbumPurchased(
    digitalAlbumPurchased.query,
  );
  expect(nullResult.status).toBe(200);
  expect(nullResult.body as unknown).toHaveProperty('paidAlbums', null);

  const without = structuredClone(digitalAlbumPurchased.response.body) as {
    paidAlbums?: unknown;
  };
  delete without.paidAlbums;

  const missingResult = await replay(without).digitalAlbumPurchased(
    digitalAlbumPurchased.query,
  );
  expect(missingResult.status).toBe(200);
  expect(missingResult.body as unknown).not.toHaveProperty('paidAlbums');
});

test('digitalAlbum_purchased drops a bad total and keeps undeclared paidAlbums', async () => {
  const upstream = structuredClone(digitalAlbumPurchased.response.body) as {
    paidAlbums: unknown;
    total: unknown;
  };
  upstream.total = '0';
  upstream.paidAlbums = 'albums';

  const result = await replay(upstream).digitalAlbumPurchased(
    digitalAlbumPurchased.query,
  );

  expect(result.body as unknown).not.toHaveProperty('total');
  expect(result.body as unknown).toHaveProperty('paidAlbums', 'albums');
});

test('vip_growthpoint rejects a user level without a numeric growth point', async () => {
  const upstream = structuredClone(vipGrowthpoint.response.body) as {
    data: { userLevel: { growthPoint: unknown } };
  };
  upstream.data.userLevel.growthPoint = '27073';

  await expectUpstreamShapeRejection(
    replay(upstream).vipGrowthpoint(vipGrowthpoint.query),
    {
      module: 'vip_growthpoint',
      path: 'body.data.userLevel.growthPoint',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('vip_growthpoint rejects a body without a user level', async () => {
  const upstream = structuredClone(vipGrowthpoint.response.body) as {
    data: { userLevel?: unknown };
  };
  delete upstream.data.userLevel;

  await expectUpstreamShapeRejection(
    replay(upstream).vipGrowthpoint(vipGrowthpoint.query),
    {
      module: 'vip_growthpoint',
      path: 'body.data.userLevel',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('vip_growthpoint drops a bad level card field and keeps undeclared fields', async () => {
  const upstream = structuredClone(vipGrowthpoint.response.body) as {
    data: {
      levelCard: { level: unknown };
      userLevel: { avatarUrl: unknown };
      extra?: unknown;
    };
  };
  upstream.data.levelCard.level = '7';
  upstream.data.userLevel.avatarUrl = null;
  upstream.data.extra = { theme: 'dark' };

  const result = await replay(upstream).vipGrowthpoint(vipGrowthpoint.query);

  expect(result.body.data.levelCard as unknown).not.toHaveProperty('level');
  expect((result.body.data.levelCard as { levelName: unknown }).levelName).toBe(
    vipGrowthpoint.response.body.data.levelCard.levelName,
  );
  expect(
    (result.body.data as { userLevel: Record<string, unknown> }).userLevel
      .avatarUrl,
  ).toBeNull();
  expect(result.body.data as unknown).toHaveProperty('extra', {
    theme: 'dark',
  });
});

test('vip_growthpoint_details rejects a non-array detail list', async () => {
  const upstream = structuredClone(vipGrowthpointDetails.response.body) as {
    data: { details: unknown };
  };
  upstream.data.details = null;

  await expectUpstreamShapeRejection(
    replay(upstream).vipGrowthpointDetails(vipGrowthpointDetails.query),
    {
      module: 'vip_growthpoint_details',
      path: 'body.data.details',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('vip_growthpoint_details keeps a detail without a resource id', async () => {
  const upstream = structuredClone(vipGrowthpointDetails.response.body) as {
    data: { details: Array<{ resourceId?: unknown }> };
  };
  delete upstream.data.details[0]!.resourceId;

  const result = await replay(upstream).vipGrowthpointDetails(
    vipGrowthpointDetails.query,
  );
  const first = result.body.data.details[0] as unknown as Record<
    string,
    unknown
  >;

  expect(result.status).toBe(200);
  expect(first).not.toHaveProperty('resourceId');
  expect(first.descript).toBe(
    vipGrowthpointDetails.response.body.data.details[0]?.descript,
  );
});

test('vip_growthpoint_details drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(vipGrowthpointDetails.response.body) as {
    data: {
      hasMore: unknown;
      details: Array<{
        descript?: unknown;
        growthPoint: unknown;
        resourceId: unknown;
        extra?: unknown;
      }>;
    };
  };
  upstream.data.hasMore = 'false';
  delete upstream.data.details[0]!.descript;
  upstream.data.details[0]!.growthPoint = '10';
  upstream.data.details[0]!.resourceId = '5330407344';
  upstream.data.details[0]!.extra = { taskName: '每日发放' };

  const result = await replay(upstream).vipGrowthpointDetails(
    vipGrowthpointDetails.query,
  );
  const first = result.body.data.details[0] as unknown as Record<
    string,
    unknown
  >;

  expect(result.body.data as unknown).not.toHaveProperty('hasMore');
  expect(first).not.toHaveProperty('descript');
  expect(first).not.toHaveProperty('growthPoint');
  expect(first).not.toHaveProperty('resourceId');
  expect(first).toHaveProperty('extra', { taskName: '每日发放' });
});

test('vip_tasks rejects a non-array task list', async () => {
  const upstream = structuredClone(vipTasks.response.body) as {
    data: { taskList: unknown };
  };
  upstream.data.taskList = null;

  await expectUpstreamShapeRejection(
    replay(upstream).vipTasks(vipTasks.query),
    {
      module: 'vip_tasks',
      path: 'body.data.taskList',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('vip_tasks rejects a task without a task id', async () => {
  const upstream = structuredClone(vipTasks.response.body) as {
    data: { taskList: Array<{ taskItems: Array<{ taskId?: unknown }> }> };
  };
  delete upstream.data.taskList[0]!.taskItems[0]!.taskId;

  await expectUpstreamShapeRejection(
    replay(upstream).vipTasks(vipTasks.query),
    {
      module: 'vip_tasks',
      path: 'body.data.taskList[0].taskItems[0].taskId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('vip_tasks drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(vipTasks.response.body) as {
    data: {
      taskScore: unknown;
      taskList: Array<{
        taskItems: Array<{ growthPoint: unknown; extra?: unknown }>;
      }>;
    };
  };
  upstream.data.taskScore = '0';
  upstream.data.taskList[0]!.taskItems[0]!.growthPoint = '3';
  upstream.data.taskList[0]!.taskItems[0]!.extra = { abTest: 'b' };

  const result = await replay(upstream).vipTasks(vipTasks.query);
  const task = result.body.data.taskList[0]!.taskItems[0] as unknown as Record<
    string,
    unknown
  >;

  expect(result.body.data as unknown).not.toHaveProperty('taskScore');
  expect(task).not.toHaveProperty('growthPoint');
  expect(task).toHaveProperty('extra', { abTest: 'b' });
  expect(task.taskId).toBe(
    vipTasks.response.body.data.taskList[0]?.taskItems[0]?.taskId,
  );
});

test('vip_timemachine rejects a record without a row key', async () => {
  const upstream = structuredClone(vipTimemachine.response.body) as {
    data: { detail: Array<{ rowKey?: unknown }> };
  };
  delete upstream.data.detail[0]!.rowKey;

  await expectUpstreamShapeRejection(
    replay(upstream).vipTimemachine(vipTimemachine.query),
    {
      module: 'vip_timemachine',
      path: 'body.data.detail[0].rowKey',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('vip_timemachine rejects a record without a report payload', async () => {
  const upstream = structuredClone(vipTimemachine.response.body) as {
    data: { detail: Array<{ data?: unknown }> };
  };
  delete upstream.data.detail[0]!.data;

  await expectUpstreamShapeRejection(
    replay(upstream).vipTimemachine(vipTimemachine.query),
    {
      module: 'vip_timemachine',
      path: 'body.data.detail[0].data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('vip_timemachine rejects a null report payload', async () => {
  const upstream = structuredClone(vipTimemachine.response.body) as {
    data: { detail: Array<{ data: unknown }> };
  };
  upstream.data.detail[0]!.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).vipTimemachine(vipTimemachine.query),
    {
      module: 'vip_timemachine',
      path: 'body.data.detail[0].data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('vip_timemachine rejects a non-array record list', async () => {
  const upstream = structuredClone(vipTimemachine.response.body) as {
    data: { detail: unknown };
  };
  upstream.data.detail = 'detail';

  await expectUpstreamShapeRejection(
    replay(upstream).vipTimemachine(vipTimemachine.query),
    {
      module: 'vip_timemachine',
      path: 'body.data.detail',
      expected: 'array | null',
      actual: 'string',
    },
  );
});

test('vip_timemachine accepts a missing record list', async () => {
  const upstream = structuredClone(vipTimemachine.response.body) as {
    data: { detail?: unknown };
  };
  delete upstream.data.detail;

  const result = await replay(upstream).vipTimemachine(vipTimemachine.query);

  expect(result.status).toBe(200);
  expect(result.body.data as unknown).not.toHaveProperty('detail');
});

test('vip_timemachine drops bad loose fields and keeps the report payload', async () => {
  const upstream = structuredClone(vipTimemachine.response.body) as {
    data: {
      detail: Array<{ showFree: unknown; type: unknown; data: unknown }>;
    };
  };
  upstream.data.detail[0]!.showFree = 'no';
  upstream.data.detail[0]!.type = '3';
  (upstream.data.detail[0]!.data as Record<string, unknown>).extraReport = {
    week: 1,
  };

  const result = await replay(upstream).vipTimemachine(vipTimemachine.query);
  const first = result.body.data.detail![0] as unknown as Record<
    string,
    unknown
  >;

  expect(first).not.toHaveProperty('showFree');
  expect(first).not.toHaveProperty('type');
  expect(first.data).toHaveProperty('extraReport', { week: 1 });
  expect(first.rowKey).toBe(
    vipTimemachine.response.body.data.detail[0]?.rowKey,
  );
});
