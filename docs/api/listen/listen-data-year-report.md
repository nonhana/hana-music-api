---
title: '听歌足迹 - 年度听歌足迹'
description: '登录后调用此接口, 获取年度听歌足迹'
---

# 听歌足迹 - 年度听歌足迹

> 登录后调用此接口, 获取年度听歌足迹

## 接口信息

| 项目     | 值                         |
| -------- | -------------------------- |
| 接口地址 | `/listen/data/year/report` |
| 请求方式 | `GET` / `POST`             |
| 需要登录 | 是                         |
| 对应模块 | `listen_data_year_report`  |
| 文档分类 | 听歌记录                   |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /listen/data/year/report
```

## 编程式调用

```ts
import { listenDataYearReport } from 'hana-music-api'

const result = await listenDataYearReport()

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 获取年度听歌足迹

**接口地址 :** `/listen/data/year/report`
