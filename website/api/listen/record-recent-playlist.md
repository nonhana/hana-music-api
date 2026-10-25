---
title: '最近播放-歌单'
description: '调用此接口，可获得最近播放-歌单'
---

# 最近播放-歌单

> 调用此接口，可获得最近播放-歌单

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/record/recent/playlist` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 否                        |
| 对应模块 | `record_recent_playlist`  |
| 文档分类 | 听歌记录                  |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                 |
| ------- | ---------------- | :--: | ------ | -------------------- |
| `limit` | number \| string |  —   | 100    | 返回数量，默认为 100 |

## HTTP 示例

```bash
GET /record/recent/playlist?limit=1
```

## 编程式调用

```ts
import { recordRecentPlaylist } from 'hana-music-api';

const result = await recordRecentPlaylist({
  limit: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data`、`body.data.list` 和每条记录的 `resourceId`（字符串）、歌单 `data.id` 收紧；歌单摘要复用 `PlaylistSummary`，`lastSong`、`playTime`、`resourceType`、`total`、`message` 和其余展示字段宽松。`limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`、`body: ''`，结构定义保留这个空字符串分支。结构定义和类型是 `RecordRecentPlaylistBody`，见 [返回体结构](/guide/response-bodies)。匿名调用返回 `total: 0`、`list: []`（录制 `record_recent_playlist.anonymous.json`），作为真实空结果；登录录制见 `record_recent_playlist.default.json`。

## 补充说明

说明 : 调用此接口，可获得最近播放-歌单

**可选参数 :** `limit` : 返回数量，默认为 100

**接口地址 :** `/record/recent/playlist`

**调用例子 :** `/record/recent/playlist?limit=1`
