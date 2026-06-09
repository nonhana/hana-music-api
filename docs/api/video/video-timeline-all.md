---
title: '获取全部视频列表'
description: '调用此接口,可获取视频分类列表,分页参数只能传入 offset'
---

# 获取全部视频列表

> 调用此接口,可获取视频分类列表,分页参数只能传入 offset

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/video/timeline/all` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `video_timeline_all`  |
| 文档分类 | 视频与 MV             |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明   |
| -------- | ---------------- | :--: | ------ | ------ |
| `offset` | number \| string |  —   | 0      | 默认 0 |

## HTTP 示例

```bash
GET /video/timeline/all
```

## 编程式调用

```ts
import { videoTimelineAll } from 'hana-music-api'

const result = await videoTimelineAll()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取视频分类列表,分页参数只能传入 offset

**可选参数 :** `offset`: 默认 0

**接口地址 :** `/video/timeline/all`

**调用例子 :** `/video/timeline/all`
