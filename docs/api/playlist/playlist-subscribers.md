---
title: '歌单收藏者'
description: '调用此接口 , 传入歌单 id 可获取歌单的所有收藏者'
---

# 歌单收藏者

> 调用此接口 , 传入歌单 id 可获取歌单的所有收藏者

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/playlist/subscribers` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `playlist_subscribers`  |
| 文档分类 | 歌单                    |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------- |
| `id`     | string           |  ✅  | -      | 歌单 id                                                             |
| `limit`  | number \| string |  —   | 20     | 取出评论数量 , 默认为 20                                            |
| `offset` | number \| string |  —   | -      | 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值 |

## HTTP 示例

```bash
GET /playlist/subscribers?id=544215255&limit=30
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_subscribers({
  id: '544215255',
  limit: '30',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌单 id 可获取歌单的所有收藏者  
**必选参数 :**

`id` : 歌单 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值

**接口地址 :** `/playlist/subscribers`

**调用例子 :** `/playlist/subscribers?id=544215255&limit=30`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
