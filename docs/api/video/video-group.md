---
title: '获取视频标签/分类下的视频'
description: '调用此接口 , 传入标签/分类`id`,可获取到相关的视频,分页参数只能传入 offset'
---

# 获取视频标签/分类下的视频

> 调用此接口 , 传入标签/分类`id`,可获取到相关的视频,分页参数只能传入 offset

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/video/group` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `video_group`  |
| 文档分类 | 视频与 MV      |

## 请求参数

| 参数     | 类型             | 必填 | 默认值 | 说明             |
| -------- | ---------------- | :--: | ------ | ---------------- |
| `id`     | string           |  ✅  | -      | videoGroup 的 id |
| `offset` | number \| string |  —   | 0      | 默认 0           |

## HTTP 示例

```bash
GET /video/group?id=9104
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.video_group({
  id: '9104',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入标签/分类`id`,可获取到相关的视频,分页参数只能传入 offset

**必选参数 :** `id`: videoGroup 的 id

**可选参数 :** `offset`: 默认 0

**接口地址 :** `/video/group`

**调用例子 :** `/video/group?id=9104`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
