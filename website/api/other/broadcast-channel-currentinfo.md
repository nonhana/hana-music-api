---
title: '广播电台 - 电台信息'
description: '调用此接口，传入电台id，获取广播电台 - 电台信息'
---

# 广播电台 - 电台信息

调用此接口，传入电台id，获取广播电台 - 电台信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- |
| 接口地址   | `/broadcast/channel/currentinfo`                                                    |
| 请求方式   | `GET` / `POST`                                                                      |
| 需要登录   | 否                                                                                  |
| 对应模块   | `broadcast_channel_currentinfo`                                                     |
| SDK 函数   | `broadcastChannelCurrentinfo`（`hana-music-api/api/broadcast_channel_currentinfo`） |
| 返回体类型 | `BroadcastChannelCurrentinfoBody`（已建模返回体）                                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { broadcastChannelCurrentinfo } from 'hana-music-api';

const result = await broadcastChannelCurrentinfo({
  id: '5',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/broadcast/channel/currentinfo' \
  --data-urlencode 'id=5'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 电台id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`BroadcastChannelCurrentinfoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/broadcast_channel_currentinfo`、`hana-music-api/schemas/broadcast_channel_currentinfo` 导入运行时校验器）。

```ts
type CurrentInfo = {
  id: number;
  channelCoverUrl?: string | null;
  channelName?: string | null;
  currentTime?: number | null;
  duration?: number | null;
  endTime?: number | null;
  playUrl: string;
  programId?: number | null;
  programName?: string | null;
  regionName?: string | null;
  startTime?: number | null;
  thirdChannelId?: string | null;
  thirdProgramId?: string | null;
};

type BroadcastChannelCurrentinfoBody = {
  code: 200;
  data: CurrentInfo;
  message?: string | null;
};
```

| 字段      | 类型          | 必填 | 说明                         |
| --------- | ------------- | ---- | ---------------------------- |
| `code`    | `200`         | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `CurrentInfo` | 是   | 接口返回的数据主体           |
| `message` | `string`      | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **空闲频道状态**：当广播频道暂无正在播放节目时，`programId`、`startTime`、`endTime` 与 `duration` 为 `0`，`programName` 为 `null`。
