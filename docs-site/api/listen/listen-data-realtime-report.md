---
title: '听歌足迹 - 本周/本月收听时长'
description: '登录后调用此接口, 获取本周/本月收听时长'
---

# 听歌足迹 - 本周/本月收听时长

> 登录后调用此接口, 获取本周/本月收听时长

## 接口信息

| 项目     | 值                             |
| -------- | ------------------------------ |
| 接口地址 | `/listen/data/realtime/report` |
| 请求方式 | `GET` / `POST`                 |
| 需要登录 | 是                             |
| 对应模块 | `listen_data_realtime_report`  |
| 文档分类 | 听歌记录                       |

## 请求参数

| 参数   | 类型   | 必填 | 默认值 | 说明                                                    |
| ------ | ------ | :--: | ------ | ------------------------------------------------------- |
| `type` | string |  ✅  | -      | 维度类型 周 week 月 month; 今年没结束，不支持今年的数据 |

## HTTP 示例

```bash
GET /listen/data/realtime/report?type=month
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.listen_data_realtime_report({
  type: 'month',
})

console.log(result.body)
```

## 补充说明

说明 : 登录后调用此接口, 获取本周/本月收听时长

**必选参数 :**

`type`: 维度类型 周 week 月 month; 今年没结束，不支持今年的数据

**接口地址 :** `/listen/data/realtime/report`

**调用例子 :** `/listen/data/realtime/report?type=month`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
