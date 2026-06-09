---
title: '专辑动态信息'
description: '调用此接口 , 传入专辑 id, 可获得专辑动态信息,如是否收藏,收藏数,评论数,分享数'
---

# 专辑动态信息

> 调用此接口 , 传入专辑 id, 可获得专辑动态信息,如是否收藏,收藏数,评论数,分享数

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/album/detail/dynamic` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `album_detail_dynamic`  |
| 文档分类 | 专辑                    |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明    |
| ---- | ------ | :--: | ------ | ------- |
| `id` | string |  ✅  | -      | 专辑 id |

## HTTP 示例

```bash
GET /album/detail/dynamic?id=32311
```

## 编程式调用

```ts
import { albumDetailDynamic } from 'hana-music-api'

const result = await albumDetailDynamic({
  id: '32311',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入专辑 id, 可获得专辑动态信息,如是否收藏,收藏数,评论数,分享数

**必选参数 :** `id`: 专辑 id

**接口地址 :** `/album/detail/dynamic`

**调用例子 :** `/album/detail/dynamic?id=32311`
