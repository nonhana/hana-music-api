---
'hana-music-api': minor
---

给 5 个听歌足迹读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `listen_data_total` → `ListenDataTotalBody`：收紧 `code`、`data.totalDuration`；`message` 宽松。
- `listen_data_today_song` → `ListenDataTodaySongBody`：收紧 `code`、`data.songDTOs` 和每首歌的 `data.songDTOs[].songId`；`songName`、`aliasName`、`picUrl`、`redStar`、`lastPlayTime`、`artists`（含 `artistId`）宽松。
- `listen_data_year_report` → `ListenDataYearReportBody`：收紧 `code`、`data.yearItems` 和每年的 `data.yearItems[].year`；`displayYear`、`playNum`、`playDuration` 宽松。
- `listen_data_realtime_report` → `ListenDataRealtimeReportBody`：只收紧 `code` 和返回物 `data`（`data` 是返回对象，不是某个时长字段）；时长分布块、周维度的今日/好友块、月维度的 `sleepTdBlock` 及其嵌套字段全部宽松。
- `listen_data_report` → `ListenDataReportBody`：只收紧 `code` 和通到报告的 `data`；周/月/年报的统计块（`listenTimeBlock`、`topSongBlock`、`topArtistBlock`、`topStyleBlock`、`topAgeBlock`、`topLanguageBlock`、`vipBlock`、`wallpaperBlock`、好友块等）整块缺失或为 `null` 时原样保留，块内字段全部宽松。

### 行为变化

- 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 未登录调用这 5 个接口时上游返回 HTTP 200 + `code: 302`（每个模块各有一份 `.anonymous.json`）。以前模块按 `status: 200` 放行，现在按业务码拒绝为 `status: 302`，`body` 保留网易云原文。
- `listen_data_report` 的 `data` 仍是必填对象：年报（`type=year`）只有时间范围和 `listenTimeBlock: null`，空周所有块都是 `null`，`data` 本身都在；`data` 缺失或以 `null` 返回会报 502。

### 空结果与录制

- `listen_data_report` 用 2010-01-01 之前的 `endTime` 录到没有收听记录的周（`listen_data_report.empty.json`），所有统计块都是 `null`；周/月/年三种 `type` 各有录制，月报的好友块名是 `friendsListenMonthBlock` / `friendsKeyWordMonthBlock`。
- `listen_data_today_song` 的 `songDTOs` 和 `listen_data_year_report` 的 `yearItems` 允许为空数组（契约测试用真实录制构造 `[]` 边界）；本批只有一个有数据的登录账号，空账号下 `data`/列表的实际表现未验证，`listen_data_total` 的零数据账号表现同样未验证。
- 5 个模块都用登录账号录制（`context.viewer` 是 `authenticated`），录制前经 `login_status` 确认 `account.anonimousUser: false`（未落盘）；5 个接口的匿名 302 各有一份录制，另存为错误路径证据，不参与成功正文审计。

### 共享结构

本批没有结构满足三模块规则，全部留在各自模块里；`listen_data_realtime_report` 和 `listen_data_report` 的时长/好友块形状不同，也没有抽到 core。

### 迁移

- 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 未登录调用现在会 reject `status: 302`；以前读 `body.code === 302` 的调用方需要改为捕获拒绝。
- 读 `data.totalDuration`、`data.songDTOs[].songId`、`data.yearItems[].year` 时不再需要自己判空；`data` 在报告/实时接口里仍是对象，块字段要按宽松字段判 `null`/缺失。
- `listen_data_today_song`、`listen_data_year_report` 的列表本身允许为空数组；读取前仍需判断数组长度。

详见公开指南的[返回体结构](/guide/response-bodies)。
