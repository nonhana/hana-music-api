---
title: '电台 - 节目榜'
description: '登录后调用此接口，可获得电台节目榜'
---

# 电台 - 节目榜

> 登录后调用此接口，可获得电台节目榜

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/dj/program/toplist` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `dj_program_toplist`  |
| 文档分类 | 电台与播客            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                      |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 100    | 返回数量，默认为 100                                                      |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*100, 其中 100 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /dj/program/toplist?limit=1
```

## 编程式调用

```ts
import { djProgramToplist } from 'hana-music-api';

const result = await djProgramToplist({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到节目榜的 `body.toplist` 和榜上节目自己的编号 `toplist[].program.id` 收紧；排名 `rank`、上期排名 `lastRank`、分数 `score`、`programFeeType` 和 `updateTime` 宽松，节目本身按 `DjProgram` 校验。`limit` 由 SDK 默认 `100` 后再请求（`limit=0` 也走默认），上游忽略 `offset`，本批录制与探测未发现可达的空结果，数组本身允许为空。录制按字段覆盖保留非连续子集（索引 2/1，原始 5 条），见 `context.truncated`。

## 补充说明

说明 : 登录后调用此接口，可获得电台节目榜

**可选参数 :**

`limit` : 返回数量，默认为 100

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*100, 其中 100 为 limit 的值，默认为 0

**接口地址 :** `/dj/program/toplist`

**调用例子 :** `/dj/program/toplist?limit=1`
