---
title: '云贝所有任务'
description: '登录后调用此接口可获取云贝所有任务'
---

# 云贝所有任务

> 登录后调用此接口可获取云贝所有任务

## 接口信息

| 项目     | 值              |
| -------- | --------------- |
| 接口地址 | `/yunbei/tasks` |
| 请求方式 | `GET` / `POST`  |
| 需要登录 | 是              |
| 对应模块 | `yunbei_tasks`  |
| 文档分类 | 会员与云贝      |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /yunbei/tasks
```

## 编程式调用

```ts
import { yunbeiTasks } from 'hana-music-api'

const result = await yunbeiTasks()

console.log(result.body)
```

## 补充说明

说明 :登录后调用此接口可获取云贝所有任务

**接口地址 :** `/yunbei/tasks`

**调用例子 :** `/yunbei/tasks`
