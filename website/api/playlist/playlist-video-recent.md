---
title: '最近播放的视频'
description: '调用此接口，可获取最近播放的视频 ( 需要登录 )'
---

# 最近播放的视频

> 调用此接口，可获取最近播放的视频 ( 需要登录 )

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/playlist/video/recent` |
| 请求方式 | `GET` / `POST`           |
| 需要登录 | 是                       |
| 对应模块 | `playlist_video_recent`  |
| 文档分类 | 歌单                     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/video/recent
```

## 编程式调用

```ts
import { playlistVideoRecent } from 'hana-music-api';

const result = await playlistVideoRecent();

console.log(result.body);
```

## 返回内容

需要登录：匿名调用返回 `code: 200`、`data.videos: []`（录制 `playlist_video_recent.anonymous.json`）。`body.code`、`data`、`data.videos` 和每段视频自己的编号 `mlogBaseData.id`（字符串）收紧；`mlogExtVO`、`mlogBaseData` 的其余字段和 `mlogBaseData.videos[]` 里的码流全部宽松；`userProfile`、`relatedPubUsers`、`mlogPlaylists`、`source`、`audio`、`coverDetail` 等只见过 `null`，没有声明。非空录制非连续保留 5 段视频（索引 0/1/20/21/26，原始 31 段，见 `context.truncated`）。结构定义和类型是 `PlaylistVideoRecentBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取最近播放的视频 ( 需要登录 )

**接口地址 :** `/playlist/video/recent`

**调用例子 :** `/playlist/video/recent`
