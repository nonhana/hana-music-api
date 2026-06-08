---
title: '一起听 - 同步播放列表'
description: '向一起听房间上报当前播放列表快照和列表版本。'
---

# 一起听 - 同步播放列表

> 向房间广播当前歌单内容，通常由房主在加载或替换播放列表后调用。

## 接口信息

| 项目     | 值                                              |
| -------- | ----------------------------------------------- |
| 接口地址 | `/listentogether/sync/list/command`             |
| 请求方式 | `GET` / `POST`                                  |
| 需要登录 | 是                                              |
| 对应模块 | `listentogether_sync_list_command`              |
| 文档分类 | 一起听                                          |
| 上游路径 | `/api/listen/together/sync/list/command/report` |

## 请求参数

| 参数          | 类型   | 必填 | 默认值 | 说明                                                    |
| ------------- | ------ | :--: | ------ | ------------------------------------------------------- |
| `roomId`      | string |  ✅  | -      | 房间 ID                                                 |
| `commandType` | string |  ✅  | -      | 列表指令类型，公开资料可见 `REPLACE`、`PLAYMODE_CHANGE` |
| `userId`      | string |  ✅  | -      | 发起本次列表变更的用户 ID                               |
| `version`     | number |  ✅  | -      | 列表版本号，示例页里使用本地递增计数器                  |
| `randomList`  | string |  ✅  | -      | 随机顺序列表，逗号分隔的歌曲 ID 字符串                  |
| `displayList` | string |  ✅  | -      | 展示顺序列表，逗号分隔的歌曲 ID 字符串                  |

## HTTP 示例

```bash
POST /listentogether/sync/list/command?roomId=MzA0NjY5...&commandType=REPLACE&userId=32953014&version=1&displayList=1372188635,186016&randomList=1372188635,186016
```

## 编程式调用

```ts
import { listentogetherSyncListCommand } from 'hana-music-api'

const result = await listentogetherSyncListCommand({
  roomId: 'MzA0NjY5...',
  commandType: 'REPLACE',
  userId: '32953014',
  version: 1,
  displayList: '1372188635,186016',
  randomList: '1372188635,186016',
})

console.log(result.body)
```

## 返回关注点

- `code`: 是否同步成功。
- `message`: 失败时的错误信息。

## 补充说明

- 当前模块会把 `randomList` 和 `displayList` 先按逗号拆成数组，再拼进上游需要的 `playlistParam` JSON 字符串。
- `playlistParam.version` 在真正发送到上游时会被包装成数组：`[{ userId, version }]`。
- 当前实现会把 `anchorSongId` 固定为空串，把 `anchorPosition` 固定为 `-1`。

## 典型流程

1. 房主创建房间。
2. 加载歌单并拿到歌曲 ID 列表。
3. 用本接口把 `displayList` 和 `randomList` 推送到房间。
4. 从机调用 [`/listentogether/sync/playlist/get`](/api/together/listentogether-sync-playlist-get) 拉取最新歌单快照。

## 相关接口

- [`/listentogether/sync/playlist/get`](/api/together/listentogether-sync-playlist-get)
- [`/listentogether/play/command`](/api/together/listentogether-play-command)

## 维护说明

- 本页基于上游 issue、PR、示例页与当前 `hana-music-api` 模块实现补写。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
