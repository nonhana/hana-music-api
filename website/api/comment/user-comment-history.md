---
title: '获取用户历史评论'
description: '登录后调用此接口，传入用户 id, 可以获取用户历史评论'
---

# 获取用户历史评论

> 登录后调用此接口，传入用户 id, 可以获取用户历史评论

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
| `limit` | number \| string |  —   | 10     | 返回数量，默认为 10                       |
| `time`  | number \| string |  —   | 0      | 上一条数据的 time,第一页不需要传,默认为 0 |

## HTTP 示例

```bash
GET /user/comment/history?uid=32953014
GET /user/comment/history?uid=32953014&limit=1&time=1616217577564
```

## 编程式调用

```ts
import { userCommentHistory } from 'hana-music-api';

const result = await userCommentHistory({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.code` 收紧；`body.data.comments`、`body.data.hotComments` 是可以没有的路径：没有历史评论或未登录时上游返回 `null`（录制 `user_comment_history.empty.json`、`user_comment_history.anonymous.json`），缺失或 `null` 都照常返回，出现时每条评论复用 `CommentRecord` 的字段并补上 `beRepliedContent`、`beRepliedUser`、`resourceInfo`、`resourceType`、`threadId`（宽松），`commentId` 收紧。`commentCount`、`hasMore`、`reminder` 是宽松字段。默认录制 `user_comment_history.default.json`（账号 599663130）保留 7 条历史评论和 15 条热门评论。结构定义和类型是 `UserCommentHistoryBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，传入用户 id, 可以获取用户历史评论

**必选参数 :** `uid` : 用户 id

**可选参数 :**

`limit` : 返回数量，默认为 10

`time`: 上一条数据的 time,第一页不需要传,默认为 0

**接口地址 :** `/user/comment/history`

**调用例子 :**
`/user/comment/history?uid=32953014`
`/user/comment/history?uid=32953014&limit=1&time=1616217577564`
（需要换成自己的用户 id）
