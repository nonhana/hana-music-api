---
title: "云贝完成任务"
description: "云贝完成任务 接口文档。"
---

# 云贝完成任务

> 云贝完成任务 接口文档。

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/yunbei/task/finish` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `yunbei_task_finish` |
| 文档分类 | 会员与云贝 |

## 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | :---: | --- | --- |
| `userTaskId` | string | ✅ | - | 任务 id |
| `depositCode` | string | — | - | 任务 depositCode |

## HTTP 示例

```bash
GET /yunbei/task/finish?userTaskId=5146243240&depositCode=0
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.yunbei_task_finish({
  userTaskId: "5146243240",
  depositCode: "0",
})

console.log(result.body)
```

## 补充说明

**必选参数 :**

`userTaskId` : 任务 id

**可选参数 :**

`depositCode`: 任务 depositCode

**接口地址 :** `/yunbei/task/finish`

**调用例子 :** `/yunbei/task/finish?userTaskId=5146243240&depositCode=0`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
