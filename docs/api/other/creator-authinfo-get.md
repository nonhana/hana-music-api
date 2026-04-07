---
title: 'creator authinfo get'
description: 'creator authinfo get 接口文档。'
---

# creator authinfo get

> creator authinfo get 接口文档。

## 接口信息

| 项目     | 值                      |
| -------- | ----------------------- |
| 接口地址 | `/creator/authinfo/get` |
| 请求方式 | `GET` / `POST`          |
| 需要登录 | 否                      |
| 对应模块 | `creator_authinfo_get`  |
| 文档分类 | 其他工具                |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /creator/authinfo/get
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.creator_authinfo_get()

console.log(result.body)
```

## 说明

当前未在整理后的历史接口资料中找到完全对应的章节，本页内容由当前公开模块、路由和调用约定自动生成。若需要补充更精细的返回字段说明，请优先参考对应模块实现。

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
