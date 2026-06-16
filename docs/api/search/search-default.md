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
import { searchDefault } from 'hana-music-api'

const result = await searchDefault()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获取默认搜索关键词

**接口地址 :** `/search/default`
