---
'hana-music-api': minor
---

给榜单、新碟、新歌和热门歌手的 8 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `toplist` → `ToplistBody`：收紧 `code`、`list`、`list[].id`；`artistToplist` 整体宽松，榜单摘要另补宽松的 `tsSongCount`、`originalCoverId`。
- `top_album` → `TopAlbumBody`：收紧 `code`、`monthData`、`monthData[].id`；`weekData` 是可以没有的路径，出现时 `weekData[].id` 收紧。新碟记录补宽松的 `areaId`、`exclusive`。
- `top_artists` → `TopArtistsBody`：收紧 `code`、`artists`、`artists[].id`。
- `top_list` → `TopListBody`：收紧 `code`、`playlist`、`playlist.id`、`playlist.trackIds`、`playlist.trackIds[].id`。
- `top_playlist_highquality` → `TopPlaylistHighqualityBody`：收紧 `code`、`playlists`、`playlists[].id`；`total`、`lasttime`、`more`、`msg` 宽松。
- `top_song` → `TopSongBody`：收紧 `code`、`data`、`data[].id`；补宽松的 `popularity`、`starred`、`score`、`position`、`exclusive`、`playedNum`、`dayPlays`、`hearTime`、`starredNum`。
- `toplist_artist` → `ToplistArtistBody`：收紧 `code`、`list`、`list.artists`、`list.artists[].id`。
- `toplist_detail` → `ToplistDetailBody`：收紧 `code`、`list`、`list[].id`；`artistToplist`、`rewardToplist` 整体宽松，榜单摘要另补宽松的 `tsSongCount`、`originalCoverId`。

榜单摘要（`toplist.list`、`toplist_detail.list`、`top_list.playlist`、`top_playlist_highquality.playlists`）共用 `PlaylistSummary`；专辑共用 `AlbumSummary`，歌曲共用 `Song`。`top_artists` 和 `toplist_artist` 的列表是记录本身，`id` 必须在模块内收紧；共享的 `Artist.id` 仍是宽松字段，没有改动。`toplist`/`toplist_detail` 的 `list[].trackIds` 在录制里缺失，没有声明；`top_list` 的 `playlist.trackIds` 是调用方要用的 track 引用，按记录编号收紧。

### 行为变化

- 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `top_album.weekData` 是“可以没有”的路径：缺失或 `null` 照常返回，出现时里面的专辑 `id` 照样收紧。
- 空结果可以正常返回：`top_album` 的未来月份（`year=2030&month=1`）是 `monthData: []`，`top_song` 的 `type=999` 是 `data: []`，`top_artists` 越界分页是 `artists: []`，`top_playlist_highquality` 的旧游标是 `playlists: []` 且带 `msg`。
- `top_list` 的本地 `idx` 拒绝分支（`status: 500`、`{ code: 500, msg }`）和成功正文一起写进 `TopListBody` 的联合；`idx` 行为没有变化。
- 只出现在录制里的 `null` 字段（如榜单摘要的 `algType`、`artists`、`topTrackIds`，热门歌手的 `alg`、`identifyTag`、`isSubed`）没有声明，继续作为未声明字段原样保留。

### 迁移

- 这 8 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `top_album.weekData` 时类型带 `null | undefined`；读 `top_artists.artists[].id`、`toplist_artist.list.artists[].id`、`top_song.data[].id` 等收紧字段时不再需要自己判空。
- 新增声明的宽松字段（`areaId`、`exclusive`、`tsSongCount`、`originalCoverId`、`total`、旧式歌曲字段）可能是 `null` 或缺失，使用前按宽松字段处理。
- 读 `top_list` 的 `body` 时按 `code` 区分为成功正文或本地拒绝（`code: 500`）。

详见公开指南的[返回体结构](/guide/response-bodies)。
