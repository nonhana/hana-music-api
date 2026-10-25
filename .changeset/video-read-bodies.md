---
'hana-music-api': minor
---

给视频领域的 9 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。收藏/取消收藏视频（`video_sub`）是写操作，移到后续写操作批次（B22 关注/收藏/点赞），本批没有收窄。

### 新增公开结构定义

- `video_category_list` → `VideoCategoryListBody`：收紧 `code`、`data`、`data[].id`；`abExtInfo` 只见过 `null`，未声明。
- `video_detail` → `VideoDetailBody`：收紧 `code`、`data`、`data.vid`；`creator` 复用宽松的 `PlaylistUser`，`markTypes`（只见过空数组）和 `videoUserLiveInfo`（只见过 `null`）未声明。
- `video_detail_info` → `VideoDetailInfoBody`：收紧 `code`、`commentCount`、`shareCount`、`likedCount`；`liked` 宽松。
- `video_group` → `VideoGroupBody`：收紧 `code`；`datas` 在录制和对全部标签 id 的探测里只见过 `null`，元素类型无法确定，未声明；`msg` 只见过 `null`，也未声明。
- `video_group_list` → `VideoGroupListBody`：收紧 `code`、`data`、`data[].id`；`relatedVideoType`、`abExtInfo` 只见过 `null`，未声明。
- `video_timeline_all` → `VideoTimelineAllBody`：收紧 `code`、`datas`、`datas[].data.vid`；`hasmore`、`msg`、`rcmdLimit` 宽松。
- `video_timeline_recommend` → `VideoTimelineRecommendBody`：收紧 `code`、`datas`、`datas[].data.vid`；`hasmore`、`msg` 宽松。
- `video_url` → `VideoUrlBody`：收紧 `code`、`urls`、`urls[].id`、`urls[].url`。
- `related_allvideo` → `RelatedAllvideoBody`：收紧 `code`；`data` 在两种 `type` 分支的录制里都是空数组，元素类型无法确定，未声明。

两个 timeline 模块的视频记录在模块内分别声明：`creator` 复用宽松的 `PlaylistUser`，`resolutions[]`、`videoGroup[]`、`markTypes` 宽松，`relateSong[]` 是宽松字段里套着的歌曲记录（复用 `Song` 的字段并把 `id` 放宽）。`previewUrl` 只在 `video_timeline_all` 有非 `null` 证据，`urlInfo` 只在 `video_timeline_recommend` 有非 `null` 证据；`extAlg`、`relatedInfo`、`videoUserLiveInfo` 只见过 `null`，都没有声明。视频记录与 MV 记录字段不同，没有硬套 `MvSummary`；三个视频模块（`video_detail`、`video_timeline_all`、`video_timeline_recommend`）共用的 `resolutions[]` 条目和 `videoGroup[]` 引用提升为 core 的 `VideoResolutionEntry`、`VideoGroupRef`，属于 core 内部新增导出（未进包入口），不改既有结构。

### 行为变化

- 这 9 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 空结果可以正常返回：`video_timeline_all` 的越界 `offset` 返回 `datas: []`；`video_timeline_recommend` 的越界 `offset=100` 返回 `datas: []`（录制 `video_timeline_recommend.empty.json`）；`video_url` 对未知视频返回 `urls: []`；`related_allvideo` 的两种 `type` 分支都返回空 `data`；`video_group` 返回 `datas: null`。`video_category_list`、`video_group_list` 本批录制与探测未发现可达的空结果。
- `video_url` 覆盖三种清晰度（请求 1080 实际给到 720、480p、240p）；未探测到 `url` 为 `null`，所以 `urls[].url` 按必填字符串收紧，拿不到地址时上游返回空数组。付费/会员视频的 `urls[].url` 未覆盖；若上游给 `null`，会以 `UnexpectedUpstreamShape`（`status: 502`）拒绝。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。两个 timeline 模块的登录录制差异只在宽松字段（`relateSong` 出现歌曲记录、`markTypes` 出现值；`creator.experts` 的键集合差异只在 `video_timeline_all`，匿名录制多出 `experts.2`，`video_timeline_recommend` 两边都只有 `{1}` 或 `null`），登录录制保留为元素字段证据；其余 7 个模块只保留匿名录制，未保留登录对照，不对公开结构作相同性断言。
- `video_detail_info` 的本地输入拒绝没有变化：非原始值 `vid` 仍在发请求前返回 400。`video_detail` 对数字视频 id 返回的 `code: 400` 作为业务失败原样转交。

### 迁移

- 这 9 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `video_timeline_all` / `video_timeline_recommend` 的 `datas[].data` 时，`vid` 是 `string`，`creator`、`markTypes`、`relateSong`、`resolutions`、`videoGroup` 等宽松字段带 `null | undefined`。
- 读 `video_url` 的 `body.urls[].url` 时类型是 `string`；拿不到地址时数组为空，不要只检查顶层 `body.code`。
- 读 `video_group` 的 `body.datas`、`related_allvideo` 的 `body.data` 时它们没有声明，类型是 JSON 值。

详见公开指南的[返回体结构](/guide/response-bodies)。
