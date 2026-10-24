---
'hana-music-api': patch
---

按 3.0.0 公布的“收紧与宽松”标准修正实现，发 3.0.1。

### 行为变化

- **搜索结果的列表改成“可以没有”**：云搜索的 `result.songs`、`result.albums`、`result.artists`、`result.playlists`，以及搜索建议的 `result.songs`、`result.artists`、`result.albums`、`result.playlists`、`result.allMatch`，缺失或为 `null` 时照常返回；出现了仍按每条记录的编号（`allMatch` 是 `keyword`）收紧校验。坏一条记录时返回 `UnexpectedUpstreamShape`（`status: 502`），不再让整列消失。这些列表的类型变为 `ReadonlyArray<T> | null | undefined`。
- **记录里套着的编号也宽松**：`playlist_create`、`playlist_detail`、`user_playlist` 的 `playlist.tracks[].id`，以及 `playlist_detail`、`playlist_track_all` 的 `privileges[].id`，类型从 `number` 变成 `number | null | undefined`。编号缺失或类型不对时只丢这个编号，不影响外层歌单或权限项。
- 删除只见过 `null`、猜不出类型的字段声明（`crbt`、`rtUrl`、`songJumpInfo`、`songFeature`、`fansGroup` 等 51 个字段名），它们继续作为未声明字段原样保留。没有字段再声明成 `Schema.MutableJson`。
- `experts`、`authType.tags`、登录 `bindings`、搜索建议 `order` 等字段按录制里实际出现的值声明为字符串、字符串数组或对象数组。

### 迁移

- 读搜索结果时，列表类型多了 `null | undefined`；不要再假设“有总数就一定有列表”。
- 以前遇到搜索结果里一条记录编号不对，会拿到一个没有该列表的 200 响应；现在会以 `UnexpectedUpstreamShape`（502）拒绝。需要容错时，调用方应自己决定是否重试或降级。
- `playlist.tracks[].id`、`privileges[].id` 读取类型多了 `null | undefined`。
- 被删除声明的字段仍是未声明字段，继续原样保留，读取类型仍是 JSON 值；没有新增收紧字段。
- `experts`、`authType.tags`、登录 `bindings`、搜索建议 `order` 的读取类型分别收窄为字符串记录、字符串数组、对象数组、字符串数组；它们仍都是宽松字段。

详见公开指南的[返回体结构](/guide/response-bodies)和仓库的 [`agent-docs/API_CONVENTIONS.md`](https://github.com/nonhana/hana-music-api/blob/master/agent-docs/API_CONVENTIONS.md#收紧与宽松)。
