---
title: '获取用户关注列表'
description: '登录后调用此接口，传入用户 id, 可以获取用户关注列表'
---

# 获取用户关注列表

> 登录后调用此接口，传入用户 id, 可以获取用户关注列表

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/user/follows` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `user_follows`  |
| 文档分类 | 社交与消息      |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `uid`    | string           |  ✅  | -      | 用户 id                                                                 |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /user/follows?uid=32953014
```

## 编程式调用

```ts
import { userFollows } from 'hana-music-api';

const result = await userFollows({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.follow` 和每条关注记录的 `body.follow[].userId` 收紧；没有更多关注时 `follow` 是空数组（录制 `user_follows.empty.json`，`offset=100000`）。关注记录复用 `UserProfile` 的宽松字段，并补上 `py`、`time`、`vipRights`、`expertTags`；`vipRights` 复用共享的 `VipRights`，其中 `relationType`、`extInfo` 已声明为宽松字段，`memberLogo` 只见过 `null`、未声明。`remarkName` 在本批录制里只见过 `null`，没有声明。`more`、`touchCount` 是宽松字段。结构定义和类型是 `UserFollowsBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，传入用户 id, 可以获取用户关注列表

**必选参数 :** `uid` : 用户 id

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址 :** `/user/follows`

**调用例子 :** `/user/follows?uid=32953014`
