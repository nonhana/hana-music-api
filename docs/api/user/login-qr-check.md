---
title: '查询二维码扫码状态'
description: '用二维码 key 查询扫码和授权状态，登录成功后保存 Cookie。'
---

# 查询二维码扫码状态

用先前取得的二维码 `key` 查询状态。收到登录成功或二维码过期后，停止轮询。

## 接口信息

| 项目     | 值                |
| -------- | ----------------- |
| 接口地址 | `/login/qr/check` |
| 请求方式 | GET / POST        |
| 需要登录 | 无需预先登录      |
| 对应模块 | `login_qr_check`  |

## 请求参数

| 参数       | 类型                            | 必填        | 说明                                                   |
| ---------- | ------------------------------- | ----------- | ------------------------------------------------------ |
| `key`      | string                          | 是          | 通过 [获取二维码 key](/api/user/login-qr-key) 得到的值 |
| `noCookie` | boolean 或 `0`、`1`、对应字符串 | 否，仅 HTTP | 为真时停止向响应写入 `Set-Cookie`，不是 SDK 业务参数   |

## 返回状态

| `body.code` | 含义                         |
| ----------- | ---------------------------- |
| `800`       | 二维码过期，需要重新获取 key |
| `801`       | 等待扫码                     |
| `802`       | 等待用户确认                 |
| `803`       | 授权成功，保存返回的 Cookie  |

HTTP JSON 中直接读取 `code`，SDK 则读取 `result.body` 中的 `code`。这些业务状态不靠 HTTP 状态码区分。

## HTTP 示例

```bash
curl --get 'http://127.0.0.1:3021/login/qr/check' \
  --data-urlencode 'key=your-qr-key' \
  --data-urlencode 'noCookie=true'
```

`noCookie=true` 不会清除本次请求的登录身份，也不会删除模块正文中的 `cookie`。不需要阻止响应 Cookie 写回时，可以省略它。

## 编程式调用

```ts
import { loginQrCheck } from 'hana-music-api';

const result = await loginQrCheck({ key: 'your-qr-key' });
console.log(result.body);
```

确认业务码为 `803` 后，再保存 `result.cookie`，或读取正文中拼接后的 `cookie`。本接口不走库内读缓存，无需通过时间戳绕过它。

完整流程见 [认证机制](/guide/authentication)。仓库服务中的演示地址为 `/demo/qr-login`。
