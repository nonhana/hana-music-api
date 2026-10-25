---
'hana-music-api': minor
---

给 8 个专辑读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `album_detail` → `AlbumDetailBody`：收紧 `code`、`album`、`album.albumId`、`product`；数字专辑记录（`albumId`、`albumName`、`artistName` 等）在模块内声明，不复用 `AlbumSummary`，`product` 里的价格、售卖数量、简介和 `extInfo` 全部宽松。
- `album_detail_dynamic` → `AlbumDetailDynamicBody`：只收紧 `code`；收藏数、评论数、分享数、`isSub`、`albumNearbyProduct` 等全部宽松，普通专辑和数字专辑两种形态写在同一个结构里。
- `album_list` → `AlbumListBody`：收紧 `code`、`products`、`products[].albumId`；`albumName`、`price`、`saleNum`、`coverUrl` 等宽松。
- `album_list_style` → `AlbumListStyleBody`：收紧 `code`、`albumProducts`、`albumProducts[].albumId`；`artistNames`、`bought`、`hasNextPage` 等宽松。
- `album_new` → `AlbumNewBody`：收紧 `code`、`albums`、`albums[].id`；专辑记录共用 `AlbumSummary`，`total` 宽松。
- `album_newest` → `AlbumNewestBody`：收紧 `code`、`albums`、`albums[].id`；专辑记录共用 `AlbumSummary`。
- `album_privilege` → `AlbumPrivilegeBody`：收紧 `code`、`data`、`data[].id`；记录共用 `SongPrivilege`，播放/下载权限字段宽松。
- `album_songsaleboard` → `AlbumSongsaleboardBody`：收紧 `code`、`products`、`products[].albumId`；`hasMore` 只有 `year`/`total` 榜单才有，声明为宽松字段。

### 行为变化

- 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
- 非 200 返回码继续按业务拒绝原样转交，不报 502：`album_detail` 的非数字专辑/未知 id 是 `{ code: 404, message: '无专辑商品' }`，`album_list_style` 的越界分页是 `{ code: 404, message: '没有数据' }`，`album_privilege` 的未知专辑是 `{ code: 404 }`。
- 空结果：`album_new` 的越界分页返回 `albums: []`；`album_songsaleboard` 的未来年份返回 `products: []`、`hasMore: false`，`albumType=99` 的周榜返回空 `products` 且没有 `hasMore`。`album_list`（上游忽略 `offset`，录制 `offset=100000` 仍返回第一页）和 `album_newest`（没有分页）在本批录制与探测里未发现可达的空结果，`products`/`albums` 数组本身允许为空。两个详情接口 `album_detail`/`album_detail_dynamic` 没有记录列表，空结果不适用。
- `album_detail_dynamic` 的普通专辑和数字专辑形态不同（数字专辑多 `paid`、`sales`、`displayType`），两个形状都写进同一个对象，缺失的字段不会报错。
- 只出现在录制里的 `null` 字段（如 `album_detail` 的 `album.artist`、`album.artistInfoList`、`product.extInfo.grade`，`album_list` 的 `customPriceConfig`、`topfans`，`album_newest` 的 `songs`）没有声明，继续作为未声明字段原样保留。

### 迁移

- 这 8 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
- 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
- 读 `album_detail` 时按 `album.albumId` 取数字专辑编号（不是普通专辑的 `id`）；`product` 的价格、简介等仍是宽松字段，使用前按宽松字段处理。
- 读 `album_detail_dynamic` 的计数、`album_new.total`、`album_songsaleboard.hasMore` 时类型带 `null | undefined`。
- 读 `album_new.albums[].id`、`album_privilege.data[].id`、`album_songsaleboard.products[].albumId` 等收紧字段时不再需要自己判空。

详见公开指南的[返回体结构](/guide/response-bodies)。
