---
title: 'DIFM电台 - 收藏列表'
description: '调用此接口，获取DIFM电台收藏列表'
---

# DIFM电台 - 收藏列表

调用此接口，获取DIFM电台收藏列表

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- |
| 接口地址   | `/dj/difm/subscribe/channels/get`                                                   |
| 请求方式   | `GET` / `POST`                                                                      |
| 需要登录   | 否                                                                                  |
| 对应模块   | `dj_difm_subscribe_channels_get`                                                    |
| SDK 函数   | `djDifmSubscribeChannelsGet`（`hana-music-api/api/dj_difm_subscribe_channels_get`） |
| 返回体类型 | `DjDifmSubscribeChannelsGetBody`（已建模返回体）                                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djDifmSubscribeChannelsGet } from 'hana-music-api';

const result = await djDifmSubscribeChannelsGet({
  sources: [0],
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/dj/difm/subscribe/channels/get' \
  -H 'Content-Type: application/json' \
  --data '{"sources":[0]}'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型                 | 必填 | 默认值 | 说明                                          |
| --------- | -------------------- | ---- | ------ | --------------------------------------------- |
| `sources` | `Array<0 \| 1 \| 2>` | 否   | `[0]`  | 来源列表，0: 最嗨电音 1: 古典电台 2: 爵士电台 |

| `sources` 元素 | 来源             |
| -------------- | ---------------- |
| `0`            | 最嗨电音（默认） |
| `1`            | 古典电台         |
| `2`            | 爵士电台         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjDifmSubscribeChannelsGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_difm_subscribe_channels_get`、`hana-music-api/schemas/dj_difm_subscribe_channels_get` 导入运行时校验器）。

```ts
type DjDifmSubscribeChannelsGetBody = {
  code: 200;
  message?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
