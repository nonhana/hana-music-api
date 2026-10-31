---
title: '云盘'
description: '登录后调用此接口，可获取云盘数据，获取的数据没有对应 url, 需要再调用一'
---

# 云盘

> 登录后调用此接口，可获取云盘数据，获取的数据没有对应 url, 需要再调用一

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/cloud`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `user_cloud`   |
| 文档分类 | 云盘与上传     |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明                                                                      |
| -------- | ---------------- | :--: | ------ | ------------------------------------------------------------------------- |
| `limit`  | number \| string |  —   | 30     | 返回数量，默认为 30                                                       |
| `offset` | number \| string |  —   | 0      | 偏移数量，用于分页，如：(页数 - 1)\*200, 其中 200 为 limit 的值，默认为 0 |

## HTTP 示例

```bash
GET /user/cloud
```

## 编程式调用

```ts
import { userCloud } from 'hana-music-api';

const result = await userCloud();

console.log(result.body);
```

## 返回内容

云盘列表在 `data`，每条云盘记录自己的 `songId` 收紧；`privateCloud` 和 `simpleSong` 是记录里套着的对象，字段全部宽松，`simpleSong` 复用 core 的 `LooseSong`（`Song` 字段 + 宽松 `id`）。`count`、`size`、`maxSize`、`hasMore`、`upgradeSign`、`updateTime` 宽松；`cursor`、`message`、`idVersions` 只见过 `null`，没有声明。`offset` 越过末尾时 `data` 是空数组（录制 `user_cloud.past-end.json`）。录制从 25 条截到 3 条（见 `context.truncated`）。结构定义和类型是 `UserCloudBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可获取云盘数据，获取的数据没有对应 url, 需要再调用一
次 `/song/url` 获取 url

**可选参数 :**

`limit` : 返回数量，默认为 30

`offset` : 偏移数量，用于分页，如：(页数 - 1)\*200, 其中 200 为 limit 的值，默认为 0

**接口地址 :** `/user/cloud`

**调用例子 :** `/user/cloud`
