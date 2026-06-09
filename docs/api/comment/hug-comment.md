---
title: '抱一抱评论'
description: '调用此接口,可抱一抱评论'
---

# 抱一抱评论

> 调用此接口,可抱一抱评论

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/hug/comment` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `hug_comment`  |
| 文档分类 | 评论           |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |
| `cid` | string |  ✅  | -      | 评论 id |
| `sid` | string |  ✅  | -      | 资源 id |

## HTTP 示例

```bash
GET /hug/comment?uid=285516405&cid=1167145843&sid=863481066
```

## 编程式调用

```ts
import { hugComment } from 'hana-music-api'

const result = await hugComment({
  uid: '285516405',
  cid: '1167145843',
  sid: '863481066',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可抱一抱评论

**必选参数 :**

`uid`: 用户 id

`cid`: 评论 id

`sid`: 资源 id

**接口地址 :** `/hug/comment`

**调用例子 :** `/hug/comment?uid=285516405&cid=1167145843&sid=863481066`
