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
import { searchHotDetail } from 'hana-music-api'

const result = await searchHotDetail()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取热门搜索列表

**接口地址 :** `/search/hot/detail`

**调用例子 :** `/search/hot/detail`
