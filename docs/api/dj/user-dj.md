---
title: '获取用户电台'
description: '登录后调用此接口 , 传入用户 id, 可以获取用户电台'
---

# 获取用户电台

> 登录后调用此接口 , 传入用户 id, 可以获取用户电台

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/dj`     |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `user_dj`      |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/dj?uid=32953014
```

## 编程式调用

```ts
import { userDj } from 'hana-music-api'

const result = await userDj({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户电台

**必选参数 :** `uid` : 用户 id

**接口地址 :** `/user/dj`

**调用例子 :** `/user/dj?uid=32953014`
