---
title: '搜索多重匹配'
description: '调用此接口，传入搜索关键词可获得搜索结果'
---

# 搜索多重匹配

> 调用此接口，传入搜索关键词可获得搜索结果

## 接口信息

| 项目     | 值                   |
| -------- | -------------------- |
| 接口地址 | `/search/multimatch` |
| 请求方式 | `GET` / `POST`       |
| 需要登录 | 否                   |
| 对应模块 | `search_multimatch`  |
| 文档分类 | 搜索                 |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明   |
| ---------- | ------ | :--: | ------ | ------ |
| `keywords` | string |  ✅  | -      | 关键词 |

## HTTP 示例

```bash
GET /search/multimatch?keywords=海阔天空
```

## 编程式调用

```ts
import { searchMultimatch } from 'hana-music-api';

const result = await searchMultimatch({
  keywords: '海阔天空',
});

console.log(result.body);
```

## 返回内容

`body.code`、`body.result` 收紧；`result.orders` 是宽松字段（缺失或元素类型不对时整项丢弃，`null` 时保留 `null`）；`result.artist`、`result.new_mlog`、`result.playlist` 是可以没有的路径：无结果录制 `search_multimatch.no-result.json` 里只有 `orders: []`，缺失或为 `null` 时照常返回，出现了就按每项记录的 `id`（`new_mlog` 是 `resourceId`）收紧，坏一条记录会报 502。其余嵌套字段宽松。结构定义和类型是 `SearchMultimatchBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明 : 调用此接口，传入搜索关键词可获得搜索结果

**必选参数 :** `keywords` : 关键词

**接口地址 :** `/search/multimatch`

**调用例子 :** `/search/multimatch?keywords=海阔天空`
