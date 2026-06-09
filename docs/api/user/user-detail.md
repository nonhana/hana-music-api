---
title: '获取用户详情'
description: '登录后调用此接口 , 传入用户 id, 可以获取用户详情'
---

# 获取用户详情

> 登录后调用此接口 , 传入用户 id, 可以获取用户详情

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/detail` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `user_detail`  |
| 文档分类 | 用户与登录     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/detail?uid=32953014
```

## 编程式调用

```ts
import { userDetail } from 'hana-music-api'

const result = await userDetail({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情

**必选参数 :** `uid` : 用户 id

**接口地址 :** `/user/detail`

**调用例子 :** `/user/detail?uid=32953014`
