import { expect, expectTypeOf, test } from 'bun:test';

import {
  BannerBody,
  createHanaMusicApi,
  HomepageBlockPageBody,
  HomepageDragonBallBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import bannerAnonymous from '../fixtures/netease/home/banner.anonymous.json';
import banner from '../fixtures/netease/home/banner.default.json';
import bannerAndroid from '../fixtures/netease/home/banner.type-android.json';
import bannerIpad from '../fixtures/netease/home/banner.type-ipad.json';
import bannerIphone from '../fixtures/netease/home/banner.type-iphone.json';
import homepageBlockPage from '../fixtures/netease/home/homepage_block_page.default.json';
import homepageBlockPageInvalidCookie from '../fixtures/netease/home/homepage_block_page.invalid-cookie.json';
import homepageBlockPageInvalidCursor from '../fixtures/netease/home/homepage_block_page.invalid-cursor.json';
import homepageDragonBallAnonymous from '../fixtures/netease/home/homepage_dragon_ball.anonymous.json';
import homepageDragonBall from '../fixtures/netease/home/homepage_dragon_ball.default.json';

// issue #102 B27：default 录制是登录状态（先经 login_status 确认 anonimousUser: false）；
// anonymous 是未登录对照，viewer 为 invalid-cookie 的录制是探测用无效值回匿名视角。
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
    name: 'banner pc',
    recording: banner,
    bodySchema: BannerBody,
    call: (upstream, status) => replay(upstream, status).banner(banner.query),
  },
  {
    name: 'banner iphone',
    recording: bannerIphone,
    bodySchema: BannerBody,
    call: (upstream, status) =>
      replay(upstream, status).banner(bannerIphone.query),
  },
  {
    name: 'banner ipad',
    recording: bannerIpad,
    bodySchema: BannerBody,
    call: (upstream, status) =>
      replay(upstream, status).banner(bannerIpad.query),
  },
  {
    name: 'banner android',
    recording: bannerAndroid,
    bodySchema: BannerBody,
    call: (upstream, status) =>
      replay(upstream, status).banner(bannerAndroid.query),
  },
  {
    name: 'banner anonymous',
    recording: bannerAnonymous,
    bodySchema: BannerBody,
    call: (upstream, status) =>
      replay(upstream, status).banner(bannerAnonymous.query),
  },
  {
    name: 'homepage_block_page for the logged-in account',
    recording: homepageBlockPage,
    bodySchema: HomepageBlockPageBody,
    call: (upstream, status) =>
      replay(upstream, status).homepageBlockPage(homepageBlockPage.query),
  },
  {
    name: 'homepage_block_page with an invalid cookie',
    recording: homepageBlockPageInvalidCookie,
    bodySchema: HomepageBlockPageBody,
    call: (upstream, status) =>
      replay(upstream, status).homepageBlockPage(
        homepageBlockPageInvalidCookie.query,
      ),
  },
  {
    name: 'homepage_dragon_ball for the logged-in account',
    recording: homepageDragonBall,
    bodySchema: HomepageDragonBallBody,
    call: (upstream, status) =>
      replay(upstream, status).homepageDragonBall(homepageDragonBall.query),
  },
  {
    name: 'homepage_dragon_ball for an anonymous view',
    recording: homepageDragonBallAnonymous,
    bodySchema: HomepageDragonBallBody,
    call: (upstream, status) =>
      replay(upstream, status).homepageDragonBall(
        homepageDragonBallAnonymous.query,
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

test('homepage_block_page with an invalid cursor passes a rejected code through', async () => {
  expect(
    await settle(
      replay(
        homepageBlockPageInvalidCursor.response.body,
        homepageBlockPageInvalidCursor.response.status,
      ).homepageBlockPage(homepageBlockPageInvalidCursor.query),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: homepageBlockPageInvalidCursor.response.body,
    },
  });
});

test('home bodies type their tightened records and loose fields', () => {
  expectTypeOf<BannerBody['banners'][number]['targetId']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    HomepageBlockPageBody['data']['blocks'][number]['blockCode']
  >().toEqualTypeOf<string>();
  expectTypeOf<HomepageDragonBallBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();

  type BlockCreative = NonNullable<
    HomepageBlockPageBody['data']['blocks'][number]['creatives']
  >[number];
  expectTypeOf<
    NonNullable<BlockCreative['uiElement']>['labelTexts']
  >().toEqualTypeOf<ReadonlyArray<string> | null | undefined>();
  expectTypeOf<
    NonNullable<NonNullable<BlockCreative['uiElement']>['image']>['imageUrl']
  >().toEqualTypeOf<string | null | undefined>();

  type BlockResource = NonNullable<
    NonNullable<
      NonNullable<
        HomepageBlockPageBody['data']['blocks'][number]['creatives']
      >[number]['resources']
    >[number]
  >;
  type BlockProgram = NonNullable<
    NonNullable<BlockResource['resourceExtInfo']>['djProgram']
  >;
  expectTypeOf<BlockProgram['auditStatus']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<NonNullable<BlockProgram['dj']>['brand']>().toEqualTypeOf<
    string | null | undefined
  >();
});

test('banner rejects an object type before any upstream call', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json({ code: 200, banners: [] });
    },
  });

  const outcome = await settle(api.banner({ type: {} }));

  expect('rejected' in outcome && outcome.rejected.status).toBe(400);
  expect(requests).toBe(0);
});

test('banner rejects a body without a return code', async () => {
  const upstream = structuredClone(banner.response.body) as { code?: unknown };
  delete upstream.code;

  await expectUpstreamShapeRejection(replay(upstream).banner(banner.query), {
    module: 'banner',
    path: 'body.code',
    expected: 'present',
    actual: 'missing',
  });
});

test('banner rejects a banner list that is not an array', async () => {
  const upstream = structuredClone(banner.response.body) as {
    banners: unknown;
  };
  upstream.banners = {};

  await expectUpstreamShapeRejection(replay(upstream).banner(banner.query), {
    module: 'banner',
    path: 'body.banners',
    expected: 'array',
    actual: 'object',
  });
});

test('banner rejects a body without a banners list', async () => {
  const upstream = structuredClone(banner.response.body) as {
    banners?: unknown;
  };
  delete upstream.banners;

  await expectUpstreamShapeRejection(replay(upstream).banner(banner.query), {
    module: 'banner',
    path: 'body.banners',
    expected: 'present',
    actual: 'missing',
  });
});

test('banner drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(banner.response.body) as unknown as {
    banners: Array<Record<string, unknown>>;
  };
  upstream.banners[0] = {
    ...upstream.banners[0],
    typeTitle: 3000,
    targetId: '0',
    alg: null,
    song: [],
    bannerExtra: { a: 1 },
  };

  const result = await replay(upstream).banner(banner.query);
  const first = (
    result.body.banners as ReadonlyArray<Record<string, unknown>>
  )[0]!;

  expect(first).not.toHaveProperty('typeTitle');
  expect(first).not.toHaveProperty('targetId');
  expect(first).not.toHaveProperty('song');
  expect(first.alg).toBeNull();
  expect(first.bannerExtra).toEqual({ a: 1 });
  expect(first.targetType).toBe(
    (banner.response.body.banners[0] as { targetType: unknown }).targetType,
  );
});

test('homepage_block_page rejects a body without data', async () => {
  const upstream = structuredClone(homepageBlockPage.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).homepageBlockPage(homepageBlockPage.query),
    {
      module: 'homepage_block_page',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('homepage_block_page rejects a body without a return code', async () => {
  const upstream = structuredClone(homepageBlockPage.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).homepageBlockPage(homepageBlockPage.query),
    {
      module: 'homepage_block_page',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('homepage_block_page rejects a body without a blocks list', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: { blocks?: unknown };
  };
  delete upstream.data.blocks;

  await expectUpstreamShapeRejection(
    replay(upstream).homepageBlockPage(homepageBlockPage.query),
    {
      module: 'homepage_block_page',
      path: 'body.data.blocks',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('homepage_block_page rejects a blocks list that is not an array', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: { blocks: unknown };
  };
  upstream.data.blocks = {};

  await expectUpstreamShapeRejection(
    replay(upstream).homepageBlockPage(homepageBlockPage.query),
    {
      module: 'homepage_block_page',
      path: 'body.data.blocks',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('homepage_block_page rejects a block without a blockCode', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: { blocks: Array<Record<string, unknown>> };
  };
  delete upstream.data.blocks[0]!.blockCode;

  await expectUpstreamShapeRejection(
    replay(upstream).homepageBlockPage(homepageBlockPage.query),
    {
      module: 'homepage_block_page',
      path: 'body.data.blocks[0].blockCode',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('homepage_block_page rejects a blockCode that is not text', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: { blocks: Array<Record<string, unknown>> };
  };
  upstream.data.blocks[0]!.blockCode = 0;

  await expectUpstreamShapeRejection(
    replay(upstream).homepageBlockPage(homepageBlockPage.query),
    {
      module: 'homepage_block_page',
      path: 'body.data.blocks[0].blockCode',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('homepage_block_page accepts a block without creatives', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: { blocks: Array<Record<string, unknown>> };
  };
  delete upstream.data.blocks[0]!.creatives;

  const result = await replay(upstream).homepageBlockPage(
    homepageBlockPage.query,
  );

  const first = result.body.data.blocks[0]!;
  expect(first as unknown).not.toHaveProperty('creatives');
  expect(first.blockCode).toBe(
    homepageBlockPage.response.body.data.blocks[0]!.blockCode,
  );
});

test('homepage_block_page returns creatives: null unchanged', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: { blocks: Array<Record<string, unknown>> };
  };
  upstream.data.blocks[0]!.creatives = null;

  const result = await replay(upstream).homepageBlockPage(
    homepageBlockPage.query,
  );

  expect(result.body.data.blocks[0]!.creatives as unknown).toBeNull();
});

test('homepage_block_page drops a resources list with a bad element', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: {
      blocks: Array<{
        creatives?: Array<Record<string, unknown>>;
      }>;
    };
  };
  upstream.data.blocks[0]!.creatives![0]!.resources = [null];

  const result = await replay(upstream).homepageBlockPage(
    homepageBlockPage.query,
  );
  const creative = result.body.data.blocks[0]!.creatives![0]!;

  expect(creative).not.toHaveProperty('resources');
  expect(creative.creativeType).toBe(
    homepageBlockPage.response.body.data.blocks[0]!.creatives[0]!.creativeType,
  );
});

test('homepage_block_page rejects a null creative', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: { blocks: Array<Record<string, unknown>> };
  };
  upstream.data.blocks[0]!.creatives = [null];

  await expectUpstreamShapeRejection(
    replay(upstream).homepageBlockPage(homepageBlockPage.query),
    {
      module: 'homepage_block_page',
      path: 'body.data.blocks[0].creatives[0]',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('homepage_block_page drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    homepageBlockPage.response.body,
  ) as unknown as {
    data: {
      blocks: Array<
        Record<string, unknown> & {
          creatives?: Array<{
            resources?: Array<Record<string, unknown>>;
          }>;
        }
      >;
      pageConfig: Record<string, unknown>;
    };
  };
  const block = upstream.data.blocks[0]!;
  block.showType = 1;
  block.extraBlockField = 'kept';
  upstream.data.pageConfig.refreshInterval = '600000';
  const resource = block.creatives?.[0]?.resources?.[0];
  if (resource !== undefined) {
    resource.resourceExtInfo = { hasListened: 'no', extraResourceField: 1 };
  }

  const result = await replay(upstream).homepageBlockPage(
    homepageBlockPage.query,
  );
  const firstBlock = result.body.data.blocks[0] as unknown as Record<
    string,
    unknown
  >;
  const firstResource = (
    firstBlock.creatives as Array<{ resources: Array<Record<string, unknown>> }>
  )[0]?.resources[0];

  expect(firstBlock).not.toHaveProperty('showType');
  expect(firstBlock.extraBlockField).toBe('kept');
  expect(result.body.data.pageConfig as unknown).not.toHaveProperty(
    'refreshInterval',
  );
  expect(firstResource?.resourceExtInfo).toEqual({ extraResourceField: 1 });
});

test('homepage_dragon_ball rejects a body without a return code', async () => {
  const upstream = structuredClone(homepageDragonBall.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).homepageDragonBall(homepageDragonBall.query),
    {
      module: 'homepage_dragon_ball',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('homepage_dragon_ball drops a bad message and keeps undeclared data', async () => {
  const upstream = structuredClone(
    homepageDragonBall.response.body,
  ) as unknown as Record<string, unknown> & { message: unknown };
  upstream.message = 1;
  upstream.data = [{ entry: 'kept' }];

  const result = await replay(upstream).homepageDragonBall(
    homepageDragonBall.query,
  );

  expect(result.body as unknown).not.toHaveProperty('message');
  expect((result.body as unknown as { data: unknown }).data).toEqual([
    { entry: 'kept' },
  ]);
});

test('homepage_dragon_ball passes a rejected code through', async () => {
  const body = { code: 301, message: 'need login', data: [] };

  expect(await settle(replay(body).homepageDragonBall())).toEqual({
    rejected: { status: 301, cookie: [], body },
  });
});
