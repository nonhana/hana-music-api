---
'hana-music-api': minor
---

给 2 个歌曲播放/下载链接模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `song_url` → `SongUrlBody`：描述的是 **SDK 最终体**，不是网易云原文。最终体只有 `{ code: 200, data }`，上游其他顶层字段不会保留，`data` 缺失时是空数组。收紧最终体的 `code`、`data`、`data[].id`、`data[].url`、`data[].code`；`data[].id` 兼容字符串和数字编号，`level`、`freeTrialInfo` 及其余地址字段宽松。本批新增的是最终体类型化与 `url` / `code` 收紧；`code` 合成 200、顶层只有 `code` / `data`、按请求 `id` 排序都不是新增行为（原实现已经这样做）。
- `song_download_url` → `SongDownloadUrlBody`：正常录制与网易云原文逐字段一致；宽松字段类型不对时只丢该项。收紧 `code`、`data`、`data.id`、`data.url`、`data.code`；`level`、`size`、`auEff`、`freeTrialInfo` 等其余字段宽松。与 `song_url_v1`、`song_download_url_v1` 共用内部 `SongUrlData` 结构（已移到 `src/core/upstream-schemas.ts`）。

### 行为变化

- 这两个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `song_url` 的最终体仍然只有 `code` 和 `data`，`code` 由模块合成 200，单项失败看 `data[].code`；上游顶层 `code` 被忽略。301 等非特殊状态码会在请求层先被拒绝，不会到达模块。`url` 不替换；`freeTrialInfo` 不合并片段，内部坏字段按宽松字段丢弃。
- `song_download_url` 的顶层 `code` 为 404 时基线就由请求层拒绝（不是本批变化）。特殊状态码 400/302/803 以前 resolve `status: 200`，现在 reject：400/302 的 `status` 分别等于 400/302，803 落到 400，不是“等于业务码”；正文仍是网易云原文。条目级 `data.code` 为 `-105`/`-110` 时顶层仍是 200，SDK 正常返回正文，不报 502。
- `song_download_url` 的 `data` 缺失、不是对象或缺少 `id` / `url` / `code` 时现在报 502；以前原样返回。
- 上游码语义不稳定：同一请求在本次探测/重录中会从 200 翻转为 404（播放）或从 200 翻转为 `-110`（下载）。本批保留 `song_url.transient-404.json`、`song_download_url.transient-110.json` 作为翻转快照。`url: null` 时不能凭一次 `code` 判定无版权/无权限，先重试或交叉验证。

### 迁移

- 这两个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `song_download_url` 遇到特殊状态码 400/302/803 时会 reject，用 `try/catch` 接住 `NcmApiResponse`，不要只检查 resolve 后的 `status`。
- 下载前先重试一次；仍不满足 `data.code === 200`、`data.url !== null`、`data.size > 0` 时再标记失败。`size` 是宽松字段，缺失时无法核对文件字节数。
- 本批只保留匿名和失效 Cookie 录制；失效 Cookie 不是登录证据，没有登录对照，不对登录后的 `freeTrialInfo`、`payed` 等字段作相同性断言。

详见公开指南的[返回体结构](/guide/response-bodies#播放)。
