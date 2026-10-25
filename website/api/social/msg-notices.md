---
title: '通知 - 通知'
description: '登录后调用此接口 ,可获取通知'
---

# 通知 - 通知

> 登录后调用此接口 ,可获取通知

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/msg/notices` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `msg_notices`  |
| 文档分类 | 社交与消息     |

## 请求参数

| 参数       | 类型             | 必填 | 默认值                  | 说明                                                                     |
| ---------- | ---------------- | :--: | ----------------------- | ------------------------------------------------------------------------ |
| `limit`    | number \| string |  —   | 30                      | 返回数量，默认为 30                                                      |
| `lasttime` | string           |  —   | -1,传入上一次返回结果的 | 返回数据的 `time` ,默认-1,传入上一次返回结果的 time,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /msg/notices?limit=3
```

## 编程式调用

```ts
import { msgNotices } from 'hana-music-api';

const result = await msgNotices({
  limit: '3',
});

console.log(result.body);
```

## 返回内容

`body.notices` 是通知列表，每条通知只收紧自己的 `id`；`notice` 是通知正文的 JSON 字符串，`time`、`type`、`userId`、`queued`、`lastTime`、`more` 都宽松。`lasttime` 传早于账号创建的游标时返回空数组。未登录时上游返回 `code: 301`，SDK 按业务拒绝原样转交。结构定义和类型是 `MsgNoticesBody`。

## 补充说明

说明 : 登录后调用此接口 ,可获取通知

**可选参数 :**

`limit` : 返回数量，默认为 30

`lasttime` : 返回数据的 `time` ,默认-1,传入上一次返回结果的 time,将会返回下一页的数据

**接口地址 :** `/msg/notices`

**调用例子 :** `/msg/notices?limit=3`
