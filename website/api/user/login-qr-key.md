---
title: '二维码 key 生成接口'
description: '调用此接口可生成一个 key'
---

# 二维码 key 生成接口

调用此接口可生成一个 key

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                |
| ---------- | ------------------------------------------------- |
| 接口地址   | `/login/qr/key`                                   |
| 请求方式   | `GET` / `POST`                                    |
| 需要登录   | 否                                                |
| 对应模块   | `login_qr_key`                                    |
| SDK 函数   | `loginQrKey`（`hana-music-api/api/login_qr_key`） |
| 返回体类型 | `LoginQrKeyBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { loginQrKey } from 'hana-music-api';

const result = await loginQrKey();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/login/qr/key'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LoginQrKeyBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/login_qr_key`、`hana-music-api/schemas/login_qr_key` 导入运行时校验器）。

```ts
type LoginQrKeyBody = {
  code: 200;
  data: {
    unikey: string;
  };
};
```

| 字段          | 类型     | 必填 | 说明                         |
| ------------- | -------- | ---- | ---------------------------- |
| `code`        | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`        | `object` | 是   | 接口返回的数据主体           |
| `data.unikey` | `string` | 是   | 二维码登录唯一标识 key       |

<!-- api-doc:response:end -->
