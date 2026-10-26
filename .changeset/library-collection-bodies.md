---
'hana-music-api': minor
---

给 6 个用户歌单与下载/已购资产只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `user_playlist_collect` → `UserPlaylistCollectBody`：收紧 `code`、`data`、`data.playlist` 和每张歌单自己的编号 `data.playlist[].id`（复用 `PlaylistSummary`）；`count`、`more` 和歌单其余字段宽松。
- `user_playlist_create` → `UserPlaylistCreateBody`：收紧 `code`、`data`、`data.playlist`、`data.playlist[].id`；`count`、`more`、`subCount` 和歌单其余字段宽松。
- `song_downlist` → `SongDownlistBody`：收紧 `code`、下载记录列表 `info` 和每条记录自己的编号 `info[].id`；内嵌歌曲 `song` 用宽松的 `LooseSong`，`firstTime`、`type` 宽松。
- `song_monthdownlist` → `SongMonthdownlistBody`：与 `song_downlist` 相同。
- `song_singledownlist` → `SongSingledownlistBody`：只收紧 `code`；已购买单曲列表 `info` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留。
- `song_purchased` → `SongPurchasedBody`：收紧 `code` 和已购单曲列表的路径 `data`；`data.list` 只有空数组证据、元素类型未知，未声明并原样保留，`count`、`hasMore`、`message` 宽松。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 空结果：`user_playlist_collect`、`user_playlist_create` 用越界 `offset` 录到 `data.playlist: []`（`more: false`，`count` 保留总数）；`song_downlist`、`song_monthdownlist` 越界偏移返回 `info: []`。`song_singledownlist`、`song_purchased` 的录制账号没有已购买/已购单曲，两份都是真实空结果（`info: []`、`data: { count: 0, list: [], hasMore: false }`），没有非空元素证据；没有另一个已购账号可补录，元素类型暂未声明。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。两个歌单列表用公开账号 32953014 录制，`query.uid` 与正文一致、正文未改写，同参数重录逐字段一致。两个歌单列表保留匿名录制：结构与登录一致，`subscribed` 是 `null`；下载列表匿名调用返回空 `info`，只保留登录录制。
- `user_playlist_collect` 的非数字 `uid` 和 `song_downlist` 的非数字 `limit` 返回 `code: 400`。400 是特殊码，改造前被 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务码 reject `status: 400`，`body` 保留原文（录制保留在 `library/`）。

### 迁移

- 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 歌单列表的 `data.playlist[].id` 类型是数字；`data.count`、`data.more`、`subCount` 的类型带 `null | undefined`。下载记录的 `info[].id` 是数字，`song` 的类型带 `null | undefined`，歌曲字段沿用 `LooseSong` 的宽松类型。

详见公开指南的[返回体结构](/guide/response-bodies)。
