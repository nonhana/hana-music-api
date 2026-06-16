---
title: '歌单评论'
description: '调用此接口，传入音乐 id 和 limit 参数，可获得该歌单的所有评论 ( 不需要'
---

# 歌单评论

> 调用此接口，传入音乐 id 和 limit 参数，可获得该歌单的所有评论 ( 不需要

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/comment/playlist` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `comment_playlist`  |
| 文档分类 | 评论                |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                                  |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------------- |
| `id`     | string           |  ✅  | -      | 歌单 id                                                                               |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20                                                              |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值                   |
| `before` | number \| string |  —   | -      | 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到) |

## HTTP 示例

```bash
GET /comment/playlist?id=705123491
```

## 编程式调用

```ts
import { commentPlaylist } from 'hana-music-api'

const result = await commentPlaylist({
  id: '705123491',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，传入音乐 id 和 limit 参数，可获得该歌单的所有评论 ( 不需要
登录 )

**必选参数 :** `id`: 歌单 id

**可选参数 :** `limit`: 取出评论数量，默认为 20

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过 5000 条评论的时候需要用到)

**接口地址 :** `/comment/playlist`

**调用例子 :** `/comment/playlist?id=705123491`
