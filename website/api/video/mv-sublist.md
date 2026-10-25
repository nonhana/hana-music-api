---
title: '收藏的 MV 列表'
description: '调用此接口,可获取收藏的 MV 列表'
---

# 收藏的 MV 列表

> 调用此接口,可获取收藏的 MV 列表

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/mv/sublist`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `mv_sublist`   |
| 文档分类 | 视频与 MV      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /mv/sublist
```

## 编程式调用

```ts
import { mvSublist } from 'hana-music-api';

const result = await mvSublist();

console.log(result.body);
```

## 返回内容

`body.code`、收藏列表 `body.data` 和每条视频的编号 `data[].vid`（字符串）收紧；`count`、`hasMore`、`title`、`durationms`、`creator`、`playTime`、`coverUrl`、`aliaName`、`transName`、`markTypes` 是宽松字段。未登录时 `data` 是空数组（录制 `mv_sublist.anonymous.json`）；登录录制有 20 条。结构定义和类型是 `MvSublistBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取收藏的 MV 列表

**接口地址 :** `/mv/sublist`

**调用例子 :** `/mv/sublist`
