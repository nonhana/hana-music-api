---
title: "内部版本接口"
description: "调用此接口 , 可获得内部版本号(从package.json读取)"
---

# 内部版本接口

> 调用此接口 , 可获得内部版本号(从package.json读取)

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/inner/version` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `inner_version` |
| 文档分类 | 其他工具 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /inner/version
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.inner_version()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获得内部版本号(从package.json读取)

**接口地址 :** `/inner/version`

**调用例子 :** `/inner/version`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
