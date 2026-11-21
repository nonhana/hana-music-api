---
title: '查询二维码扫码状态'
description: '用二维码 key 查询扫码和授权状态，登录成功后保存 Cookie。'
---

# 查询二维码扫码状态

用先前取得的二维码 `key` 查询状态。收到登录成功或二维码过期后，停止轮询。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                    |
| ---------- | ----------------------------------------------------- |
| 接口地址   | `/login/qr/check`                                     |
| 请求方式   | `GET` / `POST`                                        |
| 需要登录   | 否                                                    |
| 对应模块   | `login_qr_check`                                      |
| SDK 函数   | `loginQrCheck`（`hana-music-api/api/login_qr_check`） |
| 返回体类型 | `LoginQrCheckBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { loginQrCheck } from 'hana-music-api';

const result = await loginQrCheck({ key: 'your-qr-key' });
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/login/qr/check' \
  --data-urlencode 'key=your-qr-key'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型     | 必填 | 默认值 | 说明                                     |
| ----- | -------- | ---- | ------ | ---------------------------------------- |
| `key` | `string` | 是   | -      | 由 `/login/qr/key` 获取的二维码 `unikey` |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LoginQrCheckBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/login_qr_check`、`hana-music-api/schemas/login_qr_check` 导入运行时校验器）。

```ts
type LoginQrCheckBody =
  | {
      code: 800;
      message?: string | null;
    }
  | {
      code: 801;
      message?: string | null;
    }
  | {
      code: 802;
      nickname?: string | null;
      avatarUrl?: string | null;
      message?: string | null;
    }
  | {
      code: 803;
      message?: string | null;
    };
```

| 字段        | 类型                       | 必填 | 说明         |
| ----------- | -------------------------- | ---- | ------------ |
| `code`      | `800 \| 801 \| 802 \| 803` | 是   | 业务状态码   |
| `message`   | `string`                   | 否   | 返回说明信息 |
| `nickname`  | `string`                   | 否   | 用户昵称     |
| `avatarUrl` | `string`                   | 否   | 头像图片 URL |

<!-- api-doc:response:end -->

## 注意事项

- **轮询状态码**：`800` 二维码过期、`801` 等待扫码、`802` 已扫码待确认（含 `nickname` 与 `avatarUrl`）、`803` 授权登录成功。
- **风控与 HTTP 选项**：触发行为验证时可能返回业务码 `8821`（可配合 [获取验证二维码](/api/other/verify-get-qr) 处理）；HTTP 调用支持额外传入 `noCookie=true` 禁止向响应头写入 `Set-Cookie`。
