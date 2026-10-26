---
'hana-music-api': minor
---

给 11 个电台节目与 DI.FM 读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。DI.FM 频道订阅/取消订阅（`dj_difm_channel_subscribe`、`dj_difm_channel_unsubscribe`）是写操作，留给写操作批次，本批没有收窄返回体。

### 新增公开结构定义

- `dj_program` → `DjProgramBody`：收紧 `code`、`programs`、`programs[].id`；`count`、`more` 宽松，节目记录复用 core 的 `DjProgram`（已声明字段宽松，未声明字段原样保留为 JSON；`programDesc` 简介图文和 `specialTags` 由 `dj_program_detail.anchors.json` 提供非空证据，`icon` 是对象但子字段只见过 `null`、`songs` 只见过空数组，都没有声明）。
- `dj_program_detail` → `DjProgramDetailBody`：收紧 `code`、`program`、`program.id`；参与主播 `participateAnchors` 有非空证据（节目 3729504614，录制 `dj_program_detail.anchors.json`），元素只声明 `userId`、`type`、`anchorInfo`，`role`、`basicDivide`、`personalBuyLink`、`personalDivide` 只见过 `null`，未声明；`songs`、`programGuests` 在本批录制与探测的节目中未发现非空，元素结构未知，未声明。
- `dj_program_toplist` → `DjProgramToplistBody`：收紧 `code`、`toplist`、`toplist[].program.id`；`rank`、`lastRank`、`score`、`programFeeType`、`updateTime` 宽松。
- `dj_program_toplist_hours` → `DjProgramToplistHoursBody`：收紧 `code`、`data`、`data.list`、`data.list[].program.id`；`total`、`updateTime`、排名、分数和 `programFeeType` 宽松，`msg` 只见过 `null`，未声明。
- `program_recommend` → `ProgramRecommendBody`：收紧 `code`、`programs`、`programs[].id`；`name`、`more` 宽松。
- `dj_personalize_recommend` → `DjPersonalizeRecommendBody`：收紧 `code`、`data`、`data[].id`；主播复用 `ProgramDj`，`descPicList`、`discountPrice`、`icon`、`immersionAnimation`、`immersionCover`、`liveInfo`、`manualTagsDTO`、`replaceResource`、`scoreInfoDTO`、`shortName`、`videos` 只见过 `null`，`participateUidList` 只见过空数组，均未声明。
- `personalized_djprogram` → `PersonalizedDjprogramBody`：收紧 `code`、`result`、`result[].id`；条目里的节目是另一种结构（多 `publish`、`subscribed`、`userId`、`adjustedPlayCount`），在模块内单独声明，只复用 `ProgramMainSong` 和 `ProgramDj`，节目里的电台摘要多 `whiteList`、`hightQuality`。
- `dj_today_perfered` → `DjTodayPerferedBody`：只收紧 `code`。
- `dj_difm_all_style_channel` → `DjDifmAllStyleChannelBody`：收紧 `code`、`data`、`data[].styles`、`data[].styles[].channels`、`data[].styles[].channels[].id`；`message`、`source`、风格和频道的展示字段宽松。
- `dj_difm_playing_tracks_list` → `DjDifmPlayingTracksListBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`total`、`message`、`artist`、`audio`、封面、时长和 `wave` 宽松。
- `dj_difm_subscribe_channels_get` → `DjDifmSubscribeChannelsGetBody`：只收紧 `code`，`message` 宽松。

### 共享结构

本批新增 core 导出 `DjProgram`、`ProgramDj`、`ProgramMainSong`（只在内部使用，未加入根入口公开类型）：`dj_program`、`dj_program_detail`、`dj_program_toplist`、`dj_program_toplist_hours`、`program_recommend` 的节目记录声明结构相同（各录制里的宽松字段可有差异，例如 `reason` 只在 `program_recommend` 有非 `null` 值），按“三个模块声明结构相同才进 core”的门槛提升；节目里的 `mainSong`（旧版歌曲）、`dj` 主播（`PlaylistUser` 加 `brand`）、参与主播和电台摘要跟着放在 core，未单独导出。另外给既有共享结构 `SimpleAlbum` 补了宽松字段 `dolbyMark`（`personalized_djprogram` 与既有 `toplist_detail` 都有非 `null` 值）。`personalized_djprogram` 的节目和电台摘要字段不同，留在模块内，只复用 `ProgramMainSong` 和 `ProgramDj`；`dj_personalize_recommend` 的电台记录与已有电台列表记录字段不同，也留在模块内。

### 行为变化

- 这 11 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- **非 200 业务码的状态码变化**：结构定义只接受 `code: 200`。`dj_program` 缺少 `rid` 的 `code: 400` 是特殊码，以前被归一成 resolve `status: 200`，现在按业务码 reject `status: 400`；`dj_program_detail` 未知节目 id 的 `code: 404` 不在特殊码表里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`）。正文都是网易云原文（录制 `dj_program.missing-rid.json`、`dj_program_detail.unknown.json`）。
- 空结果可以正常返回：`dj_program`、`program_recommend` 的越界分页返回空数组（`*.empty.json`）；`dj_difm_all_style_channel` 的 `sources: '[]'` 返回空 `data`；`dj_difm_playing_tracks_list` 的未知 `channelId` 返回空 `data.list`、`total: 0`。`dj_program_toplist`（`limit` 由 SDK 默认 `100` 后再请求，上游忽略 `offset`）、`dj_program_toplist_hours`（SDK 默认 `100`，没有 `offset`）、`dj_personalize_recommend`（SDK 默认 `6`）、`personalized_djprogram`（没有分页参数）本批录制与探测未发现可达的空结果，数组本身允许为空。
- `dj_today_perfered` 和 `dj_difm_subscribe_channels_get` 的 `data` 在匿名、登录和不同参数的探测里都是空数组，元素类型没有证据，未声明并原样保留。
- 录制截取：`dj_program`（3/30）、`dj_program_toplist`（2/5）、`program_recommend`（3/5）、`personalized_djprogram`（4/6）按字段覆盖保留非连续子集，`dj_difm_all_style_channel` 保留 1/15 个风格（`channels` 未截取），`dj_difm_playing_tracks_list` 把每条 `wave` 截到 32/2001 个点；原始数量写在 `context.truncated`，索引写在 `context.note`。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。11 个模块都带 Cookie 重录过：登录录制能通过同一结构校验，宽松字段的值与覆盖有差异（`aiGenerated` 的 `null`/`boolean`、`radio.descPicList` 的 `null`/数组、`mainSong.mMusic`/`hMusic` 的 `null`/对象、`dj.experts` 的键集合）；登录录制已删除，只保留匿名录制，不对公开结构作相同性断言。
- 本批模块的输入都按原样透传，`dj_program` 的 `asc` 类型检查和其余模块的参数行为没有变化。

### 迁移

- 这 11 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- **调用方要处理按业务码拒绝的 400**：`dj_program` 未传 `rid` 时，以前 resolve HTTP 200 + 正文 `code: 400`，现在以 `status: 400` 拒绝；`dj_program_detail` 未知节目 id 的 404 改造前就 reject `status: 404`，公开状态不变。先补齐参数，或按 `status`/`code` 处理。
- 节目里的 `programs[].id`、`program.id`、`toplist[].program.id`、`data.list[].program.id` 是收紧的 `number`，不再需要判空；`mainSong`、`dj`、`participateAnchors`、`radio` 和其余已声明字段是宽松字段，类型带 `null | undefined`，未声明字段（如 `icon`、`songs`）是原始 JSON。
- `dj_today_perfered`、`dj_difm_subscribe_channels_get` 的 `body` 只保证 `code`（后者不保证 `message`），`data` 仍是原始 JSON 数组，读元素前要自行校验。
- 列表接口的数组本身允许为空；分页不要假定一定有结果。

详见公开指南的[返回体结构](/guide/response-bodies)。
