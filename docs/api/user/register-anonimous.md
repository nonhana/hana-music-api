---
title: '游客登录'
description: '直接调用此接口, 可获取游客cookie,如果遇到其他接口未登录状态报400状态码需要验证的错误,可使用此接口获取游客cookie避免报错'
---

# 游客登录

> 直接调用此接口, 可获取游客cookie,如果遇到其他接口未登录状态报400状态码需要验证的错误,可使用此接口获取游客cookie避免报错

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/register/anonimous` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `register_anonimous`  |
| 文档分类 | 用户与登录            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /register/anonimous
```

## 编程式调用

```ts
import { registerAnonimous } from 'hana-music-api'

const result = await registerAnonimous()

console.log(result.body)
```

## 补充说明

说明 : 直接调用此接口, 可获取游客cookie,如果遇到其他接口未登录状态报400状态码需要验证的错误,可使用此接口获取游客cookie避免报错

**接口地址 :** `/register/anonimous`
