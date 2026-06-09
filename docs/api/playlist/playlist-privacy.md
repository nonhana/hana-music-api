---
title: '公开隐私歌单'
description: '可以调用此接口将当前用户的隐私歌单公开。'
---

# 公开隐私歌单

> 可以调用此接口将当前用户的隐私歌单公开。

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/playlist/privacy` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `playlist_privacy`  |
| 文档分类 | 歌单                |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌单 ID |

## HTTP 示例

```bash
GET /playlist/privacy
```

## 编程式调用

```ts
import { playlistPrivacy } from 'hana-music-api'

const result = await playlistPrivacy({
  id: '123456',
})

console.log(result.body)
```

## 补充说明

说明: 可以调用此接口将当前用户的隐私歌单公开。

**必选参数 :** `id` : 歌单 ID

**接口地址 :** `/playlist/privacy`
