# 认证机制

大多数接口既支持未登录调用，也支持携带登录态调用。涉及账户信息、歌单管理、云盘、私信、签到等接口时，通常需要 Cookie。

## 在 SDK 里怎么传认证信息

认证信息放在 `config` 里，不放在业务参数里。常见写法有 3 种：

- `createHanaMusicApi(config)` 适合绑定共享 Cookie
- 原始模块函数采用 `(query, config?)`
- `invokeModule(identifier, query, config?)` 继续支持动态调用

## 支持的登录方式

### 手机号登录

对应接口：`/login/cellphone`

适合账号密码或验证码登录场景，支持：

- `phone + password`
- `phone + md5_password`
- `phone + captcha`

### 邮箱登录

对应接口：`/login`

适合使用网易邮箱的账号登录，支持密码和 MD5 密码。

### 二维码登录

对应接口：

- `/login/qr/key`
- `/login/qr/create`
- `/login/qr/check`

推荐流程：

1. 先获取二维码 key
2. 再生成二维码内容或 base64 图片
3. 轮询检查扫码状态

> 建议轮询类请求带上时间戳，避免缓存影响状态更新。

### 游客登录

对应接口：`/register/anonimous`

适合在未登录状态下先获得游客 Cookie，减少部分接口返回校验错误的概率。

## Cookie 的使用方式

登录成功后，返回体中通常会包含 `cookie` 字段。后续调用需要登录的接口时，可以通过以下方式传入：

- HTTP GET 请求：把 `cookie` 放到 query 参数里
- HTTP POST 请求：把 `cookie` 放到 body 中
- SDK 调用：把 `cookie` 放到 `config`，而不是业务参数

### 推荐的 SDK 形状

```ts
import { createHanaMusicApi } from 'hana-music-api'

const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
})

const detail = await hana.userAccount({})

console.log(detail.body)
```

或者按单函数调用：

```ts
import { userAccount } from 'hana-music-api'

const detail = await userAccount(
  {},
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

## 认证相关注意事项

- 不要频繁调用登录接口，否则可能触发风控
- 登录接口通常比普通接口更慢，因为会经过额外加密逻辑
- 对跨域请求而言，务必确保请求会携带 Cookie
- 如果登录后仍遇到 `301` 或类似状态，优先检查缓存和 Cookie 是否正确传递

## 推荐实践

- Web 客户端优先使用二维码登录或验证码登录
- 服务端或脚本调用优先保存登录返回的 `cookie`
- 需要批量调用登录态接口时，优先复用已有 Cookie，而不是重复登录
- 在 SDK 中优先把认证信息放到 `config`，避免把执行上下文和业务参数混在一起
