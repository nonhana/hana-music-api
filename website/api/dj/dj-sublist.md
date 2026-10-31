---
title: '电台的订阅列表'
description: '登录后调用此接口，可获取订阅的电台列表'
---

# 电台的订阅列表

> 登录后调用此接口，可获取订阅的电台列表

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/dj/sublist`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `dj_sublist`   |
| 文档分类 | 电台与播客     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /dj/sublist
```

## 编程式调用

```ts
import { djSublist } from 'hana-music-api';

const result = await djSublist();

console.log(result.body);
```

## 返回内容

`body.code`、通到订阅列表的 `body.djRadios` 和每个电台的编号 `djRadios[].id` 收紧；`count`、`time`、`hasMore`、电台名称、封面、简介、计数、`descPicList`（复用 `ProgramDescPic`）和 `dj` 主播（复用宽松的 `PlaylistUser`）都是宽松字段。匿名访问返回空的 `djRadios` 和 `count: 0`（录制 `dj_sublist.anonymous.json`）；非数字 `limit` 返回正文 `code: 400`，SDK 按业务拒绝转交 `status: 400`。`rcmdtext`、`icon`、`liveInfo`、`manualTagsDTO` 等只见过 `null` 或空数组的字段没有声明。结构定义和类型是 `DjSublistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 登录后调用此接口，可获取订阅的电台列表

**接口地址 :** `/dj/sublist`

**调用例子 :** `/dj/sublist`
