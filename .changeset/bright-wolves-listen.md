---
'hana-music-api': patch
---

`playlist_subscribe` 支持调用方提供易盾 `checkToken`，并补充已知限制说明。

- 收藏（`t=1`）传入 `checkToken`（字符串或每次收藏前调用的 provider）时，改用 weapi 网页写法：`https://music.163.com/weapi/playlist/subscribe`、`os=web`，正文携带 `checkToken`，HTTP 头携带 `X-antiCheatToken`。取消收藏（`t=0`）走 weapi 网页写法，不取令牌。入参 `id`、`t` 和错误合同不变，写操作仍不自动重试。
- 未传 `checkToken` 时收藏保留官网 weapi 网页写法。这条回退路径只适合低频调用，连续操作仍可能被上游 405 拒绝。
- 验证：官方现代 web player 的收藏请求是 `/weapi/playlist/subscribe` + 170 字符 `X-antiCheatToken`，取消是 `/weapi/playlist/unsubscribe` 且不带 token。2026-10-18 02:08（CST）在真实客户端 origin `https://campanula-test.caelum.moe/` 用官方 Watchman 现取令牌，公开 SDK 的 weapi 收藏成功（HTTP 200 / `{ code: 200 }`，列表 54 → 55），取消后恢复 54/36；02:09 用同一个 Watchman 实例连续 3 轮、轮间隔 5 秒，收藏/取消全部 200，每轮恢复 54/36。SDK 不生成、不缓存、不重放令牌，HTTP 服务拒绝 `checkToken` 配置。
- 已知限制：稳定的高频收藏取决于调用方提供的令牌是否来自已登记设备；没有稳定 provider 时，本接口不保证高频可用。`retryAfter` 只是退避建议，不是上游承诺的恢复时间。
