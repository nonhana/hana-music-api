---
title: '获取歌手描述'
description: '调用此接口 , 传入歌手 id, 可获得歌手描述'
---

# 获取歌手描述

> 调用此接口 , 传入歌手 id, 可获得歌手描述

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/artist/desc` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `artist_desc`  |
| 文档分类 | 歌手           |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 歌手 id |

## HTTP 示例

```bash
GET /artist/desc?id=6452
```

## 编程式调用

```ts
import { artistDesc } from 'hana-music-api'

const result = await artistDesc({
  id: '6452',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入歌手 id, 可获得歌手描述

**必选参数 :** `id`: 歌手 id

**接口地址 :** `/artist/desc`

**调用例子 :** `/artist/desc?id=6452` ( 周杰伦 )
