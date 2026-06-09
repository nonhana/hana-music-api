---
title: '用户状态 - 相同状态的用户'
description: '登录后调用此接口, 获取相同状态的用户'
---

# 用户状态 - 相同状态的用户

> 登录后调用此接口, 获取相同状态的用户

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/user/social/status/rcmd` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 是                         |
| 对应模块 | `user_social_status_rcmd`  |
| 文档分类 | 用户与登录                 |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /user/social/status/rcmd
```

## 编程式调用

```ts
import { userSocialStatusRcmd } from 'hana-music-api'

const result = await userSocialStatusRcmd()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 获取相同状态的用户

**接口地址 :** `/user/social/status/rcmd`
