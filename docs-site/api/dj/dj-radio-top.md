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

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /djRadio/top
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.djRadio_top()

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

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
