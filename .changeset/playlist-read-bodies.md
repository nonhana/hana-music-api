---
'hana-music-api': minor
---

给歌单领域的 7 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。`playlist_mylike` 的登录录制来自本机账号；本批没有改动写操作模块。

### 新增公开结构定义

- `playlist_detail_dynamic` → `PlaylistDetailDynamicBody`：收紧 `code`；正文是扁平的计数和状态，其余声明字段全部宽松。
- `playlist_detail_rcmd_get` → `PlaylistDetailRcmdGetBody`：收紧 `code`、`data.recPlaylist`、`data.recPlaylist[].playlist.id`；`data` 是可以没有的路径，没有相关推荐时是 `null`。
- `playlist_highquality_tags` → `PlaylistHighqualityTagsBody`：收紧 `code`、`tags`、`tags[].id`。
- `playlist_hot` → `PlaylistHotBody`：收紧 `code`、`tags`、`tags[].id`；嵌套的 `playlistTag` 和其中的 `id` 宽松。
- `playlist_mylike` → `PlaylistMylikeBody`：只接受 `code: 200`，收紧 `code`、`data`；`data.feeds` 只见过空数组，元素类型猜不出，没有声明。
- `playlist_subscribers` → `PlaylistSubscribersBody`：收紧 `code`、`subscribers`、`subscribers[].userId`；收藏者其余字段沿用 `PlaylistUser` 的宽松写法。
- `playlist_video_recent` → `PlaylistVideoRecentBody`：收紧 `code`、`data`、`data.videos`、`data.videos[].mlogBaseData.id`（字符串）。

### 共享结构

`artist_video`、`search_multimatch` 和本批的 `playlist_video_recent` 逐字段重复了 mlog 记录里嵌着的歌曲结构，现在提到 `src/core/upstream-schemas.ts`，新增 `MlogSong`、`MlogSongArtist` 两个导出，三处改为 import 复用；这三个模块的 Body 行为不变。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- **`playlist_mylike` 的匿名调用行为变化**：以前 resolve HTTP 200 + `code: 302`，现在 `decodeUpstreamBody` 在结构校验前拦下 `code ≠ 200`，SDK 以 `status: 302` 拒绝（`body` 是上游原文 `{ code: 302, message: null }`，录制 `playlist_mylike.anonymous.json`）。
- 空结果可以正常返回：`playlist_detail_rcmd_get` 没有相关推荐时 `data` 是 `null`；`playlist_mylike` 的登录账号没有点赞过的视频，`data.feeds` 是空数组；`playlist_subscribers` 的 `offset` 越过总数时是空 `subscribers` 和 `total: 0`；`playlist_video_recent` 匿名时 `data.videos` 是空数组。
- `playlist_detail_dynamic` 的正文没有数组，本批录制与探测未发现可达的空结果；`playlist_highquality_tags` 和 `playlist_hot` 本批录制与探测未发现可达的空结果，但 `tags` 数组本身允许为空。
- `playlist_subscribers` 的分页语义按录制写清：匿名视角 `total` 上限是 30，`offset=0` 返回 20 条（`more: true`），`offset=20` 仍返回 10 条但带 `reason: needLogin`、`more: false`，`offset=40/60/100` 返回空数组和 `total: 0`；登录后 `total` 是完整数量（同歌单 2000，录制 `playlist_subscribers.authenticated-page-one.json`）。
- `playlist_video_recent` 需要登录：匿名调用返回 `code: 200` 和空 `videos`，元素字段的证据只来自登录录制。非空录制非连续保留 5 段视频（索引 0/1/20/21/26，原始 31 段，见 `context.truncated`）。
- 其余模块的匿名与登录重录非 null 路径与类型相同，登录只在宽松字段上多出现 null 或不同值；登录对照录制已删除。`playlist_subscribers` 保留登录第一页和空结果两份录制作为元素与 `total` 证据。
- 这 7 个模块都没有本地输入拒绝分支，参数仍按原样透传给上游。

### 登录证据

B5 没有新增 `login_status` 录制；登录身份由登录录制本身间接证明：`playlist_mylike` 返回了 `data`（匿名是 302）、`playlist_video_recent` 返回 31 段视频（匿名是空数组）、`playlist_subscribers` 登录后 `total` 是 2000（匿名上限 30）。匿名与登录的对照由同一命令重录完成。

### 迁移

- 这 7 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- **`playlist_mylike` 调用方要处理 302**：匿名调用以前 resolve HTTP 200 + `code: 302`，现在以 `status: 302` 拒绝；需要先登录，或按 `status`/`code` 处理未登录。
- 读 `playlist_detail_dynamic` 的计数和状态字段时类型带 `null | undefined`；`remarkName`、`remixVideo` 没有声明。
- 读 `playlist_detail_rcmd_get` 的 `body.data` 时先判空；`data.recPlaylist[].playlist.id` 已收紧。
- 读 `playlist_mylike` 的 `body.data.feeds` 时是未声明的 JSON 值，需要自行校验；`body.data.more`、`body.data.time` 类型带 `null | undefined`。
- 读 `playlist_subscribers` 的 `body.total`、`body.more`、`body.reason` 时类型带 `null | undefined`；`subscribers[].userId` 已收紧，`subscribeTime` 宽松；匿名分页的 `total` 上限是 30，不能当成收藏总数。
- 读 `playlist_video_recent` 的 `body.data.videos[].mlogBaseData.id` 时类型是 `string`；`mlogExtVO` 是宽松字段。

详见公开指南的[返回体结构](/guide/response-bodies)。
