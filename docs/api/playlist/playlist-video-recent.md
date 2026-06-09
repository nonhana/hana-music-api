---
title: '最近播放的视频'
description: '调用此接口 , 可获取最近播放的视频 ( 需要登录 )'
---

# 最近播放的视频

> 调用此接口 , 可获取最近播放的视频 ( 需要登录 )

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
import { playlistVideoRecent } from 'hana-music-api'

const result = await playlistVideoRecent()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取最近播放的视频 ( 需要登录 )

**接口地址 :** `/playlist/video/recent`

**调用例子 :** `/playlist/video/recent`
