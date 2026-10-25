---
title: '全部新碟'
description: '登录后调用此接口 ,可获取全部新碟'
---

# 全部新碟

> 登录后调用此接口 ,可获取全部新碟

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/album/new`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `album_new`    |
| 文档分类 | 专辑           |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |
| `area`   | string           |  —   | -      | ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本                                |

## HTTP 示例

```bash
GET /album/new?area=KR&limit=10
```

## 编程式调用

```ts
import { albumNew } from 'hana-music-api';

const result = await albumNew({
  area: 'KR',
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.albums` 和每张专辑的 `albums[].id` 收紧；专辑记录共用 `AlbumSummary`，`total` 是宽松字段。`offset=100000`（录制 `album_new.empty.json`）会返回 `albums: []`（`total` 仍是 500），空结果可以正常返回；专辑里的 `songs` 只见过空数组，没有声明，原样保留。结构定义和类型是 `AlbumNewBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口 ,可获取全部新碟

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

`area` : ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本

**接口地址 :** `/album/new`

**调用例子 :** `/album/new?area=KR&limit=10`
