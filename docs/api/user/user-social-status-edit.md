---
title: '用户状态 - 编辑'
description: '登录后调用此接口, 编辑当前用户状态， 所需参数可在接口`/user/social/status/support`获取'
---

# 用户状态 - 编辑

> 登录后调用此接口, 编辑当前用户状态， 所需参数可在接口`/user/social/status/support`获取

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/user/social/status/edit` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 是                         |
| 对应模块 | `user_social_status_edit`  |
| 文档分类 | 用户与登录                 |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /user/social/status/edit
```

## 编程式调用

```ts
import { userSocialStatusEdit } from 'hana-music-api'

const result = await userSocialStatusEdit()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 编辑当前用户状态， 所需参数可在接口`/user/social/status/support`获取

**接口地址 :** `/user/social/status/edit`
