---
title: '一起听 - 播放指令'
description: '向一起听房间上报播放、暂停、跳转和进度同步等指令。'
---

# 一起听 - 播放指令

向一起听房间上报播放、暂停、跳转和进度同步等指令。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| 接口地址   | `/listentogether/play/command`                                                  |
| 请求方式   | `GET` / `POST`                                                                  |
| 需要登录   | 是                                                                              |
| 对应模块   | `listentogether_play_command`                                                   |
| SDK 函数   | `listentogetherPlayCommand`（`hana-music-api/api/listentogether_play_command`） |
| 返回体类型 | `ListentogetherPlayCommandBody`（已建模返回体）                                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherPlayCommand } from 'hana-music-api';

const result = await listentogetherPlayCommand(
  {
    roomId: 'MzA0NjY5...',
    commandType: 'GOTO',
    targetSongId: '1372188635',
    formerSongId: '-1',
    clientSeq: 2,
    playStatus: 'PLAY',
    progress: 15342,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listentogether/play/command' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'roomId=MzA0NjY5...' \
  --data-urlencode 'commandType=GOTO' \
  --data-urlencode 'targetSongId=1372188635' \
  --data-urlencode 'formerSongId=-1' \
  --data-urlencode 'clientSeq=2' \
  --data-urlencode 'playStatus=PLAY' \
  --data-urlencode 'progress=15342'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数           | 类型               | 必填 | 默认值 | 说明                                                   |
| -------------- | ------------------ | ---- | ------ | ------------------------------------------------------ |
| `clientSeq`    | `number`           | 是   | -      | 客户端维护的递增序号                                   |
| `commandType`  | `string`           | 是   | -      | 指令类型。示例页中可见 `PLAY`、`PAUSE`、`GOTO`、`seek` |
| `formerSongId` | `string \| number` | 否   | -      | 上一首歌曲 ID；示例页未知时传 `-1`                     |
| `playStatus`   | `string \| number` | 是   | -      | 播放状态，常见为 `PLAY` 或 `PAUSE`                     |
| `progress`     | `number`           | 否   | `0`    | 当前进度，单位毫秒                                     |
| `roomId`       | `string`           | 是   | -      | 房间 ID                                                |
| `targetSongId` | `number \| string` | 是   | -      | 指令目标歌曲 ID                                        |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherPlayCommandBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_play_command`、`hana-music-api/schemas/listentogether_play_command` 导入运行时校验器）。

```ts
type ListentogetherPlayCommandBody = {
  code: 200;
  data?: {
    result?: boolean | null;
  } | null;
  message?: string | null;
};
```

| 字段          | 类型      | 必填 | 说明                         |
| ------------- | --------- | ---- | ---------------------------- |
| `code`        | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `object`  | 否   | 接口返回的数据主体           |
| `data.result` | `boolean` | 否   | 接口返回的结果主体           |
| `message`     | `string`  | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **心跳配合**：发送播放控制指令后，通常需配合 [上报一起听心跳](/api/together/listentogether-heatbeat) 维持房间播放状态。
