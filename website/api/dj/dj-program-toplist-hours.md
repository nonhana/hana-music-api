---
title: '电台 - 24 小时节目榜'
description: '调用此接口,可获取 24 小时节目榜'
---

# 电台 - 24 小时节目榜

> 调用此接口,可获取 24 小时节目榜

## 接口信息

| 项目     | 值                          |
| -------- | --------------------------- |
| 接口地址 | `/dj/program/toplist/hours` |
| 请求方式 | `GET` / `POST`              |
| 需要登录 | 否                          |
| 对应模块 | `dj_program_toplist_hours`  |
| 文档分类 | 电台与播客                  |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                 |
| ------- | ---------------- | :--: | ------ | ------------------------------------ |
| `limit` | number \| string |  —   | 100    | 返回数量，默认为 100 (不支持 offset) |

## HTTP 示例

```bash
GET /dj/program/toplist/hours?limit=1
```

## 编程式调用

```ts
import { djProgramToplistHours } from 'hana-music-api';

const result = await djProgramToplistHours({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到 24 小时节目榜的 `body.data`、`data.list` 和榜上节目自己的编号 `data.list[].program.id` 收紧；`total`、`updateTime`、`rank`、`lastRank`、`score`、`programFeeType` 宽松，`msg` 只见过 `null`，没有声明。`limit` 由 SDK 默认 `100` 后再请求（`limit=0` 也走默认），接口没有 `offset`，本批录制与探测未发现可达的空结果，`list` 数组本身允许为空。

## 补充说明

说明 : 调用此接口,可获取 24 小时节目榜

**可选参数 :**

`limit` : 返回数量，默认为 100 (不支持 offset)

**接口地址 :** `/dj/program/toplist/hours`

**调用例子 :** `/dj/program/toplist/hours?limit=1`
