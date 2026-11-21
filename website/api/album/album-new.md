---
title: '全部新碟'
description: '登录后调用此接口 ，可获取全部新碟'
---

# 全部新碟

登录后调用此接口 ，可获取全部新碟

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/album/new`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 是                                           |
| 对应模块   | `album_new`                                  |
| SDK 函数   | `albumNew`（`hana-music-api/api/album_new`） |
| 返回体类型 | `AlbumNewBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { albumNew } from 'hana-music-api';

const result = await albumNew(
  {
    area: 'KR',
    limit: 10,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/album/new' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'area=KR' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型                                    | 必填 | 默认值 | 说明                                                                    |
| -------- | --------------------------------------- | ---- | ------ | ----------------------------------------------------------------------- |
| `area`   | `'ALL' \| 'ZH' \| 'EA' \| 'KR' \| 'JP'` | 否   | `ALL`  | ALL:全部，ZH:华语，EA:欧美，KR:韩国，JP:日本                            |
| `limit`  | `number`                                | 否   | `30`   | 返回数量，默认为 30                                                     |
| `offset` | `number`                                | 否   | `0`    | 偏移数量，用于分页，如：(页数 - 1)\*30，其中 30 为 limit 的值，默认为 0 |

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

返回体类型：`AlbumNewBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/album_new`、`hana-music-api/schemas/album_new` 导入运行时校验器）。

```ts
type AlbumNewBody = {
  code: 200;
  albums: Array<AlbumSummary>;
  total?: number | null;
};
```

- **公共类型**：[AlbumSummary](/api/shared-types#albumsummary)

| 字段     | 类型                                                    | 必填 | 说明                         |
| -------- | ------------------------------------------------------- | ---- | ---------------------------- |
| `code`   | `200`                                                   | 是   | 业务状态码（`200` 表示成功） |
| `albums` | Array\<[AlbumSummary](/api/shared-types#albumsummary)\> | 是   | 专辑列表                     |
| `total`  | `number`                                                | 否   | 总条目数                     |

<!-- api-doc:response:end -->
