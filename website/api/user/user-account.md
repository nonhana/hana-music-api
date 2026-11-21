---
title: '获取账号信息'
description: '登录后调用此接口 ，可获取用户账号信息'
---

# 获取账号信息

登录后调用此接口 ，可获取用户账号信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/user/account`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `user_account`                                     |
| SDK 函数   | `userAccount`（`hana-music-api/api/user_account`） |
| 返回体类型 | `UserAccountBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { userAccount } from 'hana-music-api';

const result = await userAccount({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/user/account' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UserAccountBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/user_account`、`hana-music-api/schemas/user_account` 导入运行时校验器）。

```ts
type userAccountBodySchema = {
  code: 200;
  account:
    | (Omit<Account, 'anonimousUser'> & {
        anonimousUser: boolean;
      })
    | null;
  profile: UserProfile | null;
};

type UserAccountBody = userAccountBodySchema;
```

- **公共类型**：[Account](/api/shared-types#account)、[UserProfile](/api/shared-types#userprofile)

| 字段      | 类型                                                    | 必填 | 说明                                        |
| --------- | ------------------------------------------------------- | ---- | ------------------------------------------- |
| `code`    | `200`                                                   | 是   | 业务状态码（`200` 表示成功）                |
| `account` | [Account](/api/shared-types#account) 扩展对象 \| `null` | 是   | 账号状态信息（未登录或凭据失效时为 `null`） |
| `profile` | [UserProfile](/api/shared-types#userprofile) \| `null`  | 是   | 用户资料信息（未登录或匿名账号时为 `null`） |

<!-- api-doc:response:end -->

## 注意事项

- **身份判断**：三种登录状态均返回 `code: 200`，需结合 `account` 与 `profile` 判断——已登录时两者均为对象且 `account.anonimousUser` 为 `false`；匿名游客时仅 `account` 为对象且 `anonimousUser` 为 `true`；凭据失效时两者均为 `null`。
