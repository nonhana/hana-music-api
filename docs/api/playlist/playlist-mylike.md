---
title: '获取点赞过的视频'
description: '调用此接口, 可获取获取点赞过的视频'
---

# 获取点赞过的视频

> 调用此接口, 可获取获取点赞过的视频

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/playlist/mylike` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `playlist_mylike`  |
| 文档分类 | 歌单               |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/mylike
```

## 编程式调用

```ts
import { playlistMylike } from 'hana-music-api'

const result = await playlistMylike()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口, 可获取获取点赞过的视频

**接口地址 :** `/playlist/mylike`

**调用例子 :** `/playlist/mylike`
