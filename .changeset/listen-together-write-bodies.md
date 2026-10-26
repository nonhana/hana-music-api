---
'hana-music-api': minor
---

给 7 个一起听与动态写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体；另外 2 个动态模块只有风控拒绝录制，本批没有声明结构。

### 新增公开结构定义

- `listentogether_room_create` → `ListentogetherRoomCreateBody`：收紧 `code`、`data`、`data.roomInfo` 和接口就是为了拿的 `data.roomInfo.roomId`；房主 `creatorId`、`roomUsers[]`、`data.type`、`avatarPendantShow` 和其余房间展示字段宽松。
- `listentogether_heatbeat` → `ListentogetherHeatbeatBody`：只收紧 `code`（`200`）；`data.result`、`data.time`、`data.timeSpan`、`message` 宽松，`data.message` 只见过 `null`，未声明。
- `listentogether_play_command` → `ListentogetherPlayCommandBody`：只收紧 `code`（`200`）；`data.result`、`message` 宽松，`data.message` 只见过 `null`，未声明。
- `listentogether_sync_list_command` → `ListentogetherSyncListCommandBody`：只收紧 `code`（`200`）；`data.result`、`data.message`、`message` 宽松。
- `listentogether_end` → `ListentogetherEndBody`：只收紧 `code`（`200`）；`data.success`、`data.roomType`、`message` 宽松，其余 `data` 字段只见过 `null`，未声明。
- `listentogether_accept` → `ListentogetherAcceptBody`：只收紧 `code`（`200`）；`data`（含 `roomInfo`）和 `message` 整体宽松，新加入成员的正文没有证据。
- `event_del` → `EventDelBody`：只收紧 `code`（`200`）。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失、`null` 或类型不对时只丢这一项。
- `listentogether_accept` 的已结束房间（HTTP 200 + `code: 488`，录制 `listentogether_accept.expired-room.json`）改造前是 resolve `status: 488`（488 不在 `SPECIAL_STATUS_CODES` 里，`toModuleResponse` 直传）；现在 `decodeUpstreamBody` 按业务码拒绝，变成 reject `status: 488`，`body`/`cookie` 保留原文。本批没有录到 `listentogether_room_create` 的非 200 业务码。
- `share_resource` 和 `event_forward` 本批没有声明 `ModuleBody`：分享与转发在录制设备上被上游风控拒绝（`code: 250`），没有成功正文的证据；行为不变，正文原样转交、仍是 resolve `status: 250`，与 B45 有 Body 的 250 reject 不同。

### 迁移

- 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `listentogether_accept` 的顶层 `488` 从 resolve 变成 reject，调用方需要 try/catch；`share_resource`/`event_forward` 的 `250` 仍是 resolve。
- `ListentogetherRoomCreateBody['data']['roomInfo']['roomId']` 不再需要自己判空；`creatorId`、`message`、`data.success` 等宽松字段的类型带 `null | undefined`。
- 本批在录制设备上创建并结束了两个一起听房间（录制后均调用 `end` 清理），`listentogether_status` 回读 `data.inRoom: false`（`listentogether_status.after-cleanup.json`）；`event_del` 的录制是删除合成 id 的返回体，没有删除真实动态。

详见公开指南的[返回体结构](/guide/response-bodies)。
