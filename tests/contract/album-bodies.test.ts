import { expect, expectTypeOf, test } from 'bun:test';

import {
  AlbumDetailBody,
  AlbumDetailDynamicBody,
  AlbumListBody,
  AlbumListStyleBody,
  AlbumNewBody,
  AlbumNewestBody,
  AlbumPrivilegeBody,
  AlbumSongsaleboardBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import albumDetailVip from '../fixtures/netease/album/album_detail.default-vip.json';
import albumDetail from '../fixtures/netease/album/album_detail.default.json';
import albumDetailNonDigital from '../fixtures/netease/album/album_detail.non-digital.json';
import albumDetailUnknown from '../fixtures/netease/album/album_detail.unknown.json';
import albumDetailDynamic from '../fixtures/netease/album/album_detail_dynamic.default.json';
import albumDetailDynamicDigital from '../fixtures/netease/album/album_detail_dynamic.digital.json';
import albumDetailDynamicUnknown from '../fixtures/netease/album/album_detail_dynamic.unknown.json';
import albumList from '../fixtures/netease/album/album_list.default.json';
import albumListOffset from '../fixtures/netease/album/album_list.offset-100000.json';
import albumListStyle from '../fixtures/netease/album/album_list_style.default.json';
import albumListStyleOutOfRange from '../fixtures/netease/album/album_list_style.out-of-range.json';
import albumNew from '../fixtures/netease/album/album_new.default.json';
import albumNewEmpty from '../fixtures/netease/album/album_new.empty.json';
import albumNewest from '../fixtures/netease/album/album_newest.default.json';
import albumPrivilegeVip from '../fixtures/netease/album/album_privilege.album-vip.json';
import albumPrivilege from '../fixtures/netease/album/album_privilege.album.json';
import albumPrivilegeDigital from '../fixtures/netease/album/album_privilege.digital.json';
import albumPrivilegeUnknown from '../fixtures/netease/album/album_privilege.unknown.json';
import albumSongsaleboardDaily from '../fixtures/netease/album/album_songsaleboard.daily.json';
import albumSongsaleboardTotal from '../fixtures/netease/album/album_songsaleboard.total.json';
import albumSongsaleboardWeekEmpty from '../fixtures/netease/album/album_songsaleboard.week-empty.json';
import albumSongsaleboardWeek from '../fixtures/netease/album/album_songsaleboard.week.json';
import albumSongsaleboardYearEmpty from '../fixtures/netease/album/album_songsaleboard.year-empty.json';
import albumSongsaleboardYear from '../fixtures/netease/album/album_songsaleboard.year.json';

// issue #102 B1 的匿名录制；album_detail、album_privilege 另有登录对照，差异见各录制的 context。
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
    name: 'album_detail',
    recording: albumDetail,
    bodySchema: AlbumDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).albumDetail(albumDetail.query),
  },
  {
    name: 'album_detail for a music VIP account',
    recording: albumDetailVip,
    bodySchema: AlbumDetailBody,
    call: (upstream, status) =>
      replay(upstream, status).albumDetail(albumDetailVip.query),
  },
  {
    name: 'album_detail_dynamic',
    recording: albumDetailDynamic,
    bodySchema: AlbumDetailDynamicBody,
    call: (upstream, status) =>
      replay(upstream, status).albumDetailDynamic(albumDetailDynamic.query),
  },
  {
    name: 'album_detail_dynamic for a digital album',
    recording: albumDetailDynamicDigital,
    bodySchema: AlbumDetailDynamicBody,
    call: (upstream, status) =>
      replay(upstream, status).albumDetailDynamic(
        albumDetailDynamicDigital.query,
      ),
  },
  {
    name: 'album_detail_dynamic for an unknown album',
    recording: albumDetailDynamicUnknown,
    bodySchema: AlbumDetailDynamicBody,
    call: (upstream, status) =>
      replay(upstream, status).albumDetailDynamic(
        albumDetailDynamicUnknown.query,
      ),
  },
  {
    name: 'album_list',
    recording: albumList,
    bodySchema: AlbumListBody,
    call: (upstream, status) =>
      replay(upstream, status).albumList(albumList.query),
  },
  {
    name: 'album_list_style',
    recording: albumListStyle,
    bodySchema: AlbumListStyleBody,
    call: (upstream, status) =>
      replay(upstream, status).albumListStyle(albumListStyle.query),
  },
  {
    name: 'album_new',
    recording: albumNew,
    bodySchema: AlbumNewBody,
    call: (upstream, status) =>
      replay(upstream, status).albumNew(albumNew.query),
  },
  {
    name: 'album_new without releases',
    recording: albumNewEmpty,
    bodySchema: AlbumNewBody,
    call: (upstream, status) =>
      replay(upstream, status).albumNew(albumNewEmpty.query),
  },
  {
    name: 'album_newest',
    recording: albumNewest,
    bodySchema: AlbumNewestBody,
    call: (upstream, status) =>
      replay(upstream, status).albumNewest(albumNewest.query),
  },
  {
    name: 'album_privilege',
    recording: albumPrivilege,
    bodySchema: AlbumPrivilegeBody,
    call: (upstream, status) =>
      replay(upstream, status).albumPrivilege(albumPrivilege.query),
  },
  {
    name: 'album_privilege for a music VIP account',
    recording: albumPrivilegeVip,
    bodySchema: AlbumPrivilegeBody,
    call: (upstream, status) =>
      replay(upstream, status).albumPrivilege(albumPrivilegeVip.query),
  },
  {
    name: 'album_privilege for a digital album',
    recording: albumPrivilegeDigital,
    bodySchema: AlbumPrivilegeBody,
    call: (upstream, status) =>
      replay(upstream, status).albumPrivilege(albumPrivilegeDigital.query),
  },
  {
    name: 'album_songsaleboard daily',
    recording: albumSongsaleboardDaily,
    bodySchema: AlbumSongsaleboardBody,
    call: (upstream, status) =>
      replay(upstream, status).albumSongsaleboard(
        albumSongsaleboardDaily.query,
      ),
  },
  {
    name: 'album_songsaleboard year',
    recording: albumSongsaleboardYear,
    bodySchema: AlbumSongsaleboardBody,
    call: (upstream, status) =>
      replay(upstream, status).albumSongsaleboard(albumSongsaleboardYear.query),
  },
  {
    name: 'album_songsaleboard total',
    recording: albumSongsaleboardTotal,
    bodySchema: AlbumSongsaleboardBody,
    call: (upstream, status) =>
      replay(upstream, status).albumSongsaleboard(
        albumSongsaleboardTotal.query,
      ),
  },
  {
    name: 'album_list with an offset past its list',
    recording: albumListOffset,
    bodySchema: AlbumListBody,
    call: (upstream, status) =>
      replay(upstream, status).albumList(albumListOffset.query),
  },
  {
    name: 'album_songsaleboard week',
    recording: albumSongsaleboardWeek,
    bodySchema: AlbumSongsaleboardBody,
    call: (upstream, status) =>
      replay(upstream, status).albumSongsaleboard(albumSongsaleboardWeek.query),
  },
  {
    name: 'album_songsaleboard week without releases',
    recording: albumSongsaleboardWeekEmpty,
    bodySchema: AlbumSongsaleboardBody,
    call: (upstream, status) =>
      replay(upstream, status).albumSongsaleboard(
        albumSongsaleboardWeekEmpty.query,
      ),
  },
  {
    name: 'album_songsaleboard for a future year',
    recording: albumSongsaleboardYearEmpty,
    bodySchema: AlbumSongsaleboardBody,
    call: (upstream, status) =>
      replay(upstream, status).albumSongsaleboard(
        albumSongsaleboardYearEmpty.query,
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

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'album_detail',
    recording: albumDetailUnknown,
    call: (upstream, status) =>
      replay(upstream, status).albumDetail(albumDetailUnknown.query),
  },
  {
    name: 'album_detail for a normal album',
    recording: albumDetailNonDigital,
    call: (upstream, status) =>
      replay(upstream, status).albumDetail(albumDetailNonDigital.query),
  },
  {
    name: 'album_list_style',
    recording: albumListStyleOutOfRange,
    call: (upstream, status) =>
      replay(upstream, status).albumListStyle(albumListStyleOutOfRange.query),
  },
  {
    name: 'album_privilege',
    recording: albumPrivilegeUnknown,
    call: (upstream, status) =>
      replay(upstream, status).albumPrivilege(albumPrivilegeUnknown.query),
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
      status: 404,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('album bodies type their tightened records and loose fields', () => {
  expectTypeOf<AlbumDetailBody['album']['albumId']>().toEqualTypeOf<number>();
  expectTypeOf<AlbumDetailBody['product']['price']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<AlbumDetailDynamicBody['commentCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    AlbumListBody['products'][number]['albumId']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    AlbumListStyleBody['albumProducts'][number]['albumId']
  >().toEqualTypeOf<number>();
  expectTypeOf<AlbumNewBody['albums'][number]['id']>().toEqualTypeOf<number>();
  expectTypeOf<AlbumNewBody['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    AlbumNewestBody['albums'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    AlbumPrivilegeBody['data'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<AlbumPrivilegeBody['data'][number]['dl']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    AlbumSongsaleboardBody['products'][number]['albumId']
  >().toEqualTypeOf<number>();
  expectTypeOf<AlbumSongsaleboardBody['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
});

test('album_detail rejects a product detail without an album', async () => {
  const upstream = structuredClone(albumDetail.response.body) as {
    album: unknown;
  };
  upstream.album = null;

  await expectUpstreamShapeRejection(
    replay(upstream).albumDetail(albumDetail.query),
    {
      module: 'album_detail',
      path: 'body.album',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('album_detail rejects a digital album whose albumId is text', async () => {
  const upstream = structuredClone(albumDetail.response.body);
  (upstream.album as { albumId: unknown }).albumId = '396372188';

  await expectUpstreamShapeRejection(
    replay(upstream).albumDetail(albumDetail.query),
    {
      module: 'album_detail',
      path: 'body.album.albumId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('album_detail rejects a product detail without product info', async () => {
  const upstream = structuredClone(albumDetail.response.body) as {
    product?: unknown;
  };
  delete upstream.product;

  await expectUpstreamShapeRejection(
    replay(upstream).albumDetail(albumDetail.query),
    {
      module: 'album_detail',
      path: 'body.product',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('album_detail drops a bad purchase flag and keeps undeclared fields', async () => {
  const upstream = structuredClone(albumDetail.response.body) as {
    canBuy?: unknown;
    hasAlbum: unknown;
    boughtCnt: unknown;
    album: Record<string, unknown>;
    product: Record<string, unknown> & { extInfo: Record<string, unknown> };
  };
  delete upstream.canBuy;
  upstream.hasAlbum = null;
  upstream.boughtCnt = '0';
  upstream.album.customPriceConfig = { price: 22 };
  upstream.product.extInfo.someFlag = true;

  const result = await replay(upstream).albumDetail(albumDetail.query);

  expect(result.body as unknown).not.toHaveProperty('canBuy');
  expect(result.body as unknown).not.toHaveProperty('boughtCnt');
  expect(result.body.hasAlbum as unknown).toBeNull();
  expect(result.body.vipType).toBe(albumDetail.response.body.vipType);
  expect(result.body.album as unknown).toHaveProperty('customPriceConfig', {
    price: 22,
  });
  expect((result.body.product as { extInfo: unknown }).extInfo).toHaveProperty(
    'someFlag',
    true,
  );
});

test('album_detail_dynamic rejects a body without a return code', async () => {
  const upstream = structuredClone(albumDetailDynamic.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).albumDetailDynamic(albumDetailDynamic.query),
    {
      module: 'album_detail_dynamic',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('album_detail_dynamic drops bad counters and keeps undeclared fields', async () => {
  const upstream = structuredClone(albumDetailDynamic.response.body) as {
    subTime?: unknown;
    onSale: unknown;
    commentCount: unknown;
    albumNearbyProduct?: unknown;
    dailyNewFans?: unknown;
  };
  delete upstream.subTime;
  delete upstream.albumNearbyProduct;
  upstream.onSale = null;
  upstream.commentCount = '180';
  upstream.dailyNewFans = 3;

  const result = await replay(upstream).albumDetailDynamic(
    albumDetailDynamic.query,
  );

  expect(result.body as unknown).not.toHaveProperty('subTime');
  expect(result.body as unknown).not.toHaveProperty('commentCount');
  expect(result.body as unknown).not.toHaveProperty('albumNearbyProduct');
  expect(result.body.onSale as unknown).toBeNull();
  expect(result.body.shareCount).toBe(
    albumDetailDynamic.response.body.shareCount,
  );
  expect(result.body as unknown).toHaveProperty('dailyNewFans', 3);
});

test('album_list rejects a digital album without an albumId', async () => {
  const upstream = structuredClone(albumList.response.body);
  delete (upstream.products[0] as { albumId?: unknown }).albumId;

  await expectUpstreamShapeRejection(
    replay(upstream).albumList(albumList.query),
    {
      module: 'album_list',
      path: 'body.products[0].albumId',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('album_list rejects a product list that is not an array', async () => {
  const upstream = structuredClone(albumList.response.body) as {
    products: unknown;
  };
  upstream.products = null;

  await expectUpstreamShapeRejection(
    replay(upstream).albumList(albumList.query),
    {
      module: 'album_list',
      path: 'body.products',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('album_list drops a bad sale count and keeps undeclared fields', async () => {
  const upstream = structuredClone(albumList.response.body);
  const product = upstream.products[0] as {
    area?: unknown;
    price: unknown;
    saleNum: unknown;
    albumName: unknown;
    customPriceConfig?: unknown;
  };
  delete product.area;
  product.price = null;
  product.saleNum = '4690';
  product.customPriceConfig = { price: 22 };

  const result = await replay(upstream).albumList(albumList.query);
  const first = result.body.products[0] as unknown as Record<string, unknown>;

  expect(first).not.toHaveProperty('area');
  expect(first).not.toHaveProperty('saleNum');
  expect(first.price).toBeNull();
  expect(first.albumName).toBe(albumList.response.body.products[0]?.albumName);
  expect(first).toHaveProperty('customPriceConfig', { price: 22 });
});

test('album_list returns the first page for an offset past its list', async () => {
  const result = await replay(
    albumListOffset.response.body,
    albumListOffset.response.status,
  ).albumList(albumListOffset.query);

  expect(result.status).toBe(200);
  expect(result.body.products.map((product) => product.albumId)).toEqual(
    albumList.response.body.products.map((product) => product.albumId),
  );
});

test('album_list_style rejects a style album without an albumId', async () => {
  const upstream = structuredClone(albumListStyle.response.body);
  (upstream.albumProducts[0] as { albumId: unknown }).albumId = '404060139';

  await expectUpstreamShapeRejection(
    replay(upstream).albumListStyle(albumListStyle.query),
    {
      module: 'album_list_style',
      path: 'body.albumProducts[0].albumId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('album_list_style drops a bad artist name list and keeps the album', async () => {
  const upstream = structuredClone(albumListStyle.response.body);
  const product = upstream.albumProducts[0] as {
    bought?: unknown;
    type: unknown;
    artistNames: unknown;
    albumName: unknown;
    customPriceConfig?: unknown;
  };
  delete product.bought;
  product.type = null;
  product.artistNames = '林俊杰';
  product.customPriceConfig = { price: 4 };

  const result = await replay(upstream).albumListStyle(albumListStyle.query);
  const first = result.body.albumProducts[0] as unknown as Record<
    string,
    unknown
  >;

  expect(first).not.toHaveProperty('bought');
  expect(first).not.toHaveProperty('artistNames');
  expect(first.type).toBeNull();
  expect(first.albumName).toBe(
    albumListStyle.response.body.albumProducts[0]?.albumName,
  );
  expect(first).toHaveProperty('customPriceConfig', { price: 4 });
});

test('album_list_style keeps hasNextPage loose at the top level', async () => {
  const upstream = structuredClone(albumListStyle.response.body) as {
    hasNextPage: unknown;
  };
  upstream.hasNextPage = 'yes';

  const result = await replay(upstream).albumListStyle(albumListStyle.query);

  expect(result.body as unknown).not.toHaveProperty('hasNextPage');
  expect(result.body.albumProducts).toHaveLength(
    albumListStyle.response.body.albumProducts.length,
  );
});

test('album_new rejects a release without an id', async () => {
  const upstream = structuredClone(albumNew.response.body);
  delete (upstream.albums[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).albumNew(albumNew.query),
    {
      module: 'album_new',
      path: 'body.albums[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('album_new drops a bad company and keeps undeclared songs', async () => {
  const upstream = structuredClone(albumNew.response.body) as {
    total?: unknown;
    albums: Array<{ mark: unknown; company: unknown; songs?: unknown }>;
  };
  delete upstream.total;
  const album = upstream.albums[0]!;
  album.mark = null;
  album.company = 123;
  album.songs = [{ id: 1 }];

  const result = await replay(upstream).albumNew(albumNew.query);
  const first = result.body.albums[0] as unknown as Record<string, unknown>;

  expect(result.body as unknown).not.toHaveProperty('total');
  expect(first).not.toHaveProperty('company');
  expect(first.mark).toBeNull();
  expect(first.name).toBe(albumNew.response.body.albums[0]?.name);
  expect(first).toHaveProperty('songs', [{ id: 1 }]);
});

test('album_new returns a recorded empty release list unchanged', async () => {
  const result = await replay(albumNewEmpty.response.body).albumNew(
    albumNewEmpty.query,
  );

  expect(result.status).toBe(200);
  expect(result.body.albums as unknown).toEqual([]);
  expect(result.body.total).toBe(albumNewEmpty.response.body.total);
});

test('album_newest rejects a latest album whose id is text', async () => {
  const upstream = structuredClone(albumNewest.response.body);
  (upstream.albums[0] as { id: unknown }).id = '400290288';

  await expectUpstreamShapeRejection(
    replay(upstream).albumNewest(albumNewest.query),
    {
      module: 'album_newest',
      path: 'body.albums[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('album_newest drops a bad size and keeps undeclared fields', async () => {
  const upstream = structuredClone(albumNewest.response.body) as {
    albums: Array<{
      paid?: unknown;
      companyId: unknown;
      size: unknown;
      extra?: unknown;
    }>;
  };
  const album = upstream.albums[0]!;
  delete album.paid;
  album.companyId = null;
  album.size = '4';
  album.extra = { source: 'home' };

  const result = await replay(upstream).albumNewest(albumNewest.query);
  const first = result.body.albums[0] as unknown as Record<string, unknown>;

  expect(first).not.toHaveProperty('paid');
  expect(first).not.toHaveProperty('size');
  expect(first.companyId).toBeNull();
  expect(first.name).toBe(albumNewest.response.body.albums[0]?.name);
  expect(first).toHaveProperty('extra', { source: 'home' });
});

test('album_privilege rejects a quality record without a song id', async () => {
  const upstream = structuredClone(albumPrivilege.response.body);
  delete (upstream.data[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).albumPrivilege(albumPrivilege.query),
    {
      module: 'album_privilege',
      path: 'body.data[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('album_privilege rejects a data block that is not an array', async () => {
  const upstream = structuredClone(albumPrivilege.response.body) as {
    data: unknown;
  };
  upstream.data = 'none';

  await expectUpstreamShapeRejection(
    replay(upstream).albumPrivilege(albumPrivilege.query),
    {
      module: 'album_privilege',
      path: 'body.data',
      expected: 'array',
      actual: 'string',
    },
  );
});

test('album_privilege drops a bad trial flag and keeps undeclared fields', async () => {
  const upstream = structuredClone(albumPrivilege.response.body);
  const privilege = upstream.data[0] as {
    toast?: unknown;
    dl: unknown;
    freeTrialPrivilege: { listenType: unknown; resConsumable: unknown };
    bd?: unknown;
  };
  delete privilege.toast;
  privilege.dl = null;
  privilege.freeTrialPrivilege.listenType = 'none';
  privilege.bd = 'cloud';

  const result = await replay(upstream).albumPrivilege(albumPrivilege.query);
  const first = result.body.data[0] as unknown as Record<string, unknown>;

  expect(first).not.toHaveProperty('toast');
  expect(first.dl).toBeNull();
  expect(first.fee).toBe(albumPrivilege.response.body.data[0]?.fee);
  expect(first.freeTrialPrivilege).toHaveProperty('resConsumable', false);
  expect(first.freeTrialPrivilege).not.toHaveProperty('listenType');
  expect(first).toHaveProperty('bd', 'cloud');
});

test('album_songsaleboard rejects a sales record without an albumId', async () => {
  const upstream = structuredClone(albumSongsaleboardDaily.response.body);
  (upstream.products[0] as { albumId: unknown }).albumId = '156507145';

  await expectUpstreamShapeRejection(
    replay(upstream).albumSongsaleboard(albumSongsaleboardDaily.query),
    {
      module: 'album_songsaleboard',
      path: 'body.products[0].albumId',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('album_songsaleboard drops a bad rank change and keeps undeclared fields', async () => {
  const upstream = structuredClone(albumSongsaleboardDaily.response.body);
  const product = upstream.products[0] as {
    newest?: unknown;
    rankIncr: unknown;
    salesCertificationSystemLevelCode: unknown;
    albumName: unknown;
    bundleTag?: unknown;
  };
  delete product.newest;
  product.rankIncr = '1';
  product.salesCertificationSystemLevelCode = null;
  product.bundleTag = { label: '首发' };

  const result = await replay(upstream).albumSongsaleboard(
    albumSongsaleboardDaily.query,
  );
  const first = result.body.products[0] as unknown as Record<string, unknown>;

  expect(first).not.toHaveProperty('newest');
  expect(first).not.toHaveProperty('rankIncr');
  expect(first.salesCertificationSystemLevelCode).toBeNull();
  expect(first.albumName).toBe(
    albumSongsaleboardDaily.response.body.products[0]?.albumName,
  );
  expect(first).toHaveProperty('bundleTag', { label: '首发' });
});

test('album_songsaleboard keeps hasMore loose for the yearly boards', async () => {
  const upstream = structuredClone(albumSongsaleboardTotal.response.body) as {
    hasMore: unknown;
  };
  upstream.hasMore = 'yes';

  const result = await replay(upstream).albumSongsaleboard(
    albumSongsaleboardTotal.query,
  );

  expect(result.body as unknown).not.toHaveProperty('hasMore');
  expect(result.body.products).toHaveLength(
    albumSongsaleboardTotal.response.body.products.length,
  );
});

test('album_songsaleboard returns a week board with no releases and no hasMore', async () => {
  const result = await replay(
    albumSongsaleboardWeekEmpty.response.body,
    albumSongsaleboardWeekEmpty.response.status,
  ).albumSongsaleboard(albumSongsaleboardWeekEmpty.query);

  expect(result.status).toBe(200);
  expect(result.body.products as unknown).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('hasMore');
});

test('album_songsaleboard returns a recorded empty yearly board unchanged', async () => {
  const result = await replay(
    albumSongsaleboardYearEmpty.response.body,
  ).albumSongsaleboard(albumSongsaleboardYearEmpty.query);

  expect(result.status).toBe(200);
  expect(result.body.products as unknown).toEqual([]);
  expect(result.body.hasMore).toBe(false);
});
