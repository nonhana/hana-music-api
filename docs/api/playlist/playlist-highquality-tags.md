---
title: '精品歌单标签列表'
description: '调用此接口 , 可获取精品歌单标签列表'
---

# 精品歌单标签列表

> 调用此接口 , 可获取精品歌单标签列表

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/playlist/highquality/tags` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `playlist_highquality_tags`  |
| 文档分类 | 歌单                         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/highquality/tags
```

## 编程式调用

```ts
import { playlistHighqualityTags } from 'hana-music-api'

const result = await playlistHighqualityTags()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取精品歌单标签列表

**接口地址 :** `/playlist/highquality/tags`

**调用例子 :** `/playlist/highquality/tags`
