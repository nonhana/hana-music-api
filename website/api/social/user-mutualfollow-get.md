---
title: '用户是否互相关注'
description: '登录后调用此接口, 传入用户id, 可判断用户是否互相关注'
---

# 用户是否互相关注

> 登录后调用此接口, 传入用户id, 可判断用户是否互相关注

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/user/mutualfollow/get` |
| 请求方式 | `GET` / `POST`           |
| 需要登录 | 是                       |
| 对应模块 | `user_mutualfollow_get`  |
| 文档分类 | 社交与消息               |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/mutualfollow/get?uid=32953014
```

## 编程式调用

```ts
import { userMutualfollowGet } from 'hana-music-api';

const result = await userMutualfollowGet({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.code` 和 `body.data` 收紧，`data` 是接口要返回的布尔值：互相关注为 `true`，否则为 `false`。登录与未登录都返回 HTTP 200；未登录时对同一 uid 上游返回 `false`（录制 `user_mutualfollow_get.mutual.json`、`user_mutualfollow_get.not-mutual.json`、`user_mutualfollow_get.anonymous.json`）。结构定义和类型是 `UserMutualfollowGetBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口, 传入用户id, 可判断用户是否互相关注

**必选参数 :**

`uid`: 用户 id

**接口地址 :** `/user/mutualfollow/get`

**调用例子 :** `/user/mutualfollow/get?uid=32953014`
