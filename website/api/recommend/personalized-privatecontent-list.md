---
title: '独家放送列表'
description: '调用此接口，可获取独家放送列表'
---

# 独家放送列表

> 调用此接口，可获取独家放送列表

## 接口信息

| 项目     | 值                                  |
| -------- | ----------------------------------- |
| 接口地址 | `/personalized/privatecontent/list` |
| 请求方式 | `GET` / `POST`                      |
| 需要登录 | 否                                  |
| 对应模块 | `personalized_privatecontent_list`  |
| 文档分类 | 推荐与发现                          |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                    |
| -------- | ---------------- | :--: | ------ | ----------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 60     | 返回数量，默认为 60                                                     |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*60, 其中 60 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /personalized/privatecontent/list?limit=1&offset=2
```

## 编程式调用

```ts
import { personalizedPrivatecontentList } from 'hana-music-api';

const result = await personalizedPrivatecontentList({
  limit: '1',
  offset: '2',
});

console.log(result.body);
```

## 返回内容

`body.code`、独家放送列表 `body.result` 和每条内容自己的编号 `result[].id` 收紧；分页的 `more`、`offset` 和条目的 `time`、`copywriter`、`picUrl`、`sPicUrl`、`url`、`type` 宽松。条目比 `/personalized/privatecontent` 多 `time`、少 `alg`，结构分开声明。越界 `offset=100000` 返回 `code: 404`，`offset=abc` 返回 `code: 400`，SDK 都按业务拒绝原样转交；本批未找到空列表，数组本身允许为空。

## 非 200 业务码的状态码变化

本模块的 `code:400` 录制见 `personalized_privatecontent_list.invalid-offset.json`，越界 `offset=100000` 的 `code:404` 录制见 `personalized_privatecontent_list.offset-out-of-range.json`；通用规则见[返回体结构](/guide/response-bodies#非-200-业务码的状态码变化)。改造前 `code:400` 经 `SPECIAL_STATUS_CODES` 映射为 resolve `status:200`、`code:404` 是 resolve `status:404`，现在都按业务拒绝（`status:400`/`status:404`），`body` 保留上游原文，不报 502。

## 补充说明

说明 : 调用此接口，可获取独家放送列表

**可选参数 :**

`limit` : 返回数量，默认为 60

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*60, 其中 60 为 limit 的值，默认为 0

**接口地址 :** `/personalized/privatecontent/list`

**调用例子 :** `/personalized/privatecontent/list?limit=1&offset=2`
