---
title: '推荐电台'
description: '调用此接口，可获取推荐电台'
---

# 推荐电台

> 调用此接口，可获取推荐电台

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/personalized/djprogram` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 否                        |
| 对应模块 | `personalized_djprogram`  |
| 文档分类 | 推荐与发现                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /personalized/djprogram
```

## 编程式调用

```ts
import { personalizedDjprogram } from 'hana-music-api';

const result = await personalizedDjprogram();

console.log(result.body);
```

## 返回内容

`body.code`、通到推荐电台的 `body.result` 和条目自己的编号 `result[].id` 收紧；`category` 宽松。条目里的节目比 `DjProgram` 多 `publish`、`subscribed`、`subscribedCount`、`userId`、`adjustedPlayCount` 等个人电台字段，在模块内单独声明，只复用其中的旧版歌曲 `ProgramMainSong` 和主播 `ProgramDj`；节目里的电台摘要多 `whiteList`、`hightQuality`，也单独声明。`programDesc`、`titbits`、`titbitImages`、`songs` 在本批录制里只见过 `null`，没有声明。本批录制与探测未发现可达的空结果，`result` 数组本身允许为空。录制按字段覆盖保留非连续子集（索引 5/0/1/2，原始 6 条），见 `context.truncated`。

## 补充说明

说明 : 调用此接口，可获取推荐电台

**接口地址 :** `/personalized/djprogram`

**调用例子 :** `/personalized/djprogram`
