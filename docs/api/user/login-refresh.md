---
title: '刷新登录'
description: '调用此接口，可刷新登录状态,返回内容包含新的cookie(不支持刷新二维码登录的cookie)'
---

# 刷新登录

> 调用此接口，可刷新登录状态,返回内容包含新的cookie(不支持刷新二维码登录的cookie)

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/login/refresh` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `login_refresh`  |
| 文档分类 | 用户与登录       |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /login/refresh
```

## 编程式调用

```ts
import { loginRefresh } from 'hana-music-api'

const result = await loginRefresh()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可刷新登录状态,返回内容包含新的cookie(不支持刷新二维码登录的cookie)

**调用例子 :** `/login/refresh`
