---
title: '相似 mv'
description: '调用此接口 , 传入 `mvid` 可获取相似 mv'
---

# 相似 mv

> 调用此接口 , 传入 `mvid` 可获取相似 mv

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/simi/mv`     |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否             |
| 对应模块 | `simi_mv`      |
| 文档分类 | 推荐与发现     |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明  |
| ------ | ------ | :--: | ------ | ----- |
| `mvid` | string |  ✅  | -      | mv id |

## HTTP 示例

```bash
GET /simi/mv?mvid=5436712
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.simi_mv({
  mvid: '5436712',
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 传入 `mvid` 可获取相似 mv

**必选参数 :** `mvid`: mv id

**接口地址 :** `/simi/mv`

**调用例子 :** `/simi/mv?mvid=5436712`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
