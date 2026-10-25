---
'hana-music-api': minor
---

给 6 个评论扩展只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `comment_dj` → `CommentDjBody`：收紧 `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧。
- `comment_event` → `CommentEventBody`：收紧字段与 `CommentDjBody` 相同。
- `comment_floor` → `CommentFloorBody`：收紧 `code`、`data.comments`、`data.comments[].commentId`；`data.ownerComment` 是父评论附带信息，编号也宽松。
- `comment_hot` → `CommentHotBody`：收紧 `code`、`hotComments`、`hotComments[].commentId`。
- `comment_hug_list` → `CommentHugListBody`：收紧 `code`、`data.hugComments`；`data.currentComment` 是被抱评论的附带信息，编号也宽松。
- `comment_new` → `CommentNewBody`：收紧 `code`、`data.comments`、`data.comments[].commentId`。

`comment_dj`、`comment_event`、`comment_floor`、`comment_hot` 的评论记录继续复用 `CommentRecord`；`comment_hug_list`、`comment_new` 复用其中的宽松字段后，在各自模块内声明 v2 多出的楼层、视频、扩展信息和会员角标字段。评论里的 `user`、`beReplied`、`likedCount`、`time`、`decoration`、`ipLocation`、`pendantData` 等其余声明字段都宽松；`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId`、`hasMore`、`message` 等也宽松。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `comment_dj`、`comment_event` 的 `hotComments` 是“可以没有”的路径：`offset` 越过总数时网易云整个不返回它，缺失或 `null` 都照常返回；出现时里面的评论记录仍按 `commentId` 收紧，坏一条报 502。
- 空结果：零评论电台（`comment_dj.empty.json`）、零评论动态（`comment_event.empty.json`）、无评论资源（`comment_hot.empty.json`、`comment_new.empty.json`）都返回空列表；`comment_floor.empty.json` 返回 `data.comments: []` 并保留 `ownerComment`，`comment_hug_list.empty.json` 返回 `hugComments: []`、`hugTotalCounts: 0` 并保留 `currentComment`。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只抽查了本批匿名录制中非 `null` 的路径与类型；登录录制未保留；不对公开结构作相同性断言。
- 只见过 `null` 或空容器的字段（如 `commentBanner`、`topComments`、`tag`、`likeAnimationMap`、`outShowComments`、`bottomTags`）没有声明，继续作为未声明字段原样保留。
- 写操作没有纳入本批：`comment`（新增/删除/回复）、`comment_like`（点赞/取消）和 `hug_comment`（抱一抱评论）都会产生真实副作用，需要写操作批次取得明确许可后再处理。

### 迁移

- 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `comments[].user`、`comments[].beReplied`、`likedCount` 等宽松字段时，类型带 `null | undefined`。
- 读 `comments[].commentId`、`data.comments[].commentId` 时不再需要自己判空；`hotComments` 可能整个缺失或是 `null`。

详见公开指南的[返回体结构](/guide/response-bodies)。

后续清理：7 个评论列表模块的公共字段可抽到 core。
