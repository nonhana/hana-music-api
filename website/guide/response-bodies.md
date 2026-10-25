# 返回体结构

部分模块的返回体在 SDK 里做了运行时校验：SDK 在返回结果之前，先用这个模块的结构定义检查 `body`。声明的字段分两类：

- **收紧字段**：缺了这次调用就等于没成功。缺失或类型不对时，SDK 报“上游结构变了”（`status: 502`）。
- **宽松字段**：缺了只是少一项信息。可能缺失，也可能是 `null`；有值但类型不对时当成缺失，不报错。

还有一类**可以没有**的路径：正常情况下就可能整个缺失或为 `null`（例如搜索没有结果时的结果列表）。缺失或 `null` 时照常返回；出现了就按里面记录的收紧字段校验，坏一条记录会报 502，不会整列消失。

判断标准和写法的完整说明见 [`agent-docs/API_CONVENTIONS.md` 的“收紧与宽松”](https://github.com/nonhana/hana-music-api/blob/master/agent-docs/API_CONVENTIONS.md#收紧与宽松)。下面按领域列出每个模块的**收紧字段**和**可以没有**的路径；其余已声明字段都是宽松字段，未声明的字段原样保留在 `body` 里，类型是 JSON 值。

宽松字段里套着的记录（例如歌单的 `tracks[]`、`privileges[]`）不按“记录自己的编号”收紧：这些编号也宽松，类型不对只让这一项或整个宽松字段缺失，不会 502。只有不在宽松容器里的收紧字段才会报 `UnexpectedUpstreamShape`。例如 `song_detail.privileges[].id` 在必填的 `privileges` 数组里，缺失会 502；歌曲里可选的 `privilege` 对象里的 `id` 只会在 `privilege` 出现时校验，类型不对就让整个 `privilege` 当成缺失。

“可以没有”的路径不是宽松字段：它缺失或为 `null` 时照常返回；一旦出现，里面的记录仍按收紧字段校验。例如云搜索的 `result.songs`，没有结果时可以整个缺失，但出现了却有一首歌缺 `id`，会报 502。

## 登录

| 模块                                       | 结构定义                 | 收紧的字段                                                                                                                  |
| ------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [获取二维码 key](/api/user/login-qr-key)   | `LoginQrKeyBody`         | `code`、`data`、`data.unikey`                                                                                               |
| [生成二维码](/api/user/login-qr-create)    | `LoginQrCreateBody`      | `code`、`data`、`data.qrurl`、`data.qrimg`                                                                                  |
| [查询扫码状态](/api/user/login-qr-check)   | `LoginQrCheckBody`       | `code`（800–803）；802 的 `nickname`、`avatarUrl` 是宽松字段                                                                |
| [行为验证二维码](/api/other/verify-get-qr) | `VerifyGetQrBody`        | `code`、`data`、`data.qrCode`、`data.qrurl`、`data.qrimg`                                                                   |
| [发送验证码](/api/user/captcha-sent)       | `CaptchaSentBody`        | `code`；`data` 宽松                                                                                                         |
| [手机号登录](/api/user/login-cellphone)    | `LoginCellphoneBody`     | `code`、`cookie`、`account`、`account.id`、`profile`、`profile.userId`                                                      |
| 手机号登录被风控拦下                       | `LoginCellphoneRiskBody` | `code`（10004）、`message`、`redirectUrl`                                                                                   |
| [账号信息](/api/user/user-account)         | `UserAccountBody`        | `code`、`account`、`account.id`、`account.anonimousUser`、`profile`、`profile.userId`                                       |
| [登录状态](/api/user/login-status)         | `LoginStatusBody`        | `data`、`data.code`、`data.account`、`data.account.id`、`data.account.anonimousUser`、`data.profile`、`data.profile.userId` |
| [用户详情](/api/user/user-detail)          | `UserDetailBody`         | `code`、`profile`、`profile.userId`                                                                                         |
| [刷新登录](/api/user/login-refresh)        | `LoginRefreshBody`       | `code`、`cookie`                                                                                                            |
| [退出登录](/api/user/logout)               | `LogoutBody`             | `code`                                                                                                                      |

`account` 和 `profile` 在收紧的同时允许 `null`：没登录、登录失效时两者都是 `null`；匿名账号只有 `account`（`anonimousUser: true`），`profile` 是 `null`。`vipType`、`nickname`、`avatarUrl` 等其余账号字段宽松。

## 曲库

| 模块                                             | 结构定义               | 收紧的字段                                                                                  |
| ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------- |
| [用户歌单](/api/playlist/user-playlist)          | `UserPlaylistBody`     | `code`、`playlist`、`playlist[].id`                                                         |
| [歌单详情](/api/playlist/playlist-detail)        | `PlaylistDetailBody`   | `code`、`playlist`、`playlist.id`、`playlist.trackIds`、`playlist.trackIds[].id`            |
| [歌单中的歌曲](/api/playlist/playlist-track-all) | `PlaylistTrackAllBody` | `code`、`songs`、`songs[].id`                                                               |
| [歌曲详情](/api/music/song-detail)               | `SongDetailBody`       | `code`、`songs`、`songs[].id`、`privileges`、`privileges[].id`                              |
| [专辑内容](/api/album/album)                     | `AlbumBody`            | `code`、`songs`、`songs[].id`、`songs[].privilege.id`、`album`、`album.id`                  |
| [已收藏专辑](/api/album/album-sublist)           | `AlbumSublistBody`     | `code`、`data`、`data[].id`                                                                 |
| [已收藏歌手](/api/artist/artist-sublist)         | `ArtistSublistBody`    | `code`、`data`、`data[].id`                                                                 |
| [歌手热门歌曲](/api/artist/artist-top-song)      | `ArtistTopSongBody`    | `code`、`songs`、`songs[].id`、`songs[].privilege.id`                                       |
| [歌手专辑](/api/artist/artist-album)             | `ArtistAlbumBody`      | `code`、`hotAlbums`、`hotAlbums[].id`                                                       |
| [每日推荐歌曲](/api/recommend/recommend-songs)   | `RecommendSongsBody`   | `code`、`data`、`data.dailySongs`、`data.dailySongs[].id`、`data.dailySongs[].privilege.id` |
| [喜欢音乐列表](/api/music/likelist)              | `LikelistBody`         | `code`、`ids`                                                                               |

### 歌曲

各个接口里的歌曲共用同一份声明：

- 收紧：`id`。
- 宽松：其余声明字段，包括 `name`、`ar`（歌手的 `id`、`name`）、`al`（专辑的 `id`、`name`、`picUrl`）、`dt`（时长，毫秒）、`fee`（网易云给的付费类型，原样保留数值）、`no`、`cd`、`alia`、`tns`、`publishTime`，以及音质、权限、版权、封面和搜索用的简化字段。

`no` 是歌曲在 CD 里的序号，`0` 表示没有；`cd` 是自由文本（如 `"1"`、`"01"`、`"1/2"`、`"A"`、`"无"`），云盘上传、没匹配上曲库的歌是 `null`，SDK 不把它解析成数字；`alia`、`tns` 是字符串数组；`publishTime` 是毫秒时间戳，`0` 表示没有，专辑接口里的歌可能没有这个字段。

专辑记录（`album`、`hotAlbums`、云搜索的 `albums`）另外声明了宽松字段 `company`（唱片公司，没写时是空串）；`album_sublist` 的录制里没有这个字段，因此没有声明。

只出现过 `null`、没录到非 `null` 值的字段（如 `crbt`、`rtUrl`、`songJumpInfo`、`songFeature`）没有声明，仍会作为未声明字段原样保留在返回体里；只出现过空数组、元素类型猜不出的字段（如 `rtUrls`、`displayTags`）也一样。

歌手和专辑的编号和名字都可能缺失或为 `null`：传到云盘、没有匹配上曲库的歌（网易云返回的 `t` 是 1），歌手和专辑的编号是 0，名字是 `null`。这种歌只有上传者本人登录时能看到歌名；别人看、或者没有有效登录时，歌名也可能是 `null`。这些字段宽松后都不会再让整页 502。

### 专辑列表与数字专辑

| 模块                                                     | 结构定义                 | 收紧的字段                                         |
| -------------------------------------------------------- | ------------------------ | -------------------------------------------------- |
| [数字专辑详情](/api/album/album-detail)                  | `AlbumDetailBody`        | `code`、`album`、`album.albumId`、`product`        |
| [专辑动态信息](/api/album/album-detail-dynamic)          | `AlbumDetailDynamicBody` | `code`                                             |
| [数字专辑-新碟上架](/api/album/album-list)               | `AlbumListBody`          | `code`、`products`、`products[].albumId`           |
| [数字专辑-语种风格馆](/api/album/album-list-style)       | `AlbumListStyleBody`     | `code`、`albumProducts`、`albumProducts[].albumId` |
| [全部新碟](/api/album/album-new)                         | `AlbumNewBody`           | `code`、`albums`、`albums[].id`                    |
| [最新专辑](/api/album/album-newest)                      | `AlbumNewestBody`        | `code`、`albums`、`albums[].id`                    |
| [获取专辑歌曲的音质](/api/album/album-privilege)         | `AlbumPrivilegeBody`     | `code`、`data`、`data[].id`                        |
| [数字专辑&数字单曲-榜单](/api/album/album-songsaleboard) | `AlbumSongsaleboardBody` | `code`、`products`、`products[].albumId`           |

`album_detail` 是数字专辑商品详情，`album` 记录用 `albumId`、`albumName`、`artistName`，没有 `AlbumSummary` 的 `id`、`songs`；`product` 里的价格、售卖数量、简介和 `extInfo` 全部宽松，`board` 与购买状态字段也宽松。非数字专辑（录制 `album_detail.non-digital.json`）或未知 id 返回 `code: 404`（`无专辑商品`），SDK 按业务拒绝原样转交，不会报 502；本批录制与探测未发现可达的空结果。`album_detail_dynamic` 只有 `code` 收紧，普通专辑和数字专辑的字段不同（数字专辑多 `paid`、`sales`、`displayType`），写进同一个结构。

`album_new` 和 `album_newest` 的 `albums[]` 共用 `AlbumSummary`，只收紧 `id`；专辑里的 `songs` 只见过空数组或 `null`，没有声明。`album_new` 的 `offset` 越过总数时返回 `albums: []`（录制 `album_new.empty.json`），`total` 仍是 500；`album_newest` 没有分页，本批录制与探测未发现可达的空结果，数组本身允许为空。`album_list` 的上游忽略 `offset`：`album_list.offset-100000.json` 里 `offset=100000` 仍返回与第一页相同的 10 个 `albumId`。`album_list_style` 的越界分页返回 `code: 404`（`没有数据`）。这两个列表本批录制与探测未发现可达的空结果；数组本身允许为空。

`album_privilege` 的 `data[]` 共用 `SongPrivilege`，只收紧歌曲 `id`；登录后 `dl`、`pl`、`payed` 和 `freeTrialPrivilege.listenType` 会变化，登录对照录制保留为 `album_privilege.album-vip.json`。未知专辑 id 返回 `code: 404`；本批录制与探测未发现可达的空结果，数组本身允许为空。`album_songsaleboard` 的 `daily`/`week` 不带 `hasMore`（`album_songsaleboard.week.json`），`year`/`total` 才带，声明为宽松字段；未来年份（`year=2030`，录制 `album_songsaleboard.year-empty.json`）返回 `products: []`、`hasMore: false`，`albumType=99` 的周榜（录制 `album_songsaleboard.week-empty.json`）返回 `products: []` 且没有 `hasMore`，都是真实空结果。

登录对照只保留了 `album_detail` 和 `album_privilege`：其余六个模块的字段集合与类型相同；值差异来自封面 CDN、实时计数和榜单/新碟列表的实时更新，登录录制已删除。

### 歌单与用户

[用户歌单](/api/playlist/user-playlist)和[歌单详情](/api/playlist/playlist-detail)共用 `PlaylistSummary`，其中 `creator` 和可选的 `subscribers[]` 共用 `PlaylistUser`。这两个 TypeScript 类型都可以从 `hana-music-api` 根入口直接导入。

`PlaylistSummary` 只收紧 `id`。其余声明字段都是宽松字段，包括歌单名称、封面、`trackCount`、`updateTime`、`trackUpdateTime`、`playCount`、`privacy`、`specialType`、`status`、`description`、`tags`、`subscribed`、`creator`、`subscribers`、`tracks`，以及播放量、收藏数、分享数和各种审核/展示状态。`status` 正常为 0，已删除为 10，其他数值也原样保留。歌单里套着的 `tracks[].id` 和歌单详情/歌单中的歌曲的 `privileges[].id` 也宽松，类型不对只会丢掉这个编号，不会让整张歌单或整列消失。

`PlaylistUser` 的字段全部宽松：`userId`、`nickname` 也不例外。其余声明字段有 `accountStatus`、`authStatus`、`authenticationTypes`、`authority`、`avatarImgId`、`backgroundImgId`、`birthday`、`city`、`djStatus`、`gender`、`province`、`userType`、`vipType`、`avatarImgIdStr`、`avatarImgId_str`、`avatarUrl`、`description`、`detailDescription`、`signature`、`backgroundImgIdStr`、`backgroundUrl`、`anchor`、`defaultAvatar`、`followed`、`mutual`、`expertTags`、`avatarDetail`、`experts`；`experts` 是字符串到字符串的对象。

`subscribed` 是 `null` 表示网易云给的是没有登录的视角：Cookie 里的 `MUSIC_U` 已经失效时，用户歌单和歌单详情都是 `null`；完全不带 Cookie 时，用户歌单是 `null`，歌单详情是 `false`。

### 歌单编辑与收藏

| 模块                                                   | 结构定义                  | 收紧的字段                                                                   |
| ------------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------- |
| [红心](/api/music/like)                                | `LikeBody`                | `code`；`playlistId` 宽松，`songs` 没有声明                                  |
| [收藏专辑](/api/album/album-sub)                       | `AlbumSubBody`            | `code`；`time`、`message` 宽松                                               |
| [收藏歌手](/api/artist/artist-sub)                     | `ArtistSubBody`           | `code`；`data`、`message` 宽松                                               |
| [歌单分类](/api/playlist/playlist-catlist)             | `PlaylistCatlistBody`     | `code`、`all`、`all.name`、`categories`、`sub`、`sub[].name`                 |
| [新建歌单](/api/playlist/playlist-create)              | `PlaylistCreateBody`      | `code`、`id`、`playlist`、`playlist.id`；`playlist.tracks[].id` 宽松         |
| [删除歌单](/api/playlist/playlist-delete)              | `PlaylistDeleteBody`      | `code`                                                                       |
| [修改歌单简介](/api/playlist/playlist-desc-update)     | `PlaylistDescUpdateBody`  | `code`                                                                       |
| [修改歌单名称](/api/playlist/playlist-name-update)     | `PlaylistNameUpdateBody`  | `code`                                                                       |
| [调整歌单顺序](/api/playlist/playlist-order-update)    | `PlaylistOrderUpdateBody` | `code`                                                                       |
| [公开隐私歌单](/api/playlist/playlist-privacy)         | `PlaylistPrivacyBody`     | `code`                                                                       |
| [设置歌单标签](/api/playlist/playlist-tags-update)     | `PlaylistTagsUpdateBody`  | `code`                                                                       |
| [往歌单加歌或删歌](/api/playlist/playlist-tracks)      | `PlaylistTracksBody`      | `code`；`count`、`cloudCount`、`trackIds` 宽松；SDK 去掉 200 响应的额外包装  |
| [收藏或取消收藏歌单](/api/playlist/playlist-subscribe) | `PlaylistSubscribeBody`   | `code`                                                                       |
| [设置歌单封面](/api/playlist/playlist-cover-update)    | `PlaylistCoverUpdateBody` | `code`、`data`、`data.code`；`data.url`、`msg` 宽松                          |
| [歌曲排序](/api/music/song-order-update)               | `SongOrderUpdateBody`     | `code`；大批量调整可能回 `-1`，但网易云可能已经完成排序，SDK 仍按失败返回    |
| [申请图片上传凭证](/api/playlist/image-upload-token)   | `ImageUploadTokenBody`    | `code`、`data`、`data.imgId`、`data.token`、`data.uploadUrl`、`data.url_pre` |

歌单分类没有编号，靠名字来认，所以 `all.name`、`sub[].name` 收紧；分类的其他字段宽松。

## 榜单、新碟与新歌

| 模块                                               | 结构定义                     | 收紧的字段                                                                              |
| -------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| [所有榜单](/api/toplist/toplist)                   | `ToplistBody`                | `code`、`list`、`list[].id`；`artistToplist` 宽松                                       |
| [新碟上架](/api/album/top-album)                   | `TopAlbumBody`               | `code`、`monthData`、`monthData[].id`；`weekData` 可以没有，出现时 `weekData[].id` 收紧 |
| [热门歌手](/api/artist/top-artists)                | `TopArtistsBody`             | `code`、`artists`、`artists[].id`                                                       |
| [排行榜详情](/api/toplist/top-list)                | `TopListBody`                | `code`、`playlist`、`playlist.id`、`playlist.trackIds`、`playlist.trackIds[].id`        |
| [精品歌单](/api/playlist/top-playlist-highquality) | `TopPlaylistHighqualityBody` | `code`、`playlists`、`playlists[].id`                                                   |
| [新歌速递](/api/toplist/top-song)                  | `TopSongBody`                | `code`、`data`、`data[].id`                                                             |
| [歌手榜](/api/artist/toplist-artist)               | `ToplistArtistBody`          | `code`、`list`、`list.artists`、`list.artists[].id`                                     |
| [所有榜单内容摘要](/api/toplist/toplist-detail)    | `ToplistDetailBody`          | `code`、`list`、`list[].id`；`artistToplist`、`rewardToplist` 宽松                      |

榜单摘要（`toplist.list`、`toplist_detail.list`、`top_list.playlist`、`top_playlist_highquality.playlists`）共用 `PlaylistSummary`，只收紧 `id`；`tracks[]`、`creator`、`subscribers[]` 里的编号仍然宽松。`toplist` 和 `toplist_detail` 在模块内补了宽松的 `tsSongCount`、`originalCoverId`；这两个摘要接口的 `list[].trackIds` 在录制里缺失，没有声明。`top_list` 的 `playlist.trackIds` 是调用方要用的 track 引用，声明为收紧。歌手榜和热门歌手返回的歌手列表是记录本身，`id` 收紧：这两个模块在模块内局部覆盖了 `Artist.id`，没有改动共享的 `Artist`。

`top_album` 的 `monthData` 是当月的全部新碟，`weekData` 是本周新增；日本区当月录制只有 `monthData`、没有 `weekData`，所以 `weekData` 声明成可以没有的路径。新碟记录在 `AlbumSummary` 之外声明了宽松的 `areaId`、`exclusive`。`top_artists` 在 `offset` 越过总数时返回空数组和 `more: false`；`top_playlist_highquality` 在 `before` 早于全部歌单的 `updateTime` 时返回空列表和 `msg`，它的 `total` 也是宽松字段。`top_song` 的 `type=999` 返回 `data: []`；`top_album` 用未来月份（`year=2030&month=1`）录到 `monthData: []`。`toplist`、`toplist_detail`、`toplist_artist` 没有真实空结果路径，`top_list` 用不存在的 id 会得到上游错误而不是空榜单。

新歌记录在 `Song` 之外声明了旧式字段 `popularity`、`starred`、`score`、`position`、`exclusive`、`playedNum`、`dayPlays`、`hearTime`、`starredNum`，全部宽松；`bMusic`、`lMusic`、`hMusic`、`mMusic`、`sqMusic`、`mp3Url` 等没有声明，原样保留。

`top_list` 的 `idx` 参数不请求上游，直接在本地返回 `status: 500` 和 `{ code: 500, msg }`；这个拒绝分支和成功正文一起写进了 `TopListBody` 的联合，`code` 收紧、`msg` 宽松。

## 歌手、听歌排行与会员

| 模块                                              | 结构定义                  | 收紧的字段                                                                      |
| ------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| [歌手详情](/api/artist/artist-detail)             | `ArtistDetailBody`        | `code`、`data`、`data.artist`、`data.artist.id`                                 |
| [获取歌手描述](/api/artist/artist-desc)           | `ArtistDescBody`          | `code`、`introduction`                                                          |
| [歌手详情动态](/api/artist/artist-detail-dynamic) | `ArtistDetailDynamicBody` | `code`                                                                          |
| [歌手粉丝](/api/artist/artist-fans)               | `ArtistFansBody`          | `code`；`data` 可以没有，出现时 `data[].userProfile`、`userProfile.userId` 收紧 |
| [歌手粉丝数量](/api/artist/artist-follow-count)   | `ArtistFollowCountBody`   | `code`、`data`                                                                  |
| [歌手分类列表](/api/artist/artist-list)           | `ArtistListBody`          | `code`、`artists`、`artists[].id`                                               |
| [获取歌手 mv](/api/artist/artist-mv)              | `ArtistMvBody`            | `code`、`mvs`、`mvs[].id`                                                       |
| [关注歌手新 MV](/api/artist/artist-new-mv)        | `ArtistNewMvBody`         | `code`、`data`、`data.newWorks`、`data.newWorks[].mvId`                         |
| [关注歌手新歌](/api/artist/artist-new-song)       | `ArtistNewSongBody`       | `code`、`data`、`data.newWorks`、`data.newWorks[].songLists[].id`               |
| [歌手全部歌曲](/api/artist/artist-songs)          | `ArtistSongsBody`         | `code`、`songs`、`songs[].id`                                                   |
| [获取歌手视频](/api/artist/artist-video)          | `ArtistVideoBody`         | `code`、`data`、`data.records`、`data.records[].id`                             |
| [歌手单曲](/api/artist/artists)                   | `ArtistsBody`             | `code`、`hotSongs`、`hotSongs[].id`                                             |
| [听歌排行](/api/listen/user-record)               | `UserRecordBody`          | `code`；`allData` / `weekData` 可以没有，出现时 `[].song` 收紧                  |
| [VIP 信息](/api/vip/vip-info)                     | `VipInfoBody`             | `code`、`data`                                                                  |
| [VIP 信息 v2](/api/vip/vip-info-v2)               | `VipInfoV2Body`           | `code`、`data`                                                                  |

`data.artist.id`、`hotSongs[].id`、`data.records[].id` 是记录自己的编号，所以收紧；歌曲里套着的 `song.id`、MV 记录里的 `artist`、视频记录里的 `resource` 和会员权益对象是附带信息，字段宽松。听歌排行里 `allData` 和 `weekData` 按 `type` 二选一，两个都可以缺失或为 `null`。

歌手粉丝的 `data` 是可以没有的路径：越界分页/没有更多粉丝时上游返回 `data: null`（录制 `artist_fans.empty.json`，`offset=100000`），缺失或 `null` 都照常返回；出现时每个粉丝的 `userProfile` 和 `userProfile.userId` 按收紧校验，坏一条记录报 502。歌手分页列表 `artist_mv`、`artist_songs`、`artist_list` 在 `offset` 越过总数时返回空数组（录制 `artist_mv.empty.json`、`artist_songs.empty.json`、`artist_list.empty.json`），数组本身允许为空。`artist_video` 用越界 `cursor` 录到空 `records`（`artist_video.empty.json`）。`artist_desc` 的 `introduction` 在没有介绍条目时是空数组（`artist_desc.empty.json`）。

`artist_new_mv`、`artist_new_song` 返回的是登录账号关注歌手的新作品，登录录制都有非空结果：`artist_new_mv.default.json` 有 17 个 MV，`artist_new_song.default.json` 的 `newSongCount` 是 2213、原 20 个 block/62 首歌（截取保留 2 个 block、5 首歌，见 `context.truncated`）。`newWorks` 是需要校验的数组：匿名录制里是空数组（`artist_new_mv.anonymous-empty.json`、`artist_new_song.anonymous-empty.json`），这是正常结果；缺失、`null` 或坏一条记录都报 502。MV 的 `mvId` 和每首歌的 `songLists[].id` 收紧；MV 的 `artistId`、`artistName`、`artistImgUrl`、`mvName`、`playCount`、`duration`、`mvCoverUrl`、`publishTime`、`publishDate`、`artisAlias`、`artisTransName` 和新歌 block 的 `blockTitle`、`blockType`、`publishTime`、`albumId`、`albumSongCount`、`accompanimentIds` 都是宽松字段。

歌手全部歌曲的记录复用共享的 `Song`，另在模块内补了宽松的 `eq`，并把 `noCopyrightRcmd` 扩展成含 `expInfo`、`mvInfo` 的宽松结构。`artist_songs.default.json` 截取保留 30 首，`noCopyrightRcmd` 的嵌套证据在分页录制 `artist_songs.no-copyright.json`（`offset=70`，原始第 82 首；第 73 首在补录时已是 null）里。

MV 记录（`artist_mv` 的 `mvs[]`）本批在模块内声明：`id` 收紧，`artistName`、`duration`、`imgurl`、`imgurl16v9`、`name`、`playCount`、`publishTime`（`YYYY-MM-DD` 字符串）、`status`、`subed` 和 `artist`（复用宽松的 `Artist`）都是宽松字段。B9 的 MV 模块可以按三模块规则评估是否把它提升为共享结构。

登录对照：这 8 个匿名接口在带 Cookie 重录时声明类型相同，值差异只来自关注状态（`followed`、`follow`、`followDay`）和实时计数/CDN 地址，登录录制已删除；个别声明字段的值可能为 `null` 或非 `null`（如 `artist_fans` 的 `vipRights`），属于记录数据本身的差异。

## 播放

| 模块                                                             | 结构定义                | 收紧的字段                                                                                      |
| ---------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| [获取音乐 url - 新版](/api/music/song-url-v1)                    | `SongUrlV1Body`         | `code`、`data`、`data[].id`、`data[].url`、`data[].code`；`level`、`expi`、`freeTrialInfo` 宽松 |
| [获取客户端歌曲下载链接 - 新版](/api/music/song-download-url-v1) | `SongDownloadUrlV1Body` | `code`、`data`、`data.id`、`data.url`、`data.code`；`level`、`size` 宽松                        |
| [获取逐字歌词](/api/music/lyric-new)                             | `LyricNewBody`          | `code`、`lrc`、`lrc.lyric`；其余歌词形式和 `pureMusic` 宽松                                     |
| [听歌打卡](/api/music/scrobble)                                  | `ScrobbleBody`          | `code`                                                                                          |

播放地址和下载地址里，`url` 是 `null` 表示拿不到地址，原因看条目里的 `code`，不能只检查顶层 `body.code` 或 HTTP 状态。播放地址的 `freeTrialInfo` 不是 `null` 表示只能试听，`url` 是试听片段，`start`、`end` 是片段在整首里的起止秒数，不应假定固定为 30 秒；这两个字段本身是宽松字段。

下载地址的 `data` 是一个对象，不是数组。2026-10-21 使用真实国内 IP、不带账号 Cookie 请求会员歌 `1409311773`，`standard`、`higher`、`exhigh` 三档都返回顶层 `code: 200`，但 `data.code: -105`、`url: null`、`level: null`、`size: 0`；同一游客身份的播放接口仍返回试听片段。因此，这个只能试听的场景在下载接口中通过已声明的数值字段 `data.code` 识别，本次录制的值为 `-105`，表示当前身份没有下载权限，而不是拿到了可下载的试听文件。无版权的下载录制则是 `data.code: -110`（播放地址的无版权录制是 404）。这些是已录到的场景，不把 `-105` 解释为所有账号、所有歌曲都只能试听的通用结论，也没有录到会员到期的情况。

下载前同时检查 `data.code === 200`、`data.url !== null`、`data.size > 0`；不满足时标记下载失败，保留返回码说明原因，不要改用播放接口的试听地址补位。`size` 是宽松字段，缺失时无法核对文件字节数。下载录制中的 `freeTrialInfo` 均为 `null`，没有下载试听片段的证据；它按宽松字段声明，调用方不要假定下载接口一定会给试听片段。本次没有录到下载接口的 `code: 404`，不据此推断它的含义。

`level` 是实际给到的音质，可能比请求的低；`expi` 是播放地址有效的秒数。歌词除 `lrc` 外的几种可能整个缺失，也可能在、但 `lyric` 是空串，两种都表示没有这种歌词。

## 搜索

| 模块                                            | 结构定义               | 收紧的字段                                                                                                                                                                      |
| ----------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [云搜索](/api/search/cloudsearch)               | `CloudsearchBody`      | `code`、`result`；`result.songs`、`result.albums`、`result.artists`、`result.playlists` 可以没有，出现了则 `[].id` 收紧                                                         |
| [搜索](/api/search/search)                      | `SearchBody`           | `code`；`result` 可以没有（`type=2000` 走语音搜索），出现时 `result.songs`、`result.albums`、`result.artists`、`result.playlists`、`result.mvs` 可以没有，出现了则 `[].id` 收紧 |
| [搜索建议](/api/search/search-suggest)          | `SearchSuggestBody`    | `code`、`result`；`result.songs`、`result.artists`、`result.albums`、`result.playlists`、`result.allMatch` 可以没有，出现了则 `[].id` 或 `[].keyword` 收紧                      |
| [默认搜索关键词](/api/search/search-default)    | `SearchDefaultBody`    | `code`、`data`、`data.showKeyword`、`data.realkeyword`                                                                                                                          |
| [热门搜索](/api/search/search-hot)              | `SearchHotBody`        | `code`、`result`、`result.hots`、`result.hots[].first`                                                                                                                          |
| [热搜列表(详细)](/api/search/search-hot-detail) | `SearchHotDetailBody`  | `code`、`data`、`data[].searchWord`                                                                                                                                             |
| [本地歌曲匹配](/api/search/search-match)        | `SearchMatchBody`      | `code`、`result`、`result.songs`、`result.songs[].id`、`result.ids`                                                                                                             |
| [多类型搜索](/api/search/search-multimatch)     | `SearchMultimatchBody` | `code`、`result`；`result.orders` 宽松；`result.artist`、`result.new_mlog`、`result.playlist` 可以没有，出现了则 `[].id` / `[].resourceId` 收紧                                 |

云搜索按 `type` 只给一类结果。结果列表（`songs`、`albums`、`artists`、`playlists`）是可以没有的路径：没有结果时只有总数（0），列表整个缺失或是 `null`；出现了就按每项记录的编号（`[].id`）收紧校验，坏一条记录会报 502，不会整列消失。各总数（`songCount`、`albumCount`、`artistCount`、`playlistCount`）是宽松字段。专辑的其他声明字段是 `name`、`picUrl`、`artists`（`id`、`name`）、`publishTime`、`company`；歌手的其他声明字段是 `name`、`picUrl`、`musicSize`（歌曲数）；歌单的其他声明字段是 `name`、`coverImgUrl`、`trackCount`、`playCount`、`creator`（`userId`、`nickname`）。这些全部宽松，包括云搜索里的 `al.name`；共用歌曲的 `al.name` 本来就是宽松字段，不再需要单独放宽。

搜索建议默认按类别给出，某一类没有建议时对应列表整个缺失或是 `null`（包括 `playlists`），出现了就按每项建议的编号（`allMatch` 是 `keyword`）收紧校验；`type` 为 `mobile` 时只给关键词 `allMatch`，没有建议时 `result` 是空对象。每项建议的 `name` 都是宽松字段。

搜索（`/search`）的 `result` 是通到搜索结果的路径，按 `type` 只给一类列表；没有结果时只有总数（`songCount: 0`），列表可能是空数组（`albums`、`artists`、`playlists`）、`null`（`type=1004` 的 `mvs`）或整个缺失（`songs`），出现了就按每项记录的 `id` 收紧。空结果由 `search.no-result.json`、`search.empty-albums.json`、`search.empty-artists.json`、`search.empty-playlists.json`、`search.empty-mvs.json` 覆盖。`result` 本身可以没有，因为 `type=2000` 的语音搜索走另一条上游接口，返回 `data` 形状；这批没有收窄语音搜索的 `data`，它作为未声明字段原样返回。歌曲共用 `Song`，专辑共用 `AlbumSummary` 并局部补了宽松的 `alg`、`containedSong`，歌手、歌单和 MV 在模块内声明并把记录 `id` 收紧；各总数、`hasMore`、`hlWords`、`trp` 是宽松字段；歌单的 `score` 只见过 `null`，没有声明。

默认搜索关键词的 `data` 是通到关键词的路径，`data.showKeyword`（展示词）和 `data.realkeyword`（实际搜索词）是接口要返回的那一项，所以收紧；`styleKeyword`、`action`、`alg`、`bizQueryInfo`、`gap`、`searchType` 宽松。只见过 `null` 的 `imageUrl`、`logInfo`、`source`、`trp_id`、`trp_type`、`styleKeyword.descWord` 和 `message` 没有声明，原样保留。本批录制（`search_default.default.json`，另有一次登录对照探测，未保留录制）没有发现可达的空结果，`data` 在这些录制里都存在。

热门搜索的 `result.hots` 是通到热搜词的路径，每条记录的 `first` 是热搜词本身，收紧；`second`、`iconType` 宽松，只见过 `null` 的 `third` 没有声明。本批录制（`search_hot.default.json`，另有一次匿名复现和一次登录对照探测，后两者未保留录制）没有发现可达的空结果，`result.hots` 都是 10 条。热搜列表（详细）的 `data` 是通到列表的路径，每条记录的 `searchWord` 收紧；`score`、`content`、`source`、`iconType`、`iconUrl`、`url`、`alg`、`message` 宽松，`trp` 整体宽松（`rules` 是宽松字符串数组，`trp` 也可能是 `null`）。`alg` 在 `search_hot_detail.default.json` 里是 `null`、在 `search_hot_detail.second.json` 里有值，`trp` 只在后者出现；这两份录制和一次登录对照探测（未保留录制）都没有发现可达的空结果，`data` 都是 20 条。

本地歌曲匹配的 `result`、`result.songs` 和 `result.ids` 收紧，每首匹配歌曲的 `id` 和 `ids`（接口要返回的本地文件映射项）收紧；旧式歌曲字段（`popularity`、`score`、`hMusic` 等）宽松。空结果录制 `search_match.no-result.json` 是 `songs: []`、`ids: []`。多类型搜索的 `result` 收紧，`orders` 是宽松的类别顺序；`artist`、`new_mlog`、`playlist` 是可以没有的路径（无结果录制 `search_multimatch.no-result.json` 里只有 `orders: []`），出现了就按记录 `id` / `resourceId` 收紧；其余嵌套字段宽松。

## 评论

| 模块                                      | 结构定义              | 收紧的字段                                                                                                |
| ----------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| [歌曲评论](/api/comment/comment-music)    | `CommentMusicBody`    | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [专辑评论](/api/comment/comment-album)    | `CommentAlbumBody`    | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [歌单评论](/api/comment/comment-playlist) | `CommentPlaylistBody` | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [MV 评论](/api/comment/comment-mv)        | `CommentMvBody`       | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [视频评论](/api/comment/comment-video)    | `CommentVideoBody`    | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |

这五个固定资源评论列表共用 `src/core/upstream-schemas.ts` 里的 `CommentRecord`、`CommentReply` 和 `CommentUser`：本批录制里 5 个模块的评论记录字段和类型完全一致。`commentId` 是每条评论自己的编号，所以收紧；`user` 和 `beReplied` 是评论里套着的记录，字段全部宽松，包括 `beReplied[].beRepliedCommentId`。`likedCount`、`liked`、`favorited`、`time`、`timeStr`、`status`、`parentCommentId`、`commentLocationType`、`decoration`、`ipLocation`、`pendantData` 也是宽松字段。

`comments` 是通到评论列表的路径，缺失、`null` 或不是数组都报 502；空结果是真实可达的：无评论资源返回 `comments: []`（录制 `comment_music.empty.json`、`comment_album.empty.json`、`comment_playlist.empty.json`），越界分页返回 `comments: []`、`total` 保持原值。`hotComments` 是可以没有的路径：`offset` 越过总数时网易云整个不返回 `hotComments`（录制 `comment_music.out-of-range.json` 等），缺失或 `null` 都照常返回；出现时按 `commentId` 收紧校验，坏一条报 502。`topComments` 在录制里只见过空数组，元素类型猜不出，没有声明；`commentBanner` 只见过 `null`，也没有声明。两者和评论里的 `aiCommentLabel`、`showFloorComment`、`repliedMark`、`userBizLevels`、`medal`、`grade`、`likeAnimationMap` 等未声明字段一样原样保留。

5 份非空录制保留的是覆盖各字段的非连续子集，原条数与保留条数为：`comment_music` 20/15 → 5/5，`comment_album` 20/9 → 5/4，`comment_playlist` 20/15 → 5/4，`comment_mv` 20/15 → 6/4，`comment_video` 20/15 → 6/4（`comments`/`hotComments`）；`context.truncated.length` 记的是原数组长度。

`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId` 是宽松字段；`userId` 是查看者自己的编号，匿名时也存在。登录对照先用 `login_status` 确认 `account.anonimousUser: false`，再逐模块抽查：五个模块的非 `null` 路径与类型相同，登录响应只会在宽松字段上多出现值为 `null` 的路径（如 `comments[].user.vipRights`、`beReplied[].content`/`richContent`、`beReplied[].ipLocation.userId`、`beReplied[].user.avatarDetail`），这些字段本来就是宽松字段，登录录制未保留。`/api/resource/comments/${action}` 的 `comment` 模块是评论增删回复的写操作，无法在不产生真实副作用的前提下录全各 action，本批没有给它加结构定义。

## 导出约定

收窄返回体的模块从根入口导出结构定义和同名类型，名字是模块名转成 PascalCase 再加 `Body`，例如 `user_account` → `UserAccountBody`、`login_qr_check` → `LoginQrCheckBody`。导出了哪些结构定义，以上面按领域列出的表为准。

结构定义的值是函数，不是普通对象（`typeof UserAccountBody === 'function'`）。Standard Schema 接口在它的 `~standard` 属性上，用法见 [用结构定义校验数据](#用结构定义校验数据)。

## 成功码与失败处理

收窄返回体的模块只认可特定的 `body.code` 作为成功：

- **默认成功码**：`[200]`，适用于大部分模块。
- **例外**：`login_qr_check`（二维码轮询）的成功码为 `[800, 801, 802, 803]`，对应过期、等待、已扫码、已授权四种状态。

`code` 不在成功码列表时，SDK 把网易云的返回体原样作为失败抛出，`status` 取业务码（101–599 外钳位到 400）。例如扫码时要求行为验证的 8821、续期时登录已失效的 301、手机登录被风控的 10004。

## 读取类型

每个结构定义同名导出一个类型，是 `body` 的类型：

```ts
import type { LoginQrCheckBody, UserAccountBody } from 'hana-music-api';

const describe = (body: LoginQrCheckBody) =>
  body.code === 802 ? `${body.nickname ?? '有人'} 已扫码，等待确认` : body.code;

const isMember = (body: UserAccountBody) => (body.account?.vipType ?? 0) > 0;
```

`code` 是字面量，按 `code` 判断后 TypeScript 会收窄到对应的分支。宽松字段读出来的类型是 `T | null | undefined`，使用前要处理缺失和 `null`。只用类型时写 `import type`，不会把 SDK 打包进浏览器端。

## 用结构定义校验数据

结构定义是 [Standard Schema](https://standardschema.dev/) 对象，可以交给任何支持 Standard Schema 的库，也可以直接调 `~standard.validate`，不需要引入 Effect：

```ts
import { UserAccountBody } from 'hana-music-api';

const result = UserAccountBody['~standard'].validate(savedBody);
if (result.issues) {
  console.error(result.issues);
} else {
  console.log(result.value.profile?.nickname);
}
```

`validate` 是同步的，不需要 Effect 运行时。适合在测试里检查自己的假数据是否和 SDK 认可的结构一致。

对外只承诺 Standard Schema 接口和导出的类型。这些对象同时也是 Effect Schema，熟悉 Effect 的使用者可以照常组合使用，但这部分不在兼容承诺之内，Effect 升级大版本时可能变化。

## 网易云拒绝时

失败正文的处理已在 [成功码与失败处理](#成功码与失败处理) 说明。部分失败场景另外导出了结构定义，可用于精确错误处理：

```ts
import { loginCellphone, LoginCellphoneRiskBody } from 'hana-music-api';

try {
  await loginCellphone({ phone: 'your-phone', captcha: 'your-captcha' });
} catch (error: unknown) {
  const body = (error as { body?: unknown }).body;
  const risk = LoginCellphoneRiskBody['~standard'].validate(body);
  if (!('issues' in risk) || !risk.issues) {
    console.log('被风控拦截:', risk.value.message, risk.value.redirectUrl);
  }
}
```

失败结构定义（如 `LoginCellphoneRiskBody` 对应手机登录的 10004 风控）不在运行时自动校验，需要调用方按需使用。

## 结构变了时

返回码认识、但**收紧字段**缺失或类型不对时，Promise 以 `status: 502` 拒绝，`body` 带上出错的位置：

```json
{
  "code": 502,
  "msg": "Unexpected upstream shape in album at body.album.id: expected present, got missing",
  "upstreamShape": {
    "module": "album",
    "path": "body.album.id",
    "expected": "present",
    "actual": "missing"
  }
}
```

用 `body.upstreamShape` 判断是不是这种失败，不要解析 `msg`。`path` 指向 SDK 返回的 `body` 里的位置；`expected` 为 `present` 表示字段缺失，其余是期望的类型或取值。这种失败说明网易云改了返回结构，需要升级 SDK 或报告问题，重试通常没有用。

宽松字段缺失、是 `null` 或类型不对都不会来到这里：SDK 把类型不对的值当成缺失，缺失和 `null` 都原样返回。宽松字段整个值校验失败时也当成缺失，包括数组元素里的问题。“可以没有”的路径缺失或为 `null` 也不会来到这里；但路径出现、里面一条记录不合收紧字段校验时，仍会报这里说的 502。
