---
title: '获取用户历史评论'
description: '登录后调用此接口 , 传入用户 id, 可以获取用户历史评论'
---

# 获取用户历史评论

> 登录后调用此接口 , 传入用户 id, 可以获取用户历史评论

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/user/comment/history` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 是                      |
| 对应模块 | `user_comment_history`  |
| 文档分类 | 评论                    |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                      |
| ------- | ---------------- | :--: | ------ | ----------------------------------------- |
| `uid`   | string           |  ✅  | -      | 用户 id                                   |
| `limit` | number \| string |  —   | 10     | 返回数量 , 默认为 10                      |
| `time`  | number \| string |  —   | 0      | 上一条数据的 time,第一页不需要传,默认为 0 |

## HTTP 示例

```bash
GET /user/comment/history?uid=32953014
GET /user/comment/history?uid=32953014&limit=1&time=1616217577564
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_comment_history({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户历史评论

**必选参数 :** `uid` : 用户 id

**可选参数 :**

`limit` : 返回数量 , 默认为 10

`time`: 上一条数据的 time,第一页不需要传,默认为 0

**接口地址 :** `/user/comment/history`

**调用例子 :** `/user/comment/history?uid=32953014` `/user/comment/history?uid=32953014&limit=1&time=1616217577564` (需要换成自己的用户 id)

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
