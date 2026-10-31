---
title: '热搜列表(简略)'
description: '调用此接口,可获取热门搜索列表'
---

# 热搜列表(简略)

> 调用此接口,可获取热门搜索列表

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/search/hot`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `search_hot`   |
| 文档分类 | 搜索           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /search/hot
```

## 编程式调用

```ts
import { searchHot } from 'hana-music-api';

const result = await searchHot();

console.log(result.body);
```

## 返回内容

`body.code`、`body.result`、`body.result.hots` 和每条热搜的 `first`（热搜词本身）收紧；`second`、`iconType` 是宽松字段。只见过 `null` 的 `third` 没有声明，原样保留。本批录制（`search_hot.default.json`，另有一次匿名复现和一次登录对照探测，后两者未保留录制）没有发现可达的空结果，`result.hots` 在这些录制里都是 10 条。结构定义和类型是 `SearchHotBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取热门搜索列表

**接口地址 :** `/search/hot`

**调用例子 :** `/search/hot`
