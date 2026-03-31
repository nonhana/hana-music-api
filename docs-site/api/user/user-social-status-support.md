---
title: "用户状态 - 支持设置的状态"
description: "登录后调用此接口, 获取支持设置的状态"
---

# 用户状态 - 支持设置的状态

> 登录后调用此接口, 获取支持设置的状态

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/user/social/status/support` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `user_social_status_support` |
| 文档分类 | 用户与登录 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /user/social/status/support
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_social_status_support()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 获取支持设置的状态

**接口地址 :** `/user/social/status/support`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
