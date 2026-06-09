---
title: '一起听 - 心跳'
description: '上报一起听房间的当前歌曲、播放状态和进度。'
---

# 一起听 - 心跳

> 维持一起听播放状态的心跳接口。路由名沿用历史拼写 `heatbeat`。

## 接口信息

| 项目     | 值                               |
| -------- | -------------------------------- |
| 接口地址 | `/listentogether/heatbeat`       |
| 请求方式 | `GET` / `POST`                   |
| 需要登录 | 是                               |
| 对应模块 | `listentogether_heatbeat`        |
| 文档分类 | 一起听                           |
| 上游路径 | `/api/listen/together/heartbeat` |

## 请求参数

| 参数         | 类型   | 必填 | 默认值 | 说明                               |
| ------------ | ------ | :--: | ------ | ---------------------------------- |
| `roomId`     | string |  ✅  | -      | 房间 ID                            |
| `songId`     | string |  ✅  | -      | 当前播放歌曲 ID                    |
| `playStatus` | string |  ✅  | -      | 播放状态，常见为 `PLAY` 或 `PAUSE` |
| `progress`   | number |  ✅  | -      | 当前播放进度，单位毫秒             |

## HTTP 示例

```bash
POST /listentogether/heatbeat?roomId=MzA0NjY5...&songId=1372188635&playStatus=PLAY&progress=0
```

## 编程式调用

```ts
import { listentogetherHeatbeat } from 'hana-music-api'

const result = await listentogetherHeatbeat({
  roomId: 'MzA0NjY5...',
  songId: '1372188635',
  playStatus: 'PLAY',
  progress: 0,
})

console.log(result.body)
```

## 返回关注点

- `code`: 是否上报成功。
- `message`: 心跳失败时的错误原因。

## 相关接口

- [`/listentogether/play/command`](/api/together/listentogether-play-command)
- [`/listentogether/status`](/api/together/listentogether-status)
