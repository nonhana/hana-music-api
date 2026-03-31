---
title: "搜索多重匹配"
description: "调用此接口 , 传入搜索关键词可获得搜索结果"
---

# 搜索多重匹配

> 调用此接口 , 传入搜索关键词可获得搜索结果

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/search/multimatch` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `search_multimatch` |
| 文档分类 | 搜索 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `keywords` | string | ✅ | - | 关键词 |

## HTTP 示例

```bash
GET /search/multimatch?keywords=海阔天空
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.search_multimatch({
  keywords: "海阔天空",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入搜索关键词可获得搜索结果

**必选参数 :** `keywords` : 关键词

**接口地址 :** `/search/multimatch`

**调用例子 :** `/search/multimatch?keywords=海阔天空`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
