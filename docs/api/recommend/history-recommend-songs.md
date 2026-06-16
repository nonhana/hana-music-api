---
title: '获取历史日推可用日期列表'
description: '调用此接口，可获得历史日推可用日期列表'
---

# 获取历史日推可用日期列表

> 调用此接口，可获得历史日推可用日期列表

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/history/recommend/songs` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 否                         |
| 对应模块 | `history_recommend_songs`  |
| 文档分类 | 推荐与发现                 |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /history/recommend/songs
```

## 编程式调用

```ts
import { historyRecommendSongs } from 'hana-music-api'

const result = await historyRecommendSongs()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获得历史日推可用日期列表

**接口地址 :** `/history/recommend/songs`

**调用例子 :** `/history/recommend/songs`
