---
title: '获取已收藏专辑列表'
description: '调用此接口 , 可获得已收藏专辑列表'
---

# 获取已收藏专辑列表

> 调用此接口 , 可获得已收藏专辑列表

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/album/sublist` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `album_sublist`  |
| 文档分类 | 专辑             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                           |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------------ |
| `limit`  | number \| string |  —   | 25     | 取出数量 , 默认为 25                                                           |
| `offset` | number \| string |  —   | <br>为 | 偏移数量 , 用于分页 , 如 :( 页数 -1)\*25, 其中 25 为 limit 的值 , 默认<br>为 0 |

## HTTP 示例

```bash
GET /album/sublist
```

## 编程式调用

```ts
import { albumSublist } from 'hana-music-api'

const result = await albumSublist()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获得已收藏专辑列表

**可选参数 :**  
`limit`: 取出数量 , 默认为 25

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*25, 其中 25 为 limit 的值 , 默认
为 0

**接口地址 :** `/album/sublist`

**调用例子 :** `/album/sublist` ( 周杰伦 )
