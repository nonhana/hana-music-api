---
title: '歌单导入 - 任务状态'
description: '调用此接口，传入导入歌单任务id，获取任务状态'
---

# 歌单导入 - 任务状态

调用此接口，传入导入歌单任务id，获取任务状态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| 接口地址   | `/playlist/import/task/status`                                                 |
| 请求方式   | `GET` / `POST`                                                                 |
| 需要登录   | 否                                                                             |
| 对应模块   | `playlist_import_task_status`                                                  |
| SDK 函数   | `playlistImportTaskStatus`（`hana-music-api/api/playlist_import_task_status`） |
| 返回体类型 | `PlaylistImportTaskStatusBody`（已建模返回体）                                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistImportTaskStatus } from 'hana-music-api';

const result = await playlistImportTaskStatus({
  id: '123834369',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/import/task/status' \
  --data-urlencode 'id=123834369'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 任务id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistImportTaskStatusBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_import_task_status`、`hana-music-api/schemas/playlist_import_task_status` 导入运行时校验器）。

```ts
type ImportTask = {
  id: number;
  status: string;
  parentId?: number | null;
  playlistId?: number | null;
  createTime?: number | null;
  msg?: string | null;
  succCount?: number | null;
  playlistStatus?: number | null;
  playlistPrivacy?: number | null;
  type?: string | null;
};

type PlaylistImportTaskStatusBody = {
  code: 200;
  data: {
    tasks: Array<ImportTask>;
    taskProcess?: string | null;
  };
  msg?: string | null;
  message?: string | null;
};
```

| 字段                           | 类型                | 必填 | 说明                         |
| ------------------------------ | ------------------- | ---- | ---------------------------- |
| `code`                         | `200`               | 是   | 业务状态码（`200` 表示成功） |
| `data`                         | `object`            | 是   | 接口返回的数据主体           |
| `data.tasks`                   | `Array<ImportTask>` | 是   | -                            |
| `data.tasks[].id`              | `number`            | 是   | 记录 ID                      |
| `data.tasks[].status`          | `string`            | 是   | -                            |
| `data.tasks[].parentId`        | `number`            | 否   | parent ID                    |
| `data.tasks[].playlistId`      | `number`            | 否   | 歌单 ID                      |
| `data.tasks[].createTime`      | `number`            | 否   | 时间戳                       |
| `data.tasks[].msg`             | `string`            | 否   | 提示信息                     |
| `data.tasks[].succCount`       | `number`            | 否   | -                            |
| `data.tasks[].playlistStatus`  | `number`            | 否   | -                            |
| `data.tasks[].playlistPrivacy` | `number`            | 否   | -                            |
| `data.tasks[].type`            | `string`            | 否   | -                            |
| `data.taskProcess`             | `string`            | 否   | -                            |
| `msg`                          | `string`            | 否   | 提示信息                     |
| `message`                      | `string`            | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
