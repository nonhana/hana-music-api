---
title: '领取 vip 成长值'
description: '登录后调用此接口，可获取已完成的会员任务的成长值奖励'
---

# 领取 vip 成长值

登录后调用此接口，可获取已完成的会员任务的成长值奖励

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/vip/growthpoint/get`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 是                                                              |
| 对应模块   | `vip_growthpoint_get`                                           |
| SDK 函数   | `vipGrowthpointGet`（`hana-music-api/api/vip_growthpoint_get`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { vipGrowthpointGet } from 'hana-music-api';

const result = await vipGrowthpointGet(
  {
    ids: ['your-task-id'],
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/vip/growthpoint/get' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data '{"ids":["your-task-id"]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型            | 必填 | 默认值 | 说明                               |
| ----- | --------------- | ---- | ------ | ---------------------------------- |
| `ids` | `Array<string>` | 是   | -      | 通过`/vip/tasks`获取到的`unGetIds` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
