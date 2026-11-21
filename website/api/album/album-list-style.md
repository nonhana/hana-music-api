---
title: '数字专辑-语种风格馆'
description: '调用此接口 ，可获取语种风格馆数字专辑列表'
---

# 数字专辑-语种风格馆

调用此接口 ，可获取语种风格馆数字专辑列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                        |
| ---------- | --------------------------------------------------------- |
| 接口地址   | `/album/list/style`                                       |
| 请求方式   | `GET` / `POST`                                            |
| 需要登录   | 否                                                        |
| 对应模块   | `album_list_style`                                        |
| SDK 函数   | `albumListStyle`（`hana-music-api/api/album_list_style`） |
| 返回体类型 | `AlbumListStyleBody`（已建模返回体）                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumListStyle } from 'hana-music-api';

const result = await albumListStyle({
  area: 'Z_H',
  offset: 2,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/list/style' \
  --data-urlencode 'area=Z_H' \
  --data-urlencode 'offset=2'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型                             | 必填 | 默认值 | 说明                                                                    |
| -------- | -------------------------------- | ---- | ------ | ----------------------------------------------------------------------- |
| `area`   | `'Z_H' \| 'E_A' \| 'KR' \| 'JP'` | 否   | `Z_H`  | 地区 Z_H:华语，E_A:欧美，KR:韩国，JP:日本                               |
| `limit`  | `number`                         | 否   | `10`   | 返回数量，默认为 30                                                     |
| `offset` | `number`                         | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

| `area` | 地区         |
| ------ | ------------ |
| `Z_H`  | 华语（默认） |
| `E_A`  | 欧美         |
| `KR`   | 韩国         |
| `JP`   | 日本         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`AlbumListStyleBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_list_style`、`hana-music-api/schemas/album_list_style` 导入运行时校验器）。

```ts
type StyleAlbum = {
  albumId: number;
  albumName?: string | null;
  artistName?: string | null;
  artistNames?: Array<string> | null;
  bought?: boolean | null;
  coverUrl?: string | null;
  price?: number | null;
  saleDisplayType?: number | null;
  sales?: number | null;
  type?: number | null;
};

type AlbumListStyleBody = {
  code: 200;
  albumProducts: Array<StyleAlbum>;
  hasNextPage?: boolean | null;
};
```

| 字段                              | 类型                | 必填 | 说明                         |
| --------------------------------- | ------------------- | ---- | ---------------------------- |
| `code`                            | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `albumProducts`                   | `Array<StyleAlbum>` | 是   | 数字专辑商品列表             |
| `albumProducts[].albumId`         | `number`            | 是   | 专辑 ID                      |
| `albumProducts[].albumName`       | `string`            | 否   | 专辑名称                     |
| `albumProducts[].artistName`      | `string`            | 否   | 歌手名称                     |
| `albumProducts[].artistNames`     | `Array<string>`     | 否   | 歌手名称列表或文本           |
| `albumProducts[].bought`          | `boolean`           | 否   | -                            |
| `albumProducts[].coverUrl`        | `string`            | 否   | 资源访问链接                 |
| `albumProducts[].price`           | `number`            | 否   | 价格                         |
| `albumProducts[].saleDisplayType` | `number`            | 否   | -                            |
| `albumProducts[].sales`           | `number`            | 否   | -                            |
| `albumProducts[].type`            | `number`            | 否   | -                            |
| `hasNextPage`                     | `boolean`           | 否   | -                            |

<!-- api-doc:response:end -->
