---
title: '邮箱登录'
description: '可以直接从浏览器中获取cookie值，只需要其中key为`MUSIC_U`的数据即可'
---

# 邮箱登录

可以直接从浏览器中获取cookie值，只需要其中key为`MUSIC_U`的数据即可

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                    |
| ---------- | ------------------------------------- |
| 接口地址   | `/login`                              |
| 请求方式   | `GET` / `POST`                        |
| 需要登录   | 否                                    |
| 对应模块   | `login`                               |
| SDK 函数   | `login`（`hana-music-api/api/login`） |
| 返回体类型 | `UnknownJson`（未建模接口）           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { login } from 'hana-music-api';

const result = await login({
  email: 'xxx@163.com',
  password: 'yyy',
});
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/login' \
  -H 'Content-Type: application/json' \
  --data '{"email":"xxx@163.com","password":"yyy"}'
```

<!-- api-doc:params:start -->

## 请求参数

> `password` 与 `md5_password` 二选一必填，同时传入时优先使用 `md5_password`。

| 参数           | 类型     | 必填   | 默认值 | 说明                                       |
| -------------- | -------- | ------ | ------ | ------------------------------------------ |
| `email`        | `string` | 是     | -      | 163 网易邮箱                               |
| `password`     | `string` | 二选一 | -      | 密码                                       |
| `md5_password` | `string` | 二选一 | -      | md5 加密后的密码，传入后 `password` 将失效 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **凭据优先级**：`password` 与 `md5_password` 二选一，同时传入时优先使用 `md5_password`。
- **会话保存**：SDK 不会自动将登录 Cookie 写入已有 client；请保存响应中的 `result.cookie` 并在后续请求通过 `{ cookie }` 传入，详见 [认证机制](/guide/authentication)。
