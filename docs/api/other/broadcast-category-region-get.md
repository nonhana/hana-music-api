---
title: '广播电台 - 分类/地区信息'
description: '调用此接口, 获取广播电台 - 分类/地区信息'
---

# 广播电台 - 分类/地区信息

> 调用此接口, 获取广播电台 - 分类/地区信息

## 接口信息

| 项目     | 值                               |
| -------- | -------------------------------- |
| 接口地址 | `/broadcast/category/region/get` |
| 请求方式 | `GET` / `POST`                   |
| 需要登录 | 否                               |
| 对应模块 | `broadcast_category_region_get`  |
| 文档分类 | 其他工具                         |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /broadcast/category/region/get
```

## 编程式调用

```ts
import { broadcastCategoryRegionGet } from 'hana-music-api'

const result = await broadcastCategoryRegionGet()

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 获取广播电台 - 分类/地区信息

**接口地址:** `/broadcast/category/region/get`

**调用例子:** `/broadcast/category/region/get`
