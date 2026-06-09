---
title: '最近播放-歌单'
description: '调用此接口 , 可获得最近播放-歌单'
---

# 最近播放-歌单

> 调用此接口 , 可获得最近播放-歌单

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/record/recent/playlist` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 否                        |
| 对应模块 | `record_recent_playlist`  |
| 文档分类 | 听歌记录                  |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                  |
| ------- | ---------------- | :--: | ------ | --------------------- |
| `limit` | number \| string |  —   | 100    | 返回数量 , 默认为 100 |

## HTTP 示例

```bash
GET /record/recent/playlist?limit=1
```

## 编程式调用

```ts
import { recordRecentPlaylist } from 'hana-music-api'

const result = await recordRecentPlaylist({
  limit: '1',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获得最近播放-歌单

**可选参数 :** `limit` : 返回数量 , 默认为 100

**接口地址 :** `/record/recent/playlist`

**调用例子 :** `/record/recent/playlist?limit=1`
