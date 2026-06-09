---
title: '用户状态'
description: '登录后调用此接口, 传入用户id, 获取用户状态'
---

# 用户状态

> 登录后调用此接口, 传入用户id, 获取用户状态

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/user/social/status` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 是                    |
| 对应模块 | `user_social_status`  |
| 文档分类 | 用户与登录            |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/social/status?uid=32953014
```

## 编程式调用

```ts
import { userSocialStatus } from 'hana-music-api'

const result = await userSocialStatus({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 传入用户id, 获取用户状态

**必选参数 :**

`uid`: 用户 id

**接口地址 :** `/user/social/status`

**调用例子 :** `/user/social/status?uid=32953014`
