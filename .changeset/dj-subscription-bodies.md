---
'hana-music-api': minor
---

给 8 个电台榜单与订阅读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。订阅/取消订阅电台（`dj_sub`）和 DI.FM 频道订阅/取消订阅（`dj_difm_channel_subscribe`、`dj_difm_channel_unsubscribe`）是写操作，留给写操作批次，本批没有收窄返回体。

### 新增公开结构定义

- `djRadio_top` → `DjRadioTopBody`：成功对象只收紧 `code`，`message` 宽松；另有空字符串分支。`data` 在本账号的一次登录录制里是空数组，元素类型无法确认，未声明并原样透传；非法 `djRadioId` 返回 HTTP 400 空正文，网易云把 400 归一成 `status: 200`，SDK 返回 `""`。匿名调用返回 `code: 302`（录制 `djRadio_top.anonymous.json`），302 是特殊码，改造前归一成 resolve `status: 200`，现在按业务码 reject `status: 302`；本接口需要登录。
- `dj_sublist` → `DjSublistBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`count`、`time`、`hasMore`、电台展示字段、简介图文（复用 `ProgramDescPic`）和主播（复用 `PlaylistUser`）宽松。`rcmdtext`、`icon`、`liveInfo`、`manualTagsDTO` 等只见过 `null`，`participateUidList` 只见过空数组，均未声明。
- `dj_subscriber` → `DjSubscriberBody`：收紧 `code`、`subscribers`、`subscribers[].userId`；`time`、`hasMore`、昵称、头像、认证、关注状态和 `subscribeTime` 宽松。
- `dj_toplist` → `DjToplistBody`：收紧 `code`、`toplist`、`toplist[].id`；`updateTime`、排名、分数、分类、封面、计数和主播（复用 `PlaylistUser`）宽松。
- `dj_toplist_hours` → `DjToplistHoursBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`data.total`、`data.updateTime`、排名、分数、头像、认证和直播状态宽松，主播条目复用 `DjAnchorRank`；`msg` 在成功录制里只见过 `null`，未声明。
- `dj_toplist_newcomer` → `DjToplistNewcomerBody`：收紧字段与 `dj_toplist_hours` 相同，主播条目复用 `DjAnchorRank`。
- `dj_toplist_pay` → `DjToplistPayBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`data.total`、`data.updateTime`、排名、分数、名称、封面和创作者宽松；`msg` 在成功录制里只见过 `null`，未声明。
- `dj_toplist_popular` → `DjToplistPopularBody`：收紧字段与 `dj_toplist_hours` 相同，主播条目复用 `DjAnchorRank`。

### 共享结构

新增 core 导出 `DjAnchorRank`：`dj_toplist_hours`、`dj_toplist_newcomer`、`dj_toplist_popular` 的主播榜条目字段完全相同，按“三个模块声明结构相同才进 core”的门槛提升，只收紧主播自己的 `id`，`avatarDetail` 复用既有 `AvatarDetail`。同时导出既有 `AvatarDetail` 供 `DjAnchorRank` 复用，导出既有 core 结构 `ProgramDescPic` 供 `dj_sublist` 复用订阅列表里的简介图文；`PlaylistUser` 继续作为主播/订阅者记录的基座。`dj_toplist` 和 `dj_sublist` 的电台记录字段集合不同，各自留在模块里。三个主播榜的 envelope（`code`、`data.total`、`data.updateTime`、`data.list`）也相同，本批作为模块公开合同暂留，后续统一榜单结构时再抽 core（后续清理项）。

### 行为变化

- 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- **非 200 业务码的状态码变化**：成功对象只接受 `code: 200`，以前 HTTP 200 + 非 200 业务码会原样返回 `status: 200`，现在按业务码拒绝，`status` 等于正文里的 `code`、正文仍是网易云原文。本批探测到的路径：五个榜单和 `dj_sublist` 的非数字 `limit` 返回 `code: 400`（录制 `*.invalid-limit.json`）；大于 `100` 的 `limit` 只有 `dj_toplist_hours`、`dj_toplist_newcomer`、`dj_toplist_pay`、`dj_toplist_popular` 返回 `code: 400`，`dj_toplist`、`dj_sublist`、`dj_subscriber` 的 `limit=101` 在本批匿名探测里仍返回 200；`dj_subscriber` 缺少 `id` 返回 `code: 400`（录制 `dj_subscriber.missing-id.json`）。
- `djRadio_top` 匿名调用返回 `code: 302`（录制 `djRadio_top.anonymous.json`）。302 落在 `SPECIAL_STATUS_CODES` 里，改造前被归一成 resolve `status: 200`，现在按业务码 reject `status: 302`，`body` 保留原文；本接口需要登录。
- `djRadio_top` 的非数字 `djRadioId` 是 HTTP 400、空正文，网易云把 400 归一成 `status: 200`，所以这条路径仍 resolve `status: 200`、`body` 是空字符串。`DjRadioTopBody` 的成功对象和 `''` 是联合类型，空正文不会报 502。
- 空结果可以正常返回：`dj_toplist` 的 `offset=99999` 越界分页返回空 `toplist`（`dj_toplist.empty.json`）；`dj_sublist` 匿名返回空 `djRadios`、`count: 0`（`dj_sublist.anonymous.json`）；`dj_subscriber` 的 `time=1` 时间游标越界返回空 `subscribers`（`dj_subscriber.empty.json`）。`dj_toplist_hours`、`dj_toplist_pay`、`dj_toplist_popular` 没有 `offset`，`dj_toplist_newcomer` 的 `offset` 被上游忽略，`limit=0` 会被 SDK 的 `limit || 100` 替换成默认 `100` 再发送；本批录制和探测里没有可达的空结果，数组本身允许为空。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。榜单和 `dj_subscriber` 都保留同一请求的匿名对照：字段集合相同，差异只在宽松字段的实时值；`dj_sublist` 必须登录才能看到订阅，匿名录制是真实的空列表。所有录制保留完整列表，没有截取。

### 迁移

- 这 8 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- **调用方要处理按业务码拒绝的 400**：五个榜单和 `dj_sublist` 传非数字 `limit`、四个榜单（`hours`/`newcomer`/`pay`/`popular`）传大于 `100` 的 `limit`、`dj_subscriber` 缺少 `id` 时，以前 resolve HTTP 200 + 正文业务码，现在以 `status: 400` 拒绝；先补齐参数，或按 `status`/`code` 处理。`dj_toplist`、`dj_sublist`、`dj_subscriber` 的 `limit=101` 本批仍返回 200，不要按 400 处理。
- `djRadios[].id`、`toplist[].id`、`subscribers[].userId`、`data.list[].id` 是收紧的 `number`，不再需要判空；其余已声明字段是宽松字段，类型带 `null | undefined`。
- `djRadio_top` 的 `body` 类型是成功对象或 `''`：成功对象只保证 `code`（`message` 宽松），`data` 仍是原始 JSON 数组；非数字 `djRadioId` 返回 `""`。匿名调用会以 `status: 302` 拒绝，本接口需要登录。
- 列表接口的数组本身允许为空；分页不要假定一定有结果。

详见公开指南的[返回体结构](/guide/response-bodies)。
