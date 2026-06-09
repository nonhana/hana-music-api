---
title: '歌词摘录 - 歌词摘录信息'
description: '登录后调用此接口, 传入歌曲id, 获取歌词摘录信息'
---

# 歌词摘录 - 歌词摘录信息

> 登录后调用此接口, 传入歌曲id, 获取歌词摘录信息

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/song/lyrics/mark` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 是                  |
| 对应模块 | `song_lyrics_mark`  |
| 文档分类 | 歌词摘录            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /song/lyrics/mark?id=2058263032
```

## 编程式调用

```ts
import { songLyricsMark } from 'hana-music-api'

const result = await songLyricsMark({
  id: '2058263032',
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口, 传入歌曲id, 获取歌词摘录信息

**必选参数：**

`id`: 歌曲id

**接口地址:** `/song/lyrics/mark`

**调用例子:** `/song/lyrics/mark?id=2058263032`
