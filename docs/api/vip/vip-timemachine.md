---
title: "黑胶时光机"
description: "调用此接口 , 可获得黑胶时光机数据"
---

# 黑胶时光机

> 调用此接口 , 可获得黑胶时光机数据

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/vip/timemachine` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `vip_timemachine` |
| 文档分类 | 会员与云贝 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `startTime` | string | — | - | 开始时间 |
| `endTime` | string | — | - | 结束时间 |
| `limit` | number \| string | — | 60 | 返回数量 , 默认为 60 |

## HTTP 示例

```bash
GET /vip/timemachine
GET /vip/timemachine?startTime=1638288000000&endTime=1640966399999&limit=10
GET /vip/timemachine?startTime=1609430400&endTime=1640966399999&limit=60
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.vip_timemachine()

console.log(result.body)
```

## 补充说明

说明 : 调用此接口 , 可获得黑胶时光机数据

**可选参数 :** `startTime` : 开始时间
`endTime` : 结束时间
`limit` : 返回数量 , 默认为 60

**接口地址 :** `/vip/timemachine`

**调用例子 :** `/vip/timemachine` `/vip/timemachine?startTime=1638288000000&endTime=1640966399999&limit=10`（2021年12月） `/vip/timemachine?startTime=1609430400&endTime=1640966399999&limit=60`(2021年)

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
