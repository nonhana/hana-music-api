---
title: '播客列表'
description: '可以获取播客列表'
---

# 播客列表

> 可以获取播客列表

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/voicelist/search` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `voicelist_search`  |
| 文档分类 | 电台与播客          |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /voicelist/search
```

## 编程式调用

```ts
import { voicelistSearch } from 'hana-music-api'

const result = await voicelistSearch()

console.log(result.body)
```

## 补充说明

说明: 可以获取播客列表

**接口地址:** `/voicelist/search`

**可选参数：**

`limit`: 取出歌单数量，默认为 200

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*200, 其中 200 为 limit 的值

`podcastName`: 播客名称
