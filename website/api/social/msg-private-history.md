---
title: '私信内容'
description: '登录后调用此接口，可获取私信内容'
---

# 私信内容

> 登录后调用此接口，可获取私信内容

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/msg/private/history` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 是                     |
| 对应模块 | `msg_private_history`  |
| 文档分类 | 社交与消息             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                              |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------- |
| `uid`    | string           |  ✅  | -      | 用户 id                                           |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                               |
| `before` | number \| string |  —   | -      | 分页参数,取上一页最后一项的 `time` 获取下一页数据 |

## HTTP 示例

```bash
GET /msg/private/history?uid=9003
```

## 编程式调用

```ts
import { msgPrivateHistory } from 'hana-music-api';

const result = await msgPrivateHistory({
  uid: '9003',
});

console.log(result.body);
```

## 返回内容

`body.msgs` 是私信消息列表，每条私信只收紧自己的 `id`；`msg` 是消息正文的 JSON 字符串，`fromUser`、`toUser` 与私信会话列表一样按宽松资料处理，`time`、`batchId` 宽松；`isArtist`、`isSubed`、`hint`、`more` 也宽松。`before` 早于会话开始时间时返回空数组；未登录时上游返回 `code: 200` 和空消息列表（`isSubed: false`）。结构定义和类型是 `MsgPrivateHistoryBody`。

## 补充说明

说明 : 登录后调用此接口，可获取私信内容

**必选参数 :**
`uid` : 用户 id

**可选参数 :**
`limit` : 返回数量，默认为 30

`before` : 分页参数,取上一页最后一项的 `time` 获取下一页数据

**接口地址 :**
`/msg/private/history`

**调用例子 :**
`/msg/private/history?uid=9003` (云音乐小秘书)
