---
title: '电台 - 节目'
description: '登录后调用此接口，传入`rid`, 可查看对应电台的电台节目以及对应的 id, 需要'
---

# 电台 - 节目

> 登录后调用此接口，传入`rid`, 可查看对应电台的电台节目以及对应的 id, 需要

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/program`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_program`   |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `rid`    | string           |  ✅  | -      | 电台 的 id                                                              |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |
| `asc`    | boolean          |  —   | false  | 排序方式,默认为 `false` (新 => 老 ) 设置 `true` 可改为 老 => 新         |

## HTTP 示例

```bash
GET /dj/program?rid=336355127&limit=40
```

## 编程式调用

```ts
import { djProgram } from 'hana-music-api';

const result = await djProgram({
  rid: '336355127',
  limit: '40',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到节目列表的 `body.programs` 和每个节目自己的编号 `programs[].id` 收紧。节目记录共用 `DjProgram`，已声明字段宽松，未声明字段原样保留（JSON）：`mainSong`（旧版歌曲，含 `album`、`artists` 和 `bMusic`/`lMusic`/`mMusic`/`hMusic` 四个音质档）、`dj` 主播、参与主播 `participateAnchors`（元素只声明 `userId`、`type`、`anchorInfo`）和 `radio` 电台摘要。`programDesc` 是简介图文列表，和电台摘要的 `descPicList` 共用同一份条目声明（`timeStamp` 只见过 `null`）；`specialTags` 是字符串数组。`icon` 是对象但子字段只见过 `null`，`songTimeStamps`、`titbits`、`videoInfo`、`adIconInfo`、`programGuests` 只见过 `null`，`songs` 只见过空数组，都没有声明。`count`、`more` 宽松。越界分页返回 `programs: []`（录制 `dj_program.empty.json`），数组本身允许为空；缺少 `rid` 时上游返回 HTTP 200、正文 `code: 400`（录制 `dj_program.missing-rid.json`），SDK 按业务拒绝转交 `status: 400`，正文仍是网易云原文。录制按字段覆盖保留非连续子集（索引 22/0/29，原始 30 条），见 `context.truncated`。

## 补充说明

说明 : 登录后调用此接口，传入`rid`, 可查看对应电台的电台节目以及对应的 id, 需要
注意的是这个接口返回的 mp3Url 已经无效，都为 null, 但是通过调用 `/song/url` 这
个接口，传入节目 mainTrackId 仍然能获取到节目音频，如 `/song/url?id=478446370` 获取代
码时间的一个节目的音频

**必选参数 :** `rid`: 电台 的 id

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

`asc` : 排序方式,默认为 `false` (新 => 老 ) 设置 `true` 可改为 老 => 新

**接口地址 :** `/dj/program`

**调用例子 :** `/dj/program?rid=336355127&limit=40` ( 对应 ' 代码时间 ' 的节目列表 )
