---
'hana-music-api': minor
---

给 8 个签到与云贝状态读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `signin_progress` → `SigninProgressBody`：收紧 `code`、签到页 `data`、今日签到状态 `data.today.todaySignedIn`、签到记录 `data.records` 及每条记录的 `day`、签到统计 `data.stats` 与 `data.today.todayStats` 及统计的 `id`；记录的 `signed`、统计描述、进度和奖品字段宽松，只见过 `null` 的 `currentSignDesc` 未声明。
- `sign_happy_info` → `SignHappyInfoBody`：收紧 `code`、`data`、活动信息 `data.info` 及其 `id`；活动文案、资源链接、图片和热评字段宽松，只见过 `null` 的 `jumpText`、`specialJumpUrl`、`btnPicUrl`、`operator`、`videoStrId` 未声明。
- `yunbei` → `YunbeiBody`：收紧 `code`、签到状态 `data` 及连续签到天数 `data.days`、当天获得的云贝 `data.shells`。
- `yunbei_info` → `YunbeiInfoBody`：收紧 `code`、账户记录 `userPoint` 及其 `userId`、`balance`；账户等级、签到标记和票券文案宽松，只见过 `null` 的配置字段未声明。
- `yunbei_today` → `YunbeiTodayBody`：收紧 `code`、`data` 及当天获得的云贝 `data.shells`。
- `yunbei_tasks` → `YunbeiTasksBody`：收紧 `code`、任务列表 `data` 及每个任务的 `taskId`；任务说明、图标、链接和奖励明细宽松，只见过 `null` 的 `wordsPicUrl`、图标与目标状态字段未声明。
- `yunbei_tasks_todo` → `YunbeiTasksTodoBody`：收紧 `code`、待办任务列表 `data` 及每个任务的 `userTaskId`（任务未开始时为 0）；任务名、奖励和链接宽松。
- `yunbei_rcmd_song_history` → `YunbeiRcmdSongHistoryBody`：收紧 `code`、推歌历史 `data`；`data.records` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留，分页对象 `data.page` 宽松。

### 行为变化

- 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对时丢这一项，`null` 原样保留。
- 非 200 业务码的状态变化：`signin_progress` 的非法 `moduleId` 与 `yunbei_rcmd_song_history` 的负 `size` 都返回 HTTP 200 + `code: 400`。400 在 `SPECIAL_STATUS_CODES` 里，以前被归一成 resolve `status: 200` 并原样返回正文；现在按业务拒绝 reject `status: 400`，`body` 仍是网易云原文。
- 匿名调用同样有特殊码变化：`yunbei`、`yunbei_today`、`sign_happy_info` 返回 `code: 302`（各模块的 `.anonymous.json`），302 以前被归一成 resolve `status: 200`，现在按业务码 reject `status: 302`，`body` 保留原文；`signin_progress` 匿名的 `code: 301` 不在特殊码表里，改造前就是 reject `status: 301`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变。没有录到 HTTP 400 空正文，`ModuleBody` 不包含空字符串分支。
- 写操作不在本批范围：`daily_signin`、`vip_growthpoint_get`、`yunbei_sign`、`yunbei_task_finish`、`yunbei_rcmd_song` 没有改动。

### 空结果与未覆盖路径

- `signin_progress` 的默认录制来自一个未签到的登录账号（`records[].signed` 全为 `false`），同时是未签到证据；30 天记录、3 条统计和今日统计都是非空数组，空窗口没有录到。
- `yunbei_today` 的录制是 0 云贝零值；`yunbei_rcmd_song_history` 的录制是空历史。
- `yunbei_tasks`、`yunbei_tasks_todo` 和 `sign_happy_info` 在本批录制里只有非空列表，本批未录到空结果（未验证是否可达）。
- `yunbei_expense`、`yunbei_receipt` 本次探测仍返回 `code: 404`（接口未找到），没有成功正文，未补结构定义。

### 登录对照

- 录制前用同一 Cookie 调用 `login_status`，确认 `account.anonimousUser` 为 `false`；登录对照录制未落盘。匿名对照：`signin_progress` 返回 `code: 301`，`sign_happy_info`、`yunbei`、`yunbei_today` 返回 `code: 302`；`yunbei_info`、`yunbei_tasks`、`yunbei_tasks_todo`、`yunbei_rcmd_song_history` 返回 `code: 200` 且通过结构校验，录制分别是各模块的 `.anonymous.json`。

### 迁移

- 这 8 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，读取时是 JSON 值。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `signin_progress` 时用 `body.data.today.todaySignedIn`（收紧）和 `body.data.records[].signed`（宽松，类型含 `null | undefined`）判断签到状态；统计描述、进度和奖品仍是宽松字段。
- `yunbei_rcmd_song_history.data.records` 未声明，使用前请自行校验。
- 读 `yunbei_tasks.data[].taskId` 和 `yunbei_tasks_todo.data[].userTaskId` 等收紧字段时不再需要自己判空。

详见公开指南的[返回体结构](/guide/response-bodies)。
