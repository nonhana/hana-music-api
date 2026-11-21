---
title: '刷新登录'
description: '续期登录 Cookie：扫码和短信两种登录得到的 Cookie 都能续期，返回新的 MUSIC_U。'
---

# 刷新登录

续期登录 Cookie。扫码登录和手机号登录得到的 Cookie 都能续期，网易云会下发新的 `MUSIC_U`（有效期重新算 180 天）和新的 `__csrf`（约 15 天）。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/login/refresh`                                     |
| 请求方式   | `GET` / `POST`                                       |
| 需要登录   | 是                                                   |
| 对应模块   | `login_refresh`                                      |
| SDK 函数   | `loginRefresh`（`hana-music-api/api/login_refresh`） |
| 返回体类型 | `LoginRefreshBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { loginRefresh } from 'hana-music-api';

const result = await loginRefresh({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/login/refresh' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LoginRefreshBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/login_refresh`、`hana-music-api/schemas/login_refresh` 导入运行时校验器）。

```ts
type LoginRefreshBody = {
  code: 200;
  cookie: string;
  bizCode?: string | null;
};
```

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `cookie`  | `string` | 是   | 拼接后的 Cookie 字符串       |
| `bizCode` | `string` | 否   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **凭据轮换**：刷新成功后新 Cookie 位于 `result.cookie` 与 `body.cookie`；续期不会立即使旧 Cookie 失效。
