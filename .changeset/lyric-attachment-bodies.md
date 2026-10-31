---
'hana-music-api': minor
---

给 6 个歌曲附属与歌词模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `lyric` → `LyricBody`：收紧 `code`、`lrc`、`lrc.lyric`，没收录时 `lyric` 是“暂无歌词”；`tlyric`、`romalrc`、`klyric`、`lyricUser`、`transUser`（复用 `LyricUser`）、`pureMusic`、`needDesc`、`uncollected`、`sgc`、`sfy`、`qfy` 宽松；`briefDesc` 只见过 `null`，没有声明。
- `song_chorus` → `SongChorusBody`：收紧 `code`、`chorus`、`chorus[].id`、`data`、`data[].id`；起止时间和 `ugcLocked` 宽松。
- `song_music_detail` → `SongMusicDetailBody`：收紧 `code`、`data`、`data.songId`；各档音质（`h`、`m`、`l`、`sq`、`vi`、`sk`、`jm`、`je`）、`sks` 和 `error`、`message`、`success` 宽松；`hr`、`db` 只见过 `null`，没有声明。
- `song_wiki_summary` → `SongWikiSummaryBody`：收紧 `code`、`data`、`data.blocks`、`data.blocks[].id`；区块的 `showType`、`creatives[].resources[]`、`uiElement` 等 UI 字段和 `cursor`、`hasMore` 全部宽松。
- `song_lyrics_mark` → `SongLyricsMarkBody`：收紧 `code`、`data`；`message` 宽松。`markVOList`、`markCountList` 在录制里只出现过空数组，元素类型没有证据，未声明并原样保留。
- `song_lyrics_mark_user_page` → `SongLyricsMarkUserPageBody`：收紧 `code`、`data`；`data.offset`、`data.hasMore` 宽松。`data.markVOList` 只出现过空数组，未声明并原样保留。

本批没有“可以没有”（`Optional`）的路径：录到的 6 个模块在正常返回里都带齐了上面的收紧字段。

### 行为变化

- 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- `song_music_detail` 的未知歌曲：上游 HTTP 200、正文 `{ data: null, code: 400, message: '参数异常', success: false, error: true }`。SDK 以前 resolve `status: 200`，现在按业务拒绝原样转交，以 `status: 400` reject；正文不变，不报 502。调用方需要 `try/catch` 接住 `NcmApiResponse`，不能只检查 resolve 后的 `status`。
- 空结果：`song_chorus` 的未知歌曲返回 `chorus: []`、`data: []`（录制 `song_chorus.empty.json`）；`song_wiki_summary` 的未知歌曲仍返回 `code: 200`，只剩“相关歌单”一个区块；两个歌词摘录接口在本次录制账号上返回空的 `markVOList`。
- 老版歌词没有可达的空 `lrc`：未收录返回 `lrc.lyric` 为“暂无歌词”，纯音乐会带一行说明，所以 `lrc` 和 `lrc.lyric` 按收紧字段处理。

### 迁移

- 这 6 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- `song_wiki_summary` 的 `data.blocks` 和 `data.blocks[].id` 不再需要自己判空；区块内容（`creatives`、`uiElement`）仍是宽松字段，使用前按宽松字段处理。
- 两个歌词摘录接口目前只承诺 `data` 是对象，`markVOList` 里的记录形状没有声明；使用前自行校验。写入操作 `song_lyrics_mark_add`、`song_lyrics_mark_del` 已由本 release 的写操作批次补上 Body。

详见公开指南的[返回体结构](/guide/response-bodies)。
