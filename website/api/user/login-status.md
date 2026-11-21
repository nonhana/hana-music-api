---
title: '登录状态'
description: '调用此接口，可获取登录状态'
---

# 登录状态

调用此接口，可获取登录状态

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/login/status`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `login_status`                                     |
| SDK 函数   | `loginStatus`（`hana-music-api/api/login_status`） |
| 返回体类型 | `LoginStatusBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { loginStatus } from 'hana-music-api';

const result = await loginStatus();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/login/status'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LoginStatusBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/login_status`、`hana-music-api/schemas/login_status` 导入运行时校验器）。

```ts
type UserAccountBody = {
  code: 200;
  account:
    | (Omit<Account, 'anonimousUser'> & {
        anonimousUser: boolean;
      })
    | null;
  profile: UserProfile | null;
};

type LoginStatusBody = {
  data: UserAccountBody;
};
```

- **公共类型**：[Account](/api/shared-types#account)、[UserProfile](/api/shared-types#userprofile)

| 字段           | 类型                                                    | 必填 | 说明                                        |
| -------------- | ------------------------------------------------------- | ---- | ------------------------------------------- |
| `data`         | `UserAccountBody`                                       | 是   | 接口返回的数据主体                          |
| `data.code`    | `200`                                                   | 是   | 业务状态码（`200` 表示成功）                |
| `data.account` | [Account](/api/shared-types#account) 扩展对象 \| `null` | 是   | 账号状态信息（未登录或凭据失效时为 `null`） |
| `data.profile` | [UserProfile](/api/shared-types#userprofile) \| `null`  | 是   | 用户资料信息（未登录或匿名账号时为 `null`） |

<!-- api-doc:response:end -->

## 注意事项

- **数据结构**：返回体在外层包裹了 `data`，内部结构与 [获取账号信息](/api/user/user-account) 一致。
