---
title: "电台订阅者列表"
description: "调用此接口,可获取电台订阅者列表"
---

# 电台订阅者列表

> 调用此接口,可获取电台订阅者列表

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/dj/subscriber` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `dj_subscriber` |
| 文档分类 | 电台与播客 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `id` | string | ✅ | - | 电台 id |
| `time` | number \| string | — | -1,传入上一次返回结果的 | 分页参数,默认-1,传入上一次返回结果的 time,将会返回下一页的数据 |
| `limit` | number \| string | — | 20 | 返回数量,默认为 20 |

## HTTP 示例

```bash
GET /dj/subscriber?id=335425050
GET /dj/subscriber?id=335425050&time=1602761825390
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.dj_subscriber({
  id: "335425050",
})

console.log(result.body)
```

## 补充说明

说明 : 调用此接口,可获取电台订阅者列表
**必选参数 :** `id`: 电台 id

**可选参数 :**
`time` : 分页参数,默认-1,传入上一次返回结果的 time,将会返回下一页的数据

`limit` : 返回数量,默认为 20

**接口地址 :** `/dj/subscriber`

**调用例子 :** `/dj/subscriber?id=335425050` , `/dj/subscriber?id=335425050&time=1602761825390`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
