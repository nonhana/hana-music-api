---
'hana-music-api': minor
---

引入可枚举的请求 profile，并以 `web` 作为新模块默认值（#80）。

- 新增 `RequestProfile` 注册表：`web`（weapi + `os=web` + 浏览器 UA）和 `desktop`（eapi + 官方 Mac 客户端身份）。模块通过 `defineModule` 声明 `profile` 和 `checkToken` 策略，不再用 `Effect.updateService(Call, ...)` 私自改 crypto、UA 或 Cookie。
- `checkToken` 提升为请求层能力：模块只声明是否需要令牌，请求层按 `weapi`/`eapi` 放置正文和 HTTP 头，并丢弃调用方手写的 `X-antiCheatToken`。`playlist_subscribe`、`playlist_create`、`playlist_desc_update` 使用 `web` profile + 可选令牌；`playlist_name_update`、`playlist_tags_update` 使用 `web` profile 且不发送令牌。
- 新增浏览器子路径 `hana-music-api/watchman`：按需加载官方 `tool.min.js`，复用 Watchman 实例，`getToken` 每次现取、不缓存，支持 CSP nonce、超时和 SSR 明确报错。
- 契约测试覆盖协议、URL、Cookie `os`、UA、token 位置、无 token 写接口和“禁止模块级身份覆盖”的静态检查。
