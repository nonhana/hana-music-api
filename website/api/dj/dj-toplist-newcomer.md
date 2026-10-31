---
title: '电台 - 主播新人榜'
description: '调用此接口,可获取主播新人榜'
---

# 电台 - 主播新人榜

> 调用此接口,可获取主播新人榜

## 接口信息

| 项目     | 值                     |
| -------- | ---------------------- |
| 接口地址 | `/dj/toplist/newcomer` |
| 请求方式 | `GET` / `POST`         |
| 需要登录 | 否                     |
| 对应模块 | `dj_toplist_newcomer`  |
| 文档分类 | 电台与播客             |

## 请求参数

| 参数    | 类型             | 必填 | 默认值 | 说明                                 |
| ------- | ---------------- | :--: | ------ | ------------------------------------ |
| `limit` | number \| string |  —   | 100    | 返回数量，默认为 100 (不支持 offset) |

## HTTP 示例

```bash
GET /dj/toplist/newcomer?limit=30
```

## 编程式调用

```ts
import { djToplistNewcomer } from 'hana-music-api';

const result = await djToplistNewcomer({
  limit: '30',
});

console.log(result.body);
```

## 返回内容

`body.code`、通到主播榜的 `body.data`、`data.list` 和榜上主播自己的编号 `data.list[].id` 收紧；`data.total`、`data.updateTime`、排名、分数、头像、认证和直播状态都是宽松字段。`msg` 在成功录制里只见过 `null`，未声明。`offset` 在本批探测里被上游忽略，SDK 的 `limit || 100` 会把 `limit=0` 当默认 `100` 发送；本批录制和探测里没有可达的空结果。非数字或超出 `[1, 100]` 的 `limit` 返回正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。结构定义和类型是 `DjToplistNewcomerBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取主播新人榜

**可选参数 :**

`limit` : 返回数量，默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/newcomer`

**调用例子 :** `/dj/toplist/newcomer?limit=30`
