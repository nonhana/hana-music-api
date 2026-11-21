---
title: 'DIFM电台 - 取消收藏频道'
description: '调用此接口，可取消收藏DIFM频道'
---

# DIFM电台 - 取消收藏频道

调用此接口，可取消收藏DIFM频道

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| 接口地址   | `/dj/difm/channel/unsubscribe`                                                 |
| 请求方式   | `GET` / `POST`                                                                 |
| 需要登录   | 是                                                                             |
| 对应模块   | `dj_difm_channel_unsubscribe`                                                  |
| SDK 函数   | `djDifmChannelUnsubscribe`（`hana-music-api/api/dj_difm_channel_unsubscribe`） |
| 返回体类型 | `DjDifmChannelUnsubscribeBody`（已建模返回体）                                 |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djDifmChannelUnsubscribe } from 'hana-music-api';

const result = await djDifmChannelUnsubscribe(
  {
    id: '1',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/difm/channel/unsubscribe' \
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

返回体类型：`DjDifmChannelUnsubscribeBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_difm_channel_unsubscribe`、`hana-music-api/schemas/dj_difm_channel_unsubscribe` 导入运行时校验器）。

```ts
type DjDifmChannelUnsubscribeBody = {
  code: 200;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
