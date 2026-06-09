---
title: '每日推荐歌曲-不感兴趣'
description: '日推歌曲标记为不感兴趣( 同时会返回一个新推荐歌曲, 需要登录 )'
---

# 每日推荐歌曲-不感兴趣

> 日推歌曲标记为不感兴趣( 同时会返回一个新推荐歌曲, 需要登录 )

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/recommend/songs/dislike` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 是                         |
| 对应模块 | `recommend_songs_dislike`  |
| 文档分类 | 推荐与发现                 |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌曲 id |

## HTTP 示例

```bash
GET /recommend/songs/dislike?id=168091
```

## 编程式调用

```ts
import { recommendSongsDislike } from 'hana-music-api'

const result = await recommendSongsDislike({
  id: '168091',
})

console.log(result.body)
```

## 补充说明

说明 : 日推歌曲标记为不感兴趣( 同时会返回一个新推荐歌曲, 需要登录 )

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/recommend/songs/dislike`

**调用例子 :** `/recommend/songs/dislike?id=168091`

返回数据 :

```json
{
  "data":{
    "name":"破碎太阳之心",
    "id":2009592201,
    "position":0,
    "alias":[],
    ...
  },
  "code":200
}
```
