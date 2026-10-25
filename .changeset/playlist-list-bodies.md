---
'hana-music-api': minor
---

给 `top_playlist` 补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `top_playlist` → `TopPlaylistBody`：收紧 `code`、`playlists` 和每个歌单自己的编号 `playlists[].id`；歌单摘要共用 `PlaylistSummary`，并在模块内补了宽松的 `alg`、`backgroundImageId`、`originalCoverId`、`tsSongCount`，`total`、`more`、回显的 `cat` 宽松。
- 模块既有的 `avatarImgId_str` → `avatarImgIdStr` 改写保留，但只作用于成功返回体：`TopPlaylistBody` 描述改写后的最终体，录制保存上游原文；契约测试用测试内显式写出的转换与最终体逐字段比较。`code: 404` 等业务拒绝的正文原样透传，不做改写。
- `limit`/`offset` 等非数字参数时上游回 HTTP 400 空正文，网易云把它归一成 `status: 200`、`body: ''`；空字符串作为 `TopPlaylistBody` 的独立分支保留，不报 502。

### 行为变化

- `top_playlist` 开始做运行时结构校验：以前畸形返回原样放行，现在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失、`null` 或类型不对只丢这一项。
- 非 200 业务 `code` 仍按业务拒绝原样转交，不做字段改写。
- 空结果：`order=new` 返回真实空结果 `playlists: []`、`total: 0`、`more: false`（录制 `playlist/top_playlist.empty.json`）。
- 分页兜底：`order=hot` 下 `offset=680` 是真实尾页（6 条，含 `14089582600`，`more: false`，`playlist/top_playlist.last-page.json`）；`offset>=686` 返回本批录制里的另一份固定 6 条兜底列表（`18271967084` 等，与尾页不同，`limit` 不生效，`more: true`，`playlist/top_playlist.beyond-last-page.json`、`playlist/top_playlist.fallback-ignores-limit.json`）。
- 登录与匿名返回相同顶层键，条目顺序和值因个性化不同；登录录制里出现 `subscribed: true`，`creator.experts` 的键 `1`、`2` 都出现过；匿名只有键 `2`（`playlist/top_playlist.anonymous.json`）。
- 只见过 `null` 的 `algType`、`backgroundImageUrl`、`coverText`、`iconImgUrl`、`promptedMgcInfo`、`recommendText`、`relateResId`、`subTitle`、`title`、`topTrackIds` 等没有声明，继续作为未声明字段原样保留。

### 探测记录（可复现）

`order=hot`、登录 Cookie：

- `offset=1/50/600` → 各 50 条；`offset=680` → 6 条真实尾页（`more: false`，含 `14089582600`）；`offset=684` → 2 条；`offset=685` → 1 条（`more: false`）。
- `offset=686/687/690/692/700/1000/5000/100000/1000000` → 同一份固定 6 条兜底列表（`18271967084` 等，`more: true`，与 `offset=680` 的尾页不同）。
- `offset=686&limit=1` → 仍是同一份固定 6 条，`limit` 在兜底里不生效。
- `limit=0/1/50/100`（`offset=0`）、`offset=-5`、`limit=-1`、`order=bad`、`cat=''`、`cat=不存在的分类xyz` → 200 非空。

匿名：

- `order=new&limit=50` → `{ code: 200, playlists: [], total: 0, more: false, cat: '全部' }`（`playlist/top_playlist.empty.json`）。

参数错误（登录与匿名形态相同）：

- `limit=abc` / `offset=abc` → HTTP 400 空正文，SDK 归一成 `{ status: 200, body: '' }`（`limit=abc` 入库为 `playlist/top_playlist.invalid-limit.json`，`offset=abc` 是同一空正文形态，未单独入库）。

### 迁移

- `body` 类型从原始 JSON 变成收窄后的联合：成功时是 `TopPlaylistBody` 的对象分支，非数字参数时是空字符串 `''`；未声明字段仍在，但读取时是 JSON 值。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 成功分支的 `playlists[].id` 是 `number`；`creator`、`subscribers[]` 的编号和其余字段仍宽松，读取时类型带 `null | undefined`。
- 既有调用方拿到的字段名本来就是 `avatarImgIdStr`（不是录制原文里的 `avatarImgId_str`），不要按上游原文修正。
- 后续清理：`tsSongCount`、`originalCoverId` 目前在 `toplist`、`toplist_detail`、`top_playlist` 三处模块内声明，本批不提升到 core。

详见公开指南的[返回体结构](/guide/response-bodies)。
