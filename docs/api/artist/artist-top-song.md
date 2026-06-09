---
title: '歌手热门 50 首歌曲'
description: '调用此接口,可获取歌手热门 50 首歌曲'
---

# 歌手热门 50 首歌曲

> 调用此接口,可获取歌手热门 50 首歌曲

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/artist/top/song` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `artist_top_song`  |
| 文档分类 | 歌手               |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌手 id |

## HTTP 示例

```bash
GET /artist/top/song?id=6452
```

## 编程式调用

```ts
import { artistTopSong } from 'hana-music-api'

const result = await artistTopSong({
  id: '6452',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取歌手热门 50 首歌曲

**必选参数 :**

`id` : 歌手 id

**接口地址 :** `/artist/top/song`

**调用例子 :** `/artist/top/song?id=6452`
