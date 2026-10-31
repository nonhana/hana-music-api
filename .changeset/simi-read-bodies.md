---
'hana-music-api': minor
---

给 5 个相似内容读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `simi_artist` → `SimiArtistBody`：收紧 `code`、`artists`、`artists[].id`；歌手记录复用 `Artist` 的字段并在模块内收紧 `id`，另补宽松的 `alg`、`fansCount`；`name`、`picUrl`、`albumSize`、`musicSize`、`alias` 等宽松。
- `simi_mv` → `SimiMvBody`：收紧 `code`、`mvs`、`mvs[].id`；MV 记录复用 `MvSummary` 并补宽松的 `alg`，`cover`、`name`、`playCount`、`duration`、`artistId`、`artistName`、`artists` 宽松。
- `simi_playlist` → `SimiPlaylistBody`：收紧 `code`、`playlists`、`playlists[].id`；歌单记录复用 `PlaylistSummary` 并补宽松的 `alg`、`recommendReason`、`extProperties` 等推荐字段，`name`、`coverImgUrl`、`trackCount`、`playCount`、`subscribed`、`creator`、`tracks` 宽松。
- `simi_song` → `SimiSongBody`：收紧 `code`、`songs`、`songs[].id`；歌曲记录是旧版歌曲结构，复用 `ProgramMainSong` 并补宽松的 `alg`、`alias`、`mp3Url`、`privilege`、`recommendReason`、`sqMusic`、`transNames`。
- `simi_user` → `SimiUserBody`：只收紧 `code`；`userprofiles` 只有空数组证据、元素类型未知，没有声明，作为未声明字段原样保留。

### 行为变化

- 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `simi_artist`、`simi_song` 缺少 `id` 时上游返回 HTTP 200 + `code: 400`，以前按 `status: 200` 放行，现在以 `status: 400` 转交原文（错误正文键分别是 `message` 和 `msg`）。
- `simi_playlist`、`simi_user` 的 `ModuleBody` 增加空字符串分支：缺少 `id` 时上游 HTTP 400 空正文被归一成 `status: 200` 和空字符串，原样返回（不报 502）；两个 Body 类型因此是 `对象 | ''` 联合。

### 空结果与录制

- `simi_artist`、`simi_playlist`、`simi_song` 的未知 id 返回空数组（`simi_artist.unknown.json`、`simi_playlist.unknown.json`、`simi_song.unknown.json`）。
- `simi_mv` 传入未知 `mvid` 仍返回默认 5 条（`simi_mv.unknown-mvid.json`），本批录制与探测未发现可达的空结果；`mvs` 数组本身允许为空。
- `simi_user` 的登录账号用 15 首歌曲（含 `108485`）探测都返回空 `userprofiles`，只保留 `108485` 的录制（`simi_user.empty.json`），没有找到非空结果。
- 5 个模块都用登录账号录制（`context.viewer` 是 `authenticated`），录制前经 `login_status` 确认 `anonimousUser: false`；本批未保留匿名对照录制，不对匿名视角作相同性断言。

### 共享结构

- `ProgramQuality` 增加宽松的 `name`：相似歌曲的 `sqMusic` 录制里是空串。受影响的公开 Body 包括 `SimiSongBody`、`PersonalizedNewsongBody` 和 `DjProgram*` 等复用旧版音质档的结构；`name` 现在按字符串宽松校验，非字符串值会被丢掉，不再原样保留。

### 迁移

- 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `artists[].id`、`mvs[].id`、`playlists[].id`、`songs[].id` 时不再需要自己判空；列表本身允许为空数组。
- `userprofiles` 仍未声明，读取前要自行判断结构和元素类型。
- `SimiPlaylistBody`、`SimiUserBody` 是 `对象 | ''` 联合：读取字段前先用 `typeof body === 'string'` 区分空正文分支。

详见公开指南的[返回体结构](/guide/response-bodies)。
