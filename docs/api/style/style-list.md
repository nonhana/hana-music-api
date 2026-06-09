---
title: '曲风列表'
description: '调用此接口获取曲风列表及其对应的 `tagId`'
---

# 曲风列表

> 调用此接口获取曲风列表及其对应的 `tagId`

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/style/list`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `style_list`   |
| 文档分类 | 曲风           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /style/list
```

## 编程式调用

```ts
import { styleList } from 'hana-music-api'

const result = await styleList()

console.log(result.body)
```

## 补充说明

说明: 调用此接口获取曲风列表及其对应的 `tagId`

**接口地址:** `/style/list`

**调用例子:** `/style/list`
