---
title: 'DIFM电台 - 取消收藏频道'
description: '调用此接口, 可取消收藏DIFM频道'
---

# DIFM电台 - 取消收藏频道

> 调用此接口, 可取消收藏DIFM频道

## 接口信息

| 项目     | 值                             |
| -------- | ------------------------------ |
| 接口地址 | `/dj/difm/channel/unsubscribe` |
| 请求方式 | `GET` / `POST`                 |
| 需要登录 | 否                             |
| 对应模块 | `dj_difm_channel_unsubscribe`  |
| 文档分类 | 电台与播客                     |

## 请求参数

| 参数 | 类型   | 必填 | 默认值 | 说明   |
| ---- | ------ | :--: | ------ | ------ |
| `id` | string |  ✅  | -      | 频道id |

## HTTP 示例

```bash
GET /dj/difm/channel/unsubscribe?id=1
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_difm_channel_unsubscribe({
  id: '1',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 可取消收藏DIFM频道

**必选参数 :**

`id`: 频道id

**接口地址:** `/dj/difm/channel/unsubscribe`

**调用例子:** `/dj/difm/channel/unsubscribe?id=1`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
