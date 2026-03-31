---
title: "数字专辑详情"
description: "调用此接口 , 传入专辑 id, 可获取数字专辑信息"
---

# 数字专辑详情

> 调用此接口 , 传入专辑 id, 可获取数字专辑信息

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/digitalAlbum/detail` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `digitalAlbum_detail` |
| 文档分类 | 专辑 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 专辑 id |

## HTTP 示例

```bash
GET /digitalAlbum/detail?id=120605500
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.digitalAlbum_detail({
  id: "120605500",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入专辑 id, 可获取数字专辑信息

**必选参数 :** `id` : 专辑 id

**接口地址 :** `/digitalAlbum/detail`

**调用例子 :** `/digitalAlbum/detail?id=120605500`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
