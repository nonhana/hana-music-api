---
title: '视频详情'
description: '调用此接口，可获取视频详情'
---

# 视频详情

> 调用此接口，可获取视频详情

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/video/detail` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 否              |
| 对应模块 | `video_detail`  |
| 文档分类 | 视频与 MV       |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明       |
| ---- | ------ | :--: | ------ | ---------- |
| `id` | string |  ✅  | -      | 视频 的 id |

## HTTP 示例

```bash
GET /video/detail?id=89ADDE33C0AAE8EC14B99F6750DB954D
```

## 编程式调用

```ts
import { videoDetail } from 'hana-music-api'

const result = await videoDetail({
  id: '89ADDE33C0AAE8EC14B99F6750DB954D',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口，可获取视频详情

**必选参数 :** `id`: 视频 的 id

**接口地址 :** `/video/detail`

**调用例子 :** `/video/detail?id=89ADDE33C0AAE8EC14B99F6750DB954D`
