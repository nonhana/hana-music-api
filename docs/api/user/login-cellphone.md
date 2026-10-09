---
title: '手机号登录'
description: '使用手机号与密码、MD5 密码或验证码登录。'
---

# 手机号登录

提供手机号，以及密码、MD5 密码或验证码中的一种。登录成功后保存返回的 Cookie，后续调用无需重复登录。

## 接口信息

| 项目     | 值                        |
| -------- | ------------------------- |
| 接口地址 | `/login/cellphone`        |
| 请求方式 | GET / POST，示例使用 POST |
| 需要登录 | 否                        |
| 对应模块 | `login_cellphone`         |

## 请求参数

| 参数           | 类型                | 要求       | 默认值 | 说明                                                            |
| -------------- | ------------------- | ---------- | ------ | --------------------------------------------------------------- |
| `phone`        | string              | 必填       | 无     | 手机号码                                                        |
| `password`     | string              | 凭据三选一 | 无     | 明文密码                                                        |
| `md5_password` | string              | 凭据三选一 | 无     | MD5 密码，优先于明文密码                                        |
| `captcha`      | string              | 凭据三选一 | 无     | 验证码，优先于密码；先调用 [发送验证码](/api/user/captcha-sent) |
| `countrycode`  | number 或数字字符串 | 可选       | `86`   | 国家或地区代码，比如美国使用 `1`                                |

请提供一种非空凭据。当前模块按验证码、MD5 密码、明文密码的顺序选择实际登录方式。三者不需要同时填写。

## HTTP 示例

```bash
curl 'http://127.0.0.1:3021/login/cellphone' \
  -H 'Content-Type: application/json' \
  --data '{"phone":"your-phone-number","captcha":"your-captcha"}'
```

使用密码登录时，将 `captcha` 字段换成 `password` 或 `md5_password`。

## 编程式调用

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

此例展示登录成功后的衔接。实际应用应捕获登录失败，并按返回的业务状态处理额外验证。SDK 不会自动把返回的 Cookie 写入已有 client，完整说明见 [认证机制](/guide/authentication)。

## 返回内容

登录成功时正文带 `account.id`、`profile` 的 `userId`、`nickname`、`avatarUrl`，以及拼接后的 `cookie`。结构定义和类型是 `LoginCellphoneBody`。

网易云的风控可能拦下登录，这时 SDK 以网易云的原始正文拒绝，`status` 是 400：

```json
{
  "code": 10004,
  "message": "当前登录存在安全风险，请稍后再试",
  "redirectUrl": "https://st.music.163.com/st/user-new/phoneReuse/index.html?..."
}
```

`redirectUrl` 指向网易云的手机号复用验证页面。这种正文的结构定义和类型是 `LoginCellphoneRiskBody`，可以用它判断失败是不是风控。实测改用真实国内 IP（`realIP`）或改用扫码登录可以绕开。详见 [返回体结构](/guide/response-bodies)。
