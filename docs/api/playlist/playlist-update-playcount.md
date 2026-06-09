---
title: '歌单更新播放量'
description: '调用后可更新歌单播放量'
---

# 歌单更新播放量

> 调用后可更新歌单播放量

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/playlist/update/playcount` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `playlist_update_playcount`  |
| 文档分类 | 歌单                         |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌单 id |

## HTTP 示例

```bash
GET /playlist/update/playcount?id=24381616
```

## 编程式调用

```ts
import { playlistUpdatePlaycount } from 'hana-music-api'

const result = await playlistUpdatePlaycount({
  id: '24381616',
})

console.log(result.body)
```

## 补充说明

说明 : 调用后可更新歌单播放量

**必选参数 :** `id` : 歌单 id

**接口地址 :** `/playlist/update/playcount`

**调用例子 :** `/playlist/update/playcount?id=24381616`
