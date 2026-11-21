---
title: 'DIFM电台 - 收藏频道'
description: '调用此接口，可收藏DIFM频道'
---

# DIFM电台 - 收藏频道

调用此接口，可收藏DIFM频道

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| 接口地址   | `/dj/difm/channel/subscribe`                                               |
| 请求方式   | `GET` / `POST`                                                             |
| 需要登录   | 是                                                                         |
| 对应模块   | `dj_difm_channel_subscribe`                                                |
| SDK 函数   | `djDifmChannelSubscribe`（`hana-music-api/api/dj_difm_channel_subscribe`） |
| 返回体类型 | `DjDifmChannelSubscribeBody`（已建模返回体）                               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djDifmChannelSubscribe } from 'hana-music-api';

const result = await djDifmChannelSubscribe(
  {
    id: '1',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/difm/channel/subscribe' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 频道id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjDifmChannelSubscribeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_difm_channel_subscribe`、`hana-music-api/schemas/dj_difm_channel_subscribe` 导入运行时校验器）。

```ts
type DjDifmChannelSubscribeBody = {
  code: 200;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
