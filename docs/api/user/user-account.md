---
title: '获取账号信息'
description: '登录后调用此接口 ,可获取用户账号信息'
---

# 获取账号信息

> 登录后调用此接口 ,可获取用户账号信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/user/account` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `user_account`  |
| 文档分类 | 用户与登录      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /user/account
```

## 编程式调用

```ts
import { userAccount } from 'hana-music-api'

const result = await userAccount()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取用户账号信息

**接口地址 :** `/user/account`

**调用例子 :** `/user/account`
