---
'hana-music-api': minor
---

给 7 个可逆写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `follow` → `FollowBody`：接口就是为了确认关注/取关成功，正文顶层的 `code` 收紧为 `200`；`msg` 是附带的提示，宽松。
- `mv_sub` → `MvSubBody`：收紧 `code`；`message` 宽松，`data` 只见过 `null`，未声明。
- `video_sub` → `VideoSubBody`：收紧 `code`；`message` 宽松，`data`、`debugInfo`、`failData` 只见过 `null`，未声明。
- `dj_sub` → `DjSubBody`：正文只带 `code`，收紧为 `200`。
- `broadcast_sub` → `BroadcastSubBody`：收紧 `code`；`data` 是操作结果标志、`message` 是提示，宽松。
- `resource_like` → `ResourceLikeBody`：正文只带 `code`，收紧为 `200`。
- `comment_like` → `CommentLikeBody`：正文只带 `code`，收紧为 `200`。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对时只丢这一项；`null` 照常保留为 `null`。
- 非 200 返回码的处理随运行时校验变化，正文仍是网易云原文：
  - `code: 250` 落在 2xx、不是请求层的特殊码，改造前 resolve（`status: 250`）；现在按业务拒绝，变成 reject（`status: 250`，`body`/`cookie` 相同），调用方需要 try/catch。涉及 `follow`、`resource_like` 的关注/点赞方向（设备风控：`follow` 是 `message: 关注异常` + `dialog` 风险提示，`resource_like` 是 `msg` 风险提示 + `data.dialog`）和 `comment_like` 的点赞方向（`msg: 点赞异常，请稍后再试！`、`data.dialog: null`，不是设备风险提示）。
  - `code: 408` 不在 2xx、也不是特殊码，改造前请求层就 reject（`status: 408`，`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态、`body`/`cookie` 不变：`video_sub` 重复收藏。
  - 只有 `201`、`302`、`400`、`502`、`800`–`803` 这类特殊码会被请求层归一成 `status: 200`；本批 7 个模块的录制里没有这些码。
- 录制证据：`mv_sub`、`video_sub`、`dj_sub`、`broadcast_sub` 对同一目标先正向再反向，并在两步之间和之后用读取接口回读核对（`mv_sublist`、`dj_sublist`、`broadcast_channel_collect_list`）；回读结论写在各录制文件的 `context.note`，没有单独保留状态读出文件。
- 证据缺口：`follow`、`resource_like`、`comment_like` 的正方向（关注、点赞）在本机与本网络被上游拒绝（`code: 250`），没有成功正文；三个模块的成功结构证据只来自反向操作（取关、取消点赞），回读只用于确认这次没有改变账号状态，正向成功返回的字段集合未验证。`mv_sub` 的重复收藏是幂等的 `code: 200`；`dj_sub`、`broadcast_sub` 的重复收藏也是 `code: 200`。

### 迁移

- 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 关注/点赞被拒时不再返回 `status: 250` 的 resolve 结果，改为抛错（`status: 250`，`body`/`cookie` 不变）；`video_sub` 重复收藏的 reject 行为不变。按 `status`/`code` 判断失败。

详见公开指南的[返回体结构](/guide/response-bodies)。
