---
title: '电台排行榜获取'
description: '调用此接口可以获取电台排行榜'
---

# 电台排行榜获取

> 调用此接口可以获取电台排行榜

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/djRadio/top` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `djRadio_top`  |
| 文档分类 | 电台与播客     |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /djRadio/top
```

## 编程式调用

```ts
import { djRadioTop } from 'hana-music-api'

const result = await djRadioTop()

console.log(result.body)
```

## 补充说明

说明: 调用此接口可以获取电台排行榜

**接口地址:** `/djRadio/top`

**可选参数：**
`djRadioId` : 电台id

`sortIndex`: 排序 1:播放数 2:点赞数 3：评论数 4：分享数 5：收藏数 默认 1

`dataGapDays`: 天数 7:一周 30:一个月 90:三个月 默认 7

`dataType`: 未知,默认 3
