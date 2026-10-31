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
import { recommendSongsDislike } from 'hana-music-api';

const result = await recommendSongsDislike({
  id: '168091',
});

console.log(result.body);
```

## 返回内容

返回码 `body.code` 收紧为 `200`；接口在标记不感兴趣的同时返回一首替换的推荐歌曲，`body.data` 和歌曲自己的 `data.id` 收紧，歌曲其余字段宽松（录制 `recommend_songs_dislike.dislike.json`）。这个写入没有撤销调用，标记后的歌曲会从日推里移除。结构定义和类型是 `RecommendSongsDislikeBody`，见 [返回体结构](/guide/response-bodies)。

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
