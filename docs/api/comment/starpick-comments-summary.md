---
title: '云村星评馆 - 简要评论'
description: '调用此接口可以获取首页推荐的星评馆评论信息'
---

# 云村星评馆 - 简要评论

> 调用此接口可以获取首页推荐的星评馆评论信息

## 接口信息

| 项目     | 值                           |
| -------- | ---------------------------- |
| 接口地址 | `/starpick/comments/summary` |
| 请求方式 | `GET` / `POST`               |
| 需要登录 | 否                           |
| 对应模块 | `starpick_comments_summary`  |
| 文档分类 | 评论                         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /starpick/comments/summary
```

## 编程式调用

```ts
import { starpickCommentsSummary } from 'hana-music-api'

const result = await starpickCommentsSummary()

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以获取首页推荐的星评馆评论信息

**接口地址:** `/starpick/comments/summary`
