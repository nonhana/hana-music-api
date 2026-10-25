---
'hana-music-api': minor
---

给 6 个推荐读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `recommend_resource` → `RecommendResourceBody`：收紧 `code`、`recommend`、`recommend[].id`；歌单摘要复用 `PlaylistSummary`，另声明宽松的 `copywriter`、`picUrl`、小写 `playcount`、`type`、`alg`，`featureFirst`、`haveRcmdSongs` 宽松。
- `personalized` → `PersonalizedBody`：收紧 `code`、`result`、`result[].id`；卡片复用 `PlaylistSummary`，`category`、`hasTaste` 和卡片附加字段宽松。
- `personalized_mv` → `PersonalizedMvBody`：收紧 `code`、`result`、`result[].id`；记录复用 `MvSummary`，另声明宽松的 `picUrl`、`canDislike`、`copywriter`、`type`、`alg`；`trackNumberUpdateTime` 只见过 `null`，未声明。
- `personalized_newsong` → `PersonalizedNewsongBody`：收紧 `code`、`result`、`result[].id`；`song` 是旧版歌曲结构，复用 `ProgramMainSong`（`album` 复用 `SimpleAlbum`、`artists` 复用 `Artist`），另声明宽松的 `alias`、`exclusive`、`sqMusic`、`hrMusic`、`privilege`（`LooseSongPrivilege`）和 `transName`/`transNames`；`category`、`trp` 宽松。
- `personalized_privatecontent` → `PersonalizedPrivatecontentBody`：收紧 `code`、`result`、`result[].id`；`name` 和条目字段宽松。
- `personalized_privatecontent_list` → `PersonalizedPrivatecontentListBody`：收紧 `code`、`result`、`result[].id`；`more`、`offset` 和条目字段宽松；条目比 `personalized_privatecontent` 多 `time`、少 `alg`，结构在模块内单独声明。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 非 200 业务码的状态码变化：`personalized`、`personalized_newsong` 的非法 `limit` 和 `personalized_privatecontent_list` 的非法 `offset` 是 `{ code: 400, msg: '参数错误' }`，改造前经 `SPECIAL_STATUS_CODES` 映射为 resolve `status: 200`，现在被 Body 校验按业务拒绝为 reject `status: 400`、`body` 保留上游原文；`personalized_privatecontent_list` 的越界 `offset=100000` 是 `{ code: 404 }`，改造前是 resolve `status: 404`，现在是 reject `status: 404`。两者都不报 502。
- 空结果：本批录制和探测没有找到可达的空列表（`limit=0` 会回落到默认值，`personalized_mv`/`personalized_privatecontent`/`recommend_resource` 没有分页参数，越界 `offset` 返回业务错误），`recommend`/`result` 数组本身仍允许为空，契约测试用手写空数组覆盖。
- 登录对照：6 个模块都录了匿名和登录两份，登录侧先经 `login_status` 确认 `anonimousUser: false`；`personalized`、`personalized_mv`、`personalized_privatecontent`、`personalized_privatecontent_list` 两边的字段路径和类型相同，`recommend_resource` 的 `creator.expertTags` 匿名 6/6 是 `null`、登录 19 条中 14 条仍 `null`、5 条是非空数组，`personalized_newsong` 的差异都在宽松字段的 `null`/出现与否上，不改变收紧字段。

### 迁移

- 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 非 200 业务码从 resolve 变成 reject：调用方需要用 `try/catch`（或 Effect 的失败通道）接住 `NcmApiResponse`，`error.body` 是上游原文；不要再按 `status === 200` 判断这些参数错误。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `result[].id` / `recommend[].id` 时不再需要自己判空；`playcount`、`highQuality`、`more`、`offset`、`time` 等宽松字段的类型带 `null | undefined`。
- 推荐新歌的 `song` 是宽松字段，缺失或类型不对时整个 `song` 消失，读取前先判空。

详见公开指南的[返回体结构](/guide/response-bodies)。
