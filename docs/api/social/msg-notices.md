---
title: "通知 - 通知"
description: "登录后调用此接口 ,可获取通知"
---

# 通知 - 通知

> 登录后调用此接口 ,可获取通知

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/msg/notices` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 是 |
| 对应模块 | `msg_notices` |
| 文档分类 | 社交与消息 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `limit` | number \| string | — | 30 | 返回数量 , 默认为 30 |
| `lasttime` | string | — | -1,传入上一次返回结果的 | 返回数据的 `time` ,默认-1,传入上一次返回结果的 time,将会返回下一页的数据 |

## HTTP 示例

```bash
GET /msg/notices?limit=3
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.msg_notices({
  limit: "3",
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口 ,可获取通知

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`lasttime` : 返回数据的 `time` ,默认-1,传入上一次返回结果的 time,将会返回下一页的数据

**接口地址 :** `/msg/notices`

**调用例子 :** `/msg/notices?limit=3`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
