---
title: '获取用户粉丝列表'
description: '登录后调用此接口，传入用户 id, 可以获取用户粉丝列表'
---

# 获取用户粉丝列表

> 登录后调用此接口，传入用户 id, 可以获取用户粉丝列表

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/user/followeds` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `user_followeds`  |
| 文档分类 | 社交与消息        |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `uid`    | string           |  ✅  | -      | 用户 id                                                                 |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /user/followeds?uid=32953014
GET /user/followeds?uid=416608258&limit=1
GET /user/followeds?uid=416608258&limit=1&offset=1
```

## 编程式调用

```ts
import { userFolloweds } from 'hana-music-api';

const result = await userFolloweds({
  uid: '32953014',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.followeds` 和每条粉丝记录的 `body.followeds[].userId` 收紧；没有粉丝时 `followeds` 是空数组（录制 `user_followeds.empty.json`，账号 13595690613）。粉丝记录复用 `UserProfile` 的宽松字段，并补上 `py`、`time`、`vipRights`；`vipRights` 可能为 `null`，声明为宽松字段。`remarkName` 在本批录制里只见过 `null`，没有声明。`more`、`newCount`、`size` 是宽松字段，`newCount` 只在部分响应里出现。结构定义和类型是 `UserFollowedsBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，传入用户 id, 可以获取用户粉丝列表

**必选参数 :** `uid` : 用户 id

**可选参数 :**
`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页 ,如：(页数 - 1)\*30, 其中 30 为 limit 的值，默认为 0

**接口地址 :** `/user/followeds`

**调用例子 :** `/user/followeds?uid=32953014` `/user/followeds?uid=416608258&limit=1` `/user/followeds?uid=416608258&limit=1&offset=1`
