---
'hana-music-api': minor
---

登录相关模块的返回体在运行时校验，并导出结构定义和类型（#18）

- `login_qr_key`、`login_qr_create`、`login_qr_check`、`verify_getQr`、`captcha_sent`、`login_cellphone`、`user_account`、`login_status`、`user_detail`、`login_refresh`、`logout` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
- 根入口新增这些模块的结构定义，如 `LoginQrCheckBody`、`UserAccountBody`，以及手机号登录被风控拦下时的 `LoginCellphoneRiskBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
- 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
- 行为变化：这些模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400`、`502` 等原来被当作成功、以 `status: 200` 返回的业务码；`301`、`8821` 等原本就拒绝的业务码不变。
- `login_refresh` 文档改正：扫码登录和手机号登录得到的 Cookie 都能续期。
