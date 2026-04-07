---
title: '转发用户动态'
description: '登录后调用此接口 ,可以转发用户动态'
---

# 转发用户动态

> 登录后调用此接口 ,可以转发用户动态

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/event/forward` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `event_forward`  |
| 文档分类 | 社交与消息       |

## 请求参数

| 参数       | 类型   | 必填 | 默认值 | 说明       |
| ---------- | ------ | :--: | ------ | ---------- |
| `uid`      | string |  ✅  | -      | 用户 id    |
| `evId`     | string |  ✅  | -      | 动态 id    |
| `forwards` | string |  ✅  | -      | 转发的评论 |

## HTTP 示例

```bash
GET /event/forward?evId=6712917601&uid=32953014&forwards=测试内容
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.event_forward({
  evId: '6712917601',
  uid: '32953014',
  forwards: '测试内容',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可以转发用户动态

**必选参数 :** `uid` : 用户 id

`evId` : 动态 id

`forwards` : 转发的评论

**接口地址 :** `/event/forward`

**调用例子 :** `/event/forward?evId=6712917601&uid=32953014&forwards=测试内容`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
