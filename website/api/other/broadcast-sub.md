---
title: '广播电台 - 收藏/取消收藏电台'
description: '收藏或取消收藏广播电台。'
---

# 广播电台 - 收藏/取消收藏电台

收藏或取消收藏广播电台。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/broadcast/sub`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `broadcast_sub`                                      |
| SDK 函数   | `broadcastSub`（`hana-music-api/api/broadcast_sub`） |
| 返回体类型 | `BroadcastSubBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { broadcastSub } from 'hana-music-api';

const result = await broadcastSub(
  {
    id: '5',
    t: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/broadcast/sub' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=5' \
  --data-urlencode 't=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明                                   |
| ---- | ------------------ | ---- | ------ | -------------------------------------- |
| `id` | `number \| string` | 是   | -      | 广播电台 ID                            |
| `t`  | `0 \| 1`           | 否   | -      | 操作类型，`1` 为收藏，其他值为取消收藏 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`BroadcastSubBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/broadcast_sub`、`hana-music-api/schemas/broadcast_sub` 导入运行时校验器）。

```ts
type BroadcastSubBody = {
  code: 200;
  data?: boolean | null;
  message?: string | null;
};
```

| 字段      | 类型      | 必填 | 说明                         |
| --------- | --------- | ---- | ---------------------------- |
| `code`    | `200`     | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `boolean` | 否   | 接口返回的数据主体           |
| `message` | `string`  | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
