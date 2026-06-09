---
title: '转发用户动态'
description: '登录后调用此接口 ,可以转发用户动态'
---

# 转发用户动态

> 登录后调用此接口 ,可以转发用户动态

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/event/forward` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `event_forward`  |
| 文档分类 | 社交与消息       |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明       |
| ---------- | ------ | :--: | ------ | ---------- |
| `uid`      | string |  ✅  | -      | 用户 id    |
| `evId`     | string |  ✅  | -      | 动态 id    |
| `forwards` | string |  ✅  | -      | 转发的评论 |

## HTTP 示例

```bash
GET /event/forward?evId=6712917601&uid=32953014&forwards=测试内容
```

## 编程式调用

```ts
import { eventForward } from 'hana-music-api'

const result = await eventForward({
  evId: '6712917601',
  uid: '32953014',
  forwards: '测试内容',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可以转发用户动态

**必选参数 :** `uid` : 用户 id

`evId` : 动态 id

`forwards` : 转发的评论

**接口地址 :** `/event/forward`

**调用例子 :** `/event/forward?evId=6712917601&uid=32953014&forwards=测试内容`
