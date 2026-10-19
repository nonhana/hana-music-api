---
title: '刷新登录'
description: '续期登录 Cookie：扫码和短信两种登录得到的 Cookie 都能续期，返回新的 MUSIC_U。'
---

# 刷新登录

续期登录 Cookie。扫码登录和手机号登录得到的 Cookie 都能续期，网易云会下发新的 `MUSIC_U`（有效期重新算 180 天）和新的 `__csrf`（约 15 天）。

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/login/refresh` |
| 请求方式 | `GET` / `POST`   |
| 需要登录 | 是               |
| 对应模块 | `login_refresh`  |
| 文档分类 | 用户与登录       |

## 请求参数

无业务参数。用需要续期的登录 Cookie 调用。

## HTTP 示例

```bash
GET /login/refresh
```

## 编程式调用

```ts
import { loginRefresh } from 'hana-music-api';

const result = await loginRefresh({}, { cookie: 'MUSIC_U=your-cookie' });

console.log(result.cookie);
```

## 返回内容

```json
{
  "code": 200,
  "bizCode": "200",
  "cookie": "MUSIC_U=...; Max-Age=15552000; ..."
}
```

新的 Cookie 在顶层 `result.cookie` 数组里，正文的 `cookie` 是拼接后的字符串。续期后旧 Cookie 不会马上失效，所以多个地方同时续期不需要加锁。

登录已失效时网易云回 `301`，SDK 以网易云的原始正文拒绝，`status` 是 301，这时需要重新登录。结构定义和类型是 `LoginRefreshBody`，见 [返回体结构](/guide/response-bodies)。

以上行为来自 2026-10-08 的真账号实测（短信、扫码登录各一次）。
