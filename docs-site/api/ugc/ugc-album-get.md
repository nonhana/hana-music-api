---
title: "专辑简要百科信息"
description: "登录后调用此接口,使用此接口,传入专辑id,可获取对应的专辑简要百科信息"
---

# 专辑简要百科信息

> 登录后调用此接口,使用此接口,传入专辑id,可获取对应的专辑简要百科信息

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/ugc/album/get` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `ugc_album_get` |
| 文档分类 | 百科与用户贡献 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /ugc/album/get?id=168223858
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.ugc_album_get({
  id: "168223858",
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口,使用此接口,传入专辑id,可获取对应的专辑简要百科信息

**必选参数：**  

`id`: 专辑id

**接口地址:** `/ugc/album/get`

**调用例子:** `/ugc/album/get?id=168223858`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
