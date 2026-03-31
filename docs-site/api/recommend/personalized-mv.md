---
title: '推荐 mv'
description: '调用此接口 , 可获取推荐 mv'
---

# 推荐 mv

> 调用此接口 , 可获取推荐 mv

## 接口信息

| 项目     | 值                 |
| -------- | ------------------ |
| 接口地址 | `/personalized/mv` |
| 请求方式 | `GET` / `POST`     |
| 需要登录 | 否                 |
| 对应模块 | `personalized_mv`  |
| 文档分类 | 推荐与发现         |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /personalized/mv
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.personalized_mv()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获取推荐 mv

**接口地址 :** `/personalized/mv`

**调用例子 :** `/personalized/mv`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
