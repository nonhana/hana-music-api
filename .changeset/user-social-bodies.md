---
'hana-music-api': minor
---

给 7 个用户社交列表读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。关注、取关等写操作不在本批范围。

### 新增公开结构定义

- `user_follows` → `UserFollowsBody`：收紧 `code`、`follow`、`follow[].userId`；`more`、`touchCount` 宽松。
- `user_followeds` → `UserFollowedsBody`：收紧 `code`、`followeds`、`followeds[].userId`；`more`、`newCount`、`size` 宽松。
- `user_follow_mixed` → `UserFollowMixedBody`：收紧 `code`、`data`、`data.records`、`data.records[].followId`；`userProfile` 是可以没有的路径（艺术家记录里是 `null`）。
- `user_mutualfollow_get` → `UserMutualfollowGetBody`：收紧 `code`、`data`（布尔结果）。
- `user_comment_history` → `UserCommentHistoryBody`：收紧 `code`；`data.comments`、`data.hotComments` 是可以没有的路径，出现时 `commentId` 收紧。
- `user_dj` → `UserDjBody`：收紧 `code`、`programs`、`programs[].id`，节目记录复用 `DjProgram`。
- `user_event` → `UserEventBody`：收紧 `code`、`events`、`events[].id`；评论信息、作者、图片和计数宽松。

### 共享结构

`artist_fans`、`user_follows`、`user_followeds`、`user_follow_mixed`、`user_event` 的用户记录里 VIP 权益字段一致，抽出 `src/core/upstream-schemas.ts` 的 `VipRights`，并声明 `relationType` 与 `extInfo.logo.logoDto` 的宽松字段（`memberLogo` 只见过 `null`，未声明）。`user_follows`、`user_followeds` 的关注/粉丝记录复用 `UserProfile` 的宽松字段，再补上 `py`、`time`、`vipRights`，`user_follows` 还补 `expertTags`；`remarkName` 只见过 `null`，没有声明。`user_event` 的动态作者也复用 `UserProfile`，评论串里补 `latestLikedUsers[]` 的 `s`、`t` 宽松字段；`user_comment_history` 的评论复用 `CommentRecord` 并补 `beRepliedContent`、`beRepliedUser`、`resourceInfo`、`resourceType`、`threadId`。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `user_follow_mixed` 未登录时上游返回 HTTP 200、`code: 400`、`message: "not login"`，SDK 按业务拒绝原样转交（`status: 400`，正文为网易云原文），不再返回 `status: 200`。
- `user_comment_history` 的 `data.comments`、`data.hotComments` 缺失或 `null` 都照常返回；出现但里面一条评论缺 `commentId` 时报 502。
- 空结果：关注列表越界分页（`user_follows.empty.json`）、无粉丝账号（`user_followeds.empty.json`）、越界 `cursor`（`user_follow_mixed.empty.json`）、无历史评论/未登录（`user_comment_history.empty.json`、`user_comment_history.anonymous.json`）、无节目账号（`user_dj.empty.json`）、无动态账号（`user_event.empty.json`）都返回空数组或 `null`，结构定义接受。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只保留 `user_follow_mixed`、`user_comment_history`、`user_mutualfollow_get` 的未登录录制；其余模块本批未保留未登录录制，不对公开结构作相同性断言。

### 工具链

`scripts/gen-module-types.mts` 生成的 `sdkModuleRegistry` 改为显式标注 `SdkModuleRegistry`，修复新增 Body 后 declaration emit 的 TS7056（352 条目 `as const` 字面量超过编译器序列化上限）；运行时值与生成输出不变。

### 迁移

- 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `follow[].userId`、`followeds[].userId`、`data.records[].followId`、`programs[].id`、`events[].id` 时不再需要自己判空；`data` 里的布尔结果和评论列表仍要按 `null | undefined` 处理。

详见公开指南的[返回体结构](/guide/response-bodies)。
