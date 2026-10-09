# 返回体结构

部分模块的返回体在 SDK 里做了运行时校验：SDK 在返回结果之前，先用这个模块的结构定义检查 `body`，检查不通过就不返回，而是报“上游结构变了”。这些模块的 `body` 有确定的 TypeScript 类型，可以直接读声明过的字段，不用再自己判断。

目前做了校验的是登录相关的模块：

| 模块                                       | 结构定义                 | 声明的字段                                                                                                                            |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| [获取二维码 key](/api/user/login-qr-key)   | `LoginQrKeyBody`         | `code`、`data.unikey`                                                                                                                 |
| [生成二维码](/api/user/login-qr-create)    | `LoginQrCreateBody`      | `code`、`data.qrurl`、`data.qrimg`                                                                                                    |
| [查询扫码状态](/api/user/login-qr-check)   | `LoginQrCheckBody`       | `code`（800–803）、`cookie`；802 另有 `nickname`、`avatarUrl`                                                                         |
| [行为验证二维码](/api/other/verify-get-qr) | `VerifyGetQrBody`        | `code`、`data.qrCode`、`data.qrurl`、`data.qrimg`                                                                                     |
| [发送验证码](/api/user/captcha-sent)       | `CaptchaSentBody`        | `code`、`data`                                                                                                                        |
| [手机号登录](/api/user/login-cellphone)    | `LoginCellphoneBody`     | `code`、`cookie`、`account.id`、`profile` 的 `userId`、`nickname`、`avatarUrl`                                                        |
| 手机号登录被风控拦下                       | `LoginCellphoneRiskBody` | `code`（10004）、`message`、`redirectUrl`                                                                                             |
| [账号信息](/api/user/user-account)         | `UserAccountBody`        | `code`、`account`（`id`、`anonimousUser`、`vipType`）、`profile`（`userId`、`nickname`、`avatarUrl`、`vipType`），两者都可能是 `null` |
| [登录状态](/api/user/login-status)         | `LoginStatusBody`        | `data` 里是与账号信息相同的结构                                                                                                       |
| [用户详情](/api/user/user-detail)          | `UserDetailBody`         | `code`、`profile` 的 `userId`、`nickname`、`avatarUrl`、`vipType`                                                                     |
| [刷新登录](/api/user/login-refresh)        | `LoginRefreshBody`       | `code`、`cookie`                                                                                                                      |
| [退出登录](/api/user/logout)               | `LogoutBody`             | `code`                                                                                                                                |

结构定义只声明真实返回里确认过、且有人在用的字段，其余字段原样保留在 `body` 里，类型是 JSON 值。字段的取值来自脱敏后的真实返回，保存在仓库的 `tests/fixtures/netease/login/`。

## 读取类型

每个结构定义同名导出一个类型，是 `body` 的类型：

```ts
import type { LoginQrCheckBody, UserAccountBody } from 'hana-music-api';

const describe = (body: LoginQrCheckBody) =>
  body.code === 802 ? `${body.nickname} 已扫码，等待确认` : body.code;

const isMember = (body: UserAccountBody) => (body.account?.vipType ?? 0) > 0;
```

`code` 是字面量，按 `code` 判断后 TypeScript 会收窄到对应的分支。只用类型时写 `import type`，不会把 SDK 打包进浏览器端。

## 用结构定义校验数据

结构定义是 [Standard Schema](https://standardschema.dev/) 对象，可以交给任何支持 Standard Schema 的库，也可以直接调 `~standard.validate`，不需要引入 Effect：

```ts
import { UserAccountBody } from 'hana-music-api';

const result = UserAccountBody['~standard'].validate(savedBody);
if (result.issues) {
  console.error(result.issues);
} else {
  console.log(result.value.profile?.nickname);
}
```

`validate` 是同步的。适合在测试里检查自己的假数据是否和 SDK 认可的结构一致。

对外只承诺 Standard Schema 接口和导出的类型。这些对象同时也是 Effect Schema，熟悉 Effect 的使用者可以照常组合使用，但这部分不在兼容承诺之内，Effect 升级大版本时可能变化。

## 网易云拒绝时

`code` 不是这个模块认识的返回码时，SDK 把网易云的返回体原样作为失败抛出，`status` 取网易云的返回码（不在 HTTP 状态码范围内时是 400）。例如扫码时要求行为验证的 8821、续期时登录已失效的 301：

```ts
import { loginCellphone, LoginCellphoneRiskBody } from 'hana-music-api';

try {
  await loginCellphone({ phone: 'your-phone', captcha: 'your-captcha' });
} catch (error: unknown) {
  const body = (error as { body?: unknown }).body;
  const risk = LoginCellphoneRiskBody['~standard'].validate(body);
  if (!('issues' in risk) || !risk.issues) {
    console.log(risk.value.message, risk.value.redirectUrl);
  }
}
```

## 结构变了时

返回码认识、但字段缺失或类型不对时，Promise 以 `status: 502` 拒绝，`body` 带上出错的位置：

```json
{
  "code": 502,
  "msg": "Unexpected upstream shape in login_qr_check at body.nickname: expected present, got missing",
  "upstreamShape": {
    "module": "login_qr_check",
    "path": "body.nickname",
    "expected": "present",
    "actual": "missing"
  }
}
```

用 `body.upstreamShape` 判断是不是这种失败，不要解析 `msg`。`path` 指向 SDK 返回的 `body` 里的位置；`expected` 为 `present` 表示字段缺失，其余是期望的类型或取值。这种失败说明网易云改了返回结构，需要升级 SDK 或报告问题，重试通常没有用。
