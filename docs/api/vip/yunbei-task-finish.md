---
title: '云贝完成任务'
description: '云贝完成任务 接口文档。'
---

# 云贝完成任务

> 云贝完成任务 接口文档。

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/yunbei/task/finish` |
| 请求方式 | `GET` / `POST`        |
| 需要登录 | 否                    |
| 对应模块 | `yunbei_task_finish`  |
| 文档分类 | 会员与云贝            |

## 请求参数

| 参数          | 类型   | 必填 | 默认值 | 说明             |
| ------------- | ------ | :--: | ------ | ---------------- |
| `userTaskId`  | string |  ✅  | -      | 任务 id          |
| `depositCode` | string |  —   | -      | 任务 depositCode |

## HTTP 示例

```bash
GET /yunbei/task/finish?userTaskId=5146243240&depositCode=0
```

## 编程式调用

```ts
import { yunbeiTaskFinish } from 'hana-music-api'

const result = await yunbeiTaskFinish({
  userTaskId: '5146243240',
  depositCode: '0',
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
