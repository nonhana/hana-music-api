---
title: '一起听 - 心跳'
description: '上报一起听房间的当前歌曲、播放状态和进度。'
---

# 一起听 - 心跳

上报一起听房间的当前歌曲、播放状态和进度。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| 接口地址   | `/listentogether/heatbeat`                                               |
| 请求方式   | `GET` / `POST`                                                           |
| 需要登录   | 是                                                                       |
| 对应模块   | `listentogether_heatbeat`                                                |
| SDK 函数   | `listentogetherHeatbeat`（`hana-music-api/api/listentogether_heatbeat`） |
| 返回体类型 | `ListentogetherHeatbeatBody`（已建模返回体）                             |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { listentogetherHeatbeat } from 'hana-music-api';

const result = await listentogetherHeatbeat(
  {
    roomId: 'MzA0NjY5...',
    songId: '1372188635',
    playStatus: 'PLAY',
    progress: 0,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/listentogether/heatbeat' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'roomId=MzA0NjY5...' \
  --data-urlencode 'songId=1372188635' \
  --data-urlencode 'playStatus=PLAY' \
  --data-urlencode 'progress=0'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数         | 类型               | 必填 | 默认值 | 说明                               |
| ------------ | ------------------ | ---- | ------ | ---------------------------------- |
| `playStatus` | `string \| number` | 是   | -      | 播放状态，常见为 `PLAY` 或 `PAUSE` |
| `progress`   | `number`           | 是   | -      | 当前播放进度，单位毫秒             |
| `roomId`     | `string`           | 是   | -      | 房间 ID                            |
| `songId`     | `number \| string` | 是   | -      | 当前播放歌曲 ID                    |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ListentogetherHeatbeatBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/listentogether_heatbeat`、`hana-music-api/schemas/listentogether_heatbeat` 导入运行时校验器）。

```ts
type ListentogetherHeatbeatBody = {
  code: 200;
  data?: {
    result?: boolean | null;
    time?: number | null;
    timeSpan?: number | null;
  } | null;
  message?: string | null;
};
```

| 字段            | 类型      | 必填 | 说明                         |
| --------------- | --------- | ---- | ---------------------------- |
| `code`          | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`          | `object`  | 否   | 接口返回的数据主体           |
| `data.result`   | `boolean` | 否   | 接口返回的结果主体           |
| `data.time`     | `number`  | 否   | 时间戳                       |
| `data.timeSpan` | `number`  | 否   | -                            |
| `message`       | `string`  | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **联动接口**：用于定时维持房间播放进度，常与 [播放控制指令](/api/together/listentogether-play-command) 及 [获取房间状态](/api/together/listentogether-status) 配合调用。
