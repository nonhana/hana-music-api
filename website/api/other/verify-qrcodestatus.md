---
title: '验证接口 - 二维码检测'
description: '使用此接口，传入`/verify/getQr`接口返回的`qr`字符串，可检测二维码扫描状态'
---

# 验证接口 - 二维码检测

使用此接口，传入`/verify/getQr`接口返回的`qr`字符串，可检测二维码扫描状态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                               |
| ---------- | ---------------------------------------------------------------- |
| 接口地址   | `/verify/qrcodestatus`                                           |
| 请求方式   | `GET` / `POST`                                                   |
| 需要登录   | 是                                                               |
| 对应模块   | `verify_qrcodestatus`                                            |
| SDK 函数   | `verifyQrcodestatus`（`hana-music-api/api/verify_qrcodestatus`） |
| 返回体类型 | `VerifyQrcodestatusBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { verifyQrcodestatus } from 'hana-music-api';

const result = await verifyQrcodestatus(
  {
    qr: 'your-verify-qr',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/verify/qrcodestatus' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'qr=your-verify-qr'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型     | 必填 | 默认值 | 说明                                |
| ---- | -------- | ---- | ------ | ----------------------------------- |
| `qr` | `string` | 是   | -      | `/verify/getQr`接口返回的`qr`字符串 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VerifyQrcodestatusBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/verify_qrcodestatus`、`hana-music-api/schemas/verify_qrcodestatus` 导入运行时校验器）。

```ts
type VerifyQrcodestatusBody = {
  code: 200 | '200';
  data: {
    qrCodeStatus: number;
    detailReason?: number | null;
  };
  message?: string | null;
};
```

| 字段                | 类型           | 必填 | 说明                                                              |
| ------------------- | -------------- | ---- | ----------------------------------------------------------------- |
| `code`              | `200 \| '200'` | 是   | 业务状态码（`200` 表示成功）                                      |
| `data`              | `object`       | 是   | 接口返回的数据主体                                                |
| `data.qrCodeStatus` | `number`       | 是   | 二维码状态（`0` 已生成、`10` 已扫描、`20` 验证成功、`21` 已失效） |
| `data.detailReason` | `number`       | 否   | 状态原因码（`0` 正常、`303` 账号不一致）                          |
| `message`           | `string`       | 否   | 返回说明信息                                                      |

<!-- api-doc:response:end -->

## 注意事项

- **状态码组合**：`data.qrCodeStatus` 表示扫描进度（`0` 已生成、`10` 已扫描、`20` 验证成功、`21` 已失效），`data.detailReason` 表示校验结果（`0` 正常、`303` 账号不一致）。
