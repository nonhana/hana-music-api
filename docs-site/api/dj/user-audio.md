---
title: '用户电台'
description: '调用此接口, 传入用户 id 可获取用户创建的电台'
---

# 用户电台

> 调用此接口, 传入用户 id 可获取用户创建的电台

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/user/audio`  |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `user_audio`   |
| 文档分类 | 电台与播客     |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/audio?uid=32953014
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_audio({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口, 传入用户 id 可获取用户创建的电台

**必选参数 :** `uid`: 用户 id

**接口地址 :** `/user/audio`

**调用例子 :** `/user/audio?uid=32953014`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
