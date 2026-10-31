---
title: '默认搜索关键词'
description: '调用此接口，可获取默认搜索关键词'
---

# 默认搜索关键词

> 调用此接口，可获取默认搜索关键词

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/search/default` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `search_default`  |
| 文档分类 | 搜索              |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /search/default
```

## 编程式调用

```ts
import { searchDefault } from 'hana-music-api';

const result = await searchDefault();

console.log(result.body);
```

## 返回内容

`body.code`、`body.data` 和 `data.showKeyword`（展示词）、`data.realkeyword`（实际搜索词）收紧；`data.styleKeyword`、`data.action`、`data.alg`、`data.bizQueryInfo`、`data.gap`、`data.searchType` 是宽松字段。只见过 `null` 的 `data.imageUrl`、`data.logInfo`、`data.source`、`data.trp_id`、`data.trp_type`、`data.styleKeyword.descWord` 和 `body.message` 没有声明，原样保留。本批录制（`search_default.default.json`，另有一次登录对照探测，未保留录制）没有发现可达的空结果，`data` 在这些录制里都存在。结构定义和类型是 `SearchDefaultBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，可获取默认搜索关键词

**接口地址 :** `/search/default`
