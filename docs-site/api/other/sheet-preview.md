---
title: "乐谱内容"
description: "登录后调用此接口获取乐谱的内容"
---

# 乐谱内容

> 登录后调用此接口获取乐谱的内容

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/sheet/preview` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `sheet_preview` |
| 文档分类 | 其他工具 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | **乐谱** ID |

## HTTP 示例

```bash
GET /sheet/preview?id=143190
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.sheet_preview({
  id: "143190",
})

console.log(result.body)
```

## 补充说明

说明: 登录后调用此接口获取乐谱的内容

**接口地址:** `/sheet/preview`

**必选参数:** `id`: **乐谱** ID

**调用例子:** `/sheet/preview?id=143190`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
