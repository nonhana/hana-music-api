---
title: '我的数字专辑'
description: '登录后调用此接口 ，可获取我的数字专辑'
---

# 我的数字专辑

登录后调用此接口 ，可获取我的数字专辑

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| 接口地址   | `/digitalAlbum/purchased`                                              |
| 请求方式   | `GET` / `POST`                                                         |
| 需要登录   | 是                                                                     |
| 对应模块   | `digitalAlbum_purchased`                                               |
| SDK 函数   | `digitalAlbumPurchased`（`hana-music-api/api/digitalAlbum_purchased`） |
| 返回体类型 | `DigitalAlbumPurchasedBody`（已建模返回体）                            |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { digitalAlbumPurchased } from 'hana-music-api';

const result = await digitalAlbumPurchased(
  {
    limit: 10,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/digitalAlbum/purchased' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'limit=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明                         |
| -------- | -------- | ---- | ------ | ---------------------------- |
| `limit`  | `number` | 否   | `30`   | 返回数量，默认 `30`          |
| `offset` | `number` | 否   | `0`    | 偏移数量，用于分页，默认 `0` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DigitalAlbumPurchasedBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/digitalAlbum_purchased`、`hana-music-api/schemas/digitalAlbum_purchased` 导入运行时校验器）。

```ts
type DigitalAlbumPurchasedBody = {
  code: 200;
  total?: number | null;
};
```

| 字段    | 类型     | 必填 | 说明                         |
| ------- | -------- | ---- | ---------------------------- |
| `code`  | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `total` | `number` | 否   | 总条目数                     |

<!-- api-doc:response:end -->
