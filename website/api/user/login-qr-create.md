---
title: '二维码生成接口'
description: '调用此接口传入上一个接口生成的 key 可生成二维码图片的 base64 和二维码信息，可使用 base64 展示图片，或者使用二维码信息内容自行使用第三方二维码生成库渲染二维码'
---

# 二维码生成接口

调用此接口传入上一个接口生成的 key 可生成二维码图片的 base64 和二维码信息，可使用 base64 展示图片，或者使用二维码信息内容自行使用第三方二维码生成库渲染二维码

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                      |
| ---------- | ------------------------------------------------------- |
| 接口地址   | `/login/qr/create`                                      |
| 请求方式   | `GET` / `POST`                                          |
| 需要登录   | 否                                                      |
| 对应模块   | `login_qr_create`                                       |
| SDK 函数   | `loginQrCreate`（`hana-music-api/api/login_qr_create`） |
| 返回体类型 | `LoginQrCreateBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { loginQrCreate } from 'hana-music-api';

const result = await loginQrCreate({
  key: 'xxx',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/login/qr/create' \
  --data-urlencode 'key=xxx'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型            | 必填 | 默认值 | 说明                                              |
| ---------- | --------------- | ---- | ------ | ------------------------------------------------- |
| `key`      | `string`        | 是   | -      | 由 `/login/qr/key` 获取的二维码 `unikey`          |
| `platform` | `'pc' \| 'web'` | 否   | `pc`   | 生成链接的平台类型，默认 `pc`（可选 `pc`、`web`） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LoginQrCreateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/login_qr_create`、`hana-music-api/schemas/login_qr_create` 导入运行时校验器）。

```ts
type LoginQrCreateBody = {
  code: 200;
  data: {
    qrurl: string;
  };
};
```

| 字段         | 类型     | 必填 | 说明                         |
| ------------ | -------- | ---- | ---------------------------- |
| `code`       | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`       | `object` | 是   | 接口返回的数据主体           |
| `data.qrurl` | `string` | 是   | 二维码对应的授权页面 URL     |

<!-- api-doc:response:end -->

## 注意事项

- **二维码渲染**：接口仅返回扫码登录链接 `data.qrurl`，二维码图片请由应用层自行使用 `qrcode` 等库按 `qrurl` 生成。
