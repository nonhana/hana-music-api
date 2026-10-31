import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const ProductExtInfo = UpstreamObject({
  backgroundColor: Loose(Schema.String),
  caPlayType: Loose(Schema.Finite),
  caUrl: Loose(Schema.String),
  checkoutCounterStyleCode: Loose(Schema.String),
  combinationModuleTitle: Loose(Schema.String),
  copyrightLogo: Loose(Schema.String),
  copyrightName: Loose(Schema.String),
  coverAnimation: Loose(Schema.Finite),
  domainHexColor: Loose(Schema.String),
  enableReserveWeight: Loose(Schema.Boolean),
  foregroundColor: Loose(Schema.String),
  hasCertification: Loose(Schema.Boolean),
  hasMessageSupportTips: Loose(Schema.Boolean),
  markToSearch: Loose(Schema.Finite),
  moduleSkuCopywriting: Loose(Schema.String),
  moduleThemeColor: Loose(Schema.String),
  multiShopCardConfig: Loose(Schema.String),
  pureAlbumDesc: Loose(Schema.String),
  pureAlbumSkuName: Loose(Schema.String),
  reserveCardUrl: Loose(Schema.String),
  reserveSuccessImgId: Loose(Schema.String),
  saleEntranceVideoUrl: Loose(Schema.String),
  showSettingCount: Loose(Schema.Boolean),
});

const ProductDescr = UpstreamObject({
  resource: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

const Product = UpstreamObject({
  albumfee: Loose(Schema.Finite),
  albumType: Loose(Schema.Finite),
  bundling: Loose(Schema.Finite),
  buynotes: Loose(Schema.Array(Schema.String)),
  buysingle: Loose(Schema.Boolean),
  canDraw: Loose(Schema.Finite),
  descr: Loose(Schema.Array(ProductDescr)),
  donateMsg: Loose(Schema.String),
  extInfo: Loose(ProductExtInfo),
  finished: Loose(Schema.Boolean),
  hasMessage: Loose(Schema.Boolean),
  isFree: Loose(Schema.Boolean),
  multipleType: Loose(Schema.Finite),
  mvCoverUrl: Loose(Schema.String),
  mvPlayUrl: Loose(Schema.String),
  mvTitle: Loose(Schema.String),
  prefillBuyNum: Loose(Schema.Finite),
  prefillMsg: Loose(Schema.String),
  price: Loose(Schema.Finite),
  pubTime: Loose(Schema.Finite),
  saleDisplayType: Loose(Schema.Finite),
  saleNum: Loose(Schema.Finite),
  showMv: Loose(Schema.Boolean),
  singleCanBoard: Loose(Schema.Boolean),
  status: Loose(Schema.Finite),
  tags: Loose(Schema.Array(Schema.String)),
});

const DigitalAlbum = UpstreamObject({
  albumId: Schema.Finite,
  albumName: Loose(Schema.String),
  artistAvatarUrl: Loose(Schema.String),
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  artistNames: Loose(Schema.String),
  bundling: Loose(Schema.Finite),
  coverDocId: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  liveType: Loose(Schema.Finite),
  roomNo: Loose(Schema.Finite),
  stars: Loose(Schema.Boolean),
});

const ProductBoard = UpstreamObject({
  hasFansBoard: Loose(Schema.Boolean),
  hasTodayBoard: Loose(Schema.Boolean),
  todayBoardDesc: Loose(Schema.String),
  totalBoardDesc: Loose(Schema.String),
});

// 通到数字专辑详情的路径 `album`、`product` 和专辑自己的编号 `album.albumId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    album: DigitalAlbum,
    product: Product,
    board: Loose(ProductBoard),
    boughtCnt: Loose(Schema.Finite),
    canBuy: Loose(Schema.Boolean),
    hasAlbum: Loose(Schema.Boolean),
    singleSongProductId: Loose(Schema.Finite),
    vipType: Loose(Schema.Finite),
    visitorId: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const albumDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/vipmall/albumproduct/detail`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'album_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 数字专辑详情
 */
export default albumDetail;
