---
title: '领取云豆'
description: '音乐人登录后调用此接口，可领取已完成的音乐人任务的云豆奖励'
---

# 领取云豆

音乐人登录后调用此接口，可领取已完成的音乐人任务的云豆奖励

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 接口地址   | `/musician/cloudbean/obtain`                                                |
| 请求方式   | `GET` / `POST`                                                              |
| 需要登录   | 是                                                                          |
| 对应模块   | `musician_cloudbean_obtain`                                                 |
| SDK 函数   | `musicianCloudbeanObtain`（`hana-music-api/api/musician_cloudbean_obtain`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { musicianCloudbeanObtain } from 'hana-music-api';

const result = await musicianCloudbeanObtain(
  {
    id: '7036416928',
    period: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/musician/cloudbean/obtain' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=7036416928' \
  --data-urlencode 'period=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                             |
| -------- | ------------------ | ---- | ------ | ---------------------------------------------------------------- |
| `id`     | `number \| string` | 是   | -      | 任务 id，通过`/musician/tasks`获取到的`userMissionId`即为任务 id |
| `period` | `number`           | 是   | -      | 通过`/musician/tasks`获取                                        |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
