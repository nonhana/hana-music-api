---
title: "广播电台 - 全部电台"
description: "调用此接口, 获取广播电台 - 全部电台"
---

# 广播电台 - 全部电台

> 调用此接口, 获取广播电台 - 全部电台

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/broadcast/channel/list` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `broadcast_channel_list` |
| 文档分类 | 其他工具 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `categoryId` | string | — | 0 | 类别id, 默认为 0，可从“广播电台 - 分类/地区信息”接口获取 |
| `regionId` | string | — | 0 | 地区id, 默认为 0，可从“广播电台 - 分类/地区信息”接口获取 |

## HTTP 示例

```bash
GET /broadcast/channel/list
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.broadcast_channel_list()

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 获取广播电台 - 全部电台

**可选参数 :**

`categoryId` : 类别id, 默认为 0，可从“广播电台 - 分类/地区信息”接口获取

`regionId` : 地区id, 默认为 0，可从“广播电台 - 分类/地区信息”接口获取

**接口地址:** `/broadcast/channel/list`

**调用例子:** `/broadcast/channel/list`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
