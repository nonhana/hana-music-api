---
title: '歌单导入 - 任务状态'
description: '调用此接口, 传入导入歌单任务id, 获取任务状态'
---

# 歌单导入 - 任务状态

> 调用此接口, 传入导入歌单任务id, 获取任务状态

## 接口信息

| 项目     | 值                             |
| -------- | ------------------------------ |
| 接口地址 | `/playlist/import/task/status` |
| 请求方式 | `GET` / `POST`                 |
| 需要登录 | 否                             |
| 对应模块 | `playlist_import_task_status`  |
| 文档分类 | 歌单                           |

## 请求参数

这页暂时没有单独整理参数表，直接参考下面的示例调用即可。

## HTTP 示例

```bash
GET /playlist/import/task/status?id=123834369
```

## 编程式调用

```ts
import { playlistImportTaskStatus } from 'hana-music-api'

const result = await playlistImportTaskStatus({
  id: '123834369',
})

console.log(result.body)
```

## 补充说明

说明: 调用此接口, 传入导入歌单任务id, 获取任务状态

**必选参数：**

`id`: 任务id

**接口地址:** `/playlist/import/task/status`

**调用例子:** `/playlist/import/task/status?id=123834369`
