---
title: '推荐歌单'
description: '调用此接口，可获取推荐歌单'
---

# 推荐歌单

> 调用此接口，可获取推荐歌单

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/personalized` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `personalized`  |
| 文档分类 | 推荐与发现      |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                |
| ------- | ---------------- | :--: | ------ | ----------------------------------- |
| `limit` | number \| string |  —   | 30     | 取出数量，默认为 30 (不支持 offset) |

## HTTP 示例

```bash
GET /personalized?limit=1
```

## 编程式调用

```ts
import { personalized } from 'hana-music-api';

const result = await personalized({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、推荐歌单列表 `body.result` 和每个歌单自己的编号 `result[].id` 收紧；卡片复用 `PlaylistSummary`，`category`、`hasTaste`、`copywriter`、`canDislike`、`highQuality` 等宽松。匿名和登录录制各 30 条，字段集相同；`limit=0` 会回落到默认 30，没有可达的空结果，数组本身允许为空。`limit=abc` 返回 `code: 400`，SDK 按业务拒绝原样转交，不会报 502。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `personalized.invalid-limit.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。改造前 `code:400` 经 `SPECIAL_STATUS_CODES` 映射为 resolve `status:200`，现在按业务拒绝为 reject `status:400`、`body` 保留上游原文。

## 补充说明

说明 : 调用此接口，可获取推荐歌单

**可选参数 :** `limit`: 取出数量，默认为 30 (不支持 offset)

**接口地址 :** `/personalized`

**调用例子 :** `/personalized?limit=1`
