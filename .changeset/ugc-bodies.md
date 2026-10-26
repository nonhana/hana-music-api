---
'hana-music-api': minor
---

给 7 个 UGC 百科只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `ugc_album_get` → `UgcAlbumGetBody`：收紧 `code`、专辑百科记录的路径 `data` 和专辑自己的编号 `data.albumId`。未知专辑返回 `code: 200` 却没有 `data`，所以 `data` 按“可以没有”处理：缺失或 `null` 照常返回，出现却没有 `albumId` 仍报 502。专辑名、封面、公司、发行时间、简介、语言、类型、标签，以及随行的歌手和歌曲记录全部宽松。
- `ugc_artist_get` → `UgcArtistGetBody`：收紧 `code`、`data`（可以没有）和 `data.artistId`；`artistName`、`alias`、头像、地区、类型、简介和 `production` 宽松，`transName` 只见过 `null`，没有声明。
- `ugc_artist_search` → `UgcArtistSearchBody`：收紧 `code`、`data`、`data.list` 和每条结果自己的编号 `data.list[].artistId`；无结果时 `list` 是空数组，`totalCount` 和 `msg` 宽松，`extraCount` 只见过空对象，没有声明。
- `ugc_mv_get` → `UgcMvGetBody`：收紧 `code`、`data` 和 `data.mvId`；MV 名、封面、发行时间、简介和随行的歌手、关联歌曲记录宽松。
- `ugc_song_get` → `UgcSongGetBody`：收紧 `code`、`data`（可以没有）和 `data.songId`；歌曲名、歌手、专辑引用、语言、歌词正文和翻译、播放地址、锁状态和时长宽松。
- `ugc_detail` → `UgcDetailBody`：收紧 `code` 和贡献内容的路径 `data`；`data.total` 宽松。当前账号没有贡献，`data.wikiDetailResultVoList` 只见过空数组，元素类型未知，不声明，原样保留。
- `ugc_user_devote` → `UgcUserDevoteBody`：收紧 `code`、`data` 和记录自己的编号 `data.userId`；`ugcCount`、`integration`、`cloudShell` 三个附带计数宽松。

### 行为变化

- 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `ugc_mv_get` 的未知 MV 返回上游 `code: 404`（正文只有 `message`）。404 不在特殊码表里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），并没有 resolve `status: 200`；现在 Body 校验按业务码 reject 相同状态（`UpstreamBusinessFailed`），公开 `status` 和 `body` 不变，只是失败类型变化。
- 未知专辑、歌手、歌曲仍是 `code: 200` 但正文没有 `data` 的成功返回，SDK 继续 resolve `status: 200`；`data` 缺失或为 `null`，调用方读取前要先判空。
- 输入仍是 legacy，不做 id 或关键字本地校验。

### 证据与缺口

- 录制来自 issue #102 B42，落在 `tests/fixtures/netease/ugc/`。登录对照先用 `login_status` 确认 `account.anonimousUser: false`；`ugc_detail` 和 `ugc_user_devote` 保留了匿名对照，未发现字段类型差异，其余五个模块只保留登录录制，不对匿名结构作相同性断言。
- `ugc_detail` 的当前账号没有贡献，登录和匿名都只有空列表，非空 `wikiDetailResultVoList` 的元素形状没有证据，是缺口；需要有效贡献账号补录后再收紧。
- `ugc_user_devote` 的两份录制里 `ugcCount`、`integration`、`cloudShell` 都是 0，非零计数没有证据；三个字段按宽松计数声明，缺了或类型不对只丢这一项。
- 录制里的账号编号已换成合成值（`10000001` / `10000002`），响应侧 `data.userId` 不是原始 uid。

### 迁移

- 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `ugc_mv_get` 的未知 MV 以前就按 `status: 404` reject，现在相同，公开状态和正文不变；专辑、歌手、歌曲百科读取要先判断 `body.data` 是否存在。

详见公开指南的[返回体结构](/guide/response-bodies#百科与用户贡献)。
