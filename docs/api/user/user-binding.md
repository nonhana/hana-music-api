---
title: '获取用户绑定信息'
description: '登录后调用此接口 , 可以获取用户绑定信息'
---

# 获取用户绑定信息

> 登录后调用此接口 , 可以获取用户绑定信息

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/user/binding` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `user_binding`  |
| 文档分类 | 用户与登录      |

## 请求参数

| 参数  | 类型   | 必填 | 默认值 | 说明    |
| ----- | ------ | :--: | ------ | ------- |
| `uid` | string |  ✅  | -      | 用户 id |

## HTTP 示例

```bash
GET /user/binding?uid=32953014
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.user_binding({
  uid: '32953014',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 , 可以获取用户绑定信息

**必选参数 :** `uid` : 用户 id

**接口地址 :** `/user/binding`

**调用例子 :** `/user/binding?uid=32953014`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
