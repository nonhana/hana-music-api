---
title: '电台 - 类别热门电台'
description: '电台 - 类别热门电台 接口文档。'
---

# 电台 - 类别热门电台

> 电台 - 类别热门电台 接口文档。

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/dj/radio/hot` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `dj_radio_hot`  |
| 文档分类 | 电台与播客      |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |
| `cateId` | string           |  —   | -      | 类别 id,可通过 `/dj/category/recommend` 接口获取                        |

## HTTP 示例

```bash
GET /dj/radio/hot?cateId=2001
GET /dj/radio/hot?cateId=10002
```

## 编程式调用

```ts
import { djRadioHot } from 'hana-music-api';

const result = await djRadioHot({
  cateId: '2001',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到分类热门电台列表的 `body.djRadios` 和每个电台的编号 `djRadios[].id` 收紧；`count`、`hasMore`、电台名称、封面、分类、价格、计数、`descPicList` 图文、`operateUidList`/`participateUidList` 和 `dj` 主播（复用宽松的 `PlaylistUser`）都是宽松字段；`shortName` 只见过 `null`，没有声明。`offset=100000` 越界分页返回空数组（录制 `dj_radio_hot.empty.json`），未知分类 `cateId=999999` 返回空数组、`count: 0`（录制 `dj_radio_hot.empty-cate.json`）。非空录制按字段覆盖保留非连续子集（索引 7/8/19/23，原始 31 条，见 `context.truncated`），其中 `djRadios[2].participateUidList`、`djRadios[3].operateUidList` 是非空数字数组。缺少 `cateId` 或传非数字 `limit` 时上游返回 HTTP 200、正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `DjRadioHotBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

`cateId`: 类别 id,可通过 `/dj/category/recommend` 接口获取

**接口地址 :** `/dj/radio/hot`

**调用例子 :** `/dj/radio/hot?cateId=2001`(创作|翻唱) `/dj/radio/hot?cateId=10002` (3D|电子)
