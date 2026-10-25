---
'hana-music-api': minor
---

给 5 个音乐人数据读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。签到（`musician_sign`）和领取云豆（`musician_cloudbean_obtain`）是写操作，不在本批。

### 新增公开结构定义

- `musician_cloudbean` → `MusicianCloudbeanBody`：收紧 `code`、云豆对象 `data`、音乐人编号 `data.artistId` 和云豆数 `data.cloudBean`；`maxCloudBean`、`needPop`、`signed`、`message` 宽松，`musicianLevel`、`flowStage`、`dynamicNews` 只见过 `null`，没有声明。
- `musician_data_overview` → `MusicianDataOverviewBody`：收紧 `code` 和通到概况对象的 `data`；`availableExtractIncomeTotal`、`productionTotal`、`musicianLevelScore`、`totalFansCount`、`message` 宽松，`playCount`、`totalPlayCount`、`fansPlayCount`、`fansPlayRatio`、`followerCountIncrement` 只见过 `null`，没有声明。
- `musician_play_trend` → `MusicianPlayTrendBody`：收紧 `code`、日趋势数组 `data`、日期键 `data[].dateTime` 和每天的播放数 `data[].dataValue`；`message` 宽松。`startTime`/`endTime` 要传 `YYYY-MM-DD` 字符串。
- `musician_tasks` → `MusicianTasksBody`：收紧 `code`、任务列表 `data.list` 和每个任务的编号 `data.list[].missionId`；其余任务字段和 `message` 宽松。
- `musician_tasks_new` → `MusicianTasksNewBody`：收紧 `code`、任务列表 `data.list` 和每个任务的编号 `data.list[].missionId`；`userStageTargetList` 是任务记录里套着的展示数据，整列宽松，其余任务字段和 `message` 宽松。

### 行为变化

- 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `musician_play_trend` 的 `code: 400`（缺少参数或时间格式不对）属于特殊码：以前被请求层归一成 `status: 200` 原样放行，现在按业务码拒绝为 `status: 400`，`body` 保留网易云原文。本次录到的其余业务拒绝（`musician_cloudbean` 的 `code: 600`、`musician_data_overview` 的 `code: 10000`、`musician_tasks`/`musician_tasks_new` 的 `code: 301`）是请求层在模块之前就有的行为，改造前后一致（`status` 分别 `400`/`400`/`301`），这些路径不经 `decodeUpstreamBody`。其他特殊码（201、302、502、800–803）同样在改造前被归一成 `status: 200` 进入模块，本批开始校验后会按业务码拒绝（800–803 映射为 `status: 400`）。
- `musician_play_trend` 匿名调用仍是成功结果，返回 `data: []`。

### 空结果与录制

- 5 个模块都用同一个音乐人账号录制（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `account.anonimousUser: false`，未落盘）。
- `musician_play_trend` 有真实空结果：没有播放记录的 2020 年区间返回 `data: []`（`musician_play_trend.empty.json`），匿名调用同样返回空趋势（`musician_play_trend.anonymous-empty.json`）。
- `musician_tasks`（7 条）和 `musician_tasks_new`（5 条）只录到非空任务列表；本批只有一个音乐人账号，没有录到任务列表为空的账号，空账号下 `data.list` 的实际表现未验证。
- `musician_cloudbean` 和 `musician_data_overview` 返回单个对象，不是列表；未登录（匿名）只录到业务拒绝（`code: 600` / `10000`），登录的非音乐人账号未录到，返回码与成功正文未验证；成功正文只在音乐人账号下验证。
- 录制没有截取：任务列表都完整保留，趋势录制 6 个日期点。

### 共享结构

本批没有结构满足三模块规则。`musician_tasks` 和 `musician_tasks_new` 的任务字段集合不同（新版有 `userStageTargetList`、`hasSendWorth`，旧版有 `name`、`jumpLink`、`targetCount`、`webText` 等），各自留在模块里；`data` 对象只有 `list` 一项，也没有抽到 core。

### 迁移

- 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 以前从成功响应里读 `body.code === 400` 判断 `musician_play_trend` 失败的调用方，现在要改为捕获拒绝并按 `status: 400` 判断；`code: 600`、`10000`、`301` 的拒绝行为不变，不必改。`musician_play_trend` 的时间参数要用 `YYYY-MM-DD` 字符串。
- 读 `data.artistId`、`data.cloudBean`、`data[].dateTime`、`data[].dataValue`、`data.list[].missionId` 时不再需要自己判空；其余声明字段仍要按宽松字段判 `null`/缺失。

详见公开指南的[返回体结构](/guide/response-bodies)。
