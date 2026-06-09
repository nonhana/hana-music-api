---
title: '所有榜单内容摘要'
description: '调用此接口,可获取所有榜单内容摘要'
---

# 所有榜单内容摘要

> 调用此接口,可获取所有榜单内容摘要

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/toplist/detail` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 否                |
| 对应模块 | `toplist_detail`  |
| 文档分类 | 排行榜            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /toplist/detail
```

## 编程式调用

```ts
import { toplistDetail } from 'hana-music-api'

const result = await toplistDetail()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取所有榜单内容摘要

**接口地址 :** `/toplist/detail`

**调用例子 :** `/toplist/detail`
