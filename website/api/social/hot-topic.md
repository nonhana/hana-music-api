---
title: '获取热门话题'
description: '调用此接口，可获取热门话题'
---

# 获取热门话题

> 调用此接口，可获取热门话题

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/hot/topic`   |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `hot_topic`    |
| 文档分类 | 社交与消息     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                              |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 20     | 取出评论数量，默认为 20                                           |
| `offset` | number \| string |  —   | -      | 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值 |

## HTTP 示例

```bash
GET /hot/topic?limit=30&offset=30
```

## 编程式调用

```ts
import { hotTopic } from 'hana-music-api';

const result = await hotTopic({
  limit: '30',
  offset: '30',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.hot` 和每条话题自己的编号 `body.hot[].actId` 收紧。`title`、`text`、`participateCount`、`sharePicUrl`、`reason`、`isDefaultImg`、`alg` 是宽松字段；只见过 `null` 的 `iconUrl`、`readCnt`、`topicDisplayType`、`bizId`、`bizType`、`memberCount`、`onlineNum` 没有声明，原样保留。本批登录录制只返回 1 条推荐话题；`offset=100000` 和匿名调用返回同一份内容，未找到可达的空结果，`hot: []` 由契约测试构造验证。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `hot_topic.invalid-limit.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。`SPECIAL_STATUS_CODES` 里的其他码（201/302/502 以原码拒绝，800–803 钳位为 400）同样以 `status=业务码` 拒绝；不在该表里的码（如 404）原样转交。

## 补充说明

说明 : 调用此接口，可获取热门话题

**可选参数 :** `limit`: 取出评论数量，默认为 20

`offset`: 偏移数量，用于分页，如：(评论页数 - 1)\*20, 其中 20 为 limit 的值

**接口地址 :** `/hot/topic`

**调用例子 :** `/hot/topic?limit=30&offset=30`
