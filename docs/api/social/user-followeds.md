---
title: '获取用户粉丝列表'
description: '登录后调用此接口，传入用户 id, 可以获取用户粉丝列表'
---

# 获取用户粉丝列表

> 登录后调用此接口，传入用户 id, 可以获取用户粉丝列表

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/user/followeds` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `user_followeds`  |
| 文档分类 | 社交与消息        |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                     |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------ |
| `uid`    | string           |  ✅  | -      | 用户 id                                                                  |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /user/followeds?uid=32953014
GET /user/followeds?uid=416608258&limit=1
GET /user/followeds?uid=416608258&limit=1&offset=1
```

## 编程式调用

```ts
import { userFolloweds } from 'hana-music-api'

const result = await userFolloweds({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口，传入用户 id, 可以获取用户粉丝列表

**必选参数 :** `uid` : 用户 id

**可选参数 :**
`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址 :** `/user/followeds`

**调用例子 :** `/user/followeds?uid=32953014` `/user/followeds?uid=416608258&limit=1` `/user/followeds?uid=416608258&limit=1&offset=1`
