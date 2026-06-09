---
title: '获取动态评论'
description: '登录后调用此接口 , 可以获取动态下评论'
---

# 获取动态评论

> 登录后调用此接口 , 可以获取动态下评论

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/comment/event` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `comment_event`  |
| 文档分类 | 评论             |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明                                             |
| ---------- | ------ | :--: | ------ | ------------------------------------------------ |
| `threadId` | string |  ✅  | -      | 动态 id，可通过 `/event`，`/user/event` 接口获取 |

## HTTP 示例

```bash
GET /comment/event?threadId=A_EV_2_6559519868_32953014
```

## 编程式调用

```ts
import { commentEvent } from 'hana-music-api'

const result = await commentEvent({
  threadId: 'A_EV_2_6559519868_32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可以获取动态下评论

**必选参数 :** `threadId` : 动态 id，可通过 `/event`，`/user/event` 接口获取

**接口地址 :** `/comment/event`

**调用例子 :** `/comment/event?threadId=A_EV_2_6559519868_32953014`
