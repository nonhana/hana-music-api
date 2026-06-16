---
title: '获取每日推荐歌曲'
description: '调用此接口，可获得每日推荐歌曲 ( 需要登录 )'
---

# 获取每日推荐歌曲

> 调用此接口，可获得每日推荐歌曲 ( 需要登录 )

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/recommend/songs` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 是                 |
| 对应模块 | `recommend_songs`  |
| 文档分类 | 推荐与发现         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /recommend/songs
```

## 编程式调用

```ts
import { recommendSongs } from 'hana-music-api'

const result = await recommendSongs()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获得每日推荐歌曲 ( 需要登录 )

**接口地址 :** `/recommend/songs`

**调用例子 :** `/recommend/songs`
