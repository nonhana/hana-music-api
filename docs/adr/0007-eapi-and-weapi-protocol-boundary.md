# ADR-0007：eapi 与 web（weapi）协议分界线

- 状态：已采用
- 日期：2026-11-22
- 更新：[ADR-0001](./0001-request-actions-and-profiles.md)（取代 §#137 对音频取址与会话续期的迁移结论）

## 背景

`#137`（PR #138）曾采用单一语法判据：只要接口路径出现在四份官方网页/Hybrid JS 资源中，即从 `eapi` 迁移到 `web`（`weapi` + `os=web`）。该假设在生产环境（Campanula）引发三类实测可复现的回归：

1. **音频直链下载频繁中断与 CORS 失效（`song_download_url_v1`、`song_url_v1.read`）**：
   - `web` 通道针对 `/jdymusic/` 曲目（如 `3443085323`、`3450889750`、`3384478636`）下发 `m704` / `m804.music.126.net`（阿里云节点，`Tengine`）。源站仅在请求携带 `Origin` 时才返回 `Access-Control-Allow-Origin: *`，但阿里云 CDN 边缘既未返回 `Vary: Origin`，也未强行注入 CORS 头；一旦节点首个回源请求是不带 `Origin` 的 `<audio src>` 播放或预热，边缘会长期缓存无 `ACAO` 的响应头（实测 `age` 达 20–28 天），导致后续浏览器 `fetch()` 均因缺少 `ACAO` 被 CORS 拦截。
   - `web` 通道针对 `/ymusic/` 曲目（如 `1377766050`、`4208408`）下发 `m10.music.126.net`（百度云节点，`nginx`）。同一缓存节点控制变量实测表明：带浏览器 UA 但无 `https://music.163.com/` Referer 时下载速率被精准限速至约 `99 KB/s`（`[104, 97, 98]` KB/s），而携带 `Referer: https://music.163.com/` 或无浏览器 UA 时为 `8,748 – 10,272 KB/s`。在 `Referrer-Policy: no-referrer` 的第三方 Web 应用中无法伪造跨域 Referer，导致下载及高码率流媒体严重卡顿。
   - 相比之下，`eapi` 通道下发 `m701` / `m801.music.126.net` 与 `m7` / `m8.music.126.net`（`chinatelecom` 节点，`openresty`），实测即便不带 `Origin` 头也会在边缘无条件返回 `Access-Control-Allow-Origin: *` 与 `Access-Control-Expose-Headers: *`，支持 `Range` 206 分段续传，且实测速率 `12,076 – 16,948 KB/s`。
   - 官方 `hybrid/app.4c9df986.js` 虽然调用 `/api/song/enhance/download/url/v1`，但紧邻 `/api/mac/upgrade/get` 等桌面壳能力——桌面原生客户端下载器不走浏览器 CORS 且不携带第三方网页特征，因此“官方源码出现该路径”不能推导为“浏览器可用 `web` 通道”。
2. **会话续期不再轮换 `MUSIC_U`（`login_refresh`）**：
   - 使用真实登录态对比 `POST /api/login/token/refresh`：在 `web` 通道（含真实生产带 `checkToken` 请求与裸 `weapi` 请求）返回 `{ code: 200, bizCode: "400" }` 且 `Set-Cookie` 不下发新的 `MUSIC_U`；在 `eapi` 通道（默认 iPhone 身份）返回 `{ code: 200, bizCode: "200" }` 并通过 `Set-Cookie` 轮换新的 `MUSIC_U`（`Max-Age=2147483647`）。

同时对其他媒体与音频状态接口做阴性对照实测，确认无同类分叉：

- `mv_url`（`/api/song/enhance/play/mv/url`）：`web` 与 `eapi` 均下发同一 `vodkgeyttp8.vod.126.net`（`chinatelecom`，边缘 `ACAO: *`）。
- `check_music`（`/api/song/enhance/player/url`）：仅读取 `code === 200` 判断版权/可播状态，不对外暴露或消费音频 CDN URL，继续保留 `web`。

## 决定：四层确定性协议分界线

所有模块动作按以下优先级顺序自上而下裁决，命中高层即止，不再只凭官方网页 JS 中是否出现路径决定协议：

| 优先级 | 分层类别                             | 强制 Profile              | 裁决规则与客观边界                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 典型模块/动作                                                                                                                                                                                                      |
| ------ | ------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **L1** | 专用协议 / 外部直连                  | `clientlogOsx` / `plain*` | 目标网关不是通用业务 API（日志域名、NOS 对象存储直传、纯页面读取）                                                                                                                                                                                                                                                                                                                                                                                                                       | `scrobble`、上传外部阶段、`audio_match`、`related_playlist`                                                                                                                                                        |
| **L2** | 服务端语义或分发分叉（高于网页依据） | **`eapi`**                | 满足任一条件即强制锁定 `eapi`，禁止迁移到 `web`：<br>1. **音频直链取址（`audioDelivery`）**：返回音频 CDN 下载/播放链接供下游直连消费的接口（匹配 `/api/song/enhance/(player\|download)/url` 且非纯布尔探测）。<br>2. **凭据轮换（`sessionRotation`）**：需要通过 `Set-Cookie` 下发并轮换 `MUSIC_U` 的会话续期接口。<br>3. **原生独占语义（`nativeCapability`）**：网页端不具备等价能力或参数合同（`sky` 沉浸声、通用开放 `batch`、移动 `banner`、云盘原生上传阶段、`op=update` 排序）。 | `song_url.read`、`song_url_v1.{read,sky}`、`song_download_url.read`、`song_download_url_v1.read`、`login_refresh.request`、`banner.read`、`batch.request`、`cloud.{check,information}`、`song_order_update.update` |
| **L3** | 常规业务与网页反作弊接口             | **`web`（`weapi`）**      | 不命中 L1/L2，且满足以下任一条件：官方网页/桌面同源页面有等价业务调用、属于 `/api/w/*` 或 `/web` 路由、或受网易云网页 `yidun` 反作弊规则保护（需与浏览器端 `hana-music-api/watchman` 身份自洽）                                                                                                                                                                                                                                                                                          | 常规 JSON 读写、登录、扫码、收藏/订阅/点赞/评论/歌单曲目增删等（286 动作）                                                                                                                                         |
| **L4** | 无网页依据的保守存量                 | **`eapi`**                | 不命中 L1/L2，且当前官方网页资源中未见同业务调用依据；不猜网页兼容，保持 `eapi`                                                                                                                                                                                                                                                                                                                                                                                                          | 其余保留 `eapi` 模块（83 动作）                                                                                                                                                                                    |

## 机器门禁与后续准入清单

为防止后续新增接口或同步官方网页清单时再次误迁，仓库建立以下强制护栏：

1. **策略清单与自动审计**：`tests/fixtures/upstream-policy/protocol-boundary.json` 登记 L2 `mandatoryEapi` 名单、音频直链路径模式 `^/api/song/enhance/(?:player|download)/url(?:/|$)`（仅显式白名单 `check_music.read` 例外）与会话轮换路径 `/api/login/token/refresh`。`scripts/audit-upstream-endpoints.mts` 的 `checkProtocolBoundary` 在 `checkCoverage` 中自动核对，并在 `tests/behavior/tooling/upstream-endpoints.test.ts` 中运行。
2. **变异与行为回归**：`tests/behavior/modules/web-endpoints.test.ts` 与 `tests/mutation/targets/web-endpoints.ts` 保护 `song_download_url_v1.read`、`song_url_v1.read` 与 `login_refresh.request` 不得回退至 `web`。
3. **新增 / 迁移准入核对**：以后新增任何模块或从 `eapi` 往 `web` 迁移前，若其满足以下任一特征，**不得**仅凭网页 JS 源码出现路径而选用 `web`，必须先用真实响应验证下游消费兼容性：
   - 返回外部媒体/文件下载链接（需核查目标 CDN 在无 Referer、跨站 `Origin` 命中缓存时的 `ACAO` 与速率）；
   - 依赖响应 `Set-Cookie` 轮换账号会话凭据；
   - 携带客户端独占参数（如沉浸声、云盘原生校验、客户端专用排序）。

## 后果

- 当前 352 模块、390 动作的分布收敛为：**286 `web`、93 `eapi`、2 `clientlogOsx`、9 `plain*`**。
- `song_download_url_v1.read`、`song_url_v1.read` 与 `login_refresh.request` 恢复使用 `eapi`，公开输入、返回体 Schema、错误分类及低层 `createRequest` 保持不变。
- `check_music.read` 留在 `web`，`mv_url` 经实测无分流隐患继续留在 `web`。
