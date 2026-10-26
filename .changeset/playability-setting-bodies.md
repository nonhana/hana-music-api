---
'hana-music-api': minor
---

给 6 个播放可用性、音频识别和用户设置只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `check_music` → `CheckMusicBody`：公开体是 SDK 合成的 `{ code: 200, success, message }`，三个字段都收紧；上游顶层 `code`、`data` 和 `data[0].code` 收紧，`data[1..]` 不校验，上游 `data` 数组不进入公开体。
- `audio_match` → `AudioMatchBody`：收紧 `code` 和识别结果路径 `data`；未声明的顶层字段原样保留；`data.result` 在没识别到时是 `null`，按可以没有处理，出现时每条记录的 `song` 复用 core 的 `Song`，`song.id` 收紧，`startTime` 宽松；`queryId`、`type`、`moduleList`、`noMatchReason`、`message` 宽松；只见过 `null` 的 `data.mv` 没有声明。
- `song_like_check` → `SongLikeCheckBody`：收紧 `code` 和喜欢列表 `ids`（歌曲编号数组，空列表是正常结果）。
- `song_red_count` → `SongRedCountBody`：收紧 `code`、数量路径 `data` 和接口要拿的 `data.count`；`countDesc` 宽松。
- `song_dynamic_cover` → `SongDynamicCoverBody`：收紧 `code` 和封面路径 `data`；`data.videoPlayUrl` 是接口要拿的那一项，没有动态封面时整个字段缺失，按可以没有处理；`height`、`weight`、`needTransition`、`message` 宽松。
- `setting` → `SettingBody`：收紧 `code`、设置路径 `setting` 和记录自己的编号 `setting.userId`；其余设置项全部宽松。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项；`Optional` 路径缺失或 `null` 照常返回，出现坏记录仍报 502。
- 上游业务返回码不是 200 时，以前这些模块大多 resolve `status: 200`、把上游正文原样交给调用方；现在按业务拒绝原样转交，`status` 取上游返回码，调用方需要 `try/catch` 接住 `NcmApiResponse`。本次录到的例子是 `song_like_check` 的空 `ids` 请求（`{ code: 400 }`）。
- `check_music` 的公开体不变，仍是 `{ code, success, message }`。旧实现已经会拒绝正文不是对象、`data` 不是数组或 `null`、`data[0]` 不是对象、`data[0].code` 缺失或不是数字；相对基线新增的是 `data` 缺失（旧实现返回 `success: false`），`data[0]` 非对象现在报 `body.data[0]`、缺 `code` 的 `actual` 是 `missing`。`data[1..]` 不校验。上游顶层返回码不是 200 时从“合成 `success: false`”变成业务拒绝转交。
- `audio_match` 旧实现只拒绝非对象正文；新增 `code`/`data` 缺失、`data.result` 坏记录等 502。以前会把缺失的上游返回码补成 200 并只保留 `code`/`data`/`message`，现在未声明的顶层字段原样保留。

### 录制与空结果

- 本批新增 19 份录制：`playback/audio_match.{match,match-login,no-match}.json`、`playback/check_music.{playable,anonymous,no-copyright,nonexistent}.json`、`like-collect/song_like_check.{mixed,none,anonymous,empty-ids}.json`、`song/song_red_count.{default,anonymous,zero}.json`、`song/song_dynamic_cover.{default,empty,anonymous}.json`、`user/setting.{default,anonymous}.json`。没有截断。
- 登录对照先经 `login_status` 确认 `account.anonimousUser: false`（未落盘）。`setting`、`audio_match`、`check_music`、`song_like_check`、`song_red_count`、`song_dynamic_cover` 都保留登录与匿名录制；登录和匿名的结构相同，值差异来自账号自己的喜爱列表、实时计数、设置和 `queryId` 等动态字段。`check_music` 匿名录制本次条目 `code` 是 404、登录是 200（上游播放码会翻转），不对可播放结果作相同性断言。`setting` 两份录制的 `userId` 已换成合成值。
- 空结果：`audio_match` 没识别到时 `data.result` 是 `null`（`noMatchReason: 10`）；`song_like_check` 没有已喜爱的歌和匿名时 `ids` 是空数组；`song_dynamic_cover` 没有动态封面时 `data` 是空对象；`song_red_count` 对不存在的歌曲返回 `count: 0`；`check_music` 无版权、不存在的歌曲和本次匿名录制都是 `success: false`。`check_music` 的 `data` 数组在不存在、无版权的探测里仍有一项，本批没有录到可达的空数组；数组本身允许为空。
- `check_music` 的公开体由 SDK 合成：录制里的 `response.body` 是网易云原文，最终体写在 `context.expect`；契约测试按录制原文回放并断言 `context.expect`，`schema:audit` 在有 `context.expect` 时校验它（新增的 `context.expect` 约定同时更新了 `scripts/schema-audit.mts` 和 `tests/_kit/assertions.ts` 的 `Recording` 类型）。`audio_match` 的指纹由仓库 demo 的音频运行时按 8 kHz/3 秒流程生成，录制里的 `query.audioFP` 可以原样复用；有命中指纹来自真实歌曲片段（《平凡之路》 id 28815250，源 FLAC 从登录态播放地址取得，偏移 1 秒取 3 秒；匿名播放地址是 30 秒试听 MP3，未用于该指纹），可用 `bun scripts/audio-fingerprint.mts <音频文件> --offset 1` 复现；`no-match` 用 440 Hz 合成音频，`bun scripts/audio-fingerprint.mts --tone 440` 可复现。
- 未录到 `audio_match`、`song_red_count`、`song_dynamic_cover`、`setting` 的顶层非 200 返回，这些模块的非 200 分支只按通用业务拒绝路径测试，没有为它们声明失败正文结构；`check_music` 和 `song_like_check` 有专门的非 200 用例（`check_music` 的探测返回不是 JSON，只用于拒绝路径；`song_like_check.empty-ids.json` 是 `code: 400` 的真实录制）。

### 迁移

- 这 6 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `song_dynamic_cover` 的 `data.videoPlayUrl` 和 `audio_match` 的 `data.result` 类型带 `null | undefined`，使用前判空；`song_dynamic_cover` 没有动态封面时 `data` 是空对象，`videoPlayUrl` 带会过期的签名参数，不要缓存或逐字比较。
- 上游业务码不是 200 时现在会 reject；读 `audio_match`、`check_music`、`song_like_check`、`song_red_count`、`song_dynamic_cover`、`setting` 的调用方要按 `NcmApiResponse` 接住错误。
- 新增的公开类型是 `AudioMatchBody`、`CheckMusicBody`、`SettingBody`、`SongDynamicCoverBody`、`SongLikeCheckBody`、`SongRedCountBody`。

详见公开指南的[返回体结构](/guide/response-bodies)。
