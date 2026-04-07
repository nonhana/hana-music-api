---
title: 'batch 批量请求接口'
description: '登录后调用此接口 ,传入接口和对应原始参数(原始参数非文档里写的参数,需参考源码),可批量请求接口'
---

# batch 批量请求接口

> 登录后调用此接口 ,传入接口和对应原始参数(原始参数非文档里写的参数,需参考源码),可批量请求接口

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/batch`       |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是             |
| 对应模块 | `batch`        |
| 文档分类 | 其他工具       |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /batch?/api/v2/banner/get={"clientType":"pc"}
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.batch({
  /api/v2/banner/get: "{\"clientType\":\"pc\"}",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,传入接口和对应原始参数(原始参数非文档里写的参数,需参考源码),可批量请求接口

**接口地址 :** `/batch`

**调用例子 :** 使用 GET 方式:`/batch?/api/v2/banner/get={"clientType":"pc"}` 使用 POST 方式传入参数:`{ "/api/v2/banner/get": {"clientType":"pc"} }`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
