---
title: '验证接口 - 二维码生成'
description: '进行某些操作，如关注用户，可能会触发验证，可调用这个接口生成二维码，使用app扫码后可解除验证'
---

# 验证接口 - 二维码生成

进行某些操作，如关注用户，可能会触发验证，可调用这个接口生成二维码，使用app扫码后可解除验证

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/verify/getQr`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `verify_getQr`                                     |
| SDK 函数   | `verifyGetQr`（`hana-music-api/api/verify_getQr`） |
| 返回体类型 | `VerifyGetQrBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { verifyGetQr } from 'hana-music-api';

const result = await verifyGetQr({
  evid: 'example',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/verify/getQr' \
  --data-urlencode 'evid=example'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型     | 必填 | 默认值 | 说明                                   |
| ------- | -------- | ---- | ------ | -------------------------------------- |
| `evid`  | `string` | 否   | -      | 触发验证后，接口返回的params的event_id |
| `sign`  | `string` | 否   | -      | 触发验证后，接口返回的params的sign     |
| `token` | `string` | 否   | -      | 触发验证后，接口返回的verifyToken      |
| `type`  | `number` | 否   | -      | 触发验证后，接口返回的verifyType       |
| `vid`   | `string` | 否   | -      | 触发验证后，接口返回的verifyId         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VerifyGetQrBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/verify_getQr`、`hana-music-api/schemas/verify_getQr` 导入运行时校验器）。

```ts
type VerifyGetQrBody = {
  code: 200;
  data: {
    qrCode: string;
    qrurl: string;
    qrimg: string;
  };
};
```

| 字段          | 类型     | 必填 | 说明                                               |
| ------------- | -------- | ---- | -------------------------------------------------- |
| `code`        | `200`    | 是   | 业务状态码（`200` 表示成功）                       |
| `data`        | `object` | 是   | 接口返回的数据主体                                 |
| `data.qrCode` | `string` | 是   | 验证二维码标识                                     |
| `data.qrurl`  | `string` | 是   | 二维码对应的授权页面 URL                           |
| `data.qrimg`  | `string` | 是   | 二维码图片 Data URL（未开启 `qrimg` 时为空字符串） |

<!-- api-doc:response:end -->

## 注意事项

- **可选依赖**：生成验证二维码图片需环境中安装可选依赖 `qrcode`。
