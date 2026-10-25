---
'hana-music-api': minor
---

给搜索领域的 6 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `search` → `SearchBody`：收紧 `code`；`result` 可以没有（`type=2000` 走语音搜索），出现时 `result.songs`、`result.albums`、`result.artists`、`result.playlists`、`result.mvs` 可以没有，出现了则 `[].id` 收紧；专辑局部补了宽松的 `alg`、`containedSong`；各总数、`hasMore`、`hlWords`、`trp` 宽松。
- `search_default` → `SearchDefaultBody`：收紧 `code`、`data`、`data.showKeyword`、`data.realkeyword`；`styleKeyword`、`action`、`alg`、`bizQueryInfo`、`gap`、`searchType` 宽松。
- `search_hot` → `SearchHotBody`：收紧 `code`、`result`、`result.hots`、`result.hots[].first`；`second`、`iconType` 宽松。
- `search_hot_detail` → `SearchHotDetailBody`：收紧 `code`、`data`、`data[].searchWord`；`alg`、`score`、`content`、`source`、`iconType`、`iconUrl`、`url`、`message` 宽松，`trp` 整体宽松。
- `search_match` → `SearchMatchBody`：收紧 `code`、`result`、`result.songs`、`result.songs[].id`、`result.ids`；旧式歌曲字段和音质对象宽松。
- `search_multimatch` → `SearchMultimatchBody`：收紧 `code`、`result`；`result.orders` 是宽松字段；`result.artist`、`result.new_mlog`、`result.playlist` 可以没有，出现了则 `[].id` / `[].resourceId` 收紧。

歌曲共用 `Song`，专辑共用 `AlbumSummary`（`search` 局部补 `alg`、`containedSong`），歌单共用 `PlaylistSummary`；搜索歌手、MV 和 mlog 在模块内声明并把记录编号收紧。`search` 的 `type=2000` 语音搜索返回 `data` 形状，这批没有收窄，作为未声明字段原样返回。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 空结果可以正常返回：`search` 按 `type` 的空结果分别录到 `search.no-result.json`（`songs` 缺失）、`search.empty-albums.json` / `search.empty-artists.json` / `search.empty-playlists.json`（对应列表是 `[]`）和 `search.empty-mvs.json`（`mvs: null`）；`search_match.no-result.json` 是 `songs: []`、`ids: []`；`search_multimatch.no-result.json` 只有 `orders: []`，三个类别数组缺失。`search_hot`、`search_hot_detail`、`search_default` 的匿名录制、匿名复现和登录对照探测（后两者未保留录制）都没有发现可达的空结果。
- 只出现在录制里的 `null` 字段（如 `search` 的 `result.searchQcReminder` 和 `playlists[].score`、`search_default` 的 `data.styleKeyword.descWord`、`search_hot` 的 `third`、`search_multimatch` 的 `searchCircle`）没有声明，继续作为未声明字段原样保留。`search_hot_detail` 的 `alg` 只在部分录制里有值，声明成宽松字符串；`trp` 也是宽松字段。
- `search` 的本地输入拒绝分支（缺少 `keywords`）没有变化，仍然在发请求前返回 400。

### 迁移

- 这 6 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `search` 的 `body.result` 时类型带 `null | undefined`；读 `result.songs`、`result.albums`、`result.artists`、`result.playlists`、`result.mvs` 时同样带 `null | undefined`，出现时记录 `id` 已收紧。
- 读 `search_multimatch` 的 `result.artist`、`result.new_mlog`、`result.playlist` 时类型带 `null | undefined`；`result.orders` 是宽松的字符串数组，可能缺失或为 `null`。
- 新增声明的宽松字段（`hlWords`、`trp`、`alg`、`styleKeyword`、`iconUrl`、`containedSong`、旧式歌曲字段等）可能是 `null` 或缺失，使用前按宽松字段处理。

详见公开指南的[返回体结构](/guide/response-bodies)。
