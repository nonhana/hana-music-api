---
title: '新碟上架'
description: '调用此接口，可获取新碟上架列表，如需具体音乐信息需要调用获取专辑列表接'
---

# 新碟上架

调用此接口，可获取新碟上架列表，如需具体音乐信息需要调用获取专辑列表接

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/top/album`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 否                                           |
| 对应模块   | `top_album`                                  |
| SDK 函数   | `topAlbum`（`hana-music-api/api/top_album`） |
| 返回体类型 | `TopAlbumBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { topAlbum } from 'hana-music-api';

const result = await topAlbum({
  offset: 0,
  limit: 30,
  year: 2019,
  month: 6,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/top/album' \
  --data-urlencode 'offset=0' \
  --data-urlencode 'limit=30' \
  --data-urlencode 'year=2019' \
  --data-urlencode 'month=6'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                         |
| -------- | ---------------- | ---- | ------ | -------------------------------------------- |
| `area`   | `string`         | 否   | `ALL`  | ALL:全部，ZH:华语，EA:欧美，KR:韩国，JP:日本 |
| `type`   | `'new' \| 'hot'` | 否   | `new`  | new:全部 hot:热门，默认为 new                |
| `limit`  | `number`         | 否   | `50`   | 返回数量，默认 `50`                          |
| `offset` | `number`         | 否   | `0`    | 偏移数量，用于分页，默认 `0`                 |
| `year`   | `number`         | 否   | 本年   | 年，默认本年                                 |
| `month`  | `number`         | 否   | 本月   | 月，默认本月                                 |

| `area` | 地区         |
| ------ | ------------ |
| `ALL`  | 全部（默认） |
| `ZH`   | 华语         |
| `EA`   | 欧美         |
| `KR`   | 韩国         |
| `JP`   | 日本         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`TopAlbumBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/top_album`、`hana-music-api/schemas/top_album` 导入运行时校验器）。

```ts
type Album = Omit<AlbumSummary, 'areaId' | 'exclusive'> & {
  areaId?: number | null;
  exclusive?: boolean | null;
};

type TopAlbumBody = {
  code: 200;
  hasMore?: boolean | null;
  weekData?: Array<Album> | null;
  monthData: Array<Album>;
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                    | 类型           | 必填 | 说明                                                            |
| ----------------------- | -------------- | ---- | --------------------------------------------------------------- |
| `code`                  | `200`          | 是   | 业务状态码（`200` 表示成功）                                    |
| `hasMore`               | `boolean`      | 否   | 是否还有更多数据                                                |
| `weekData`              | `Array<Album>` | 可空 | 条目列表，继承自 [AlbumSummary](/api/shared-types#albumsummary) |
| `weekData[].areaId`     | `number`       | 否   | area ID                                                         |
| `weekData[].exclusive`  | `boolean`      | 否   | -                                                               |
| `monthData`             | `Array<Album>` | 是   | 条目列表，继承自 [AlbumSummary](/api/shared-types#albumsummary) |
| `monthData[].areaId`    | `number`       | 否   | area ID                                                         |
| `monthData[].exclusive` | `boolean`      | 否   | -                                                               |

<!-- api-doc:response:end -->
