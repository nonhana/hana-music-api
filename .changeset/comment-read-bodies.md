---
'hana-music-api': minor
---

给 5 个固定资源评论列表模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `comment_music` → `CommentMusicBody`：收紧 `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧。
- `comment_album` → `CommentAlbumBody`：收紧字段与上面相同。
- `comment_playlist` → `CommentPlaylistBody`：收紧字段与上面相同。
- `comment_mv` → `CommentMvBody`：收紧字段与上面相同。
- `comment_video` → `CommentVideoBody`：收紧字段与上面相同。

`CommentRecord` 由这五个模块共用，`CommentUser`、`CommentReply` 是它的组成结构（一并导出便于复用）；本批录制里评论记录的字段和类型完全一致。评论里的 `user`、`beReplied`（含 `beReplied[].beRepliedCommentId`）、`likedCount`、`liked`、`favorited`、`time`、`timeStr`、`status`、`parentCommentId`、`commentLocationType`、`decoration`、`ipLocation`、`pendantData` 都宽松；`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId` 也宽松。

### 行为变化

- 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在 `code`、`comments` 或 `comments[].commentId` 缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `hotComments` 是“可以没有”的路径：`offset` 越过总数时网易云整个不返回它，缺失或 `null` 都照常返回；出现时里面的评论记录仍按 `commentId` 收紧，坏一条报 502。
- 空结果：无评论资源返回 `comments: []`、`hotComments: []`、`total: 0`（录制 `comment_music.empty.json`、`comment_album.empty.json`、`comment_playlist.empty.json`）；越界分页返回 `comments: []` 且没有 `hotComments`（各模块的 `out-of-range` 录制）。`comment_mv`、`comment_video` 本批录制与探测未发现可达的无评论资源。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false` 后抽查：五个模块的非 `null` 路径与类型相同，登录响应只会在宽松字段上多出现值为 `null` 的路径（如 `comments[].user.vipRights`、`beReplied[].content`/`richContent`、`beReplied[].ipLocation.userId`），登录录制未保留。
- 只见过 `null` 或空数组的字段（如 `commentBanner`、`topComments`、`aiCommentLabel`、`showFloorComment`、`repliedMark`）没有声明，继续作为未声明字段原样保留。
- `/api/resource/comments/${action}` 的 `comment` 模块承接评论新增、删除和回复三个写操作，无法在不产生真实副作用的前提下录全各 action，本批没有给它加 `ModuleBody`；建议放到写操作批次并取得明确许可后再处理。

### 迁移

- 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `comments[].user`、`comments[].beReplied`、`likedCount` 等宽松字段时，类型带 `null | undefined`。
- 读 `comments[].commentId` 时不再需要自己判空；`hotComments` 可能整个缺失或是 `null`。

详见公开指南的[返回体结构](/guide/response-bodies)。
