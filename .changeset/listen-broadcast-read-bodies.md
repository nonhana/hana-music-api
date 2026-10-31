---
'hana-music-api': minor
---

给 4 个一起听状态与最近常听读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `listentogether_status` → `ListentogetherStatusBody`：收紧 `code`、`data`、`data.inRoom`；`data.anotherFollowStatus` 宽松；`roomInfo`、`anotherDeviceInfo`、`data.status` 在录制里只见过 `null`，未声明并原样保留。
- `listentogether_sync_playlist_get` → `ListentogetherSyncPlaylistGetBody`：收紧 `code`、`data`；未加入/已失效房间的 `data` 是空对象，列表字段没有证据，未声明并原样保留。
- `listentogether_room_check` → `ListentogetherRoomCheckBody`：收紧 `code`、`data`、`data.joinable`、`data.status`；`data.copywriting` 宽松；`data.type` 只见过 `null`，未声明。
- `recent_listen_list` → `RecentListenListBody`：收紧 `code`、`data`；`data.resources` 在匿名调用里是 `null`，按可以没有处理，出现时 `data.resources[].resourceId` 收紧；标题、封面、落地链接和展示字段宽松。

### 行为变化

- 这 4 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对只丢这一项；宽松字段的 `null` 原样保留。

### 空结果与录制

- 一起听状态、同步歌单和房间检查都录到未加入/已失效状态。`listentogether_status` 返回 `inRoom: false`，`roomInfo`、`anotherDeviceInfo`、`data.status` 都是 `null`；`listentogether_sync_playlist_get` 的 `data` 是空对象；`listentogether_room_check` 返回 `status: "EXPIRED"`、`joinable: false`、`copywriting` 失效提示和 `type: null`。本批探测 `roomId=0`、`1`、`9999999999` 都是已失效状态，没有房间内的成功正文，房间字段未声明。
- `recent_listen_list` 登录账号返回 12 条资源（11 个歌单、1 张专辑），匿名返回 `title: null`、`resources: null`（`recent_listen_list.anonymous.json`），作为列表的不可用状态；`resources: []` 也按正常空列表接受。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`；3 个一起听接口保留登录和匿名录制，正文逐字段相同；`recent_listen_list` 的匿名正文是 `resources: null`。本批结论只覆盖这些录制与探测，不据此推断所有账号、地区和上游版本一致。

### 证据缺口

`voice_detail`、`voicelist_detail`、`voicelist_list` 是创作者工作台接口，只允许操作自己的播客/声音；本机账号没有播客，`voicelist_detail`/`voicelist_list` 返回 `code: 400`（`只允许操作自己的播客`），`voice_detail` 访问他人声音返回 `code: 401`（`不允许操作他人的声音`）。这些路径没有带字段的成功正文可录，不猜结构、不加 `ModuleBody`。

写操作 `broadcast_sub`、`listentogether_accept`、`listentogether_end`、`listentogether_heatbeat`、`listentogether_play_command`、`listentogether_room_create`、`listentogether_sync_list_command`、`voice_delete`、`voicelist_trans` 不在本节范围。`record_recent_voice` 是只读列表，由播放记录模块（`record-read-bodies`）交付。

### 只读但由听歌足迹模块交付

`listen_data_today_song`、`listen_data_total`、`listen_data_year_report`、`listen_data_report`、`listen_data_realtime_report` 由听歌足迹模块（`listen-stats-read-bodies`）交付，不重复实现、不保留录制。

### 迁移

- 这 4 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `RecentListenListBody` 的 `data.resources` 是 `数组 | null | undefined`，读取前先判空；`ListentogetherSyncPlaylistGetBody` 的 `data` 仍然没有声明字段，读取房间歌单前自行校验；`ListentogetherStatusBody` 的 `roomInfo` 未声明，房间信息形态要自行判断。
- 读 `data.inRoom`、`data.joinable`、`listentogether_room_check.data.status`、`data.resources[].resourceId` 时不再需要自己判空；`listentogether_status.data.status` 只见过 `null`，仍未声明，读取前自行判断。

详见公开指南的[返回体结构](/guide/response-bodies)。
