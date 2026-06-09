---
title: '评论抱一抱列表'
description: '调用此接口,可获取评论抱一抱列表'
---

# 评论抱一抱列表

> 调用此接口,可获取评论抱一抱列表

## 接口信息

| 项目     | 值                  |
| -------- | ------------------- |
| 接口地址 | `/comment/hug/list` |
| 请求方式 | `GET` / `POST`      |
| 需要登录 | 否                  |
| 对应模块 | `comment_hug_list`  |
| 文档分类 | 评论                |

## 请求参数

| 参数       | 类型             | 必填 | 默认值            | 说明                                        |
| ---------- | ---------------- | :--: | ----------------- | ------------------------------------------- |
| `uid`      | string           |  ✅  | -                 | 用户 id                                     |
| `cid`      | string           |  ✅  | -                 | 评论 id                                     |
| `sid`      | string           |  ✅  | -                 | 资源 id                                     |
| `page`     | number \| string |  —   | -                 | 页数                                        |
| `cursor`   | number \| string |  —   | -1,第一页不需要传 | 上一页返回的 cursor,默认-1,第一页不需要传   |
| `idCursor` | string           |  —   | -1,第一页不需要传 | 上一页返回的 idCursor,默认-1,第一页不需要传 |
| `pageSize` | number \| string |  —   | 100               | 每页页数,默认 100                           |

## HTTP 示例

```bash
GET /comment/hug/list?uid=285516405&cid=1167145843&sid=863481066&pageSize=2&page=1
```

## 编程式调用

```ts
import { commentHugList } from 'hana-music-api'

const result = await commentHugList({
  uid: '285516405',
  cid: '1167145843',
  sid: '863481066',
  pageSize: '2',
  page: '1',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取评论抱一抱列表

**必选参数 :**

`uid`: 用户 id

`cid`: 评论 id

`sid`: 资源 id

**可选参数 :**

`page`: 页数

`cursor`: 上一页返回的 cursor,默认-1,第一页不需要传

`idCursor`: 上一页返回的 idCursor,默认-1,第一页不需要传

`pageSize` : 每页页数,默认 100

**接口地址 :** `/comment/hug/list`

**调用例子 :** `/comment/hug/list?uid=285516405&cid=1167145843&sid=863481066&pageSize=2&page=1`
