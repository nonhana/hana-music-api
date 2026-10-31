---
title: '电台订阅者列表'
description: '调用此接口,可获取电台订阅者列表'
---

# 电台订阅者列表

> 调用此接口,可获取电台订阅者列表

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/dj/subscriber` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `dj_subscriber`  |
| 文档分类 | 电台与播客       |

## 请求参数

| 参数    | 类型             | 必填 | 默认值                  | 说明                                                           |
| ------- | ---------------- | :--: | ----------------------- | -------------------------------------------------------------- |
| `id`    | string           |  ✅  | -                       | 电台 id                                                        |
| `time`  | number \| string |  —   | -1,传入上一次返回结果的 | 分页参数,默认-1,传入上一次返回结果的 time,将会返回下一页的数据 |
| `limit` | number \| string |  —   | 20                      | 返回数量,默认为 20                                             |

## HTTP 示例

```bash
GET /dj/subscriber?id=335425050
GET /dj/subscriber?id=335425050&time=1602761825390
```

## 编程式调用

```ts
import { djSubscriber } from 'hana-music-api';

const result = await djSubscriber({
  id: '335425050',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到订阅者列表的 `body.subscribers` 和每个订阅者自己的编号 `subscribers[].userId` 收紧；`time`、`hasMore`、昵称、头像、认证、关注状态和 `subscribeTime` 都是宽松字段。`time=1` 的时间游标越界返回空 `subscribers`（录制 `dj_subscriber.empty.json`）；缺少 `id` 返回正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `DjSubscriberBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取电台订阅者列表
**必选参数 :** `id`: 电台 id

**可选参数 :**
`time` : 分页参数,默认-1,传入上一次返回结果的 time,将会返回下一页的数据

`limit` : 返回数量,默认为 20

**接口地址 :** `/dj/subscriber`

**调用例子 :** `/dj/subscriber?id=335425050`，`/dj/subscriber?id=335425050&time=1602761825390`
