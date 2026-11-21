---
title: '数字专辑详情'
description: '传入数字专辑 ID，获取数字专辑商品详情、价格与售卖信息。'
---

# 数字专辑详情

传入数字专辑 ID，获取数字专辑商品详情、价格与售卖信息。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/album/detail`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `album_detail`                                     |
| SDK 函数   | `albumDetail`（`hana-music-api/api/album_detail`） |
| 返回体类型 | `AlbumDetailBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumDetail } from 'hana-music-api';

const result = await albumDetail({
  id: '84547195',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/detail' \
  --data-urlencode 'id=84547195'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明        |
| ---- | ------------------ | ---- | ------ | ----------- |
| `id` | `number \| string` | 是   | -      | 数字专辑 ID |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_detail`、`hana-music-api/schemas/album_detail` 导入运行时校验器）。

```ts
type DigitalAlbum = {
  albumId: number;
  albumName?: string | null;
  artistAvatarUrl?: string | null;
  artistId?: number | null;
  artistName?: string | null;
  artistNames?: string | null;
  bundling?: number | null;
  coverDocId?: string | null;
  coverUrl?: string | null;
  liveType?: number | null;
  roomNo?: number | null;
  stars?: boolean | null;
};

type ProductDescr = {
  resource?: string | null;
  type?: number | null;
};

type ProductExtInfo = {
  backgroundColor?: string | null;
  caPlayType?: number | null;
  caUrl?: string | null;
  checkoutCounterStyleCode?: string | null;
  combinationModuleTitle?: string | null;
  copyrightLogo?: string | null;
  copyrightName?: string | null;
  coverAnimation?: number | null;
  domainHexColor?: string | null;
  enableReserveWeight?: boolean | null;
  foregroundColor?: string | null;
  hasCertification?: boolean | null;
  hasMessageSupportTips?: boolean | null;
  markToSearch?: number | null;
  moduleSkuCopywriting?: string | null;
  moduleThemeColor?: string | null;
  multiShopCardConfig?: string | null;
  pureAlbumDesc?: string | null;
  pureAlbumSkuName?: string | null;
  reserveCardUrl?: string | null;
  reserveSuccessImgId?: string | null;
  saleEntranceVideoUrl?: string | null;
  showSettingCount?: boolean | null;
};

type Product = {
  albumfee?: number | null;
  albumType?: number | null;
  bundling?: number | null;
  buynotes?: Array<string> | null;
  buysingle?: boolean | null;
  canDraw?: number | null;
  descr?: Array<ProductDescr> | null;
  donateMsg?: string | null;
  extInfo?: ProductExtInfo | null;
  finished?: boolean | null;
  hasMessage?: boolean | null;
  isFree?: boolean | null;
  multipleType?: number | null;
  mvCoverUrl?: string | null;
  mvPlayUrl?: string | null;
  mvTitle?: string | null;
  prefillBuyNum?: number | null;
  prefillMsg?: string | null;
  price?: number | null;
  pubTime?: number | null;
  saleDisplayType?: number | null;
  saleNum?: number | null;
  showMv?: boolean | null;
  singleCanBoard?: boolean | null;
  status?: number | null;
  tags?: Array<string> | null;
};

type ProductBoard = {
  hasFansBoard?: boolean | null;
  hasTodayBoard?: boolean | null;
  todayBoardDesc?: string | null;
  totalBoardDesc?: string | null;
};

type AlbumDetailBody = {
  code: 200;
  album: DigitalAlbum;
  product: Product;
  board?: ProductBoard | null;
  boughtCnt?: number | null;
  canBuy?: boolean | null;
  hasAlbum?: boolean | null;
  singleSongProductId?: number | null;
  vipType?: number | null;
  visitorId?: number | null;
};
```

| 字段                    | 类型           | 必填 | 说明                         |
| ----------------------- | -------------- | ---- | ---------------------------- |
| `code`                  | `200`          | 是   | 业务状态码（`200` 表示成功） |
| `album`                 | `DigitalAlbum` | 是   | 专辑信息                     |
| `album.albumId`         | `number`       | 是   | 专辑 ID                      |
| `album.albumName`       | `string`       | 否   | 专辑名称                     |
| `album.artistAvatarUrl` | `string`       | 否   | 资源访问链接                 |
| `album.artistId`        | `number`       | 否   | 歌手 ID                      |
| `album.artistName`      | `string`       | 否   | 歌手名称                     |
| `album.artistNames`     | `string`       | 否   | 歌手名称列表或文本           |
| `album.bundling`        | `number`       | 否   | -                            |
| `album.coverDocId`      | `string`       | 否   | coverDoc ID                  |
| `album.coverUrl`        | `string`       | 否   | 资源访问链接                 |
| `album.liveType`        | `number`       | 否   | -                            |
| `album.roomNo`          | `number`       | 否   | -                            |
| `album.stars`           | `boolean`      | 否   | -                            |
| `product`               | `Product`      | 是   | 商品售价与简介信息           |
| `board`                 | `ProductBoard` | 否   | -                            |
| `board.hasFansBoard`    | `boolean`      | 否   | -                            |
| `board.hasTodayBoard`   | `boolean`      | 否   | -                            |
| `board.todayBoardDesc`  | `string`       | 否   | -                            |
| `board.totalBoardDesc`  | `string`       | 否   | -                            |
| `boughtCnt`             | `number`       | 否   | -                            |
| `canBuy`                | `boolean`      | 否   | 是否可购买                   |
| `hasAlbum`              | `boolean`      | 否   | 是否已拥有专辑               |
| `singleSongProductId`   | `number`       | 否   | singleSongProduct ID         |
| `vipType`               | `number`       | 否   | 会员类型标识                 |
| `visitorId`             | `number`       | 否   | visitor ID                   |

<!-- api-doc:response:end -->

## 注意事项

- **接口定位**：本接口用于获取**数字专辑商品**详情与售卖信息；普通免费专辑请调用 [获取专辑内容](/api/album/album)。
- **异常状态**：传入未知专辑 ID 时上游返回 `code: 404`，SDK 按业务拒绝原样返回，详见 [错误处理](/guide/error-handling)。
