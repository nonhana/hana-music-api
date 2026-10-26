---
'hana-music-api': minor
---

给 6 个歌单写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `playlist_update` → `PlaylistUpdateBody`：`/api/batch` 的顶层 `code` 和 `/api/playlist/desc/update`、`/api/playlist/tags/update`、`/api/playlist/update/name` 三条子路由的 `code` 收紧，子路由的结果键必须出现；子路由的 `message` 宽松。
- `playlist_track_add` → `PlaylistTrackAddBody`：只收紧 `code`。上游对自有歌单也回 `code: 401`（无权限操作歌单），没有录到成功正文，其余字段原样保留。
- `playlist_track_delete` → `PlaylistTrackDeleteBody`：只收紧 `code`。上游对自有歌单也回 `code: 401`（无权限操作歌单），没有录到成功正文，其余字段原样保留。
- `playlist_update_playcount` → `PlaylistUpdatePlaycountBody`：收紧 `code`；缺少 `id` 时上游回 HTTP 400 空正文，SDK 归一成 `status: 200`，空字符串作为独立分支保留，合计是 `{ code: 200, ... } | ''`。
- `playlist_import_name_task_create` → `PlaylistImportNameTaskCreateBody`：只收紧 `code`；`data`、`data.taskId`、`msg`、`message` 宽松。`local`/`link` 分支没有录制，不对 `data.taskId` 收紧。
- `playlist_import_task_status` → `PlaylistImportTaskStatusBody`：收紧 `code`、`data`、`data.tasks`、`data.tasks[].id`、`data.tasks[].status`；每条任务的其余字段和 `taskProcess` 宽松，只见过 `null` 的 `imgUrl`、`playlistName` 没有声明。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- **非 200 业务码的状态码变化**：`playlist_track_add` 缺 `pid`、`playlist_track_delete` 缺 `id`、`playlist_import_name_task_create` 缺 `text` 的上游 `code: 400` 改造前被 `SPECIAL_STATUS_CODES` 归一成 `status: 200` 放行，现在按业务拒绝返回 `status: 400`，`body` 是上游原文。401（无权限操作歌单）、404（歌单已删除/不存在）、500（系统异常）不在特殊码表里，改造前就是 reject `status: 401`/`404`/`500`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文都不变。
- `playlist_update` 的顶层 `code: 200` 不代表每条子路由都成功：标签超限时 `/api/playlist/tags/update` 回 `code: 400`，其余两条仍是 `200`。子路由的 `code` 是收紧字段，缺失或类型不对报 502。
- 已删除歌单的 tombstone 仍会接受写入：`playlist_update` 对 `playlist.status: 10` 的歌单回 `200` 并改掉名字/简介/标签，`playlist_update_playcount` 同样回 `200` 并接受播放计数。清理的含义是歌单不再出现在用户歌单列表，元数据并未抹除；调用方不要用返回码判断歌单是否还存在。
- `playlist_import_task_status` 的未知任务 id 回 `code: 200`、`data.tasks: []`、`data.taskProcess: null`；没有匹配到歌曲的任务是 `data.tasks[0].status: 'NOT_SONG_MATCH'`、`playlistId: 0`。

### 录制与清理

- 歌单类写操作都在一个临时歌单（tid `18526771500`）上完成；导入任务不是歌单操作，只创建任务，不建歌单。
- 临时歌单先用 `playlist_delete` 删除并保留响应，再用 `playlist_detail` 确认：仍回 `code: 200` 和 `playlist.status: 10`（删除标记），不是 HTTP 404。账号歌单快照从 58 张变成 57 张，只移除了这一张，没有新增，也没有既有歌单被改动。
- 删除后做错误路径探测时发现，已删除歌单仍接受 `playlist_update` 的名字/简介/标签和 `playlist_update_playcount` 的计数写入，两份 fixture 的 `context.note` 已写明。
- `playlist_import_name_task_create` 的无匹配文本只建了任务（`playlistId: 0`、`status: NOT_SONG_MATCH`），没有生成歌单。
- 录制在 `tests/fixtures/netease/playlist-write/`。成功响应里的歌单 id、任务 id、`createTime` 和 `context.recordedAt` 是随机值，不能复现；失败录制的 `code`、`message` 是稳定的。
- 证据缺口（列为缺口，不宣称成功证据）：`playlist_track_add`/`playlist_track_delete` 只有 `code: 401`（无权限操作歌单）和 `code: 404`（歌单已删除/不存在）的拒绝录制；自建歌单的隐私和公开、weapi/eapi/api、PC UA、重复添加、删除已在歌单里的歌都回 401，没有 `final: true` 的成功录制。这两份结构定义只收紧 `code`，成功边界只能用手写 body 做结构测试，不能当作上游成功正文的证据；`schema:audit module` 对这两个模块因无成功录制返回 exit 1，不能把本批描述成审计全绿。`playlist_import_name_task_create` 的 `local`/`link` 分支没有录制，`data.taskId` 因此不收紧。`playlist_update` 缺 `id` 时的 400 空正文没有录制，不猜它的形状。

### 迁移

- 这 6 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 参数错误现在会 reject：`playlist_track_add`/`playlist_track_delete`/`playlist_import_name_task_create` 的 400 从 `status: 200` 变成 `status: 400` 拒绝，用 `try/catch` 接住后按 `body.code` 处理，不要只看 HTTP 状态。
- 读 `playlist_update` 的子路由结果时，`code` 是必填数字（可能是 400 等业务码），`message` 可能缺失；顶层 200 不能当成三条都成功。
- 读 `playlist_update_playcount` 时 `body` 可能是空字符串（缺少 `id` 的情况），先判类型再当对象用。
- 读 `playlist_import_name_task_create` 时 `data` 可能缺失或 `null`（包括未录制的 `local`/`link` 分支），`data.taskId` 也可能缺失。
- 读 `playlist_import_task_status` 时 `data.tasks` 可能为空，`data.taskProcess` 可能是 `null`。

详见公开指南的[返回体结构](/guide/response-bodies)。
