---
title: '获取用户信息 , 歌单，收藏，mv, dj 数量'
description: '登录后调用此接口 , 可以获取用户信息'
---

# 获取用户信息 , 歌单，收藏，mv, dj 数量

> 登录后调用此接口 , 可以获取用户信息

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/user/subcount` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `user_subcount`  |
| 文档分类 | 用户与登录       |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /user/subcount
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_subcount()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可以获取用户信息

**接口地址 :** `/user/subcount`

**调用例子 :** `/user/subcount`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
