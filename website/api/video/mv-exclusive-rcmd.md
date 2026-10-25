---
title: '网易出品 mv'
description: '调用此接口，可获取网易出品 mv'
---

# 网易出品 mv

> 调用此接口，可获取网易出品 mv

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/mv/exclusive/rcmd` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `mv_exclusive_rcmd`  |
| 文档分类 | 视频与 MV            |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                        |
| -------- | ---------------- | :--: | ------ | --------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 取出数量，默认为 30                                                         |
| `offset` | number \| string |  —   | <br>为 | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认<br>为 0 |

## HTTP 示例

```bash
GET /mv/exclusive/rcmd?limit=10
```

## 编程式调用

```ts
import { mvExclusiveRcmd } from 'hana-music-api';

const result = await mvExclusiveRcmd({
  limit: '10',
});

console.log(result.body);
```

## 返回内容

`body.code`、网易出品 MV 列表 `body.data` 和每个 MV 的编号 `data[].id` 收紧（共用 `MvSummary`）；`more` 和记录里的封面、简介、播放数、时长、收藏状态、`artists` 都是宽松字段。`offset` 越过总数时返回空数组（录制 `mv_exclusive_rcmd.no-result.json`）。结构定义和类型是 `MvExclusiveRcmdBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取网易出品 mv

**可选参数 :** `limit`: 取出数量，默认为 30

`offset`: 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认
为 0

**接口地址 :** `/mv/exclusive/rcmd`

**调用例子 :** `/mv/exclusive/rcmd?limit=10`
