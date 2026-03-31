---
title: "广播电台 - 电台信息"
description: "调用此接口, 传入电台id, 获取广播电台 - 电台信息"
---

# 广播电台 - 电台信息

> 调用此接口, 传入电台id, 获取广播电台 - 电台信息

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/broadcast/channel/currentinfo` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `broadcast_channel_currentinfo` |
| 文档分类 | 其他工具 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /broadcast/channel/currentinfo?id=5
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.broadcast_channel_currentinfo({
  id: "5",
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 传入电台id, 获取广播电台 - 电台信息

**必选参数：**

`id`: 电台id

**接口地址:** `/broadcast/channel/currentinfo`

**调用例子:** `/broadcast/channel/currentinfo?id=5`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
