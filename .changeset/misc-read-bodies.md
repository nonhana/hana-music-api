---
'hana-music-api': minor
---

给日历、曲风偏好、用户社交状态和内部版本 5 个读取模块补上结构定义（`ModuleBody`），除 `inner_version` 外开始运行时校验返回体。

### 新增公开结构定义

- `calendar` → `CalendarBody`：收紧 `code`、`data`、`data.calendarEvents`、`data.calendarEvents[].id`；事件的标题、封面、提醒、计数字段和 `data.calendarConfig` 的按钮宽松。
- `style_preference` → `StylePreferenceBody`：收紧 `code`、`data`、`data.tagPreferenceVos`、`data.tagPreferenceVos[].tagId`；`data.tags` 的三层曲风树、`ratio`、封面和链接宽松。
- `user_social_status_support` → `UserSocialStatusSupportBody`：收紧 `code`、`data`、`data[].type`；图标、文案、跳转地址和 `canEdit` 宽松。
- `user_social_status_rcmd` → `UserSocialStatusRcmdBody`：收紧 `code` 和 `data`；`data.userRcmdInfoVOList` 是可以没有的路径，出现时每条记录的 `userId` 收紧；`rcmdTitle`、当前状态和身份信息宽松；`rcmdWords`、`identityInfoDTO.origin`、`tagRcmdVOList[].id` 只见过 `null`，未声明，原样保留。
- `inner_version` → `InnerVersionBody`：收紧 `code`、`data` 和 `data.version`；接口不请求上游，正文由模块用构建内联的 `package.json` 版本号拼出，不做上游校验。

### 行为变化

- 4 个读取模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项；未声明字段原样保留。
- `user_social_status_rcmd` 没有设置状态时上游返回 `data: {}`，`data.userRcmdInfoVOList` 整个缺失或为 `null` 都照常返回；出现但一条记录缺 `userId` 时报 502，不会整列消失。
- `user_social_status_rcmd`、`user_social_status_support` 未登录时上游返回 HTTP 200 + `code: 302`：改造前经 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务码拒绝为 reject `status: 302`，`body` 保留网易云原文。`calendar` 匿名可读，不受影响。
- `inner_version` 的公开正文没有变化（`code: 200`、`data.version`），只是新增了公开结构定义和类型。

### 录制证据

- 录制前用同一 Cookie 调 `login_status`，确认 `account.anonimousUser: false`（账号 599663130）。
- `calendar`：2025-10-01 至 2025-10-26 的 18 条事件（`calendar.default.json`），零长度区间无事件（`calendar.empty.json`，`calendarEvents: []`），匿名零长度区间同样为空（`calendar.anonymous.json`，`code: 200`），确认接口不需要登录。
- `style_preference`：登录 5 条偏好和完整曲风树（`style_preference.default.json`）；匿名调用两个数组都是空（`style_preference.anonymous.json`），用作空结果证据。
- `user_social_status_rcmd`：先录无状态空结果（`user_social_status_rcmd.empty.json`），再用 `user_social_status_edit` 设置 `LISTENING` 后录 18 条相似用户（`user_social_status_rcmd.default.json`）；`event_del` 删除同一状态 id 返回 `code: 200` 但状态仍在，实际用 `createRequest` 向 `/api/social/user/status/edit` 发送外层 `content: ''` 清空，回读 `data: {}` 确认账号状态已恢复。
- `user_social_status_support`：登录录制 18 个可设置状态（`user_social_status_support.default.json`）；匿名调用返回 `code: 302`（录制 `user_social_status_support.anonymous.json`），没有可用的空状态列表录制。
- `user_social_status_rcmd` 的匿名调用同样返回 `code: 302`（录制 `user_social_status_rcmd.anonymous.json`）。
- `inner_version` 不请求上游，没有录制；用构造测试校验正文。
- 录制没有出现 `MUSIC_U`/`MUSIC_A`/`__csrf`/cookie/邮箱；`user_social_status_rcmd` 里的其他用户编号属于公开数据，没有出现在录制中的当前账号编号。

### 迁移

- 这 4 个读取模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `user_social_status_rcmd`、`user_social_status_support` 未登录时从 resolve `status: 200` 变成 reject `status: 302`，调用方需要 try/catch；`error.body` 是上游原文。
- 读 `data.calendarEvents[].id`、`data.tagPreferenceVos[].tagId`、`data[].type` 和 `data.userRcmdInfoVOList[].userId` 时不再需要自己判空；宽松字段的类型带 `null | undefined`。
- `user_social_status_rcmd` 的 `data.userRcmdInfoVOList` 读取前仍要判断缺失或 `null`，空状态不会返回空数组而是整个缺失。
- `inner_version` 的 `data.version` 变为收紧字段，但值仍由 SDK 自己拼出，没有上游变化风险。

详见公开指南的[返回体结构](/guide/response-bodies)。
