---
'hana-music-api': minor
---

给 7 个播客与广播电台读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `broadcast_category_region_get` → `BroadcastCategoryRegionGetBody`：收紧 `code`、`data`、`data.categoryList`、`data.categoryList[].id`、`data.regionList`、`data.regionList[].id`；分类/地区名称宽松。
- `broadcast_channel_list` → `BroadcastChannelListBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；封面、名称、地区、来源、分数、订阅状态、房间号、`total` 和 `hasMore` 宽松。
- `broadcast_channel_currentinfo` → `BroadcastChannelCurrentinfoBody`：收紧 `code`、`data`、`data.id`、`data.playUrl`；节目编号、节目名、起止时间、时长、第三方编号和展示字段宽松。
- `broadcast_channel_collect_list` → `BroadcastChannelCollectListBody`：只收紧 `code`；`data` 只见过空数组，元素类型没有证据，未声明并原样保留。
- `voicelist_search` → `VoicelistSearchBody`：收紧 `code`、`data`；`data.total`、`data.hasMore` 宽松；列表元素未声明，原样保留。
- `voicelist_list_search` → `VoicelistListSearchBody`：收紧 `code`、`data`；`data.total`、`data.hasMore` 宽松；列表元素未声明，原样保留。
- `voice_lyric` → `VoiceLyricBody`：收紧 `code`、`data`；没有歌词时 `data` 是 `null`，声明为可以没有的路径，出现时 `data.lyricUrl` 收紧，`data.source`/`message` 只见过 `null`，未声明。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 非 200 返回码继续按业务拒绝原样转交：`broadcast_channel_currentinfo` 的已下架/无当前信息频道是 HTTP 200、正文 `code: 400`（录制 `broadcast_channel_currentinfo.delisted.json`），`voice_lyric` 的无播放权限声音也是 `code: 400`（录制 `voice_lyric.unavailable.json`），SDK 分别转交 `status: 400`。
- 空结果：`broadcast_channel_list` 的未知地区返回空列表和 `total: 0`（`broadcast_channel_list.empty.json`）；`broadcast_channel_collect_list`、`voicelist_search`、`voicelist_list_search` 的登录账号没有收藏/播客/声音，匿名调用同样为空；`voice_lyric` 的无歌词声音返回 `data: null`（`voice_lyric.without-lyric.json`）。`broadcast_category_region_get` 是静态目录，本批录制与探测未发现可达的空结果，数组本身允许为空。
- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`；7 个接口都保留了登录和匿名录制。`broadcast_category_region_get` 只有地区列表顺序不同，`broadcast_channel_list` 只有 11 处 `coverUrl` 的 CDN 主机（p3/p4）不同（`subed` 全 `false`、`total` 都是 `843`），`broadcast_channel_currentinfo` 只有 `currentTime` 不同；`broadcast_channel_collect_list`、`voicelist_search`、`voicelist_list_search`、`voice_lyric` 逐字段相同。

### 证据缺口

`voicelist_list`、`voicelist_detail`、`voicelist_trans` 和 `voice_detail` 是创作者工作台接口，只允许操作自己的播客/声音。本机账号没有播客；工作台接口对非所有者返回 `code: 400`，`voice_detail` 访问他人声音返回 `code: 401`，个别不存在的 id 返回 HTTP 200、正文 `code: 200`、`data: null`。这些路径都没有带字段的成功正文可录，不猜结构、不加 `ModuleBody`。写操作 `broadcast_sub`、`dj_sub`、`dj_difm_channel_subscribe`、`dj_difm_channel_unsubscribe`、`voice_delete` 不在本批范围。

### 迁移

- 这 7 个模块的 `body` 类型从原始 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `voice_lyric` 的 `data` 类型是 `{ ... } | null | undefined`，读 `lyricUrl` 前先判空；`voicelist_search`/`voicelist_list_search` 的 `data.list` 仍未声明，元素类型带 `unknown`/JSON，使用前自行校验。
- 读 `data.list[].id`、`data.id`、`data.playUrl`、`data.categoryList[].id`、`data.regionList[].id` 等收紧字段时不再需要自己判空。

详见公开指南的[返回体结构](/guide/response-bodies)。
