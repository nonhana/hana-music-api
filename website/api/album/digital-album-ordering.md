---
title: '购买数字专辑'
description: '登录后调用此接口 ，可获取购买数字专辑的地址，把地址生成二维码后，可扫描购买专辑'
---

# 购买数字专辑

登录后调用此接口 ，可获取购买数字专辑的地址，把地址生成二维码后，可扫描购买专辑

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                   |
| ---------- | -------------------------------------------------------------------- |
| 接口地址   | `/digitalAlbum/ordering`                                             |
| 请求方式   | `GET` / `POST`                                                       |
| 需要登录   | 是                                                                   |
| 对应模块   | `digitalAlbum_ordering`                                              |
| SDK 函数   | `digitalAlbumOrdering`（`hana-music-api/api/digitalAlbum_ordering`） |
| 返回体类型 | `UnknownJson`（未建模接口）                                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { digitalAlbumOrdering } from 'hana-music-api';

const result = await digitalAlbumOrdering(
  {
    id: '86286082',
    payment: '3',
    quantity: 1,
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/digitalAlbum/ordering' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=86286082' \
  --data-urlencode 'payment=3' \
  --data-urlencode 'quantity=1'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                           |
| ---------- | ------------------ | ---- | ------ | ------------------------------ |
| `id`       | `number \| string` | 是   | -      | 专辑的 id                      |
| `payment`  | `string`           | 是   | -      | 支付方式， 0 为支付宝 3 为微信 |
| `quantity` | `number`           | 是   | -      | 购买的数量                     |

| `payment` | 支付方式 |
| --------- | -------- |
| `'0'`     | 支付宝   |
| `'3'`     | 微信     |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->
