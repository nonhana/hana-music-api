---
title: '数字专辑&数字单曲-榜单'
description: '获取数字专辑或数字单曲的销售榜单。'
---

# 数字专辑&数字单曲-榜单

> 获取数字专辑或数字单曲的日榜、周榜、年榜和总榜。

## 接口信息

| 项目     | 值                                         |
| -------- | ------------------------------------------ |
| 接口地址 | `/album/songsaleboard`                     |
| 请求方式 | `GET` / `POST`                             |
| 需要登录 | 否                                         |
| 对应模块 | `album_songsaleboard`                      |
| 文档分类 | 专辑                                       |
| 上游路径 | `/api/feealbum/songsaleboard/${type}/type` |

## 请求参数

| 参数        | 类型   | 必填 | 默认值  | 说明                                            |
| ----------- | ------ | :--: | ------- | ----------------------------------------------- |
| `albumType` | number |  —   | `0`     | 榜单对象类型，`0` 为数字专辑，`1` 为数字单曲    |
| `type`      | string |  —   | `daily` | 榜单周期，可选 `daily`、`week`、`year`、`total` |
| `year`      | number |  —   | -       | 当 `type=year` 时使用，表示年份                 |

## HTTP 示例

```bash
GET /album/songsaleboard
GET /album/songsaleboard?type=year&year=2020&albumType=0
```

## 编程式调用

```ts
import { albumSongsaleboard } from 'hana-music-api'

const result = await albumSongsaleboard({
  type: 'year',
  year: 2020,
  albumType: 0,
})

console.log(result.body)
```

## 返回关注点

- `code`: 请求是否成功。
- `data`: 榜单主体数据。
