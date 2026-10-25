---
'hana-music-api': minor
---

给 6 个曲风读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `style_list` → `StyleListBody`：收紧 `code`、`data`、`data[].tagId`；曲风记录有三层嵌套，`childrenTags` 是宽松字段，子曲风的 `tagId` 也宽松。
- `style_detail` → `StyleDetailBody`：收紧 `code`；`data` 是可以没有的路径（未知曲风 id 返回 `data: null`），出现时 `data.tagId` 收紧；描述、封面、数量文案和登录后的偏好内容（`professionalReviews`、`favouriteSong`、`tagPortrait`）都宽松。
- `style_artist` → `StyleArtistBody`：收紧 `code`、`data.artists`、`data.artists[].id`；歌手记录复用 `Artist`，额外声明宽松的 `fansCount`。
- `style_album` → `StyleAlbumBody`：收紧 `code`、`data.albums`、`data.albums[].id`；专辑记录复用 `SimpleAlbum`，只把 `id` 收紧。
- `style_playlist` → `StylePlaylistBody`：收紧 `code`、`data.playlist`、`data.playlist[].id`；歌单摘要和创建者字段宽松。
- `style_song` → `StyleSongBody`：收紧 `code`、`data.songs`、`data.songs[].id`；歌曲复用 `Song`，其中只有 `id` 收紧。

四个带分页的曲风列表模块（`style_artist`、`style_album`、`style_playlist`、`style_song`）的 `data.page`（`cursor`、`size`、`more`、`total`）字段一致，共用新增的 `StylePage`，作为分页提示全部宽松。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对只丢这一项；`null` 原样保留。
- 空结果：四个带分页的曲风列表模块的未知曲风 id 返回 `code: 200` 和空数组（`style_artist.unknown-tag.json` 等）；`style_detail` 的未知曲风 id 返回 `code: 200`、`data: null`。这些路径以前原样返回，现在仍然成功返回，只是 `body` 变成了收窄后的类型。`style_list` 没有参数，本批录制与探测未发现可达的空结果，`data` 本身允许为空数组。
- 登录对照只保留了 `style_detail` 和 `style_song`：`style_detail` 匿名时 `professionalReviews`、`favouriteSong`、`tagPortrait` 是 `null`；`style_song` 匿名与登录的声明字段相同，差异只在宽松字段的值。
- 所有带 `tagId` 的曲风接口缺参时，上游返回 HTTP 200、正文 `code: 400`、`msg: 参数错误`（录制 `style_detail.missing-tag.json`、`style_artist.missing-tag.json`、`style_album.missing-tag.json`、`style_playlist.missing-tag.json`、`style_song.missing-tag.json`）。结构定义只接受 `code: 200`，这些路径从“原样返回 `status: 200`、正文非 200 业务码”变成 `status: 400` 的业务拒绝，正文仍是网易云原文；SDK 输入仍按 legacy 对象放行，不新增输入校验。
- 只出现在录制里的 `null` 字段（如 `style_detail` 的 `playRate`、`style_artist` 的 `awardTags`、`style_album` 的 `awardTags`/`displayTags`）和只见过空数组的字段（`style_album` 的 `songs`）没有声明，继续作为未声明字段原样保留。

### 迁移

- 这 6 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `style_detail` 的 `body.data` 可能缺失或为 `null`，读之前先判断；`style_list` 的子曲风编号（`childrenTags[].tagId`）是宽松字段，类型带 `null | undefined`。
- 读四个带分页的曲风列表模块的 `data.page.total`、`more` 时按宽松字段处理。

详见公开指南的[返回体结构](/guide/response-bodies)。
