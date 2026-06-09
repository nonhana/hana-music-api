---
title: '年度听歌报告'
description: '登录后调用此接口,使用此接口,可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告'
---

# 年度听歌报告

> 登录后调用此接口,使用此接口,可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/summary/annual` |
| 请求方式 | `GET` / `POST`    |
| 需要登录 | 是                |
| 对应模块 | `summary_annual`  |
| 文档分类 | 听歌记录          |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /summary/annual?year=2024
```

## 编程式调用

```ts
import { summaryAnnual } from 'hana-music-api'

const result = await summaryAnnual({
  year: '2024',
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,可获取当前登录用户年度听歌报告，目前支持2017-2024年的报告

**必选参数：**

`year`: 报告年份

**接口地址:** `/summary/annual`

**调用例子:** `/summary/annual?year=2024`
