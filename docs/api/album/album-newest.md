---
title: '最新专辑'
description: '调用此接口 ，获取云音乐首页新碟上架数据'
---

# 最新专辑

> 调用此接口 ，获取云音乐首页新碟上架数据

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/album/newest` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `album_newest`  |
| 文档分类 | 专辑            |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /album/newest
```

## 编程式调用

```ts
import { albumNewest } from 'hana-music-api'

const result = await albumNewest()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 ，获取云音乐首页新碟上架数据

**接口地址 :** `/album/newest`

**调用例子 :** `/album/newest`
