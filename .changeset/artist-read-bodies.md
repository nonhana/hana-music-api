---
'hana-music-api': minor
---

给 10 个歌手读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `artist_desc` → `ArtistDescBody`：收紧 `code`、`introduction`；`briefDesc`、`count`、`topicData` 宽松，相关专栏的专栏、正文和创建者编号不收紧。
- `artist_detail_dynamic` → `ArtistDetailDynamicBody`：只收紧 `code`；关注状态、演出、视频数和推荐资源全部宽松。
- `artist_fans` → `ArtistFansBody`：收紧 `code` 和粉丝列表 `data`（越界分页/没有更多粉丝时上游返回 `data: null`，声明为可以没有的路径），出现时 `data[].userProfile`、`userProfile.userId` 收紧；`vipRights` 宽松。
- `artist_follow_count` → `ArtistFollowCountBody`：收紧 `code`、`data`；关注状态和各计数宽松。
- `artist_list` → `ArtistListBody`：收紧 `code`、`artists`、`artists[].id`；`more` 宽松，歌手记录复用 `Artist` 并在模块内收紧 `id`。
- `artist_mv` → `ArtistMvBody`：收紧 `code`、`mvs`、`mvs[].id`；`hasMore`、`time` 宽松，MV 记录本批在模块内局部声明。
- `artist_new_mv` → `ArtistNewMvBody`：收紧 `code`、`data`、`data.newWorks`、`data.newWorks[].mvId`；匿名时 `newWorks` 是空数组，MV 的其余字段宽松。
- `artist_new_song` → `ArtistNewSongBody`：收紧 `code`、`data`、`data.newWorks`、`data.newWorks[].songLists[].id`；匿名时 `newWorks` 是空数组，`songLists` 复用 `Song`，block 分组字段宽松。录制截取保留 2/20 个 block、5/62 首歌，`context.truncated` 记录原始数量。
- `artist_songs` → `ArtistSongsBody`：收紧 `code`、`songs`、`songs[].id`；歌曲记录复用 `Song`，补宽松的 `eq`，并在模块内把 `noCopyrightRcmd` 扩展成含 `expInfo`、`mvInfo` 的宽松结构（分页录制 `artist_songs.no-copyright.json` 提供嵌套证据）；`more`、`total` 宽松。`artist_songs.default.json` 截取保留 30/100 首，`context.truncated` 记录原始数量。
- `artist_video` → `ArtistVideoBody`：收紧 `code`、`data`、`data.records`、`data.records[].id`；`data.page` 和记录里的 `resource` 宽松。

### 行为变化

- 这 10 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 这两个 404 都不在 `SPECIAL_STATUS_CODES` 里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变：未知歌手 id 的 `artist_follow_count` 是 `{ code: 404, message: '资源未找到', data: null }`，`artist_desc` 的未知 id 是 `{ code: 404 }`。
- 空结果：`artist_fans` 的越界分页返回 `data: null`；`artist_mv`、`artist_songs`、`artist_list` 的越界分页返回空数组和各自的 `hasMore`/`more`；`artist_video` 的越界 `cursor` 返回空 `records`；`artist_desc` 的歌手没有介绍条目时 `introduction` 是空数组。
- `artist_new_mv`、`artist_new_song` 的非空录制来自本机已登录账号：MV 17 个作品，新歌原 20 个 block/62 首歌（截取保留 2 个 block、5 首歌，`context.truncated` 记录原始数量）。匿名录制是空 `newWorks`（正常结果），两个接口的 `newWorks` 都是收紧数组，缺失、`null` 或坏记录都报 502；B9 的 MV 结构可以拿 `artist_new_mv.default.json` 和 `artist_mv.default.json` 对比后再决定是否提升为共享结构。
- 登录对照：8 个匿名可用的接口带 Cookie 重录后字段集合和类型相同，值差异只来自关注状态、实时计数和 CDN 地址，登录录制已删除；`artist_new_mv`、`artist_new_song` 的非空录制只能带登录身份取得，匿名录制另存为 `anonymous-empty`。
- 只出现在录制里的 `null` 字段（如 `artist_detail_dynamic` 的 `concert.simpleConcert`、`rcmdResource.picUrl`，`artist_video` 的 `resource.userProfile`、`mlogBaseData.userId`）没有声明，继续作为未声明字段原样保留。

### 迁移

- 这 10 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `artist_fans` 的 `data` 类型是 `ReadonlyArray<...> | null | undefined`，使用前判空；`artist_songs`、`artist_mv`、`artist_list`、`artist_video` 的列表字段本身允许为空数组。
- `artist_new_mv`/`artist_new_song` 的 `data.newWorks` 类型是 `ReadonlyArray<...>`（必需数组）；缺失或 `null` 会 502，不要判空。MV 的 `mvId`、新歌的 `songLists[].id` 已收紧，块内其余字段类型带 `null | undefined`。

详见公开指南的[返回体结构](/guide/response-bodies)。
