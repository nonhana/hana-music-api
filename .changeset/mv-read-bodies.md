---
'hana-music-api': minor
---

给 MV 领域的 8 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。收藏/取消收藏 MV（`mv_sub`）是写操作，本批没有收窄，留在后续写操作批次。

### 新增公开结构定义

- `mv_all` → `MvAllBody`：收紧 `code`、`data`、`data[].id`；`count` 在非零 `offset` 时可能整个缺失，和 `hasMore` 一起宽松。
- `mv_first` → `MvFirstBody`：收紧 `code`、`data`、`data[].id`。
- `mv_exclusive_rcmd` → `MvExclusiveRcmdBody`：收紧 `code`、`data`、`data[].id`；`more` 宽松。
- `top_mv` → `TopMvBody`：收紧 `code`、`data`、`data[].id`；`lastRank`、`score`、`hasMore`、`updateTime` 和嵌套的 `mv` 宽松。
- `mv_detail` → `MvDetailBody`：收紧 `code`、`data`、`data.id`；`mp` 和详情其余字段宽松。
- `mv_detail_info` → `MvDetailInfoBody`：收紧 `code`、`commentCount`、`shareCount`、`likedCount`；`liked` 宽松。
- `mv_url` → `MvUrlBody`：收紧 `code`、`data`、`data.id`、`data.url`、`data.code`。
- `mv_sublist` → `MvSublistBody`：收紧 `code`、`data`、`data[].vid`。

四个列表模块（`mv_all`、`mv_first`、`mv_exclusive_rcmd`、`top_mv`）共用新的 `MvSummary`：只收紧记录自己的 `id`，`alias`、`transNames`、`artists`（复用 `Artist`）等其余字段宽松；`top_mv` 在模块内补上榜字段和嵌套 `mv`。只见过 `null` 的 `desc`、`data.price`、`mp.msg`、`promotionVo` 和只见过空数组的 `videoGroup` 没有声明，继续原样保留。

### 行为变化

- 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 空结果可以正常返回：`mv_first` 用无效地区筛选、`mv_exclusive_rcmd` 用越界 `offset` 录到空 `data`；`mv_sublist` 匿名时 `data` 是空数组。`mv_all`、`top_mv`、`mv_detail` 本批录制与探测未发现可达的空结果；`mv_detail_info` 计数为 0 时三个字段仍在（`mvid=1` 探测 200）。
- `mv_url` 的 `data.url` 允许 `null`：上游拿不到地址时是 `null`，原因看 `data.code`（录制 `mv_url.unavailable.json` 时上游间歇返回 `-125`）。
- 其余列表模块的匿名与登录重录逐字段 diff 没有结构差异，登录对照录制已删除；`mv_sublist` 只对比到顶层字段（匿名时 `data` 是空数组），保留非空登录录制作为元素字段证据。
- `mv_detail_info` 的本地输入拒绝没有变化：非原始值 `mvid` 仍在发请求前返回 400。

### 迁移

- 这 8 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `mv_all` 的 `body.count`、`hasMore` 和列表记录里的宽松字段时类型带 `null | undefined`。
- 读 `mv_detail` 的 `body.mp`、`body.data.brs`、`body.data.desc` 时同样带 `null | undefined`；`data.id` 已收紧。
- 读 `mv_url` 的 `body.data.url` 时类型是 `string | null`，不要只检查顶层 `body.code`。
- 读 `mv_sublist` 的 `body.data[].vid` 时类型是 `string`；登录态和匿名态的列表长度可能不同。

详见公开指南的[返回体结构](/guide/response-bodies)。
