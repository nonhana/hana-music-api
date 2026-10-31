---
title: '收藏的专栏'
description: '调用此接口,可获取收藏的专栏'
---

# 收藏的专栏

> 调用此接口,可获取收藏的专栏

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/topic/sublist` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 否               |
| 对应模块 | `topic_sublist`  |
| 文档分类 | 社交与消息       |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                              |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 50     | 取出歌单数量，默认为 50                                           |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*50, 其中 50 为 limit 的值 |

## HTTP 示例

```bash
GET /topic/sublist?limit=2&offset=1
```

## 编程式调用

```ts
import { topicSublist } from 'hana-music-api';

const result = await topicSublist({
  limit: '2',
  offset: '1',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.data` 和每条专栏自己的编号 `body.data[].id` 收紧。`author`、`title`、`resUrl`、`rectanglePicUrl`、`picId`、`readCount`、`subTime` 是宽松字段；`userId` 是作者附带编号，也宽松。越界分页（录制 `topic_sublist.out-of-range.json`，`offset=100000`）返回 `data: []`，`count` 保持原值、`hasMore: false`；`count`、`hasMore` 本身也是宽松字段。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `topic_sublist.invalid-offset.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。`SPECIAL_STATUS_CODES` 里的其他码（201/302/502 以原码拒绝，800–803 钳位为 400）同样以 `status=业务码` 拒绝；不在该表里的码（如 404）原样转交。

## 补充说明

说明 : 调用此接口,可获取收藏的专栏

**可选参数 :**

`limit`: 取出歌单数量，默认为 50

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/topic/sublist`

**调用例子 :** `/topic/sublist?limit=2&offset=1`
