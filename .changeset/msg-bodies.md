---
'hana-music-api': minor
---

给 6 个通知与私信读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。发私信、标记已读等写操作不在本批范围。

### 新增公开结构定义

- `msg_comments` → `MsgCommentsBody`：收紧 `code`、`comments`、`comments[].commentId`；评论复用 `CommentRecord`，补上 `beRepliedContent`、`beRepliedUser`、`combindId`、`commentExist`、`commentStatus`、`resourceJson`、`resourceType`、`subCommentExist`、`threadId` 宽松字段；`total`、`more` 宽松。
- `msg_forwards` → `MsgForwardsBody`：收紧 `code`、`forwards`、`forwards[].id`；正文 `json`、来源 `uf`（含 `uf.id`）、计数和游标宽松。
- `msg_notices` → `MsgNoticesBody`：收紧 `code`、`notices`、`notices[].id`；通知正文 `notice`（JSON 字符串）、`time`、`type`、`userId`、`queued`、`lastTime`、`more` 宽松。
- `msg_private` → `MsgPrivateBody`：收紧 `code`、`msgs`、`msgs[].user.id`；会话双方 `fromUser`/`toUser` 复用 `UserProfile` 的字段但把 `userId` 放宽，补 `expertTags`；最后一条消息、计数和 `more` 宽松。
- `msg_private_history` → `MsgPrivateHistoryBody`：收紧 `code`、`msgs`、`msgs[].id`；消息正文 `msg`（JSON 字符串）、双方资料、`time`、`batchId`、`isArtist`、`isSubed`、`hint`、`more` 宽松。
- `msg_recentcontact` → `MsgRecentcontactBody`：收紧 `code`、`data`、`data.follow`、`data.follow[].userId`；联系人记录复用 `UserProfile`，补 `py`、`onlined`、`expertTags` 宽松字段。

### 共享结构

本批没有新增 core 结构。`msg_comments` 复用评论模块已有的 `CommentRecord` 和 `CommentUser`；`msg_private`、`msg_private_history`、`msg_recentcontact` 复用 `UserProfile` 的字段。会话双方在两个私信模块里字段相同，但只有两个模块使用，按规则没有抽到 `src/core/upstream-schemas.ts`。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `msg_comments`、`msg_forwards`、`msg_notices` 未登录时上游返回 `code: 301`。301 不在 `SPECIAL_STATUS_CODES` 里，改造前请求层就按非 2xx reject `status: 301`（`ProtocolFailed`）；现在 Body 校验按业务码 reject 相同状态（`UpstreamBusinessFailed`），公开 `status` 和正文不变，只是失败类型变化，不会 resolve `status: 200`。`msg_private`、`msg_private_history`、`msg_recentcontact` 未登录时上游返回 `code: 200` 和空列表，行为不变。
- 空结果：`before=1` 的评论（`msg_comments.empty.json`）、越界 `offset` 的 @我 和私信会话（`msg_forwards.empty.json`、`msg_private.empty.json`）、早于账号创建的通知游标（`msg_notices.empty.json`）、早于会话历史的私信游标（`msg_private_history.empty.json`）都返回空数组。账号 599663130 登录时有最近联系人，本批没有登录态的空结果；未登录录制 `msg_recentcontact.anonymous.json` 返回 `data.follow: []`。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。录制只覆盖账号 599663130 与录制里出现的其他账号，不对所有账号、地区和上游版本作相同性断言。
- 私信录制里有手机号和邮箱的公开签名已按 `<redacted>` 替换，路径记在 `context.redacted`，录制 note 也写明了脱敏。

### 迁移

- 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- `msg_comments`、`msg_forwards`、`msg_notices` 的匿名调用以前就是 reject `status: 301`（不是 resolve `status: 200`），现在仍 reject `status: 301`，正文为网易云原文；公开状态不变，已按 301 处理未登录的调用方不需要改动。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `comments[].commentId`、`forwards[].id`、`notices[].id`、`msgs[].user.id`、`msgs[].id`、`data.follow[].userId` 时不再需要自己判空；`lastMsg`、`notice`、`msg` 仍是 JSON 字符串，需要调用方自行解析。

详见公开指南的[返回体结构](/guide/response-bodies)。
