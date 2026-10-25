---
title: '热搜列表(详细)'
description: '调用此接口,可获取热门搜索列表'
---

# 热搜列表(详细)

> 调用此接口,可获取热门搜索列表

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/search/hot/detail` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `search_hot_detail`  |
| 文档分类 | 搜索                 |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /search/hot/detail
```

## 编程式调用

```ts
import { searchHotDetail } from 'hana-music-api';

const result = await searchHotDetail();

console.log(result.body);
```

## 返回内容

`body.code`、`body.data` 和每条热搜的 `searchWord` 收紧；`score`、`content`、`source`、`iconType`、`iconUrl`、`url`、`alg`、`message` 是宽松字段，`trp` 整体宽松（`rules` 是宽松字符串数组，`trp` 也可能是 `null`）。`alg` 在 `search_hot_detail.default.json` 里是 `null`，在 `search_hot_detail.second.json` 里有值；`trp` 只在后者出现。本批录制（`search_hot_detail.default.json`、`search_hot_detail.second.json`，另有一次登录对照探测，未保留录制）没有发现可达的空结果，`data` 在这些录制里都是 20 条。结构定义和类型是 `SearchHotDetailBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口,可获取热门搜索列表

**接口地址 :** `/search/hot/detail`

**调用例子 :** `/search/hot/detail`
