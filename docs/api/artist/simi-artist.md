---
title: '获取相似歌手'
description: '调用此接口，传入歌手 id, 可获得相似歌手'
---

# 获取相似歌手

> 调用此接口，传入歌手 id, 可获得相似歌手

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/simi/artist` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `simi_artist`  |
| 文档分类 | 歌手           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌手 id |

## HTTP 示例

```bash
GET /simi/artist?id=6452
```

## 编程式调用

```ts
import { simiArtist } from 'hana-music-api'

const result = await simiArtist({
  id: '6452',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，传入歌手 id, 可获得相似歌手

**必选参数 :** `id`: 歌手 id

**接口地址 :** `/simi/artist`

**调用例子 :** `/simi/artist?id=6452` ( 对应和周杰伦相似歌手 )
