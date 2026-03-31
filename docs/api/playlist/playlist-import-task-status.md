---
title: "歌单导入 - 任务状态"
description: "调用此接口, 传入导入歌单任务id, 获取任务状态"
---

# 歌单导入 - 任务状态

> 调用此接口, 传入导入歌单任务id, 获取任务状态

## 接口信息

| 项目 | 值 |
| --- | --- |
| 接口地址 | `/playlist/import/task/status` |
| 请求方式 | `GET` / `POST` |
| 需要登录 | 否 |
| 对应模块 | `playlist_import_task_status` |
| 文档分类 | 歌单 |

## 请求参数

当前整理后的接口资料未明确列出参数，调用时请参考对应模块实现或程序化调用示例。

## HTTP 示例

```bash
GET /playlist/import/task/status?id=123834369
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.playlist_import_task_status({
  id: "123834369",
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 传入导入歌单任务id, 获取任务状态

**必选参数：**     

`id`: 任务id

**接口地址:** `/playlist/import/task/status`

**调用例子:** `/playlist/import/task/status?id=123834369`

## 维护说明

- 本页由脚本根据当前模块与整理后的接口说明自动生成。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
