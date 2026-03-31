---
title: "我的数字专辑"
description: "登录后调用此接口 ,可获取我的数字专辑"
---

# 我的数字专辑

> 登录后调用此接口 ,可获取我的数字专辑

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/digitalAlbum/purchased` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `digitalAlbum_purchased` |
| 文档分类 | 专辑 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /digitalAlbum/purchased?limit=10
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.digitalAlbum_purchased({
  limit: "10",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取我的数字专辑

**接口地址 :** `/digitalAlbum/purchased`

**调用例子 :** `/digitalAlbum/purchased?limit=10`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
