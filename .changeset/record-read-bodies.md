---
'hana-music-api': minor
---

给 9 个播放记录读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `record_recent_song` → `RecordRecentSongBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`playTime`、`resourceType`、`banned`、`multiTerminalInfo`、`total`、`message` 和歌曲其余字段宽松。
- `record_recent_playlist` → `RecordRecentPlaylistBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；歌单摘要复用 `PlaylistSummary`，`lastSong`、`playTime`、`resourceType`、`total`、`message` 宽松。
- `record_recent_album` → `RecordRecentAlbumBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；专辑摘要复用 `AlbumSummary`，记录里附带的 `songs`（专辑的完整歌曲数组，录制里长度等于 `size`）、`lastSong`、`transName`、`transNames`、`playTime`、`resourceType`、`total`、`message` 宽松。
- `record_recent_video` → `RecordRecentVideoBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`data.id` 在 MLOG 里是字符串、在 MV 里是数字，类型是 `string | number`；`title`、`name`、`coverUrl`、`duration`、`creator`、`artists`、`playTime`、`resourceType`、`total`、`message` 宽松。
- `record_recent_dj` → `RecordRecentDjBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；名称、封面、主播、节目计数、分类和播放终端宽松。
- `record_recent_voice` → `RecordRecentVoiceBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.pubDJProgramData.id`；`pubDJProgramData` 复用 `DjProgram` 并补上最近播放列表额外返回的统计和分类字段，`commentCount`、播放终端和其余节目字段宽松。
- `history_recommend_songs` → `HistoryRecommendSongsBody`：收紧 `code`、`data`、`data.dates`，`data.dates[]` 是日期字符串；`data.songs` 在录制里只有 `null`，未声明；`purchaseUrl`、`description`、`noHistoryMessage` 宽松。
- `history_recommend_songs_detail` → `HistoryRecommendSongsDetailBody`：收紧 `code`、`data`、`data.songs`、`data.songs[].id`；`data.dates` 只见过空数组、`data.description` 只见过 `null`，未声明；`purchaseUrl`、`noHistoryMessage` 宽松。
- `music_first_listen_info` → `MusicFirstListenInfoBody`：收紧 `code`、`data`、`data.songInfoDto.songId`、`data.musicFirstListenDto.date`；四个信息块按可以没有处理，缺失或为 `null` 照常返回，出现时仍校验；`title` 和只见过 `null` 的面板未声明。

### 行为变化

- 这 9 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对只丢这一项；宽松字段的 `null` 原样保留。
- 六个最近播放接口和 `music_first_listen_info` 的结构定义用 `object | ''` 联合：`limit` 非数字（或回忆坐标缺少 `id`）时上游 HTTP 400 空正文被既有逻辑归一成 `status: 200`、`body: ''`，现在仍原样返回空字符串，不会误报 502。
- `history_recommend_songs_detail` 的日期格式不合法时上游返回 `code: 400`，SDK 继续按业务拒绝原样转交（`status: 400`），不报 502。

### 空结果与登录

- 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。
- 六个最近播放接口匿名调用返回 `total: 0`、`list: []`（各自一份 `.anonymous.json`），作为列表的真实空结果；登录录制分别有 40 首歌曲、15 个歌单、8 张专辑、4 个视频、1 个电台、10 个声音（截断记录见 `context.truncated`）。
- `history_recommend_songs` 登录和匿名的 `data.songs` 都是 `null`，匿名 `data.dates` 是空数组；`history_recommend_songs_detail` 匿名返回 `songs: []`；`music_first_listen_info` 匿名返回 `data: {}`。
- 本批结论只覆盖这些录制与探测，不据此推断所有账号、地区和上游版本一致；本批 9 个模块都是只读接口，没有写操作。

### 证据缺口

`history_recommend_songs` 的 `data.songs` 没有非 null 证据，元素类型猜不出，未声明；`history_recommend_songs_detail` 的 `data.dates` 只见过空数组，元素类型未声明。`record_recent_voice` 的 `replaceName`、`icon`、`pubDJProgramData.algReason`、`blurCoverUrl` 等只见过 `null` 的字段未声明，仍原样保留。

### 迁移

- 这 9 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 六个最近播放接口的 `body` 可能是 `object | ''`；调用方要先排除空字符串再读 `data`。`record_recent_video` 的 `data.id` 是 `string | number`，不要假定为单一类型。
- `HistoryRecommendSongsBody` 的 `data.songs` 仍未声明，读取前自行判断；`HistoryRecommendSongsDetailBody` 的 `data.dates`、`data.description` 也未声明。

详见公开指南的[返回体结构](/guide/response-bodies)。
