---
title: '歌单更新播放量'
description: '调用后可更新歌单播放量'
---

# 歌单更新播放量

调用后可更新歌单播放量

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 接口地址   | `/playlist/update/playcount`                                                |
| 请求方式   | `GET` / `POST`                                                              |
| 需要登录   | 否                                                                          |
| 对应模块   | `playlist_update_playcount`                                                 |
| SDK 函数   | `playlistUpdatePlaycount`（`hana-music-api/api/playlist_update_playcount`） |
| 返回体类型 | `PlaylistUpdatePlaycountBody`（已建模返回体）                               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistUpdatePlaycount } from 'hana-music-api';

const result = await playlistUpdatePlaycount({
  id: '24381616',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/playlist/update/playcount' \
  --data-urlencode 'id=24381616'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明    |
| ---- | ------------------ | ---- | ------ | ------- |
| `id` | `number \| string` | 是   | -      | 歌单 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistUpdatePlaycountBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_update_playcount`、`hana-music-api/schemas/playlist_update_playcount` 导入运行时校验器）。

```ts
type PlaylistUpdatePlaycountBody =
  | {
      code: 200;
    }
  | '';
```

| 字段   | 类型  | 必填 | 说明                         |
| ------ | ----- | ---- | ---------------------------- |
| `code` | `200` | 是   | 业务状态码（`200` 表示成功） |

> 当参数格式异常时，上游可能返回空响应，此时返回体为 `""`。

<!-- api-doc:response:end -->

## 注意事项

- **接口行为**：仅用于累加歌单播放计数，请求成功仅返回 `code: 200`；若缺少 `id` 参数，上游返回空字符串 `""`。
