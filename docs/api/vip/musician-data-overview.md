---
title: '音乐人数据概况'
description: '音乐人登录后调用此接口 , 可获取统计数据概况'
---

# 音乐人数据概况

> 音乐人登录后调用此接口 , 可获取统计数据概况

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/musician/data/overview` |
| 请求方式 | `GET` / `POST`            |
| 需要登录 | 是                        |
| 对应模块 | `musician_data_overview`  |
| 文档分类 | 会员与云贝                |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /musician/data/overview
```

## 编程式调用

```ts
import { musicianDataOverview } from 'hana-music-api'

const result = await musicianDataOverview()

console.log(result.body)
```

## 补充说明

说明 : 音乐人登录后调用此接口 , 可获取统计数据概况

**接口地址 :** `/musician/data/overview`

**调用例子 :** `/musician/data/overview`
