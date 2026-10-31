---
title: '推荐新音乐'
description: '调用此接口，可获取推荐新音乐'
---

# 推荐新音乐

> 调用此接口，可获取推荐新音乐

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/personalized/newsong` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `personalized_newsong`  |
| 文档分类 | 推荐与发现              |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                |
| ------- | ---------------- | :--: | ------ | ----------------------------------- |
| `limit` | number \| string |  —   | 10     | 取出数量，默认为 10 (不支持 offset) |

## HTTP 示例

```bash
GET /personalized/newsong
```

## 编程式调用

```ts
import { personalizedNewsong } from 'hana-music-api';

const result = await personalizedNewsong();

console.log(result.body);
```

## 返回内容

`body.code`、推荐新歌列表 `body.result` 和每条记录自己的编号 `result[].id` 收紧；`category`、`trp` 宽松。`song` 是旧版歌曲结构，复用节目记录的 `ProgramMainSong`（`album` 复用 `SimpleAlbum`、`artists` 复用 `Artist`），另声明 `alias`、`exclusive`、`sqMusic`、`hrMusic`、`privilege`（`LooseSongPrivilege`）和 `transName`/`transNames`；整个 `song` 是宽松字段，坏一条只丢这一项。匿名录制 3 首、登录录制 10 首，字段差异都在宽松字段上（匿名多出若干只见过 `null` 的字段和 `exclusive: false`，登录多出 `transName`/`transNames` 和 `trp` 的非空值）；`limit=0` 回落到默认 10，没有可达的空结果，数组本身允许为空。`limit=abc` 返回 `code: 400`，SDK 按业务拒绝原样转交。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `personalized_newsong.invalid-limit.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。改造前 `code:400` 经 `SPECIAL_STATUS_CODES` 映射为 resolve `status:200`，现在按业务拒绝为 reject `status:400`、`body` 保留上游原文，不报 502。

## 补充说明

说明 : 调用此接口，可获取推荐新音乐

**可选参数 :** `limit`: 取出数量，默认为 10 (不支持 offset)

**接口地址 :** `/personalized/newsong`

**调用例子 :** `/personalized/newsong`
