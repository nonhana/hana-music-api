---
title: 'mv 排行'
description: '调用此接口，可获取 mv 排行'
---

# mv 排行

> 调用此接口，可获取 mv 排行

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/top/mv`      |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `top_mv`       |
| 文档分类 | 排行榜         |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                        |
| -------- | ---------------- | :--: | ------ | --------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 取出数量，默认为 30                                                         |
| `area`   | string           |  —   | -      | 地区,可选值为内地,港台,欧美,日本,韩国,不填则为全部                          |
| `offset` | number \| string |  —   | <br>为 | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认<br>为 0 |

## HTTP 示例

```bash
GET /top/mv?limit=10
```

## 编程式调用

```ts
import { topMv } from 'hana-music-api';

const result = await topMv({
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`body.code`、排行列表 `body.data` 和每个 MV 的编号 `data[].id` 收紧（共用 `MvSummary`）；`lastRank`、`score`、`hasMore`、`updateTime` 和嵌套的 `mv`（含 `videos[].tagSign`）都是宽松字段。录制 `top_mv.default.json` 原始 30 条，截取前 10 条（见 `context.truncated`）；本批录制与探测未发现可达的空结果。结构定义和类型是 `TopMvBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取 mv 排行

**可选参数 :** `limit`: 取出数量，默认为 30

`area`: 地区,可选值为内地,港台,欧美,日本,韩国,不填则为全部

`offset`: 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认
为 0

**接口地址 :** `/top/mv`

**调用例子 :** `/top/mv?limit=10`
