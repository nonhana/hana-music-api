---
title: '手机号登录'
description: '使用手机号与密码、MD5 密码或验证码登录。'
---

# 手机号登录

提供手机号，以及密码、MD5 密码或验证码中的一种。登录成功后保存返回的 Cookie，后续调用无需重复登录。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                       |
| ---------- | -------------------------------------------------------- |
| 接口地址   | `/login/cellphone`                                       |
| 请求方式   | `GET` / `POST`                                           |
| 需要登录   | 否                                                       |
| 对应模块   | `login_cellphone`                                        |
| SDK 函数   | `loginCellphone`（`hana-music-api/api/login_cellphone`） |
| 返回体类型 | `LoginCellphoneBody` / `LoginCellphoneRiskBody`          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { createHanaMusicApi, loginCellphone } from 'hana-music-api';

const result = await loginCellphone({
  phone: 'your-phone-number',
  captcha: 'your-captcha',
});

const hana = createHanaMusicApi({ cookie: result.cookie.join('; ') });
const account = await hana.userAccount({});
console.log(account.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/login/cellphone' \
  -H 'Content-Type: application/json' \
  --data '{"phone":"your-phone-number","captcha":"your-captcha"}'
```

<!-- api-doc:params:start -->

## 请求参数

> `captcha`、`md5_password`、`password` 三选一必填，实际生效优先级为 `captcha` → `md5_password` → `password`。

| 参数           | 类型               | 必填   | 默认值 | 说明                                                            |
| -------------- | ------------------ | ------ | ------ | --------------------------------------------------------------- |
| `phone`        | `string`           | 是     | -      | 手机号码                                                        |
| `password`     | `string`           | 三选一 | -      | 明文密码                                                        |
| `md5_password` | `string`           | 三选一 | -      | MD5 密码，优先于明文密码                                        |
| `captcha`      | `string`           | 三选一 | -      | 验证码，优先于密码；先调用 [发送验证码](/api/user/captcha-sent) |
| `countrycode`  | `number \| string` | 否     | `86`   | 国家或地区代码，比如美国使用 `1`                                |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`LoginCellphoneBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/login_cellphone`、`hana-music-api/schemas/login_cellphone` 导入运行时校验器）。

```ts
type Binding = {
  bindingTime?: number | null;
  expired?: boolean | null;
  expiresIn?: number | null;
  id?: number | null;
  refreshTime?: number | null;
  tokenJsonStr?: string | null;
  type?: number | null;
  url?: string | null;
  userId?: number | null;
};

type LoginCellphoneBody = {
  code: 200;
  account: Account;
  profile: UserProfile;
  bindings?: Array<Binding> | null;
  hitType?: number | null;
  loginType?: number | null;
  token?: string | null;
};

type LoginCellphoneRiskBody = {
  code: 10004;
  message: string;
  redirectUrl: string;
};
```

- **公共类型**：[Account](/api/shared-types#account)、[UserProfile](/api/shared-types#userprofile)

| 字段                      | 类型                                         | 必填 | 说明                                        |
| ------------------------- | -------------------------------------------- | ---- | ------------------------------------------- |
| `code`                    | `200`                                        | 是   | 业务状态码（`200` 表示成功）                |
| `account`                 | [Account](/api/shared-types#account)         | 是   | 账号状态信息（未登录或凭据失效时为 `null`） |
| `profile`                 | [UserProfile](/api/shared-types#userprofile) | 是   | 用户资料信息（未登录或匿名账号时为 `null`） |
| `bindings`                | `Array<Binding>`                             | 否   | 账号第三方绑定列表                          |
| `bindings[].bindingTime`  | `number`                                     | 否   | 绑定时间戳（毫秒）                          |
| `bindings[].expired`      | `boolean`                                    | 否   | 是否已过期                                  |
| `bindings[].expiresIn`    | `number`                                     | 否   | 有效期时长（秒）                            |
| `bindings[].id`           | `number`                                     | 否   | 记录 ID                                     |
| `bindings[].refreshTime`  | `number`                                     | 否   | 令牌刷新时间戳                              |
| `bindings[].tokenJsonStr` | `string`                                     | 否   | 序列化令牌信息 JSON 字符串                  |
| `bindings[].type`         | `number`                                     | 否   | -                                           |
| `bindings[].url`          | `string`                                     | 否   | 资源访问地址                                |
| `bindings[].userId`       | `number`                                     | 否   | 用户 ID                                     |
| `hitType`                 | `number`                                     | 否   | 命中类型                                    |
| `loginType`               | `number`                                     | 否   | 登录方式标识                                |
| `token`                   | `string`                                     | 否   | 认证令牌                                    |

### 风控失败返回体（`LoginCellphoneRiskBody`）

当触发风控拦截时，拒绝对象的 `body` 结构如下：

| 字段          | 类型     | 必填 | 说明                   |
| ------------- | -------- | ---- | ---------------------- |
| `code`        | `10004`  | 是   | 风控拦截状态码         |
| `message`     | `string` | 是   | 风控提示文本           |
| `redirectUrl` | `string` | 是   | 手机号复用验证页面 URL |

<!-- api-doc:response:end -->

## 注意事项

- **凭据优先级**：`captcha`、`md5_password`、`password` 三选一，同时传入多个时按 `captcha` → `md5_password` → `password` 顺序生效。
- **风控拦截**：上游触发安全风险校验时，拒绝结果的 `body` 符合 `LoginCellphoneRiskBody`（`code: 10004`），可通过 `redirectUrl` 引导验证或改用扫码登录。
- **会话保存**：SDK 不会自动持久化登录状态，请保存 `result.cookie` 供后续调用使用，详见 [认证机制](/guide/authentication)。
