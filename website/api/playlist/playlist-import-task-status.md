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
import { playlistImportTaskStatus } from 'hana-music-api';

const result = await playlistImportTaskStatus({
  id: '123834369',
});

console.log(result.body);
```

## 返回内容

只读轮询，没有副作用。正文的 `data.tasks` 是任务列表，每个任务的 `id` 和 `status` 收紧；`parentId`、`playlistId`、`createTime`、`msg`、`succCount`、`playlistStatus`、`playlistPrivacy`、`type` 宽松，`taskProcess` 宽松。缺少 `id` 时上游回 `code: 500`（系统异常），按业务拒绝转交 `status: 500`，状态与改造前一致。未知任务 id 回 `code: 200` 和空 `tasks`；`imgUrl`、`playlistName` 只见过 `null`，没有声明。结构定义和类型是 `PlaylistImportTaskStatusBody`，见 [返回体结构](/guide/response-bodies)。

## 补充说明

说明: 调用此接口, 传入导入歌单任务id, 获取任务状态

**必选参数：**

`id`: 任务id

**接口地址:** `/playlist/import/task/status`

**调用例子:** `/playlist/import/task/status?id=123834369`
