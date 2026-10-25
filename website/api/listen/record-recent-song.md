---
title: '最近播放-歌曲'
description: '调用此接口，可获得最近播放-歌曲'
---

# 最近播放-歌曲

> 调用此接口，可获得最近播放-歌曲

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/record/recent/song` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `record_recent_song`  |
| 文档分类 | 听歌记录              |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                 |
| ------- | ---------------- | :--: | ------ | -------------------- |
| `limit` | number \| string |  —   | 100    | 返回数量，默认为 100 |

## HTTP 示例

```bash
GET /record/recent/song?limit=1
```

## 编程式调用

```ts
import { recordRecentSong } from 'hana-music-api';

const result = await recordRecentSong({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data`、`body.data.list` 和每条记录的 `resourceId`（字符串）、歌曲 `data.id` 收紧；`playTime`、`resourceType`、`banned`、`multiTerminalInfo`、`total`、`message` 和歌曲其余字段宽松。`limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`、`body: ''`，结构定义保留这个空字符串分支。结构定义和类型是 `RecordRecentSongBody`，见 [返回体结构](/guide/response-bodies)。匿名调用返回 `total: 0`、`list: []`（录制 `record_recent_song.anonymous.json`），作为真实空结果；登录录制见 `record_recent_song.default.json`。

## 补充说明

说明 : 调用此接口，可获得最近播放-歌曲

**可选参数 :** `limit` : 返回数量，默认为 100

**接口地址 :** `/record/recent/song`

**调用例子 :** `/record/recent/song?limit=1`
