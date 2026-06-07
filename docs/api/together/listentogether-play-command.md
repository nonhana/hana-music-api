---
title: '一起听 - 播放指令'
description: '向一起听房间上报播放、暂停、跳转和进度同步等指令。'
---

# 一起听 - 播放指令

> 向房间广播当前播放器动作，例如播放、暂停、切歌和同步进度。

## 接口信息

| 项目     | 值                                         |
| -------- | ------------------------------------------ |
| 接口地址 | `/listentogether/play/command`             |
| 请求方式 | `GET` / `POST`                             |
| 需要登录 | 是                                         |
| 对应模块 | `listentogether_play_command`              |
| 文档分类 | 一起听                                     |
| 上游路径 | `/api/listen/together/play/command/report` |

## 请求参数

| 参数           | 类型   | 必填 | 默认值 | 说明                                                   |
| -------------- | ------ | :--: | ------ | ------------------------------------------------------ |
| `roomId`       | string |  ✅  | -      | 房间 ID                                                |
| `commandType`  | string |  ✅  | -      | 指令类型。示例页中可见 `PLAY`、`PAUSE`、`GOTO`、`seek` |
| `targetSongId` | string |  ✅  | -      | 指令目标歌曲 ID                                        |
| `clientSeq`    | number |  ✅  | -      | 客户端维护的递增序号                                   |
| `playStatus`   | string |  ✅  | -      | 播放状态，常见为 `PLAY` 或 `PAUSE`                     |
| `formerSongId` | string |  —   | -      | 上一首歌曲 ID；示例页未知时传 `-1`                     |
| `progress`     | number |  —   | `0`    | 当前进度，单位毫秒                                     |

## HTTP 示例

```bash
POST /listentogether/play/command?roomId=MzA0NjY5...&commandType=PLAY&targetSongId=1372188635&clientSeq=1&playStatus=PLAY&progress=0
```

## 编程式调用

```ts
import { createModuleApi } from 'hana-music-api'

const api = createModuleApi()

const result = await api.listentogether_play_command({
  roomId: 'MzA0NjY5...',
  commandType: 'GOTO',
  targetSongId: '1372188635',
  formerSongId: '-1',
  clientSeq: 2,
  playStatus: 'PLAY',
  progress: 15342,
})

console.log(result.body)
```

## 返回关注点

- `code`: 是否上报成功。
- `message`: 失败时的错误信息。

## 补充说明

- 播放指令通常和 [`/listentogether/heatbeat`](/api/together/listentogether-heatbeat) 配合使用：前者表示动作，后者维持当前播放态。

## 相关接口

- [`/listentogether/heatbeat`](/api/together/listentogether-heatbeat)
- [`/listentogether/sync/list/command`](/api/together/listentogether-sync-list-command)

## 维护说明

- 本页基于上游 PR 示例页与当前 `hana-music-api` 模块实现补写。
- 如果补充说明与当前实现存在冲突，请以 `hana-music-api` 当前源码为准。
- 如需进一步校验行为，建议结合真实上游请求或现有回归测试验证。
