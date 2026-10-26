---
'hana-music-api': minor
---

给 4 个乐谱、年度总结和星评只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `sheet_list` → `SheetListBody`：收紧 `code`、乐谱列表 `data.musicSheetSimpleInfoVOS`（可以没有）和每份乐谱自己的编号 `id`；没有乐谱时列表是 `null`（`other/sheet_list.empty.json`）。乐器筛选项 `data.sheetInstrumentTypeVOList` 同样可以为 `null`；`findSheet`、`uploadSheet`、`errorCode` 和乐谱展示字段全部宽松。
- `sheet_preview` → `SheetPreviewBody`：收紧 `code`、乐谱页数组 `data`、每页自己的编号 `id` 和取图地址 `url`；不存在的乐谱返回空数组（`other/sheet_preview.empty.json`）。`sheetId`、`md5`、`pageNumber`、`size` 宽松；匿名调用同样返回 6 页（`other/sheet_preview.anonymous.json`）。
- `summary_annual` → `SummaryAnnualBody`：只收紧 `code` 和通到年度报告的 `data`。报告正文按年份变化（2020 年起长键，2017–2019 走 `userdata` 短键），已声明字段全部宽松，未声明字段原样保留。本批保留 2018、2019 和 2022、2023 的录制，其他年份未验证；2018 的评论正文 `data.mlc` 是字符串，按 `number | string` 的宽松字段声明。没有报告的 2025 返回 `code: 404`，按业务拒绝原样转交。
- `starpick_comments_summary` → `StarpickCommentsSummaryBody`：收紧 `code`、首页 block 列表 `data.blocks` 和每个 block 自己的编号 `blockCode`；星评评论在 `creatives[].resources[]` 里，`creatives` 是可以没有的路径，缺失或 `null` 照常返回，出现时坏一条仍报 502。`resources` 与每个 creative 的 `uiElement` 是宽松字段，坏值只丢该项；block 的 `extInfo` 未声明、原样保留，其余展示字段宽松。

### 行为变化

- 这 4 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `summary_annual` 在没有报告的年份（2025）上游返回 HTTP 200 + `code: 404`，改造前 resolve 为 `status: 200`，现在按业务码拒绝为 `status: 404`，`body` 保留原文（`record/summary_annual.no-report.json`）。
- 空结果：`sheet_list` 对没有乐谱的歌曲返回 `musicSheetSimpleInfoVOS: null`（歌曲 7238118806）；`sheet_preview` 对不存在的乐谱返回 `data: []`（id=1）。`starpick_comments_summary` 没有可达的空 block 结果，数组本身允许为空。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`；`sheet_preview` 另保留匿名录制（同样 6 页），其余模块的录制都来自登录账号，除 `sheet_preview` 外未保留匿名对照，不对公开结构作相同性断言。`summary_annual.2018`/2019 的 `data.ouid`、`data.nkn` 和加密 uid，2019 的 `data.uun` 与 `data.aul`、2018 的 `data.aul`，以及 2022/2023 的加密用户 id 已换成合成值。
- `starpick_comments_summary` 的录制保留 banner、歌单推荐和星评评论三个 block（原 15 个），有 creative 的 block 保留两条 creative、每条 creative 保留一条 resource；`context.truncated.length` 记原数组长度。
- `yunbei_expense` 和 `yunbei_receipt` 本批没有补结构定义：登录账号探测两个上游路径仍返回 `code: 404`、消息“接口未找到”，没有成功返回体证据，SDK 继续原样转交正文。

### 迁移

- 这 4 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- `summary_annual` 在没有报告的年份（2025）从 resolve `status: 200` 变成 reject `status: 404`，调用方需要 `try/catch` 并检查 `status`。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `sheet_list` 的 `musicSheetSimpleInfoVOS` 和 `sheetInstrumentTypeVOList` 类型带 `null | undefined`，读取前要判空；`summary_annual` 的报告正文仍按年份自行收窄，SDK 只保证 `data` 是对象。

详见公开指南的[返回体结构](/guide/response-bodies)。
