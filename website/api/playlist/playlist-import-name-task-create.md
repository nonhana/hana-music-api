---
title: '歌单导入 - 元数据/文字/链接导入'
description: '登录后调用此接口，支持通过元数据/文字/链接三种方式生成歌单; 三种方式不可同时调用'
---

# 歌单导入 - 元数据/文字/链接导入

登录后调用此接口，支持通过元数据/文字/链接三种方式生成歌单; 三种方式不可同时调用

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                      |
| ---------- | --------------------------------------------------------------------------------------- |
| 接口地址   | `/playlist/import/name/task/create`                                                     |
| 请求方式   | `GET` / `POST`                                                                          |
| 需要登录   | 是                                                                                      |
| 对应模块   | `playlist_import_name_task_create`                                                      |
| SDK 函数   | `playlistImportNameTaskCreate`（`hana-music-api/api/playlist_import_name_task_create`） |
| 返回体类型 | `PlaylistImportNameTaskCreateBody`（已建模返回体）                                      |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistImportNameTaskCreate } from 'hana-music-api';

const result = await playlistImportNameTaskCreate(
  {
    text: '周杰伦 - 晴天',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/import/name/task/create' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'text=周杰伦 - 晴天'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数                 | 类型                              | 必填 | 默认值  | 说明                                            |
| -------------------- | --------------------------------- | ---- | ------- | ----------------------------------------------- |
| `importStarPlaylist` | `boolean`                         | 否   | `false` | 是否直接导入「我喜欢的音乐」，默认 `false`      |
| `link`               | `Array<string>`                   | 否   | -       | 外部歌单链接数组（链接导入）                    |
| `local`              | `Array<PlaylistImportLocalEntry>` | 否   | -       | 本地元数据条目数组（`name`、`artist`、`album`） |
| `playlistName`       | `string`                          | 否   | 为      | 生成的新歌单名称                                |
| `text`               | `string`                          | 否   | -       | 纯文本歌单内容（文字导入）                      |

| `local[]` 字段 | 类型     | 必填 | 说明     |
| -------------- | -------- | ---- | -------- |
| `name`         | `string` | 否   | 歌曲名称 |
| `artist`       | `string` | 否   | 歌手名称 |
| `album`        | `string` | 否   | 专辑名称 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistImportNameTaskCreateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_import_name_task_create`、`hana-music-api/schemas/playlist_import_name_task_create` 导入运行时校验器）。

```ts
type PlaylistImportNameTaskCreateBody = {
  code: 200;
  data?: {
    taskId?: number | null;
  } | null;
  msg?: string | null;
  message?: string | null;
};
```

| 字段          | 类型     | 必填 | 说明                         |
| ------------- | -------- | ---- | ---------------------------- |
| `code`        | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `object` | 否   | 接口返回的数据主体           |
| `data.taskId` | `number` | 否   | 异步任务 ID                  |
| `msg`         | `string` | 否   | 提示信息                     |
| `message`     | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **导入模式**：支持三种互斥导入方式——传 `local`（元数据数组）、`text`（纯文本）或 `link`（链接数组）。
- **任务轮询**：创建任务后可通过返回的 `data.taskId` 调用 [歌单导入任务状态](/api/playlist/playlist-import-task-status) 查询导入进度。
