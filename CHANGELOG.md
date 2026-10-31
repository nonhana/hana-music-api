# hana-music-api 发布日志

## 3.2.0

### Minor Changes

- 0b7137a: 给 6 个账号校验与基础查询只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `cellphone_existence_check` → `CellphoneExistenceCheckBody`：收紧 `code` 和注册状态 `exist`（`1` 已注册、`-1` 未注册）；回显手机号、`nickname`、`avatarUrl`、`hasPassword`、`hasSnsBinded`、`countryCode` 宽松。
  - `nickname_check` → `NicknameCheckBody`：收紧 `code` 和 `duplicated`；`candidateNicknames` 只在昵称重复时提供，按“可以没有”处理，出现坏记录仍报 502；`nickname` 宽松。
  - `get_userids` → `GetUseridsBody`：收紧 `code` 和昵称到 user id 的映射 `nicknames`；没有匹配的昵称时映射是空对象，混合查询只返回存在的键。
  - `countries_code_list` → `CountriesCodeListBody`：收紧 `code`、国家分组 `data`、每组 `countryList` 和国家记录自己的区号 `countryList[].code`；`label`、`zh`、`en`、`locale` 和 `message` 宽松。
  - `verify_qrcodestatus` → `VerifyQrcodestatusBody`：收紧 `code`、`data` 和 `data.qrCodeStatus`；`data.detailReason` 与 `message` 宽松，缺失或 `null` 照常返回；有值但类型不对时丢这一项。上游成功码是字符串 `"200"`，请求层会归一成数字 200，结构定义同时接受两者。
  - `pl_count` → `PlCountBody`：只收紧 `code`；私信、通知、关注等计数和 `friend`、`eventUser`、`sceneComments`、`battle` 里的字段全部宽松（同 `user_subcount`）。

  ### 行为变化
  - 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `verify_qrcodestatus` 的空 `qr`（`code: 400`，`qrcode is null`）以前被 `SPECIAL_STATUS_CODES` 映射成 `status: 200` 放行，现在按业务码拒绝为 `status: 400`；未登录（`code: 301`，`un login`）不在特殊码表里，改造前请求层就 reject `status: 301`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变。两者的 `body` 都保留原文，`code` 由请求层归一成数字。
  - 空结果：`get_userids` 只查不存在的昵称时返回 `nicknames: {}`（`get_userids.no-match.json`），存在与不存在的昵称混合查询只返回存在的键（`get_userids.multi.json`）；`nickname_check` 昵称可用时没有 `candidateNicknames`。`countries_code_list` 没有分页或其他输入，默认参数探测返回 22 组、189 个国家（`bun run fixtures:record countries_code_list --out /tmp/b39-countries-probe`），未发现可达的空结果，数组本身允许为空。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`（账号 599663130）；`cellphone_existence_check`、`nickname_check`、`get_userids`、`countries_code_list` 本批未保留匿名对照，不对公开结构作相同性断言。`pl_count` 保留匿名录制，`pushMsg` 是 `null`、`eventUser` 缺失；`verify_qrcodestatus` 需要登录。
  - `verify_qrcodestatus` 没有可构造的扫码会话，只录到已失效二维码（`qrCodeStatus: 21`）；未扫（`0`）、已扫（`10`）、已确认（`20`）三态没有录制，未声明额外字段。

  ### 迁移
  - 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `nickname_check.candidateNicknames` 时类型带 `null | undefined`；`get_userids.nicknames` 的类型是字符串到数字的只读映射。
  - `verify_qrcodestatus` 的 `code` 类型同时包含 `200` 和 `'200'`，但运行时返回的是数字 200；`data.qrCodeStatus` 不再需要自己判空，`data.detailReason` 的类型带 `null | undefined`。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 8 个专辑读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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
  - 这些 404 都不在 `SPECIAL_STATUS_CODES` 里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变，不报 502：`album_detail` 的非数字专辑/未知 id 是 `{ code: 404, message: '无专辑商品' }`，`album_list_style` 的越界分页是 `{ code: 404, message: '没有数据' }`，`album_privilege` 的未知专辑是 `{ code: 404 }`。
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

- 0b7137a: 给 10 个歌手读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `artist_desc` → `ArtistDescBody`：收紧 `code`、`introduction`；`briefDesc`、`count`、`topicData` 宽松，相关专栏的专栏、正文和创建者编号不收紧。
  - `artist_detail_dynamic` → `ArtistDetailDynamicBody`：只收紧 `code`；关注状态、演出、视频数和推荐资源全部宽松。
  - `artist_fans` → `ArtistFansBody`：收紧 `code` 和粉丝列表 `data`（越界分页/没有更多粉丝时上游返回 `data: null`，声明为可以没有的路径），出现时 `data[].userProfile`、`userProfile.userId` 收紧；`vipRights` 宽松。
  - `artist_follow_count` → `ArtistFollowCountBody`：收紧 `code`、`data`；关注状态和各计数宽松。
  - `artist_list` → `ArtistListBody`：收紧 `code`、`artists`、`artists[].id`；`more` 宽松，歌手记录复用 `Artist` 并在模块内收紧 `id`。
  - `artist_mv` → `ArtistMvBody`：收紧 `code`、`mvs`、`mvs[].id`；`hasMore`、`time` 宽松，MV 记录本批在模块内局部声明。
  - `artist_new_mv` → `ArtistNewMvBody`：收紧 `code`、`data`、`data.newWorks`、`data.newWorks[].mvId`；匿名时 `newWorks` 是空数组，MV 的其余字段宽松。
  - `artist_new_song` → `ArtistNewSongBody`：收紧 `code`、`data`、`data.newWorks`、`data.newWorks[].songLists[].id`；匿名时 `newWorks` 是空数组，`songLists` 复用 `Song`，block 分组字段宽松。录制截取保留 2/20 个 block、5/62 首歌，`context.truncated` 记录原始数量。
  - `artist_songs` → `ArtistSongsBody`：收紧 `code`、`songs`、`songs[].id`；歌曲记录复用 `Song`，补宽松的 `eq`，并在模块内把 `noCopyrightRcmd` 扩展成含 `expInfo`、`mvInfo` 的宽松结构（分页录制 `artist_songs.no-copyright.json` 提供嵌套证据）；`more`、`total` 宽松。`artist_songs.default.json` 截取保留 30/100 首，`context.truncated` 记录原始数量。
  - `artist_video` → `ArtistVideoBody`：收紧 `code`、`data`、`data.records`、`data.records[].id`；`data.page` 和记录里的 `resource` 宽松。

  ### 行为变化
  - 这 10 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 这两个 404 都不在 `SPECIAL_STATUS_CODES` 里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变：未知歌手 id 的 `artist_follow_count` 是 `{ code: 404, message: '资源未找到', data: null }`，`artist_desc` 的未知 id 是 `{ code: 404 }`。
  - 空结果：`artist_fans` 的越界分页返回 `data: null`；`artist_mv`、`artist_songs`、`artist_list` 的越界分页返回空数组和各自的 `hasMore`/`more`；`artist_video` 的越界 `cursor` 返回空 `records`；`artist_desc` 的歌手没有介绍条目时 `introduction` 是空数组。
  - `artist_new_mv`、`artist_new_song` 的非空录制来自本机已登录账号：MV 17 个作品，新歌原 20 个 block/62 首歌（截取保留 2 个 block、5 首歌，`context.truncated` 记录原始数量）。匿名录制是空 `newWorks`（正常结果），两个接口的 `newWorks` 都是收紧数组，缺失、`null` 或坏记录都报 502；B9 的 MV 结构可以拿 `artist_new_mv.default.json` 和 `artist_mv.default.json` 对比后再决定是否提升为共享结构。
  - 登录对照：8 个匿名可用的接口带 Cookie 重录后字段集合和类型相同，值差异只来自关注状态、实时计数和 CDN 地址，登录录制已删除；`artist_new_mv`、`artist_new_song` 的非空录制只能带登录身份取得，匿名录制另存为 `anonymous-empty`。
  - 只出现在录制里的 `null` 字段（如 `artist_detail_dynamic` 的 `concert.simpleConcert`、`rcmdResource.picUrl`，`artist_video` 的 `resource.userProfile`、`mlogBaseData.userId`）没有声明，继续作为未声明字段原样保留。

  ### 迁移
  - 这 10 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `artist_fans` 的 `data` 类型是 `ReadonlyArray<...> | null | undefined`，使用前判空；`artist_songs`、`artist_mv`、`artist_list`、`artist_video` 的列表字段本身允许为空数组。
  - `artist_new_mv`/`artist_new_song` 的 `data.newWorks` 类型是 `ReadonlyArray<...>`（必需数组）；缺失或 `null` 会 502，不要判空。MV 的 `mvId`、新歌的 `songLists[].id` 已收紧，块内其余字段类型带 `null | undefined`。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 6 个评论扩展只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `comment_dj` → `CommentDjBody`：收紧 `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧。
  - `comment_event` → `CommentEventBody`：收紧字段与 `CommentDjBody` 相同。
  - `comment_floor` → `CommentFloorBody`：收紧 `code`、`data.comments`、`data.comments[].commentId`；`data.ownerComment` 是父评论附带信息，编号也宽松。
  - `comment_hot` → `CommentHotBody`：收紧 `code`、`hotComments`、`hotComments[].commentId`。
  - `comment_hug_list` → `CommentHugListBody`：收紧 `code`、`data.hugComments`；`data.currentComment` 是被抱评论的附带信息，编号也宽松。
  - `comment_new` → `CommentNewBody`：收紧 `code`、`data.comments`、`data.comments[].commentId`。

  `comment_dj`、`comment_event`、`comment_floor`、`comment_hot` 的评论记录继续复用 `CommentRecord`；`comment_hug_list`、`comment_new` 复用其中的宽松字段后，在各自模块内声明 v2 多出的楼层、视频、扩展信息和会员角标字段。评论里的 `user`、`beReplied`、`likedCount`、`time`、`decoration`、`ipLocation`、`pendantData` 等其余声明字段都宽松；`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId`、`hasMore`、`message` 等也宽松。

  ### 行为变化
  - 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `comment_dj`、`comment_event` 的 `hotComments` 是“可以没有”的路径：`offset` 越过总数时网易云整个不返回它，缺失或 `null` 都照常返回；出现时里面的评论记录仍按 `commentId` 收紧，坏一条报 502。
  - 空结果：零评论电台（`comment_dj.empty.json`）、零评论动态（`comment_event.empty.json`）、无评论资源（`comment_hot.empty.json`、`comment_new.empty.json`）都返回空列表；`comment_floor.empty.json` 返回 `data.comments: []` 并保留 `ownerComment`，`comment_hug_list.empty.json` 返回 `hugComments: []`、`hugTotalCounts: 0` 并保留 `currentComment`。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只抽查了本批匿名录制中非 `null` 的路径与类型；登录录制未保留；不对公开结构作相同性断言。
  - 只见过 `null` 或空容器的字段（如 `commentBanner`、`topComments`、`tag`、`likeAnimationMap`、`outShowComments`、`bottomTags`）没有声明，继续作为未声明字段原样保留。
  - 写操作：`comment_like`（点赞/取消）已由本 release 的写操作批次补上；`comment`（新增/删除/回复）和 `hug_comment`（抱一抱评论）都会产生真实副作用，仍需单独处理。

  ### 迁移
  - 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `comments[].user`、`comments[].beReplied`、`likedCount` 等宽松字段时，类型带 `null | undefined`。
  - 读 `comments[].commentId`、`data.comments[].commentId` 时不再需要自己判空；`hotComments` 可能整个缺失或是 `null`。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 5 个固定资源评论列表模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `comment_music` → `CommentMusicBody`：收紧 `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧。
  - `comment_album` → `CommentAlbumBody`：收紧字段与上面相同。
  - `comment_playlist` → `CommentPlaylistBody`：收紧字段与上面相同。
  - `comment_mv` → `CommentMvBody`：收紧字段与上面相同。
  - `comment_video` → `CommentVideoBody`：收紧字段与上面相同。

  `CommentRecord` 由这五个模块共用，`CommentUser`、`CommentReply` 是它的组成结构（一并导出便于复用）；本批录制里评论记录的字段和类型完全一致。评论里的 `user`、`beReplied`（含 `beReplied[].beRepliedCommentId`）、`likedCount`、`liked`、`favorited`、`time`、`timeStr`、`status`、`parentCommentId`、`commentLocationType`、`decoration`、`ipLocation`、`pendantData` 都宽松；`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId` 也宽松。

  ### 行为变化
  - 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在 `code`、`comments` 或 `comments[].commentId` 缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `hotComments` 是“可以没有”的路径：`offset` 越过总数时网易云整个不返回它，缺失或 `null` 都照常返回；出现时里面的评论记录仍按 `commentId` 收紧，坏一条报 502。
  - 空结果：无评论资源返回 `comments: []`、`hotComments: []`、`total: 0`（录制 `comment_music.empty.json`、`comment_album.empty.json`、`comment_playlist.empty.json`）；越界分页返回 `comments: []` 且没有 `hotComments`（各模块的 `out-of-range` 录制）。`comment_mv`、`comment_video` 本批录制与探测未发现可达的无评论资源。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false` 后抽查：五个模块的非 `null` 路径与类型相同，登录响应只会在宽松字段上多出现值为 `null` 的路径（如 `comments[].user.vipRights`、`beReplied[].content`/`richContent`、`beReplied[].ipLocation.userId`），登录录制未保留。
  - 只见过 `null` 或空数组的字段（如 `commentBanner`、`topComments`、`aiCommentLabel`、`showFloorComment`、`repliedMark`）没有声明，继续作为未声明字段原样保留。
  - `/api/resource/comments/${action}` 的 `comment` 模块承接评论新增、删除和回复三个写操作，无法在不产生真实副作用的前提下录全各 action，本批没有给它加 `ModuleBody`；建议放到写操作批次并取得明确许可后再处理。

  ### 迁移
  - 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `comments[].user`、`comments[].beReplied`、`likedCount` 等宽松字段时，类型带 `null | undefined`。
  - 读 `comments[].commentId` 时不再需要自己判空；`hotComments` 可能整个缺失或是 `null`。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 7 个数字专辑与会员只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `digitalAlbum_detail` → `DigitalAlbumDetailBody`：与 `album_detail` 共用同一个上游详情接口，结构复用 `AlbumDetailBody`；收紧 `code`、`album`、`album.albumId`、`product`。
  - `digitalAlbum_sales` → `DigitalAlbumSalesBody`：收紧 `code` 和销量映射 `data`（键是专辑 id，值是数字销量）。
  - `digitalAlbum_purchased` → `DigitalAlbumPurchasedBody`：收紧 `code`；`paidAlbums` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留；`total` 宽松。
  - `vip_timemachine` → `VipTimemachineBody`：收紧 `code`、`data`、`data.detail`（可以没有，无记录时为 `null`）、`data.detail[].rowKey` 和 `data.detail[].data`；每份周报的报告体必填，缺失、`null` 或非对象报 502；四种 `type` 的报告内容写进同一个宽松结构。
  - `vip_growthpoint` → `VipGrowthpointBody`：收紧 `code`、`data`、`data.userLevel`、`data.userLevel.userId`、`data.userLevel.growthPoint`；`levelCard` 宽松。
  - `vip_growthpoint_details` → `VipGrowthpointDetailsBody`：收紧 `code`、`data`、`data.details`；记录里的 `resourceId`、`descript`、`growthPoint`、`time` 宽松。
  - `vip_tasks` → `VipTasksBody`：收紧 `code`、`data`、`data.taskList`、`data.taskList[].taskItems`、`data.taskList[].taskItems[].taskId`；本批只录到一条任务，`taskId` 为字符串。

  ### 行为变化
  - 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对时丢这一项，`null` 原样保留。
  - `digitalAlbum_detail` 与 `album_detail` 的 `body` 形状一致，只是公开模块名不同。

  ### 非 200 业务码的状态变化
  - `digitalAlbum_detail` 未知 id 返回 `{ code: 404, message: '无专辑商品' }`，`digitalAlbum_sales` 缺 `ids` 返回 `{ code: 400, msg: '参数错误', massage: '参数错误' }`、空 `ids` 返回 `{ code: 500, message: '销量查询失败' }`。其中 `code: 400` 是特殊码，改造前被 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务拒绝 reject `status: 400`；`code: 404` 和 `code: 500` 不在特殊码表里，改造前就是 reject `status: 404`/`500`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`）。三种路径的 `body` 都是网易云原文。
  - 迁移：`digitalAlbum_sales` 缺 `ids` 的 `code: 400` 从 resolve `status: 200` 变成 reject `status: 400`，依赖它返回正文的调用方需要 `try/catch`；`digitalAlbum_detail` 的 404 和空 `ids` 的 500 改造前就 reject，公开状态不变。不要依赖错误文案（400 用 `msg`/`massage`，404/500 用 `message`），只看 `code`。

  ### 空结果
  - `digitalAlbum_purchased` 的 `paidAlbums` 为空数组；列表为空时 `offset=100000` 仍为空（录制 `digital-album/digitalAlbum_purchased.offset-100000.json`）。
  - `vip_growthpoint_details` 的 `offset=100000` 越过列表返回 `details: []`（录制 `vip/vip_growthpoint_details.offset-100000.json`）。
  - `vip_timemachine` 无记录的周区间返回 `data.detail: null`（录制 `vip/vip_timemachine.empty.json`，声明为可以没有）。
  - `vip_tasks` 在本批录制（匿名与登录）里没有出现可达的空任务列表。
  - `digitalAlbum_sales` 的未知专辑返回 `0`；空 `ids` 返回 `code: 500`，没有空映射形态。

  ### 登录对照
  - 先确认 `login_status` 的 `account.anonimousUser` 为 `false`。`digitalAlbum_detail` 的登录对照只在 `vipType` 等宽松字段上出现值差异，登录对照未保留录制。
  - 匿名对照录制保留为 `vip/vip_growthpoint.anonymous.json`、`vip/vip_growthpoint_details.anonymous.json`、`vip/vip_tasks.anonymous.json` 和 `digital-album/digitalAlbum_purchased.anonymous.json`；不对匿名与登录的公开结构作相同性断言。

  ### 其他
  - 写操作不在本批范围：`digitalAlbum_ordering`（下单/购买）和 `vip_growthpoint_get`（领取成长值）没有改动。

  ### 迁移
  - 读取 `digitalAlbum_detail` 时按 `body.album.albumId` 取数字专辑编号，`body.product` 的价格、简介和 `extInfo` 仍是宽松字段。
  - `digitalAlbum_sales.data` 是 `Record<string, number>`。
  - `digitalAlbum_purchased.paidAlbums` 只有空数组证据、元素类型未知、未声明；使用前请自行校验。录制账号未购买，也没有另一个已购买账号可补录。
  - `vip_timemachine.data.detail` 的类型包含 `null | undefined`，每份记录的报告体 `data` 必填；`vip_tasks` 的任务 `taskId` 已收紧为 `string`。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 11 个电台节目与 DI.FM 读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。两个 DI.FM 频道模块（`dj_difm_channel_subscribe`、`dj_difm_channel_unsubscribe`）已由本 release 的写操作批次补上 Body。

  ### 新增公开结构定义
  - `dj_program` → `DjProgramBody`：收紧 `code`、`programs`、`programs[].id`；`count`、`more` 宽松，节目记录复用 core 的 `DjProgram`（已声明字段宽松，未声明字段原样保留为 JSON；`programDesc` 简介图文和 `specialTags` 由 `dj_program_detail.anchors.json` 提供非空证据，`icon` 是对象但子字段只见过 `null`、`songs` 只见过空数组，都没有声明）。
  - `dj_program_detail` → `DjProgramDetailBody`：收紧 `code`、`program`、`program.id`；参与主播 `participateAnchors` 有非空证据（节目 3729504614，录制 `dj_program_detail.anchors.json`），元素只声明 `userId`、`type`、`anchorInfo`，`role`、`basicDivide`、`personalBuyLink`、`personalDivide` 只见过 `null`，未声明；`songs`、`programGuests` 在本批录制与探测的节目中未发现非空，元素结构未知，未声明。
  - `dj_program_toplist` → `DjProgramToplistBody`：收紧 `code`、`toplist`、`toplist[].program.id`；`rank`、`lastRank`、`score`、`programFeeType`、`updateTime` 宽松。
  - `dj_program_toplist_hours` → `DjProgramToplistHoursBody`：收紧 `code`、`data`、`data.list`、`data.list[].program.id`；`total`、`updateTime`、排名、分数和 `programFeeType` 宽松，`msg` 只见过 `null`，未声明。
  - `program_recommend` → `ProgramRecommendBody`：收紧 `code`、`programs`、`programs[].id`；`name`、`more` 宽松。
  - `dj_personalize_recommend` → `DjPersonalizeRecommendBody`：收紧 `code`、`data`、`data[].id`；主播复用 `ProgramDj`，`descPicList`、`discountPrice`、`icon`、`immersionAnimation`、`immersionCover`、`liveInfo`、`manualTagsDTO`、`replaceResource`、`scoreInfoDTO`、`shortName`、`videos` 只见过 `null`，`participateUidList` 只见过空数组，均未声明。
  - `personalized_djprogram` → `PersonalizedDjprogramBody`：收紧 `code`、`result`、`result[].id`；条目里的节目是另一种结构（多 `publish`、`subscribed`、`userId`、`adjustedPlayCount`），在模块内单独声明，只复用 `ProgramMainSong` 和 `ProgramDj`，节目里的电台摘要多 `whiteList`、`hightQuality`。
  - `dj_today_perfered` → `DjTodayPerferedBody`：只收紧 `code`。
  - `dj_difm_all_style_channel` → `DjDifmAllStyleChannelBody`：收紧 `code`、`data`、`data[].styles`、`data[].styles[].channels`、`data[].styles[].channels[].id`；`message`、`source`、风格和频道的展示字段宽松。
  - `dj_difm_playing_tracks_list` → `DjDifmPlayingTracksListBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`total`、`message`、`artist`、`audio`、封面、时长和 `wave` 宽松。
  - `dj_difm_subscribe_channels_get` → `DjDifmSubscribeChannelsGetBody`：只收紧 `code`，`message` 宽松。

  ### 共享结构

  本批新增 core 导出 `DjProgram`、`ProgramDj`、`ProgramMainSong`（只在内部使用，未加入根入口公开类型）：`dj_program`、`dj_program_detail`、`dj_program_toplist`、`dj_program_toplist_hours`、`program_recommend` 的节目记录声明结构相同（各录制里的宽松字段可有差异，例如 `reason` 只在 `program_recommend` 有非 `null` 值），按“三个模块声明结构相同才进 core”的门槛提升；节目里的 `mainSong`（旧版歌曲）、`dj` 主播（`PlaylistUser` 加 `brand`）、参与主播和电台摘要跟着放在 core，未单独导出。另外给既有共享结构 `SimpleAlbum` 补了宽松字段 `dolbyMark`（`personalized_djprogram` 与既有 `toplist_detail` 都有非 `null` 值）。`personalized_djprogram` 的节目和电台摘要字段不同，留在模块内，只复用 `ProgramMainSong` 和 `ProgramDj`；`dj_personalize_recommend` 的电台记录与已有电台列表记录字段不同，也留在模块内。

  ### 行为变化
  - 这 11 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - **非 200 业务码的状态码变化**：结构定义只接受 `code: 200`。`dj_program` 缺少 `rid` 的 `code: 400` 是特殊码，以前被归一成 resolve `status: 200`，现在按业务码 reject `status: 400`；`dj_program_detail` 未知节目 id 的 `code: 404` 不在特殊码表里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`）。正文都是网易云原文（录制 `dj_program.missing-rid.json`、`dj_program_detail.unknown.json`）。
  - 空结果可以正常返回：`dj_program`、`program_recommend` 的越界分页返回空数组（`*.empty.json`）；`dj_difm_all_style_channel` 的 `sources: '[]'` 返回空 `data`；`dj_difm_playing_tracks_list` 的未知 `channelId` 返回空 `data.list`、`total: 0`。`dj_program_toplist`（`limit` 由 SDK 默认 `100` 后再请求，上游忽略 `offset`）、`dj_program_toplist_hours`（SDK 默认 `100`，没有 `offset`）、`dj_personalize_recommend`（SDK 默认 `6`）、`personalized_djprogram`（没有分页参数）本批录制与探测未发现可达的空结果，数组本身允许为空。
  - `dj_today_perfered` 和 `dj_difm_subscribe_channels_get` 的 `data` 在匿名、登录和不同参数的探测里都是空数组，元素类型没有证据，未声明并原样保留。
  - 录制截取：`dj_program`（3/30）、`dj_program_toplist`（2/5）、`program_recommend`（3/5）、`personalized_djprogram`（4/6）按字段覆盖保留非连续子集，`dj_difm_all_style_channel` 保留 1/15 个风格（`channels` 未截取），`dj_difm_playing_tracks_list` 把每条 `wave` 截到 32/2001 个点；原始数量写在 `context.truncated`，索引写在 `context.note`。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。11 个模块都带 Cookie 重录过：登录录制能通过同一结构校验，宽松字段的值与覆盖有差异（`aiGenerated` 的 `null`/`boolean`、`radio.descPicList` 的 `null`/数组、`mainSong.mMusic`/`hMusic` 的 `null`/对象、`dj.experts` 的键集合）；登录录制已删除，只保留匿名录制，不对公开结构作相同性断言。
  - 本批模块的输入都按原样透传，`dj_program` 的 `asc` 类型检查和其余模块的参数行为没有变化。

  ### 迁移
  - 这 11 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - **调用方要处理按业务码拒绝的 400**：`dj_program` 未传 `rid` 时，以前 resolve HTTP 200 + 正文 `code: 400`，现在以 `status: 400` 拒绝；`dj_program_detail` 未知节目 id 的 404 改造前就 reject `status: 404`，公开状态不变。先补齐参数，或按 `status`/`code` 处理。
  - 节目里的 `programs[].id`、`program.id`、`toplist[].program.id`、`data.list[].program.id` 是收紧的 `number`，不再需要判空；`mainSong`、`dj`、`participateAnchors`、`radio` 和其余已声明字段是宽松字段，类型带 `null | undefined`，未声明字段（如 `icon`、`songs`）是原始 JSON。
  - `dj_today_perfered`、`dj_difm_subscribe_channels_get` 的 `body` 只保证 `code`（后者不保证 `message`），`data` 仍是原始 JSON 数组，读元素前要自行校验。
  - 列表接口的数组本身允许为空；分页不要假定一定有结果。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给电台领域的 10 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。本批不包含电台节目、DI.FM 和订阅写操作。

  ### 新增公开结构定义
  - `dj_banner` → `DjBannerBody`：收紧 `code`、`data`；banner 的 `targetId`、`targetType`、`pic`、`url`、`typeTitle`、`exclusive` 宽松。
  - `dj_catelist` → `DjCatelistBody`：收紧 `code`、`categories`、`categories[].id`；名称和各尺寸封面宽松。
  - `dj_category_excludehot` → `DjCategoryExcludehotBody`：收紧 `code`、`data`、`data[].id`；其余同 `dj_catelist`。
  - `dj_category_recommend` → `DjCategoryRecommendBody`：收紧 `code`、`data`、`data[].categoryId`、`data[].radios`、`data[].radios[].id`；`icon` 的 `type`、`value`、`color` 和其余展示字段宽松，`msg` 只见过 `null`，未声明。
  - `dj_detail` → `DjDetailBody`：收紧 `code`、`data`、`data.id`；`dj` 复用宽松的 `PlaylistUser` 并补 `canReward`、`rewardCount`，`commentDatas[]` 和其余展示字段宽松；`unlockInfo`、`activityInfo`、`toplistInfo`、`labelDto`、`labels`、`toast`、`limitFreeToast`、`msg` 只见过 `null`，未声明；付费电台录制覆盖 `feeInfo` 的顶层字段和 `modules[]`（含 `modules[].data[]` 节目记录、旧版 `mainSong` 及其 `album`/`artists`），`feeInfo.discountPrice` 只见过 `null`，未声明，`feeInfo.videos` 只见过空对象，声明为空对象。
  - `dj_hot` → `DjHotBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`hasMore`、名称、封面、分类、计数、`copywriter`、`buyed` 和 `dj` 主播宽松。
  - `dj_radio_hot` → `DjRadioHotBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`count`、`hasMore`、价格、计数、`descPicList` 图文、`operateUidList`/`participateUidList` 和 `dj` 主播宽松；`shortName` 只见过 `null`，未声明。
  - `dj_recommend` → `DjRecommendBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`name` 和其余电台字段宽松。
  - `dj_recommend_type` → `DjRecommendTypeBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`descPicList`、`lastUpdateProgramName` 和其余字段宽松。
  - `dj_paygift` → `DjPaygiftBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`hasMore`、价格、计数和 `subed` 宽松，`msg`、`icon`、`traceId`、`playCount` 只见过 `null`，未声明。

  ### 共享结构

  本批只有 `dj` 主播复用已有的 `PlaylistUser`（`dj_hot`、`dj_recommend`、`dj_radio_hot`、`dj_recommend_type`、`dj_detail`），没有新增 core 导出。电台记录按接口分成三套在模块内声明：`dj_hot`/`dj_recommend` 的 `Radio` 16 个字段完全相同，但只有两个消费方；`dj_radio_hot`/`dj_recommend_type` 的 `Radio` 只差 `lastUpdateProgramName` 和 `DescPic` 的 `height`/`width`；`dj_category_recommend`/`dj_paygift` 的短推荐记录与上面两套都不同。三套都不满足“三个模块字段完全相同”的门槛，因此没有提升到 core。`dj_catelist` 与 `dj_category_excludehot` 的分类记录字段相同，但只有两个模块使用，同样留在模块里。

  ### 行为变化
  - 这 10 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - **非 200 业务码的状态码变化**：结构定义只接受 `code: 200`。`dj_detail`、`dj_radio_hot`、`dj_recommend_type` 缺少 `rid`、`cateId`、`type` 和 `dj_hot`、`dj_radio_hot`、`dj_paygift` 非数字 `limit` 的 `code: 400` 是特殊码，以前被归一成 resolve `status: 200`，现在按业务码 reject `status: 400`（录制 `*.missing-param.json`、`*.invalid-limit.json`）；`dj_detail` 未知 `rid` 的 `code: 404`、`msg: radio not exist` 不在特殊码表里，改造前就 reject `status: 404`，现在仍 reject 相同状态（录制 `dj_detail.unknown-rid.json`）。其余 5 个模块没有必选或可非法化的参数，本批没有录到其它非 200 业务码。
  - 空结果可以正常返回：`dj_hot`、`dj_radio_hot`、`dj_paygift` 的越界分页返回空数组和 `hasMore: false`（录制 `*.empty.json`）；`dj_recommend_type` 的未知分类返回空数组（录制 `dj_recommend_type.empty.json`），`dj_radio_hot` 的未知分类返回空数组和 `count: 0`（录制 `dj_radio_hot.empty-cate.json`）。`dj_banner`、`dj_catelist`、`dj_category_excludehot`、`dj_category_recommend`、`dj_recommend` 本批录制与探测未发现可达的空结果，数组本身允许为空。
  - `dj_radio_hot` 的非空录制按字段覆盖保留非连续子集（索引 7/8/19/23，原始 31 条，`context.truncated` 记录 `path: "body.djRadios"`、`length: 31`）；其余模块保留完整列表。
  - 登录对照在本地用登录 Cookie 重放 `login_status` 确认过 `account.anonimousUser: false`；本批未保留登录对照录制，不对公开结构作相同性断言。
  - 本批模块都没有本地输入拒绝分支，参数仍按原样透传给上游。

  ### 迁移
  - 这 10 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - **调用方要处理按业务码拒绝的 400**：`dj_detail`、`dj_radio_hot`、`dj_recommend_type` 未传 `rid`、`cateId`、`type`，`dj_hot`、`dj_radio_hot`、`dj_paygift` 传了非数字 `limit` 时，以前 resolve HTTP 200 + 正文 `code: 400`，现在以 `status: 400` 拒绝；`dj_detail` 未知 `rid` 的 404 改造前就 reject `status: 404`，公开状态不变。先补齐或修正参数，或按 `status`/`code` 处理。
  - 读 `dj_*` 的电台记录时，只有条目自己的 `id` 是收紧的 `number`；名称、封面、分类、计数、价格、`dj` 主播等宽松字段类型带 `null | undefined`，主播里的 `remarkName` 没有声明。
  - `dj_detail` 的 `commentDatas` 是宽松字段，坏一条评论会丢掉整个 `commentDatas`；`feeInfo` 的顶层和 `modules[]` 已声明（节目记录和旧版 `mainSong` 的字段类型带 `null | undefined`），`feeInfo.discountPrice` 未声明，`feeInfo.videos` 是空对象。
  - `dj_radio_hot` 的 `operateUidList`、`participateUidList` 是宽松数字数组，类型带 `null | undefined`；`shortName` 未声明。
  - 列表接口的数组本身允许为空；分页不要假定一定有结果。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 8 个电台榜单与订阅读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。`dj_sub` 和两个 DI.FM 频道模块（`dj_difm_channel_subscribe`、`dj_difm_channel_unsubscribe`）已由本 release 的写操作批次补上 Body。

  ### 新增公开结构定义
  - `djRadio_top` → `DjRadioTopBody`：成功对象只收紧 `code`，`message` 宽松；另有空字符串分支。`data` 在本账号的一次登录录制里是空数组，元素类型无法确认，未声明并原样透传；非法 `djRadioId` 返回 HTTP 400 空正文，网易云把 400 归一成 `status: 200`，SDK 返回 `""`。匿名调用返回 `code: 302`（录制 `djRadio_top.anonymous.json`），302 是特殊码，改造前归一成 resolve `status: 200`，现在按业务码 reject `status: 302`；本接口需要登录。
  - `dj_sublist` → `DjSublistBody`：收紧 `code`、`djRadios`、`djRadios[].id`；`count`、`time`、`hasMore`、电台展示字段、简介图文（复用 `ProgramDescPic`）和主播（复用 `PlaylistUser`）宽松。`rcmdtext`、`icon`、`liveInfo`、`manualTagsDTO` 等只见过 `null`，`participateUidList` 只见过空数组，均未声明。
  - `dj_subscriber` → `DjSubscriberBody`：收紧 `code`、`subscribers`、`subscribers[].userId`；`time`、`hasMore`、昵称、头像、认证、关注状态和 `subscribeTime` 宽松。
  - `dj_toplist` → `DjToplistBody`：收紧 `code`、`toplist`、`toplist[].id`；`updateTime`、排名、分数、分类、封面、计数和主播（复用 `PlaylistUser`）宽松。
  - `dj_toplist_hours` → `DjToplistHoursBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`data.total`、`data.updateTime`、排名、分数、头像、认证和直播状态宽松，主播条目复用 `DjAnchorRank`；`msg` 在成功录制里只见过 `null`，未声明。
  - `dj_toplist_newcomer` → `DjToplistNewcomerBody`：收紧字段与 `dj_toplist_hours` 相同，主播条目复用 `DjAnchorRank`。
  - `dj_toplist_pay` → `DjToplistPayBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；`data.total`、`data.updateTime`、排名、分数、名称、封面和创作者宽松；`msg` 在成功录制里只见过 `null`，未声明。
  - `dj_toplist_popular` → `DjToplistPopularBody`：收紧字段与 `dj_toplist_hours` 相同，主播条目复用 `DjAnchorRank`。

  ### 共享结构

  新增 core 导出 `DjAnchorRank`：`dj_toplist_hours`、`dj_toplist_newcomer`、`dj_toplist_popular` 的主播榜条目字段完全相同，按“三个模块声明结构相同才进 core”的门槛提升，只收紧主播自己的 `id`，`avatarDetail` 复用既有 `AvatarDetail`。同时导出既有 `AvatarDetail` 供 `DjAnchorRank` 复用，导出既有 core 结构 `ProgramDescPic` 供 `dj_sublist` 复用订阅列表里的简介图文；`PlaylistUser` 继续作为主播/订阅者记录的基座。`dj_toplist` 和 `dj_sublist` 的电台记录字段集合不同，各自留在模块里。三个主播榜的 envelope（`code`、`data.total`、`data.updateTime`、`data.list`）也相同，作为模块公开合同暂留，统一榜单结构时再抽 core。

  ### 行为变化
  - 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - **非 200 业务码的状态码变化**：成功对象只接受 `code: 200`，以前 HTTP 200 + 非 200 业务码会原样返回 `status: 200`，现在按业务码拒绝，`status` 等于正文里的 `code`、正文仍是网易云原文。本批探测到的路径：五个榜单和 `dj_sublist` 的非数字 `limit` 返回 `code: 400`（录制 `*.invalid-limit.json`）；大于 `100` 的 `limit` 只有 `dj_toplist_hours`、`dj_toplist_newcomer`、`dj_toplist_pay`、`dj_toplist_popular` 返回 `code: 400`，`dj_toplist`、`dj_sublist`、`dj_subscriber` 的 `limit=101` 在本批匿名探测里仍返回 200；`dj_subscriber` 缺少 `id` 返回 `code: 400`（录制 `dj_subscriber.missing-id.json`）。
  - `djRadio_top` 匿名调用返回 `code: 302`（录制 `djRadio_top.anonymous.json`）。302 落在 `SPECIAL_STATUS_CODES` 里，改造前被归一成 resolve `status: 200`，现在按业务码 reject `status: 302`，`body` 保留原文；本接口需要登录。
  - `djRadio_top` 的非数字 `djRadioId` 是 HTTP 400、空正文，网易云把 400 归一成 `status: 200`，所以这条路径仍 resolve `status: 200`、`body` 是空字符串。`DjRadioTopBody` 的成功对象和 `''` 是联合类型，空正文不会报 502。
  - 空结果可以正常返回：`dj_toplist` 的 `offset=99999` 越界分页返回空 `toplist`（`dj_toplist.empty.json`）；`dj_sublist` 匿名返回空 `djRadios`、`count: 0`（`dj_sublist.anonymous.json`）；`dj_subscriber` 的 `time=1` 时间游标越界返回空 `subscribers`（`dj_subscriber.empty.json`）。`dj_toplist_hours`、`dj_toplist_pay`、`dj_toplist_popular` 没有 `offset`，`dj_toplist_newcomer` 的 `offset` 被上游忽略，`limit=0` 会被 SDK 的 `limit || 100` 替换成默认 `100` 再发送；本批录制和探测里没有可达的空结果，数组本身允许为空。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。榜单和 `dj_subscriber` 都保留同一请求的匿名对照：字段集合相同，差异只在宽松字段的实时值；`dj_sublist` 必须登录才能看到订阅，匿名录制是真实的空列表。所有录制保留完整列表，没有截取。

  ### 迁移
  - 这 8 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - **调用方要处理按业务码拒绝的 400**：五个榜单和 `dj_sublist` 传非数字 `limit`、四个榜单（`hours`/`newcomer`/`pay`/`popular`）传大于 `100` 的 `limit`、`dj_subscriber` 缺少 `id` 时，以前 resolve HTTP 200 + 正文业务码，现在以 `status: 400` 拒绝；先补齐参数，或按 `status`/`code` 处理。`dj_toplist`、`dj_sublist`、`dj_subscriber` 的 `limit=101` 本批仍返回 200，不要按 400 处理。
  - `djRadios[].id`、`toplist[].id`、`subscribers[].userId`、`data.list[].id` 是收紧的 `number`，不再需要判空；其余已声明字段是宽松字段，类型带 `null | undefined`。
  - `djRadio_top` 的 `body` 类型是成功对象或 `''`：成功对象只保证 `code`（`message` 宽松），`data` 仍是原始 JSON 数组；非数字 `djRadioId` 返回 `""`。匿名调用会以 `status: 302` 拒绝，本接口需要登录。
  - 列表接口的数组本身允许为空；分页不要假定一定有结果。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 5 个动态与话题读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `event` → `EventBody`：收紧 `code`、`event`、`event[].id`；转发数、评论数、图片、作者、`topEvent` 和展示字段宽松；`privacySetting`、`uuid` 也是宽松字段；`contentDeclaration`、`repostSource` 按事件列表里的空串证据声明为宽松字符串，`resourceUniqueId` 的宽松字符串类型证据来自 `user_event` 录制。
  - `hot_topic` → `HotTopicBody`：收紧 `code`、`hot`、`hot[].actId`；标题、正文、参与人数、封面和 `alg` 宽松。
  - `topic_sublist` → `TopicSublistBody`：收紧 `code`、`data`、`data[].id`；作者、标题、封面、阅读数和收藏时间宽松，`count`、`hasMore` 宽松。
  - `topic_detail` → `TopicDetailBody`：收紧 `code`、`act`、`act.actId`；话题正文、封面、`resourceJson`（JSON 字符串）、参与人数和时间字段宽松。
  - `topic_detail_event_hot` → `TopicDetailEventHotBody`：收紧 `code`、`events`、`events[].id`；动态记录与 `event` 共用 core 的事件附带结构，`topEvent` 宽松声明，`contentDeclaration`、`repostSource`、`resourceUniqueId` 按共享记录一并声明为宽松字符串（类型证据来自 `event` 录制）。

  ### 共享结构
  - `EventUser`、`EventIpLocation`、`EventPic`、`EventResourceInfo`、`EventLikedUser`、`EventCommentThread`、`EventInfo` 在 `user_event`、`event`、`topic_detail_event_hot` 三处逐字相同，移入 `src/core/upstream-schemas.ts`，只在 core 声明一次；三个模块改为 import 复用。
  - `EventRecord` 留在各自模块（事件记录的字段三份不同）。
  - `EventPic` 随共享结构进入 core 后，`user_event` 的 `pics[]` 类型也补齐 `pcRectangleIdStr`、`pcSquareIdStr`、`rectangleIdStr`、`squareIdStr` 四个宽松字段。
  - `EventResourceInfo.resourceType` 按三份录制的并集取证保留声明：`user_event.default.json` 里有非 null 数字 `2`。

  ### 非 200 业务码的状态码变化
  - 上游 HTTP 200 + `code: 400` 的参数错误，改造前按 200 resolve；这 5 个模块开始做 Body 校验后，`decodeUpstreamBody` 会在解码 Body 之前先按业务码拒绝，公开结果为 `status: 400`、`body` 保留上游原文。请求层原有的 `SPECIAL_STATUS_CODES` 会把 `code: 400` 映射成 200，但 Body 校验发生在公开响应之前，最终状态是 400。
  - 已录入 5 份匿名 400 录制：`event.invalid-pagesize.json`（`pagesize=abc`）、`hot_topic.invalid-limit.json`（`limit=abc`）、`topic_sublist.invalid-offset.json`（`offset=abc`）、`topic_detail.missing-actid.json`（缺失 `actid`）、`topic_detail_event_hot.missing-actid.json`（缺失 `actid`）。
  - `SPECIAL_STATUS_CODES` 里的其他码同样会在 Body 校验时拒绝：201/302/502 以原码拒绝，800–803 因超出 100–599 钳位为 400。
  - `code: 404` 不在 `SPECIAL_STATUS_CODES` 里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），不报 502：未知话题的 `topic_detail`、`topic_detail_event_hot` 返回 HTTP 200 和 `{ code: 404 }`，公开 `status` 和正文不变。

  ### 行为变化
  - 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 空结果：登录账号用 `lasttime=1` 取到 `event: []`、`more: false`（`event.empty.json`，此时没有 `lasttime`）；`topic_sublist` 的 `offset=100000` 返回 `data: []`、`count` 保持原值（`topic_sublist.out-of-range.json`）；`topic_detail_event_hot` 的话题 47972517 没有热门动态，返回 `events: []`（`topic_detail_event_hot.empty.json`）。`hot_topic` 的 `offset=100000` 与默认调用返回同一份推荐内容，本批没有找到它可达的空列表；`hot: []` 由契约测试构造验证。
  - 登录对照：5 个模块都先用 `login_status` 确认 `account.anonimousUser: false` 后录制（账号 599663130）。`event` 的匿名调用返回与登录空结果相同的 `event: []`、`more: false`；`hot_topic`、`topic_detail` 的匿名响应与登录响应字段集合一致，CDN 主机可能不同（本次对照只有 `topic_detail` 的 p3/p4 差异）。匿名录制未提交，不对公开结构作相同性断言。
  - 录制截取：`event.default.json` 原 20 条保留 3 条（索引 0/4/9），`topic_detail_event_hot.default.json` 原 5 条保留 2 条（索引 0/4），`context.truncated` 记录原数组长度。
  - 未声明的扩展块继续原样保留为 JSON：非 null 扩展对象 `adInfo`、`anonymityInfo`、`bottomActivityInfos`、`extJsonInfo`、`pointTopicInfo`、`privacySettingInfo`、`pubSource`、`xInfo`；只有空容器的 `likeAnimationMap`（`{}`）、`topActivityInfos`（`[]`）；`tailMark` 在事件列表录制里只有 `null`、在话题热门动态录制里有非 null 对象。只见过 `null` 的子字段也没有声明。

  ### 迁移
  - 这 5 个模块的 `body` 类型从原始的 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 需要处理 `code: 400` 参数错误从 resolve 200 变成 reject 400；`error.body` 是上游原文，`error.status` 为 400。
  - 读 `event.event[].id`、`hot_topic.hot[].actId`、`topic_sublist.data[].id`、`topic_detail.act.actId`、`topic_detail_event_hot.events[].id` 时不再需要自己判空。
  - 宽松字段（如 `event.event[].topEvent`、`topic_detail.act.title`、`hot_topic.hot[].title`）的类型带 `null | undefined`。
  - `EventPic` 移入 core，`user_event` 的 `pics[]` 类型随之补齐 4 个宽松字段；`EventResourceInfo.resourceType` 按共享结构的并集证据保持声明。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 3 个首页读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。推荐歌单、推荐新歌、推荐 MV、独家放送和每日推荐歌单由并行批次处理，本批不重复交付；`event_del`、`event_forward` 是写操作，也不在本批范围。

  ### 新增公开结构定义
  - `banner` → `BannerBody`：收紧 `code`、`banners`；PC 和移动端共用 `targetId`/`targetType`/`typeTitle`/`url`，PC 独有 `imageUrl`/`bigImageUrl`，移动端独有 `bannerId`/`pic`/`encodeId`/`showAdTag` 等，都按宽松字段放在同一个对象里，嵌着的歌曲复用宽松的 `LooseSong`。
  - `homepage_block_page` → `HomepageBlockPageBody`：收紧 `code`、`data`、`data.blocks`、`data.blocks[].blockCode`；`data.blocks[].creatives` 是可以没有的路径，出现时里面的坏元素报 502，creative 的 `resources` 是宽松数组、整列校验失败时丢弃。`pageConfig`、`cursor`、`hasMore`、block/creative/resource 的展示字段和 `resourceExtInfo` 宽松，旧版歌曲复用 `ProgramMainSong`、新歌复用 `LooseSong`、权限复用 `LooseSongPrivilege`、主播复用 `ProgramDj`、创建者和话题用户复用 `PlaylistUser`，嵌着的电台节目复用 `DjProgram` 字段。
  - `homepage_dragon_ball` → `HomepageDragonBallBody`：收紧 `code`；`message` 宽松。`data` 在登录和匿名录制里都是空数组，元素类型没有证据，未声明并原样保留。

  ### 共享结构

  本批没有新增 core 结构。`banner`、`homepage_block_page` 复用已有的 `LooseSong`、`ProgramMainSong`、`LooseSongPrivilege`、`PlaylistUser`、`ProgramDj`、`DjProgram`、`Artist`。

  ### 行为变化
  - 这 3 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `homepage_block_page` 的非法 `cursor` 上游返回 `code: 50002`。50002 超出 100–599，请求层会钳位成 400 并按非 2xx 拒绝，所以改造前就是 reject `status: 400`（`ProtocolFailed`，见 `homepage_block_page.invalid-cursor.json`），现在 Body 校验仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文都不变，并没有 resolve 过 `status: 200`。`banner` 和 `homepage_dragon_ball` 本批没有可复现的非 200 路径。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。default 录制是登录状态；`banner` 另有独立匿名录制（PC 视角），`homepage_block_page` 另有失效凭据回匿名视角的录制（viewer 为 invalid-cookie）。两份录制都能通过同一结构校验；差异在宽松字段、`creatives` 是否出现（default 的 5 个 block 都有，invalid-cookie 的 banner block 没有）和 block 集合/顺序；不对所有账号、地区和上游版本作相同性断言。
  - `banner` 和 `homepage_block_page` 本批录入的录制与探测没有找到可达的空结果：`banner` 在 `type` 0–3 下都返回非空数组，`homepage_block_page` 在登录和失效凭据回匿名视角下都返回非空 `blocks`；数组本身允许为空。
  - `homepage_dragon_ball` 的 `data` 在登录与匿名录制里都是空数组，元素类型没有证据，未声明并原样保留。
  - `homepage_block_page` 的录制按字段覆盖保留非连续 block 子集，并截取部分 creative/resource，见 `context.truncated`。

  ### 迁移
  - 这 3 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - `homepage_block_page` 的非法 `cursor` 调用以前就是 reject `status: 400`（`code: 50002` 被钳位，不是 resolve `status: 200`），现在仍 reject `status: 400` + 网易云原文。公开状态不变，失败类型从 `ProtocolFailed` 变为 `UpstreamBusinessFailed`。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `code`。
  - 读 `data.blocks[].blockCode` 时不再需要自己判空；`banners[].targetId` 仍是宽松字段（`number | null | undefined`），block 的扩展键（`extInfo`、`crossPlatformConfig`）、`resourceExtInfo` 的未声明键和 `homepage_dragon_ball` 的 `data` 仍是 JSON 值。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给匿名注册模块补上结构定义（`ModuleBody`）并在运行时校验返回体。评论、私信发送和数字专辑下单在本批没有成功正文证据，未声明结构定义；这 5 个缺口单列在下面。

  ### 新增公开结构定义
  - `register_anonimous` → `RegisterAnonimousBody`：收紧 `code`、新建匿名账号自己的编号 `userId` 和匿名凭据 `cookie`；`createTime` 宽松。`body.cookie` 由响应的 Set-Cookie 拼出，不是上游 JSON 字段，拼好后和外层 JSON 一起校验。
  - 录制 `login/register_anonimous.default.json` 是匿名注册成功正文，账号编号已换成合成值 `10000001`；公开体的凭据只在 `context.expect` 保留脱敏占位值 `<redacted>`，真实令牌不落盘。

  ### 行为变化
  - `register_anonimous` 开始做运行时结构校验：收紧字段缺失或类型不对时报 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）；返回体没有非空 `MUSIC_A` 时仍按 `cookie.MUSIC_A` 报 502。
  - **请求层旧行为**分两档：2xx 业务码原样 resolve（状态取业务码）；`201`、`302`、`400`、`502`、`800–803` 在 `SPECIAL_STATUS_CODES` 里，归一成 `status: 200` resolve。其余业务码按状态码 reject（`100–599` 取原值，其余 `400`），正文保留网易云原文。
  - `register_anonimous` 以前在 `code !== 200` 时把请求层归一后的响应原样返回，2xx 业务码和特殊码都会 resolve；现在 `decodeUpstreamBody` 只把 `200` 当成功，其他返回码全部 reject，`status` 按上一档规则（例如 `code: 400` 以前归一成 `status: 200` resolve，现在 reject `status: 400`）。成功返回缺少 `userId` 或匿名凭据时现在会 502；`cookie` 现在是必填项，调用方如果自己构造过该返回，需要补上 `userId` 和 `cookie`。

  ### 录制缺口（成功正文未验证）

  以下 5 项只录到上游拒绝或缺参，均未声明 Body，返回体继续按原始 JSON 放行：

  - `comment` 新增（`comment_add`）：歌曲 `1394617453`、`type: 0`、`t: 1`，内容带测试标记前缀，被上游风控拒绝 `code: 250`（`comment/comment.add-rejected.json`）；换短内容、自然内容、其他歌曲和歌单评论同样 250。没有成功正文和评论 id，`t: 0` 的删除没有调用，避免误删历史评论。
  - `comment` 删除（`comment_delete`）：没有刚发布、属于自己且可以安全删除的评论 id，列为缺口。
  - `send_text`：发给自己（`user_ids` 的账号编号已换成合成值）被上游以 `code: 2201`（发送过于频繁）拒绝（`msg/send_text.rejected.json`），换自然内容重试同样被拒；发给自己可能本身不允许，无法区分频率限制与不允许发给自己。
  - `send_song`：发给自己歌曲 `1394617453` 被上游以 `code: 2201`（发送过于频繁）拒绝（`msg/send_song.rejected.json`）；同样无法区分频率限制与不允许发给自己。
  - `digitalAlbum_ordering`：只录到缺 `id`/`payment` 参数时的 HTTP 400 空正文（`digital-album/digitalAlbum_ordering.missing-params.json`）；**未实际下单、未支付**，成功正文未验证。

  补录条件统一为：风控解除后（或改用第二个账号），用 `bun run fixtures:record` 重录成功体，再按 Skill 决定字段松紧；`comment` 的删除要在新增成功后用自己的评论 id 录制，并回读确认评论消失。

  ### 迁移
  - `register_anonimous` 的 `body` 类型从原始 JSON 值变成收窄后的结构；`userId` 是 `number`，`cookie` 是 `string`（由 Set-Cookie 拼出），`createTime` 是 `number | null | undefined`。
  - 需要处理新的 502 和业务拒绝：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 其余 5 个写操作（4 个模块）的返回体类型不变。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 6 个用户歌单与下载/已购资产只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `user_playlist_collect` → `UserPlaylistCollectBody`：收紧 `code`、`data`、`data.playlist` 和每张歌单自己的编号 `data.playlist[].id`（复用 `PlaylistSummary`）；`count`、`more` 和歌单其余字段宽松。
  - `user_playlist_create` → `UserPlaylistCreateBody`：收紧 `code`、`data`、`data.playlist`、`data.playlist[].id`；`count`、`more`、`subCount` 和歌单其余字段宽松。
  - `song_downlist` → `SongDownlistBody`：收紧 `code`、下载记录列表 `info` 和每条记录自己的编号 `info[].id`；内嵌歌曲 `song` 用宽松的 `LooseSong`，`firstTime`、`type` 宽松。
  - `song_monthdownlist` → `SongMonthdownlistBody`：与 `song_downlist` 相同。
  - `song_singledownlist` → `SongSingledownlistBody`：只收紧 `code`；已购买单曲列表 `info` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留。
  - `song_purchased` → `SongPurchasedBody`：收紧 `code` 和已购单曲列表的路径 `data`；`data.list` 只有空数组证据、元素类型未知，未声明并原样保留，`count`、`hasMore`、`message` 宽松。

  ### 行为变化
  - 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 空结果：`user_playlist_collect`、`user_playlist_create` 用越界 `offset` 录到 `data.playlist: []`（`more: false`，`count` 保留总数）；`song_downlist`、`song_monthdownlist` 越界偏移返回 `info: []`。`song_singledownlist`、`song_purchased` 的录制账号没有已购买/已购单曲，两份都是真实空结果（`info: []`、`data: { count: 0, list: [], hasMore: false }`），没有非空元素证据；没有另一个已购账号可补录，元素类型暂未声明。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。两个歌单列表用公开账号 32953014 录制，`query.uid` 与正文一致、正文未改写，同参数重录逐字段一致。两个歌单列表保留匿名录制：结构与登录一致，`subscribed` 是 `null`；下载列表匿名调用返回空 `info`，只保留登录录制。
  - `user_playlist_collect` 的非数字 `uid` 和 `song_downlist` 的非数字 `limit` 返回 `code: 400`。400 是特殊码，改造前被 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务码 reject `status: 400`，`body` 保留原文（录制保留在 `library/`）。

  ### 迁移
  - 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 歌单列表的 `data.playlist[].id` 类型是数字；`data.count`、`data.more`、`subCount` 的类型带 `null | undefined`。下载记录的 `info[].id` 是数字，`song` 的类型带 `null | undefined`，歌曲字段沿用 `LooseSong` 的宽松类型。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 4 个一起听状态与最近常听读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `listentogether_status` → `ListentogetherStatusBody`：收紧 `code`、`data`、`data.inRoom`；`data.anotherFollowStatus` 宽松；`roomInfo`、`anotherDeviceInfo`、`data.status` 在录制里只见过 `null`，未声明并原样保留。
  - `listentogether_sync_playlist_get` → `ListentogetherSyncPlaylistGetBody`：收紧 `code`、`data`；未加入/已失效房间的 `data` 是空对象，列表字段没有证据，未声明并原样保留。
  - `listentogether_room_check` → `ListentogetherRoomCheckBody`：收紧 `code`、`data`、`data.joinable`、`data.status`；`data.copywriting` 宽松；`data.type` 只见过 `null`，未声明。
  - `recent_listen_list` → `RecentListenListBody`：收紧 `code`、`data`；`data.resources` 在匿名调用里是 `null`，按可以没有处理，出现时 `data.resources[].resourceId` 收紧；标题、封面、落地链接和展示字段宽松。

  ### 行为变化
  - 这 4 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对只丢这一项；宽松字段的 `null` 原样保留。

  ### 空结果与录制
  - 一起听状态、同步歌单和房间检查都录到未加入/已失效状态。`listentogether_status` 返回 `inRoom: false`，`roomInfo`、`anotherDeviceInfo`、`data.status` 都是 `null`；`listentogether_sync_playlist_get` 的 `data` 是空对象；`listentogether_room_check` 返回 `status: "EXPIRED"`、`joinable: false`、`copywriting` 失效提示和 `type: null`。本批探测 `roomId=0`、`1`、`9999999999` 都是已失效状态，没有房间内的成功正文，房间字段未声明。
  - `recent_listen_list` 登录账号返回 12 条资源（11 个歌单、1 张专辑），匿名返回 `title: null`、`resources: null`（`recent_listen_list.anonymous.json`），作为列表的不可用状态；`resources: []` 也按正常空列表接受。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`；3 个一起听接口保留登录和匿名录制，正文逐字段相同；`recent_listen_list` 的匿名正文是 `resources: null`。本批结论只覆盖这些录制与探测，不据此推断所有账号、地区和上游版本一致。

  ### 证据缺口

  `voice_detail`、`voicelist_detail`、`voicelist_list` 是创作者工作台接口，只允许操作自己的播客/声音；本机账号没有播客，`voicelist_detail`/`voicelist_list` 返回 `code: 400`（`只允许操作自己的播客`），`voice_detail` 访问他人声音返回 `code: 401`（`不允许操作他人的声音`）。这些路径没有带字段的成功正文可录，不猜结构、不加 `ModuleBody`。

  写操作 `broadcast_sub`、`listentogether_accept`、`listentogether_end`、`listentogether_heatbeat`、`listentogether_play_command`、`listentogether_room_create`、`listentogether_sync_list_command`、`voice_delete`、`voicelist_trans` 不在本节范围。`record_recent_voice` 是只读列表，由播放记录模块（`record-read-bodies`）交付。

  ### 只读但由听歌足迹模块交付

  `listen_data_today_song`、`listen_data_total`、`listen_data_year_report`、`listen_data_report`、`listen_data_realtime_report` 由听歌足迹模块（`listen-stats-read-bodies`）交付，不重复实现、不保留录制。

  ### 迁移
  - 这 4 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `RecentListenListBody` 的 `data.resources` 是 `数组 | null | undefined`，读取前先判空；`ListentogetherSyncPlaylistGetBody` 的 `data` 仍然没有声明字段，读取房间歌单前自行校验；`ListentogetherStatusBody` 的 `roomInfo` 未声明，房间信息形态要自行判断。
  - 读 `data.inRoom`、`data.joinable`、`listentogether_room_check.data.status`、`data.resources[].resourceId` 时不再需要自己判空；`listentogether_status.data.status` 只见过 `null`，仍未声明，读取前自行判断。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 5 个听歌足迹读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `listen_data_total` → `ListenDataTotalBody`：收紧 `code`、`data.totalDuration`；`message` 宽松。
  - `listen_data_today_song` → `ListenDataTodaySongBody`：收紧 `code`、`data.songDTOs` 和每首歌的 `data.songDTOs[].songId`；`songName`、`aliasName`、`picUrl`、`redStar`、`lastPlayTime`、`artists`（含 `artistId`）宽松。
  - `listen_data_year_report` → `ListenDataYearReportBody`：收紧 `code`、`data.yearItems` 和每年的 `data.yearItems[].year`；`displayYear`、`playNum`、`playDuration` 宽松。
  - `listen_data_realtime_report` → `ListenDataRealtimeReportBody`：只收紧 `code` 和返回物 `data`（`data` 是返回对象，不是某个时长字段）；时长分布块、周维度的今日/好友块、月维度的 `sleepTdBlock` 及其嵌套字段全部宽松。
  - `listen_data_report` → `ListenDataReportBody`：只收紧 `code` 和通到报告的 `data`；周/月/年报的统计块（`listenTimeBlock`、`topSongBlock`、`topArtistBlock`、`topStyleBlock`、`topAgeBlock`、`topLanguageBlock`、`vipBlock`、`wallpaperBlock`、好友块等）整块缺失或为 `null` 时原样保留，块内字段全部宽松。

  ### 行为变化
  - 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 未登录调用这 5 个接口时上游返回 HTTP 200 + `code: 302`（每个模块各有一份 `.anonymous.json`）。以前模块按 `status: 200` 放行，现在按业务码拒绝为 `status: 302`，`body` 保留网易云原文。
  - `listen_data_report` 的 `data` 仍是必填对象：年报（`type=year`）只有时间范围和 `listenTimeBlock: null`，空周所有块都是 `null`，`data` 本身都在；`data` 缺失或以 `null` 返回会报 502。

  ### 空结果与录制
  - `listen_data_report` 用 2010-01-01 之前的 `endTime` 录到没有收听记录的周（`listen_data_report.empty.json`），所有统计块都是 `null`；周/月/年三种 `type` 各有录制，月报的好友块名是 `friendsListenMonthBlock` / `friendsKeyWordMonthBlock`。
  - `listen_data_today_song` 的 `songDTOs` 和 `listen_data_year_report` 的 `yearItems` 允许为空数组（契约测试用真实录制构造 `[]` 边界）；本批只有一个有数据的登录账号，空账号下 `data`/列表的实际表现未验证，`listen_data_total` 的零数据账号表现同样未验证。
  - 5 个模块都用登录账号录制（`context.viewer` 是 `authenticated`），录制前经 `login_status` 确认 `account.anonimousUser: false`（未落盘）；5 个接口的匿名 302 各有一份录制，另存为错误路径证据，不参与成功正文审计。

  ### 共享结构

  本批没有结构满足三模块规则，全部留在各自模块里；`listen_data_realtime_report` 和 `listen_data_report` 的时长/好友块形状不同，也没有抽到 core。

  ### 迁移
  - 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 未登录调用现在会 reject `status: 302`；以前读 `body.code === 302` 的调用方需要改为捕获拒绝。
  - 读 `data.totalDuration`、`data.songDTOs[].songId`、`data.yearItems[].year` 时不再需要自己判空；`data` 在报告/实时接口里仍是对象，块字段要按宽松字段判 `null`/缺失。
  - `listen_data_today_song`、`listen_data_year_report` 的列表本身允许为空数组；读取前仍需判断数组长度。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 7 个一起听与动态写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体；另外 2 个动态模块只有风控拒绝录制，本批没有声明结构。

  ### 新增公开结构定义
  - `listentogether_room_create` → `ListentogetherRoomCreateBody`：收紧 `code`、`data`、`data.roomInfo` 和接口就是为了拿的 `data.roomInfo.roomId`；房主 `creatorId`、`roomUsers[]`、`data.type`、`avatarPendantShow` 和其余房间展示字段宽松。
  - `listentogether_heatbeat` → `ListentogetherHeatbeatBody`：只收紧 `code`（`200`）；`data.result`、`data.time`、`data.timeSpan`、`message` 宽松，`data.message` 只见过 `null`，未声明。
  - `listentogether_play_command` → `ListentogetherPlayCommandBody`：只收紧 `code`（`200`）；`data.result`、`message` 宽松，`data.message` 只见过 `null`，未声明。
  - `listentogether_sync_list_command` → `ListentogetherSyncListCommandBody`：只收紧 `code`（`200`）；`data.result`、`data.message`、`message` 宽松。
  - `listentogether_end` → `ListentogetherEndBody`：只收紧 `code`（`200`）；`data.success`、`data.roomType`、`message` 宽松，其余 `data` 字段只见过 `null`，未声明。
  - `listentogether_accept` → `ListentogetherAcceptBody`：只收紧 `code`（`200`）；`data`（含 `roomInfo`）和 `message` 整体宽松，新加入成员的正文没有证据。
  - `event_del` → `EventDelBody`：只收紧 `code`（`200`）。

  ### 行为变化
  - 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失、`null` 或类型不对时只丢这一项。
  - `listentogether_accept` 的已结束房间（HTTP 200 + `code: 488`，录制 `listentogether_accept.expired-room.json`）改造前就被请求层按非特殊码 reject `status: 488`（`ProtocolFailed`，488 不在 `SPECIAL_STATUS_CODES` 里）；现在由 `decodeUpstreamBody` 按业务码拒绝，仍 reject `status: 488`，公开状态不变，拒绝类型变成 `UpstreamBusinessFailed`，`body`/`cookie` 保留原文。没有录到 `listentogether_room_create` 的非 200 业务码。
  - `share_resource` 和 `event_forward` 没有声明 `ModuleBody`：分享与转发在录制设备上被上游风控拒绝（`code: 250`），没有成功正文的证据；行为不变，正文原样转交、仍是 resolve `status: 250`，与有 Body 的 250 reject 不同。

  ### 迁移
  - 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `listentogether_accept` 的 `488` 改造前后都 reject，公开状态不变，不需要新增 `try/catch`；`share_resource`/`event_forward` 的 `250` 仍是 resolve。
  - `ListentogetherRoomCreateBody['data']['roomInfo']['roomId']` 不再需要自己判空；`creatorId`、`message`、`data.success` 等宽松字段的类型带 `null | undefined`。
  - 在录制设备上创建并结束了两个一起听房间（录制后均调用 `end` 清理），`listentogether_status` 回读 `data.inRoom: false`（`listentogether_status.after-cleanup.json`）；`event_del` 的录制是删除合成 id 的返回体，没有删除真实动态。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 6 个歌曲附属与歌词模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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

- 0b7137a: 给日历、曲风偏好、用户社交状态和内部版本 5 个读取模块补上结构定义（`ModuleBody`），除 `inner_version` 外开始运行时校验返回体。

  ### 新增公开结构定义
  - `calendar` → `CalendarBody`：收紧 `code`、`data`、`data.calendarEvents`、`data.calendarEvents[].id`；事件的标题、封面、提醒、计数字段和 `data.calendarConfig` 的按钮宽松。
  - `style_preference` → `StylePreferenceBody`：收紧 `code`、`data`、`data.tagPreferenceVos`、`data.tagPreferenceVos[].tagId`；`data.tags` 的三层曲风树、`ratio`、封面和链接宽松。
  - `user_social_status_support` → `UserSocialStatusSupportBody`：收紧 `code`、`data`、`data[].type`；图标、文案、跳转地址和 `canEdit` 宽松。
  - `user_social_status_rcmd` → `UserSocialStatusRcmdBody`：收紧 `code` 和 `data`；`data.userRcmdInfoVOList` 是可以没有的路径，出现时每条记录的 `userId` 收紧；`rcmdTitle`、当前状态和身份信息宽松；`rcmdWords`、`identityInfoDTO.origin`、`tagRcmdVOList[].id` 只见过 `null`，未声明，原样保留。
  - `inner_version` → `InnerVersionBody`：收紧 `code`、`data` 和 `data.version`；接口不请求上游，正文由模块用构建内联的 `package.json` 版本号拼出，不做上游校验。

  ### 行为变化
  - 4 个读取模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项；未声明字段原样保留。
  - `user_social_status_rcmd` 没有设置状态时上游返回 `data: {}`，`data.userRcmdInfoVOList` 整个缺失或为 `null` 都照常返回；出现但一条记录缺 `userId` 时报 502，不会整列消失。
  - `user_social_status_rcmd`、`user_social_status_support` 未登录时上游返回 HTTP 200 + `code: 302`：改造前经 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务码拒绝为 reject `status: 302`，`body` 保留网易云原文。`calendar` 匿名可读，不受影响。
  - `inner_version` 的公开正文没有变化（`code: 200`、`data.version`），只是新增了公开结构定义和类型。

  ### 录制证据
  - 录制前用同一 Cookie 调 `login_status`，确认 `account.anonimousUser: false`（账号 599663130）。
  - `calendar`：2025-10-01 至 2025-10-26 的 18 条事件（`calendar.default.json`），零长度区间无事件（`calendar.empty.json`，`calendarEvents: []`），匿名零长度区间同样为空（`calendar.anonymous.json`，`code: 200`），确认接口不需要登录。
  - `style_preference`：登录 5 条偏好和完整曲风树（`style_preference.default.json`）；匿名调用两个数组都是空（`style_preference.anonymous.json`），用作空结果证据。
  - `user_social_status_rcmd`：先录无状态空结果（`user_social_status_rcmd.empty.json`），再用 `user_social_status_edit` 设置 `LISTENING` 后录 18 条相似用户（`user_social_status_rcmd.default.json`）；`event_del` 删除同一状态 id 返回 `code: 200` 但状态仍在，实际用 `createRequest` 向 `/api/social/user/status/edit` 发送外层 `content: ''` 清空，回读 `data: {}` 确认账号状态已恢复。
  - `user_social_status_support`：登录录制 18 个可设置状态（`user_social_status_support.default.json`）；匿名调用返回 `code: 302`（录制 `user_social_status_support.anonymous.json`），没有可用的空状态列表录制。
  - `user_social_status_rcmd` 的匿名调用同样返回 `code: 302`（录制 `user_social_status_rcmd.anonymous.json`）。
  - `inner_version` 不请求上游，没有录制；用构造测试校验正文。
  - 录制没有出现 `MUSIC_U`/`MUSIC_A`/`__csrf`/cookie/邮箱；`user_social_status_rcmd` 里的其他用户编号属于公开数据，没有出现在录制中的当前账号编号。

  ### 迁移
  - 这 4 个读取模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `user_social_status_rcmd`、`user_social_status_support` 未登录时从 resolve `status: 200` 变成 reject `status: 302`，调用方需要 try/catch；`error.body` 是上游原文。
  - 读 `data.calendarEvents[].id`、`data.tagPreferenceVos[].tagId`、`data[].type` 和 `data.userRcmdInfoVOList[].userId` 时不再需要自己判空；宽松字段的类型带 `null | undefined`。
  - `user_social_status_rcmd` 的 `data.userRcmdInfoVOList` 读取前仍要判断缺失或 `null`，空状态不会返回空数组而是整个缺失。
  - `inner_version` 的 `data.version` 变为收紧字段，但值仍由 SDK 自己拼出，没有上游变化风险。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 6 个通知与私信读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。发私信、标记已读等写操作不在本批范围。

  ### 新增公开结构定义
  - `msg_comments` → `MsgCommentsBody`：收紧 `code`、`comments`、`comments[].commentId`；评论复用 `CommentRecord`，补上 `beRepliedContent`、`beRepliedUser`、`combindId`、`commentExist`、`commentStatus`、`resourceJson`、`resourceType`、`subCommentExist`、`threadId` 宽松字段；`total`、`more` 宽松。
  - `msg_forwards` → `MsgForwardsBody`：收紧 `code`、`forwards`、`forwards[].id`；正文 `json`、来源 `uf`（含 `uf.id`）、计数和游标宽松。
  - `msg_notices` → `MsgNoticesBody`：收紧 `code`、`notices`、`notices[].id`；通知正文 `notice`（JSON 字符串）、`time`、`type`、`userId`、`queued`、`lastTime`、`more` 宽松。
  - `msg_private` → `MsgPrivateBody`：收紧 `code`、`msgs`、`msgs[].user.id`；会话双方 `fromUser`/`toUser` 复用 `UserProfile` 的字段但把 `userId` 放宽，补 `expertTags`；最后一条消息、计数和 `more` 宽松。
  - `msg_private_history` → `MsgPrivateHistoryBody`：收紧 `code`、`msgs`、`msgs[].id`；消息正文 `msg`（JSON 字符串）、双方资料、`time`、`batchId`、`isArtist`、`isSubed`、`hint`、`more` 宽松。
  - `msg_recentcontact` → `MsgRecentcontactBody`：收紧 `code`、`data`、`data.follow`、`data.follow[].userId`；联系人记录复用 `UserProfile`，补 `py`、`onlined`、`expertTags` 宽松字段。

  ### 共享结构

  本批没有新增 core 结构。`msg_comments` 复用评论模块已有的 `CommentRecord` 和 `CommentUser`；`msg_private`、`msg_private_history`、`msg_recentcontact` 复用 `UserProfile` 的字段。会话双方在两个私信模块里字段相同，但只有两个模块使用，按规则没有抽到 `src/core/upstream-schemas.ts`。

  ### 行为变化
  - 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `msg_comments`、`msg_forwards`、`msg_notices` 未登录时上游返回 `code: 301`。301 不在 `SPECIAL_STATUS_CODES` 里，改造前请求层就按非 2xx reject `status: 301`（`ProtocolFailed`）；现在 Body 校验按业务码 reject 相同状态（`UpstreamBusinessFailed`），公开 `status` 和正文不变，只是失败类型变化，不会 resolve `status: 200`。`msg_private`、`msg_private_history`、`msg_recentcontact` 未登录时上游返回 `code: 200` 和空列表，行为不变。
  - 空结果：`before=1` 的评论（`msg_comments.empty.json`）、越界 `offset` 的 @我 和私信会话（`msg_forwards.empty.json`、`msg_private.empty.json`）、早于账号创建的通知游标（`msg_notices.empty.json`）、早于会话历史的私信游标（`msg_private_history.empty.json`）都返回空数组。账号 599663130 登录时有最近联系人，本批没有登录态的空结果；未登录录制 `msg_recentcontact.anonymous.json` 返回 `data.follow: []`。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。录制只覆盖账号 599663130 与录制里出现的其他账号，不对所有账号、地区和上游版本作相同性断言。
  - 私信录制里有手机号和邮箱的公开签名已按 `<redacted>` 替换，路径记在 `context.redacted`，录制 note 也写明了脱敏。

  ### 迁移
  - 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - `msg_comments`、`msg_forwards`、`msg_notices` 的匿名调用以前就是 reject `status: 301`（不是 resolve `status: 200`），现在仍 reject `status: 301`，正文为网易云原文；公开状态不变，已按 301 处理未登录的调用方不需要改动。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `comments[].commentId`、`forwards[].id`、`notices[].id`、`msgs[].user.id`、`msgs[].id`、`data.follow[].userId` 时不再需要自己判空；`lastMsg`、`notice`、`msg` 仍是 JSON 字符串，需要调用方自行解析。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 5 个音乐人数据读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。签到（`musician_sign`）和领取云豆（`musician_cloudbean_obtain`）是写操作，不在本批。

  ### 新增公开结构定义
  - `musician_cloudbean` → `MusicianCloudbeanBody`：收紧 `code`、云豆对象 `data`、音乐人编号 `data.artistId` 和云豆数 `data.cloudBean`；`maxCloudBean`、`needPop`、`signed`、`message` 宽松，`musicianLevel`、`flowStage`、`dynamicNews` 只见过 `null`，没有声明。
  - `musician_data_overview` → `MusicianDataOverviewBody`：收紧 `code` 和通到概况对象的 `data`；`availableExtractIncomeTotal`、`productionTotal`、`musicianLevelScore`、`totalFansCount`、`message` 宽松，`playCount`、`totalPlayCount`、`fansPlayCount`、`fansPlayRatio`、`followerCountIncrement` 只见过 `null`，没有声明。
  - `musician_play_trend` → `MusicianPlayTrendBody`：收紧 `code`、日趋势数组 `data`、日期键 `data[].dateTime` 和每天的播放数 `data[].dataValue`；`message` 宽松。`startTime`/`endTime` 要传 `YYYY-MM-DD` 字符串。
  - `musician_tasks` → `MusicianTasksBody`：收紧 `code`、任务列表 `data.list` 和每个任务的编号 `data.list[].missionId`；其余任务字段和 `message` 宽松。
  - `musician_tasks_new` → `MusicianTasksNewBody`：收紧 `code`、任务列表 `data.list` 和每个任务的编号 `data.list[].missionId`；`userStageTargetList` 是任务记录里套着的展示数据，整列宽松，其余任务字段和 `message` 宽松。

  ### 行为变化
  - 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `musician_play_trend` 的 `code: 400`（缺少参数或时间格式不对）属于特殊码：以前被请求层归一成 `status: 200` 原样放行，现在按业务码拒绝为 `status: 400`，`body` 保留网易云原文。本次录到的其余业务拒绝（`musician_cloudbean` 的 `code: 600`、`musician_data_overview` 的 `code: 10000`、`musician_tasks`/`musician_tasks_new` 的 `code: 301`）是请求层在模块之前就有的行为，改造前后一致（`status` 分别 `400`/`400`/`301`），这些路径不经 `decodeUpstreamBody`。其他特殊码（201、302、502、800–803）同样在改造前被归一成 `status: 200` 进入模块，本批开始校验后会按业务码拒绝（800–803 映射为 `status: 400`）。
  - `musician_play_trend` 匿名调用仍是成功结果，返回 `data: []`。

  ### 空结果与录制
  - 5 个模块都用同一个音乐人账号录制（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `account.anonimousUser: false`，未落盘）。
  - `musician_play_trend` 有真实空结果：没有播放记录的 2020 年区间返回 `data: []`（`musician_play_trend.empty.json`），匿名调用同样返回空趋势（`musician_play_trend.anonymous-empty.json`）。
  - `musician_tasks`（7 条）和 `musician_tasks_new`（5 条）只录到非空任务列表；本批只有一个音乐人账号，没有录到任务列表为空的账号，空账号下 `data.list` 的实际表现未验证。
  - `musician_cloudbean` 和 `musician_data_overview` 返回单个对象，不是列表；未登录（匿名）只录到业务拒绝（`code: 600` / `10000`），登录的非音乐人账号未录到，返回码与成功正文未验证；成功正文只在音乐人账号下验证。
  - 录制没有截取：任务列表都完整保留，趋势录制 6 个日期点。

  ### 共享结构

  本批没有结构满足三模块规则。`musician_tasks` 和 `musician_tasks_new` 的任务字段集合不同（新版有 `userStageTargetList`、`hasSendWorth`，旧版有 `name`、`jumpLink`、`targetCount`、`webText` 等），各自留在模块里；`data` 对象只有 `list` 一项，也没有抽到 core。

  ### 迁移
  - 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 以前从成功响应里读 `body.code === 400` 判断 `musician_play_trend` 失败的调用方，现在要改为捕获拒绝并按 `status: 400` 判断；`code: 600`、`10000`、`301` 的拒绝行为不变，不必改。`musician_play_trend` 的时间参数要用 `YYYY-MM-DD` 字符串。
  - 读 `data.artistId`、`data.cloudBean`、`data[].dateTime`、`data[].dataValue`、`data.list[].missionId` 时不再需要自己判空；其余声明字段仍要按宽松字段判 `null`/缺失。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 MV 领域的 8 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。`mv_sub` 已由本 release 的写操作批次补上 `MvSubBody`。

  ### 新增公开结构定义
  - `mv_all` → `MvAllBody`：收紧 `code`、`data`、`data[].id`；`count` 在非零 `offset` 时可能整个缺失，和 `hasMore` 一起宽松。
  - `mv_first` → `MvFirstBody`：收紧 `code`、`data`、`data[].id`。
  - `mv_exclusive_rcmd` → `MvExclusiveRcmdBody`：收紧 `code`、`data`、`data[].id`；`more` 宽松。
  - `top_mv` → `TopMvBody`：收紧 `code`、`data`、`data[].id`；`lastRank`、`score`、`hasMore`、`updateTime` 和嵌套的 `mv` 宽松。
  - `mv_detail` → `MvDetailBody`：收紧 `code`、`data`、`data.id`；`mp` 和详情其余字段宽松。
  - `mv_detail_info` → `MvDetailInfoBody`：收紧 `code`、`commentCount`、`shareCount`、`likedCount`；`liked` 宽松。
  - `mv_url` → `MvUrlBody`：收紧 `code`、`data`、`data.id`、`data.url`、`data.code`。
  - `mv_sublist` → `MvSublistBody`：收紧 `code`、`data`、`data[].vid`。

  四个列表模块（`mv_all`、`mv_first`、`mv_exclusive_rcmd`、`top_mv`）共用新的 `MvSummary`：只收紧记录自己的 `id`，`alias`、`transNames`、`artists`（复用 `Artist`）等其余字段宽松；`top_mv` 在模块内补上榜字段和嵌套 `mv`。只见过 `null` 的 `desc`、`data.price`、`mp.msg`、`promotionVo` 和只见过空数组的 `videoGroup` 没有声明，继续原样保留。

  ### 行为变化
  - 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 空结果可以正常返回：`mv_first` 用无效地区筛选、`mv_exclusive_rcmd` 用越界 `offset` 录到空 `data`；`mv_sublist` 匿名时 `data` 是空数组。`mv_all`、`top_mv`、`mv_detail` 本批录制与探测未发现可达的空结果；`mv_detail_info` 计数为 0 时三个字段仍在（`mvid=1` 探测 200）。
  - `mv_url` 的 `data.url` 允许 `null`：上游拿不到地址时是 `null`，原因看 `data.code`（录制 `mv_url.unavailable.json` 时上游间歇返回 `-125`）。
  - 其余列表模块的匿名与登录重录逐字段 diff 没有结构差异，登录对照录制已删除；`mv_sublist` 只对比到顶层字段（匿名时 `data` 是空数组），保留非空登录录制作为元素字段证据。
  - `mv_detail_info` 的本地输入拒绝没有变化：非原始值 `mvid` 仍在发请求前返回 400。

  ### 迁移
  - 这 8 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `mv_all` 的 `body.count`、`hasMore` 和列表记录里的宽松字段时类型带 `null | undefined`。
  - 读 `mv_detail` 的 `body.mp`、`body.data.brs`、`body.data.desc` 时同样带 `null | undefined`；`data.id` 已收紧。
  - 读 `mv_url` 的 `body.data.url` 时类型是 `string | null`，不要只检查顶层 `body.code`。
  - 读 `mv_sublist` 的 `body.data[].vid` 时类型是 `string`；登录态和匿名态的列表长度可能不同。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 5 个私人 FM、心动模式与推荐读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `personal_fm` → `PersonalFmBody`：收紧 `code`、`data`、`data[].id`；歌曲用模块内的 `FmSong`（复用 `ProgramMainSong`，补 `alg`、`alias`、`fmRecReason`、`privilege`、`reason`、`reasonId`、`transName`、`transNames` 等录制里出现的旧版字段，全部宽松）；`extTransMap`、`popAdjust` 宽松，`tag` 只见过 `null`，未声明。
  - `personal_fm_mode` → `PersonalFmModeBody`：与 `personal_fm` 同构；`mode`/`submode` 只改请求参数，不改变响应结构；`extTransMap` 是以歌曲编号为键、`fmRecReason` 为值的宽松映射。录制覆盖 `DEFAULT`、`FAMILIAR`、`EXPLORE`、`aidj` 和 `SCENE_RCMD` 的 `FOCUS`/`EXERCISE`/`NIGHT_EMO` 分支。
  - `playmode_intelligence_list` → `PlaymodeIntelligenceListBody`：收紧 `code`、`data`、`data[].id`；`songInfo` 是宽松字段并复用 `LooseSong`（嵌套歌曲编号也宽松，坏 `id` 只丢编号，不会让整条 `songInfo` 消失），`alg`、`recommended`、`message` 宽松。
  - `aidj_content_rcmd` → `AidjContentRcmdBody`：收紧 `code`、`data`、`data.aiDjResources`；每条资源的 `type` 和 `value` 宽松，`tagName`、`message`、`trp.rules` 宽松。`value` 里声明录制有证据的 `songId`（字符串）、`includeVoice`、`songData`、`songPrivilege`、`audioList`（音频编号、地址、时长、文案等展示字段），全部宽松；`songData` 用模块内的 `AiDjSong`（复用 `ProgramMainSong`，补 `alias`/`transName`/`transNames`，歌曲编号在宽松 `value` 里也宽松）。声明了这些字段，其余原样保留；宽松字段可能缺席，例如 `with-location` 录制里的 song 资源没有 `audioList`。
  - `mlog_music_rcmd` → `MlogMusicRcmdBody`：收紧 `code`、`data.feeds`、`data.feeds[].id`；`resource` 是附带的 mlog 记录，整体宽松；声明 `mlogBaseData.userId`/`coverDetail`/`video`/`mixInfo.status`、`userProfile`（昵称、编号、头像等）和 `source` 等有证据的字段，`video` 里声明 `urlInfo`/`rcmdUrlInfo`/`urlInfos`（`id`、`r`、`size`、`validityTime`、`resolution`；`url` 只见过 `null` 未声明），嵌套歌曲复用 `MlogSong`；`matchField`、`sameCity`、`type`、`more`、`message` 宽松，`data.msg` 只见过 `null`，未声明。声明了这些字段，其余原样保留（如 `urlInfo.url`、`relatedPubUsers`、`mlogPlaylists`）。

  ### 行为变化
  - 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失、`null` 或类型不对只丢这一项。
  - `playmode_intelligence_list` 缺少 `pid` 时上游返回 `code: 500`，探测到的另一个歌单返回 `code: 400`。500 不在特殊码表里，改造前就是 reject `status: 500`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`）；400 是特殊码，改造前被归一成 resolve `status: 200`，现在 reject `status: 400`。两条路径的 `body` 都保留网易云原文，不报 502。
  - `tests/integration/server.test.ts` 的 fake upstream 为 `personal_fm` 返回合法的空 `data`（请求 payload 改放在 `requestData` 继续断言），并把 `options` 先序列化掉 `AbortSignal`。

  ### 空结果与登录
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。
  - `mlog_music_rcmd` 录到真实空结果：歌曲 `347230` 返回 `feeds: []`（`mlog_music_rcmd.empty.json`），歌曲 `1330348068` 返回 1 条相关视频。
  - `personal_fm`、`personal_fm_mode`、`playmode_intelligence_list`、`aidj_content_rcmd` 在本批录制和探测中没有找到可达的空结果；四个模块的数组本身允许为空。`personal_fm` 登录返回 3 首、匿名返回 1 首，非法 `mode` 仍返回 3 首；`playmode_intelligence_list` 只录到“我喜欢的音乐”歌单的成功返回，探测到的另一个歌单被上游拒绝。
  - `personal_fm`、`personal_fm_mode`、`aidj_content_rcmd` 另保留匿名对照；声明过的字段及其允许类型一致，差异只在宽松/未声明字段的出现与值（如 `reason`/`fmRecReason`/`extTransMap` 是否出现，`rscl`/`cannotListenReason` 的取值），不对所有账号、地区和版本作相同性断言。
  - `playmode_intelligence_list` 的成功录制从原始 149 条截到 3 条，`context.truncated` 记录原始长度 149。

  ### 证据缺口

  `personal_fm`、`personal_fm_mode`、`aidj_content_rcmd` 没有空结果录制；`tag`、`data.msg` 只见过 `null`，未声明。旧版 FM 歌曲里的 `audition`、`crbt`、`mp3Url`、`rtUrl`、`rtUrls`、`rurl`、`sign` 只见过 `null` 或空数组，也未声明，原样保留。`playmode_intelligence_list` 没有空 `data` 录制，且只验证了一个支持心动模式的歌单类型；`mlog_music_rcmd` 的非空录制只有 1 条 feed。以上结论只覆盖本批录制与探测。

  ### 迁移
  - 这 5 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `playmode_intelligence_list` 的 `songInfo` 是宽松字段，可能缺失；`songInfo.id` 也是宽松字段。`aidj_content_rcmd` 的 `value` 是异构载荷，读取前按 `type` 自行判断，声明的载荷字段都可能缺失。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 6 个播放可用性、音频识别和用户设置只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `check_music` → `CheckMusicBody`：公开体是 SDK 合成的 `{ code: 200, success, message }`，三个字段都收紧；上游顶层 `code`、`data` 和 `data[0].code` 收紧，`data[1..]` 不校验，上游 `data` 数组不进入公开体。
  - `audio_match` → `AudioMatchBody`：收紧 `code` 和识别结果路径 `data`；未声明的顶层字段原样保留；`data.result` 在没识别到时是 `null`，按可以没有处理，出现时每条记录的 `song` 复用 core 的 `Song`，`song.id` 收紧，`startTime` 宽松；`queryId`、`type`、`moduleList`、`noMatchReason`、`message` 宽松；只见过 `null` 的 `data.mv` 没有声明。
  - `song_like_check` → `SongLikeCheckBody`：收紧 `code` 和喜欢列表 `ids`（歌曲编号数组，空列表是正常结果）。
  - `song_red_count` → `SongRedCountBody`：收紧 `code`、数量路径 `data` 和接口要拿的 `data.count`；`countDesc` 宽松。
  - `song_dynamic_cover` → `SongDynamicCoverBody`：收紧 `code` 和封面路径 `data`；`data.videoPlayUrl` 是接口要拿的那一项，没有动态封面时整个字段缺失，按可以没有处理；`height`、`weight`、`needTransition`、`message` 宽松。
  - `setting` → `SettingBody`：收紧 `code`、设置路径 `setting` 和记录自己的编号 `setting.userId`；其余设置项全部宽松。

  ### 行为变化
  - 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项；`Optional` 路径缺失或 `null` 照常返回，出现坏记录仍报 502。
  - 上游业务返回码不是 200 时，以前这些模块大多 resolve `status: 200`、把上游正文原样交给调用方；现在按业务拒绝原样转交，`status` 取上游返回码，调用方需要 `try/catch` 接住 `NcmApiResponse`。本次录到的例子是 `song_like_check` 的空 `ids` 请求（`{ code: 400 }`）。
  - `check_music` 的公开体不变，仍是 `{ code, success, message }`。旧实现已经会拒绝正文不是对象、`data` 不是数组或 `null`、`data[0]` 不是对象、`data[0].code` 缺失或不是数字；相对基线新增的是 `data` 缺失（旧实现返回 `success: false`），`data[0]` 非对象现在报 `body.data[0]`、缺 `code` 的 `actual` 是 `missing`。`data[1..]` 不校验。上游顶层返回码不是 200 时从“合成 `success: false`”变成业务拒绝转交。
  - `audio_match` 旧实现只拒绝非对象正文；新增 `code`/`data` 缺失、`data.result` 坏记录等 502。以前会把缺失的上游返回码补成 200 并只保留 `code`/`data`/`message`，现在未声明的顶层字段原样保留。

  ### 录制与空结果
  - 本批新增 19 份录制：`playback/audio_match.{match,match-login,no-match}.json`、`playback/check_music.{playable,anonymous,no-copyright,nonexistent}.json`、`like-collect/song_like_check.{mixed,none,anonymous,empty-ids}.json`、`song/song_red_count.{default,anonymous,zero}.json`、`song/song_dynamic_cover.{default,empty,anonymous}.json`、`user/setting.{default,anonymous}.json`。没有截断。
  - 登录对照先经 `login_status` 确认 `account.anonimousUser: false`（未落盘）。`setting`、`audio_match`、`check_music`、`song_like_check`、`song_red_count`、`song_dynamic_cover` 都保留登录与匿名录制；登录和匿名的结构相同，值差异来自账号自己的喜爱列表、实时计数、设置和 `queryId` 等动态字段。`check_music` 匿名录制本次条目 `code` 是 404、登录是 200（上游播放码会翻转），不对可播放结果作相同性断言。`setting` 两份录制的 `userId` 已换成合成值。
  - 空结果：`audio_match` 没识别到时 `data.result` 是 `null`（`noMatchReason: 10`）；`song_like_check` 没有已喜爱的歌和匿名时 `ids` 是空数组；`song_dynamic_cover` 没有动态封面时 `data` 是空对象；`song_red_count` 对不存在的歌曲返回 `count: 0`；`check_music` 无版权、不存在的歌曲和本次匿名录制都是 `success: false`。`check_music` 的 `data` 数组在不存在、无版权的探测里仍有一项，本批没有录到可达的空数组；数组本身允许为空。
  - `check_music` 的公开体由 SDK 合成：录制里的 `response.body` 是网易云原文，最终体写在 `context.expect`；契约测试按录制原文回放并断言 `context.expect`，`schema:audit` 在有 `context.expect` 时校验它（新增的 `context.expect` 约定同时更新了 `scripts/schema-audit.mts` 和 `tests/_kit/assertions.ts` 的 `Recording` 类型）。`audio_match` 的指纹由仓库 demo 的音频运行时按 8 kHz/3 秒流程生成，录制里的 `query.audioFP` 可以原样复用；有命中指纹来自真实歌曲片段（《平凡之路》 id 28815250，源 FLAC 从登录态播放地址取得，偏移 1 秒取 3 秒；匿名播放地址是 30 秒试听 MP3，未用于该指纹），可用 `bun scripts/audio-fingerprint.mts <音频文件> --offset 1` 复现；`no-match` 用 440 Hz 合成音频，`bun scripts/audio-fingerprint.mts --tone 440` 可复现。
  - 未录到 `audio_match`、`song_red_count`、`song_dynamic_cover`、`setting` 的顶层非 200 返回，这些模块的非 200 分支只按通用业务拒绝路径测试，没有为它们声明失败正文结构；`check_music` 和 `song_like_check` 有专门的非 200 用例（`check_music` 的探测返回不是 JSON，只用于拒绝路径；`song_like_check.empty-ids.json` 是 `code: 400` 的真实录制）。

  ### 迁移
  - 这 6 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `song_dynamic_cover` 的 `data.videoPlayUrl` 和 `audio_match` 的 `data.result` 类型带 `null | undefined`，使用前判空；`song_dynamic_cover` 没有动态封面时 `data` 是空对象，`videoPlayUrl` 带会过期的签名参数，不要缓存或逐字比较。
  - 上游业务码不是 200 时现在会 reject；读 `audio_match`、`check_music`、`song_like_check`、`song_red_count`、`song_dynamic_cover`、`setting` 的调用方要按 `NcmApiResponse` 接住错误。
  - 新增的公开类型是 `AudioMatchBody`、`CheckMusicBody`、`SettingBody`、`SongDynamicCoverBody`、`SongLikeCheckBody`、`SongRedCountBody`。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 `top_playlist` 补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `top_playlist` → `TopPlaylistBody`：收紧 `code`、`playlists` 和每个歌单自己的编号 `playlists[].id`；歌单摘要共用 `PlaylistSummary`，并在模块内补了宽松的 `alg`、`backgroundImageId`、`originalCoverId`、`tsSongCount`，`total`、`more`、回显的 `cat` 宽松。
  - 模块既有的 `avatarImgId_str` → `avatarImgIdStr` 改写保留，但只作用于成功返回体：`TopPlaylistBody` 描述改写后的最终体，录制保存上游原文；契约测试用测试内显式写出的转换与最终体逐字段比较。`code: 404` 等非 200 业务码不在特殊码表里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），正文原样透传，不做改写。
  - `limit`/`offset` 等非数字参数时上游回 HTTP 400 空正文，网易云把它归一成 `status: 200`、`body: ''`；空字符串作为 `TopPlaylistBody` 的独立分支保留，不报 502。

  ### 行为变化
  - `top_playlist` 开始做运行时结构校验：以前畸形返回原样放行，现在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失、`null` 或类型不对只丢这一项。
  - 非 200 业务 `code` 不在特殊码表里，改造前就是 reject 原状态（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），正文原样透传、不做字段改写；空正文仍归一成 resolve `status: 200` + `body: ''`。
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

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给歌单领域的 7 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。`playlist_mylike` 的登录录制来自本机账号；本批没有改动写操作模块。

  ### 新增公开结构定义
  - `playlist_detail_dynamic` → `PlaylistDetailDynamicBody`：收紧 `code`；正文是扁平的计数和状态，其余声明字段全部宽松。
  - `playlist_detail_rcmd_get` → `PlaylistDetailRcmdGetBody`：收紧 `code`、`data.recPlaylist`、`data.recPlaylist[].playlist.id`；`data` 是可以没有的路径，没有相关推荐时是 `null`。
  - `playlist_highquality_tags` → `PlaylistHighqualityTagsBody`：收紧 `code`、`tags`、`tags[].id`。
  - `playlist_hot` → `PlaylistHotBody`：收紧 `code`、`tags`、`tags[].id`；嵌套的 `playlistTag` 和其中的 `id` 宽松。
  - `playlist_mylike` → `PlaylistMylikeBody`：只接受 `code: 200`，收紧 `code`、`data`；`data.feeds` 只见过空数组，元素类型猜不出，没有声明。
  - `playlist_subscribers` → `PlaylistSubscribersBody`：收紧 `code`、`subscribers`、`subscribers[].userId`；收藏者其余字段沿用 `PlaylistUser` 的宽松写法。
  - `playlist_video_recent` → `PlaylistVideoRecentBody`：收紧 `code`、`data`、`data.videos`、`data.videos[].mlogBaseData.id`（字符串）。

  ### 共享结构

  `artist_video`、`search_multimatch` 和本批的 `playlist_video_recent` 逐字段重复了 mlog 记录里嵌着的歌曲结构，现在提到 `src/core/upstream-schemas.ts`，新增 `MlogSong`、`MlogSongArtist` 两个导出，三处改为 import 复用；这三个模块的 Body 行为不变。

  ### 行为变化
  - 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - **`playlist_mylike` 的匿名调用行为变化**：以前 resolve HTTP 200 + `code: 302`，现在 `decodeUpstreamBody` 在结构校验前拦下 `code ≠ 200`，SDK 以 `status: 302` 拒绝（`body` 是上游原文 `{ code: 302, message: null }`，录制 `playlist_mylike.anonymous.json`）。
  - 空结果可以正常返回：`playlist_detail_rcmd_get` 没有相关推荐时 `data` 是 `null`；`playlist_mylike` 的登录账号没有点赞过的视频，`data.feeds` 是空数组；`playlist_subscribers` 的 `offset` 越过总数时是空 `subscribers` 和 `total: 0`；`playlist_video_recent` 匿名时 `data.videos` 是空数组。
  - `playlist_detail_dynamic` 的正文没有数组，本批录制与探测未发现可达的空结果；`playlist_highquality_tags` 和 `playlist_hot` 本批录制与探测未发现可达的空结果，但 `tags` 数组本身允许为空。
  - `playlist_subscribers` 的分页语义按录制写清：匿名视角 `total` 上限是 30，`offset=0` 返回 20 条（`more: true`），`offset=20` 仍返回 10 条但带 `reason: needLogin`、`more: false`，`offset=40/60/100` 返回空数组和 `total: 0`；登录后 `total` 是完整数量（同歌单 2000，录制 `playlist_subscribers.authenticated-page-one.json`）。
  - `playlist_video_recent` 需要登录：匿名调用返回 `code: 200` 和空 `videos`，元素字段的证据只来自登录录制。非空录制非连续保留 5 段视频（索引 0/1/20/21/26，原始 31 段，见 `context.truncated`）。
  - 其余模块的匿名与登录重录非 null 路径与类型相同，登录只在宽松字段上多出现 null 或不同值；登录对照录制已删除。`playlist_subscribers` 保留登录第一页和空结果两份录制作为元素与 `total` 证据。
  - 这 7 个模块都没有本地输入拒绝分支，参数仍按原样透传给上游。

  ### 登录证据

  B5 没有新增 `login_status` 录制；登录身份由登录录制本身间接证明：`playlist_mylike` 返回了 `data`（匿名是 302）、`playlist_video_recent` 返回 31 段视频（匿名是空数组）、`playlist_subscribers` 登录后 `total` 是 2000（匿名上限 30）。匿名与登录的对照由同一命令重录完成。

  ### 迁移
  - 这 7 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - **`playlist_mylike` 调用方要处理 302**：匿名调用以前 resolve HTTP 200 + `code: 302`，现在以 `status: 302` 拒绝；需要先登录，或按 `status`/`code` 处理未登录。
  - 读 `playlist_detail_dynamic` 的计数和状态字段时类型带 `null | undefined`；`remarkName`、`remixVideo` 没有声明。
  - 读 `playlist_detail_rcmd_get` 的 `body.data` 时先判空；`data.recPlaylist[].playlist.id` 已收紧。
  - 读 `playlist_mylike` 的 `body.data.feeds` 时是未声明的 JSON 值，需要自行校验；`body.data.more`、`body.data.time` 类型带 `null | undefined`。
  - 读 `playlist_subscribers` 的 `body.total`、`body.more`、`body.reason` 时类型带 `null | undefined`；`subscribers[].userId` 已收紧，`subscribeTime` 宽松；匿名分页的 `total` 上限是 30，不能当成收藏总数。
  - 读 `playlist_video_recent` 的 `body.data.videos[].mlogBaseData.id` 时类型是 `string`；`mlogExtVO` 是宽松字段。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 6 个歌单写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `playlist_update` → `PlaylistUpdateBody`：`/api/batch` 的顶层 `code` 和 `/api/playlist/desc/update`、`/api/playlist/tags/update`、`/api/playlist/update/name` 三条子路由的 `code` 收紧，子路由的结果键必须出现；子路由的 `message` 宽松。
  - `playlist_track_add` → `PlaylistTrackAddBody`：只收紧 `code`。上游对自有歌单也回 `code: 401`（无权限操作歌单），没有录到成功正文，其余字段原样保留。
  - `playlist_track_delete` → `PlaylistTrackDeleteBody`：只收紧 `code`。上游对自有歌单也回 `code: 401`（无权限操作歌单），没有录到成功正文，其余字段原样保留。
  - `playlist_update_playcount` → `PlaylistUpdatePlaycountBody`：收紧 `code`；缺少 `id` 时上游回 HTTP 400 空正文，SDK 归一成 `status: 200`，空字符串作为独立分支保留，合计是 `{ code: 200, ... } | ''`。
  - `playlist_import_name_task_create` → `PlaylistImportNameTaskCreateBody`：只收紧 `code`；`data`、`data.taskId`、`msg`、`message` 宽松。`local`/`link` 分支没有录制，不对 `data.taskId` 收紧。
  - `playlist_import_task_status` → `PlaylistImportTaskStatusBody`：收紧 `code`、`data`、`data.tasks`、`data.tasks[].id`、`data.tasks[].status`；每条任务的其余字段和 `taskProcess` 宽松，只见过 `null` 的 `imgUrl`、`playlistName` 没有声明。

  ### 行为变化
  - 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - **非 200 业务码的状态码变化**：`playlist_track_add` 缺 `pid`、`playlist_track_delete` 缺 `id`、`playlist_import_name_task_create` 缺 `text` 的上游 `code: 400` 改造前被 `SPECIAL_STATUS_CODES` 归一成 `status: 200` 放行，现在按业务拒绝返回 `status: 400`，`body` 是上游原文。401（无权限操作歌单）、404（歌单已删除/不存在）、500（系统异常）不在特殊码表里，改造前就是 reject `status: 401`/`404`/`500`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文都不变。
  - `playlist_update` 的顶层 `code: 200` 不代表每条子路由都成功：标签超限时 `/api/playlist/tags/update` 回 `code: 400`，其余两条仍是 `200`。子路由的 `code` 是收紧字段，缺失或类型不对报 502。
  - 已删除歌单的 tombstone 仍会接受写入：`playlist_update` 对 `playlist.status: 10` 的歌单回 `200` 并改掉名字/简介/标签，`playlist_update_playcount` 同样回 `200` 并接受播放计数。清理的含义是歌单不再出现在用户歌单列表，元数据并未抹除；调用方不要用返回码判断歌单是否还存在。
  - `playlist_import_task_status` 的未知任务 id 回 `code: 200`、`data.tasks: []`、`data.taskProcess: null`；没有匹配到歌曲的任务是 `data.tasks[0].status: 'NOT_SONG_MATCH'`、`playlistId: 0`。

  ### 录制与清理
  - 歌单类写操作都在一个临时歌单（tid `18526771500`）上完成；导入任务不是歌单操作，只创建任务，不建歌单。
  - 临时歌单先用 `playlist_delete` 删除并保留响应，再用 `playlist_detail` 确认：仍回 `code: 200` 和 `playlist.status: 10`（删除标记），不是 HTTP 404。账号歌单快照从 58 张变成 57 张，只移除了这一张，没有新增，也没有既有歌单被改动。
  - 删除后做错误路径探测时发现，已删除歌单仍接受 `playlist_update` 的名字/简介/标签和 `playlist_update_playcount` 的计数写入，两份 fixture 的 `context.note` 已写明。
  - `playlist_import_name_task_create` 的无匹配文本只建了任务（`playlistId: 0`、`status: NOT_SONG_MATCH`），没有生成歌单。
  - 录制在 `tests/fixtures/netease/playlist-write/`。成功响应里的歌单 id、任务 id、`createTime` 和 `context.recordedAt` 是随机值，不能复现；失败录制的 `code`、`message` 是稳定的。
  - 无成功录制的证据缺口（仍有 Body，不计入 37 行例外，不宣称成功证据）：`playlist_track_add`/`playlist_track_delete` 只有 `code: 401`（无权限操作歌单）和 `code: 404`（歌单已删除/不存在）的拒绝录制；自建歌单的隐私和公开、weapi/eapi/api、PC UA、重复添加、删除已在歌单里的歌都回 401，没有 `final: true` 的成功录制。这两份结构定义只收紧 `code`，成功边界只能用手写 body 做结构测试，不能当作上游成功正文的证据；`schema:audit module` 对这两个模块因无成功录制返回 exit 1，不能把它描述成审计全绿。`playlist_import_name_task_create` 的 `local`/`link` 分支没有录制，`data.taskId` 因此不收紧。`playlist_update` 缺 `id` 时的 400 空正文没有录制，不猜它的形状。

  ### 迁移
  - 这 6 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 参数错误现在会 reject：`playlist_track_add`/`playlist_track_delete`/`playlist_import_name_task_create` 的 400 从 `status: 200` 变成 `status: 400` 拒绝，用 `try/catch` 接住后按 `body.code` 处理，不要只看 HTTP 状态。
  - 读 `playlist_update` 的子路由结果时，`code` 是必填数字（可能是 400 等业务码），`message` 可能缺失；顶层 200 不能当成三条都成功。
  - 读 `playlist_update_playcount` 时 `body` 可能是空字符串（缺少 `id` 的情况），先判类型再当对象用。
  - 读 `playlist_import_name_task_create` 时 `data` 可能缺失或 `null`（包括未录制的 `local`/`link` 分支），`data.taskId` 也可能缺失。
  - 读 `playlist_import_task_status` 时 `data.tasks` 可能为空，`data.taskProcess` 可能是 `null`。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 7 个播客与广播电台读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `broadcast_category_region_get` → `BroadcastCategoryRegionGetBody`：收紧 `code`、`data`、`data.categoryList`、`data.categoryList[].id`、`data.regionList`、`data.regionList[].id`；分类/地区名称宽松。
  - `broadcast_channel_list` → `BroadcastChannelListBody`：收紧 `code`、`data`、`data.list`、`data.list[].id`；封面、名称、地区、来源、分数、订阅状态、房间号、`total` 和 `hasMore` 宽松。
  - `broadcast_channel_currentinfo` → `BroadcastChannelCurrentinfoBody`：收紧 `code`、`data`、`data.id`、`data.playUrl`；节目编号、节目名、起止时间、时长、第三方编号和展示字段宽松。
  - `broadcast_channel_collect_list` → `BroadcastChannelCollectListBody`：只收紧 `code`；`data` 只见过空数组，元素类型没有证据，未声明并原样保留。
  - `voicelist_search` → `VoicelistSearchBody`：收紧 `code`、`data`；`data.total`、`data.hasMore` 宽松；列表元素未声明，原样保留。
  - `voicelist_list_search` → `VoicelistListSearchBody`：收紧 `code`、`data`；`data.total`、`data.hasMore` 宽松；列表元素未声明，原样保留。
  - `voice_lyric` → `VoiceLyricBody`：收紧 `code`、`data`；没有歌词时 `data` 是 `null`，声明为可以没有的路径，出现时 `data.lyricUrl` 收紧，`data.source`/`message` 只见过 `null`，未声明。

  ### 行为变化
  - 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `code: 400` 是特殊码，改造前被 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务码 reject `status: 400`：`broadcast_channel_currentinfo` 的已下架/无当前信息频道是 HTTP 200、正文 `code: 400`（录制 `broadcast_channel_currentinfo.delisted.json`），`voice_lyric` 的无播放权限声音也是 `code: 400`（录制 `voice_lyric.unavailable.json`）；`body` 保留网易云原文。
  - 空结果：`broadcast_channel_list` 的未知地区返回空列表和 `total: 0`（`broadcast_channel_list.empty.json`）；`broadcast_channel_collect_list`、`voicelist_search`、`voicelist_list_search` 的登录账号没有收藏/播客/声音，匿名调用同样为空；`voice_lyric` 的无歌词声音返回 `data: null`（`voice_lyric.without-lyric.json`）。`broadcast_category_region_get` 是静态目录，本批录制与探测未发现可达的空结果，数组本身允许为空。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`；7 个接口都保留了登录和匿名录制。`broadcast_category_region_get` 只有地区列表顺序不同，`broadcast_channel_list` 只有 11 处 `coverUrl` 的 CDN 主机（p3/p4）不同（`subed` 全 `false`、`total` 都是 `843`），`broadcast_channel_currentinfo` 只有 `currentTime` 不同；`broadcast_channel_collect_list`、`voicelist_search`、`voicelist_list_search`、`voice_lyric` 逐字段相同。

  ### 证据缺口

  `voicelist_list`、`voicelist_detail`、`voicelist_trans` 和 `voice_detail` 是创作者工作台接口，只允许操作自己的播客/声音。本机账号没有播客；工作台接口对非所有者返回 `code: 400`，`voice_detail` 访问他人声音返回 `code: 401`，个别不存在的 id 返回 HTTP 200、正文 `code: 200`、`data: null`。这些路径都没有带字段的成功正文可录，不猜结构、不加 `ModuleBody`。写操作 `broadcast_sub`、`dj_sub`、`dj_difm_channel_subscribe`、`dj_difm_channel_unsubscribe`、`voice_delete` 不在本批范围。

  ### 迁移
  - 这 7 个模块的 `body` 类型从原始 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `voice_lyric` 的 `data` 类型是 `{ ... } | null | undefined`，读 `lyricUrl` 前先判空；`voicelist_search`/`voicelist_list_search` 的 `data.list` 仍未声明，元素类型带 `unknown`/JSON，使用前自行校验。
  - 读 `data.list[].id`、`data.id`、`data.playUrl`、`data.categoryList[].id`、`data.regionList[].id` 等收紧字段时不再需要自己判空。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 6 个推荐读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `recommend_resource` → `RecommendResourceBody`：收紧 `code`、`recommend`、`recommend[].id`；歌单摘要复用 `PlaylistSummary`，另声明宽松的 `copywriter`、`picUrl`、小写 `playcount`、`type`、`alg`，`featureFirst`、`haveRcmdSongs` 宽松。
  - `personalized` → `PersonalizedBody`：收紧 `code`、`result`、`result[].id`；卡片复用 `PlaylistSummary`，`category`、`hasTaste` 和卡片附加字段宽松。
  - `personalized_mv` → `PersonalizedMvBody`：收紧 `code`、`result`、`result[].id`；记录复用 `MvSummary`，另声明宽松的 `picUrl`、`canDislike`、`copywriter`、`type`、`alg`；`trackNumberUpdateTime` 只见过 `null`，未声明。
  - `personalized_newsong` → `PersonalizedNewsongBody`：收紧 `code`、`result`、`result[].id`；`song` 是旧版歌曲结构，复用 `ProgramMainSong`（`album` 复用 `SimpleAlbum`、`artists` 复用 `Artist`），另声明宽松的 `alias`、`exclusive`、`sqMusic`、`hrMusic`、`privilege`（`LooseSongPrivilege`）和 `transName`/`transNames`；`category`、`trp` 宽松。
  - `personalized_privatecontent` → `PersonalizedPrivatecontentBody`：收紧 `code`、`result`、`result[].id`；`name` 和条目字段宽松。
  - `personalized_privatecontent_list` → `PersonalizedPrivatecontentListBody`：收紧 `code`、`result`、`result[].id`；`more`、`offset` 和条目字段宽松；条目比 `personalized_privatecontent` 多 `time`、少 `alg`，结构在模块内单独声明。

  ### 行为变化
  - 这 6 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 非 200 业务码的状态码变化：`personalized`、`personalized_newsong` 的非法 `limit` 和 `personalized_privatecontent_list` 的非法 `offset` 是 `{ code: 400, msg: '参数错误' }`，改造前经 `SPECIAL_STATUS_CODES` 映射为 resolve `status: 200`，现在被 Body 校验按业务拒绝为 reject `status: 400`、`body` 保留上游原文；`personalized_privatecontent_list` 的越界 `offset=100000` 是 `{ code: 404 }`，404 不在特殊码表里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变。上述路径都不报 502。
  - 空结果：本批录制和探测没有找到可达的空列表（`limit=0` 会回落到默认值，`personalized_mv`/`personalized_privatecontent`/`recommend_resource` 没有分页参数，越界 `offset` 返回业务错误），`recommend`/`result` 数组本身仍允许为空，契约测试用手写空数组覆盖。
  - 登录对照：6 个模块都录了匿名和登录两份，登录侧先经 `login_status` 确认 `anonimousUser: false`；`personalized`、`personalized_mv`、`personalized_privatecontent`、`personalized_privatecontent_list` 两边的字段路径和类型相同，`recommend_resource` 的 `creator.expertTags` 匿名 6/6 是 `null`、登录 19 条中 14 条仍 `null`、5 条是非空数组，`personalized_newsong` 的差异都在宽松字段的 `null`/出现与否上，不改变收紧字段。

  ### 迁移
  - 这 6 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 特殊码 `code: 400` 从 resolve 变成 reject：调用方需要用 `try/catch`（或 Effect 的失败通道）接住 `NcmApiResponse`，`error.body` 是上游原文；`code: 404` 改造前后都是 reject `status: 404`，公开状态不变。不要再按 `status === 200` 判断这些参数错误。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `result[].id` / `recommend[].id` 时不再需要自己判空；`playcount`、`highQuality`、`more`、`offset`、`time` 等宽松字段的类型带 `null | undefined`。
  - 推荐新歌的 `song` 是宽松字段，缺失或类型不对时整个 `song` 消失，读取前先判空。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 9 个播放记录读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `record_recent_song` → `RecordRecentSongBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`playTime`、`resourceType`、`banned`、`multiTerminalInfo`、`total`、`message` 和歌曲其余字段宽松。
  - `record_recent_playlist` → `RecordRecentPlaylistBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；歌单摘要复用 `PlaylistSummary`，`lastSong`、`playTime`、`resourceType`、`total`、`message` 宽松。
  - `record_recent_album` → `RecordRecentAlbumBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；专辑摘要复用 `AlbumSummary`，记录里附带的 `songs`（专辑的完整歌曲数组，录制里长度等于 `size`）、`lastSong`、`transName`、`transNames`、`playTime`、`resourceType`、`total`、`message` 宽松。
  - `record_recent_video` → `RecordRecentVideoBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`data.id` 在 MLOG 里是字符串、在 MV 里是数字，类型是 `string | number`；`title`、`name`、`coverUrl`、`duration`、`creator`、`artists`、`playTime`、`resourceType`、`total`、`message` 宽松。
  - `record_recent_dj` → `RecordRecentDjBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；名称、封面、主播、节目计数、分类和播放终端宽松。
  - `record_recent_voice` → `RecordRecentVoiceBody`：收紧 `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.pubDJProgramData.id`；`pubDJProgramData` 复用 `DjProgram` 并补上最近播放列表额外返回的统计和分类字段，`commentCount`、播放终端和其余节目字段宽松。
  - `history_recommend_songs` → `HistoryRecommendSongsBody`：收紧 `code`、`data`、`data.dates`，`data.dates[]` 是日期字符串；`data.songs` 在录制里只有 `null`，未声明；`purchaseUrl`、`description`、`noHistoryMessage` 宽松。
  - `history_recommend_songs_detail` → `HistoryRecommendSongsDetailBody`：收紧 `code`、`data`、`data.songs`、`data.songs[].id`；`data.dates` 只见过空数组、`data.description` 只见过 `null`，未声明；`purchaseUrl`、`noHistoryMessage` 宽松。
  - `music_first_listen_info` → `MusicFirstListenInfoBody`：收紧 `code`、`data`、`data.songInfoDto.songId`、`data.musicFirstListenDto.date`；四个信息块按可以没有处理，缺失或为 `null` 照常返回，出现时仍校验；`title` 和只见过 `null` 的面板未声明。

  ### 行为变化
  - 这 9 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对只丢这一项；宽松字段的 `null` 原样保留。
  - 六个最近播放接口和 `music_first_listen_info` 的结构定义用 `object | ''` 联合：`limit` 非数字（或回忆坐标缺少 `id`）时上游 HTTP 400 空正文被既有逻辑归一成 `status: 200`、`body: ''`，现在仍原样返回空字符串，不会误报 502。
  - `history_recommend_songs_detail` 的日期格式不合法时上游返回 `code: 400`。400 是特殊码，改造前被 `SPECIAL_STATUS_CODES` 归一成 resolve `status: 200`，现在按业务码 reject `status: 400`，`body` 保留原文，不报 502。

  ### 空结果与登录
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。
  - 六个最近播放接口匿名调用返回 `total: 0`、`list: []`（各自一份 `.anonymous.json`），作为列表的真实空结果；登录录制分别有 40 首歌曲、15 个歌单、8 张专辑、4 个视频、1 个电台、10 个声音（截断记录见 `context.truncated`）。
  - `history_recommend_songs` 登录和匿名的 `data.songs` 都是 `null`，匿名 `data.dates` 是空数组；`history_recommend_songs_detail` 匿名返回 `songs: []`；`music_first_listen_info` 匿名返回 `data: {}`。
  - 本批结论只覆盖这些录制与探测，不据此推断所有账号、地区和上游版本一致；本批 9 个模块都是只读接口，没有写操作。

  ### 证据缺口

  `history_recommend_songs` 的 `data.songs` 没有非 null 证据，元素类型猜不出，未声明；`history_recommend_songs_detail` 的 `data.dates` 只见过空数组，元素类型未声明。`record_recent_voice` 的 `replaceName`、`icon`、`pubDJProgramData.algReason`、`blurCoverUrl` 等只见过 `null` 的字段未声明，仍原样保留。

  ### 迁移
  - 这 9 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 六个最近播放接口的 `body` 可能是 `object | ''`；调用方要先排除空字符串再读 `data`。`record_recent_video` 的 `data.id` 是 `string | number`，不要假定为单一类型。
  - `HistoryRecommendSongsBody` 的 `data.songs` 仍未声明，读取前自行判断；`HistoryRecommendSongsDetailBody` 的 `data.dates`、`data.description` 也未声明。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 8 个写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体；部分写操作没有撤销调用（`recommend_songs_dislike`、`fm_trash` 已在模块页说明）。`user_update` 因上游拒绝没有成功正文证据，本批不改。

  ### 新增公开结构定义
  - `dj_difm_channel_subscribe` → `DjDifmChannelSubscribeBody`：只收紧 `code`；`message` 宽松，`data` 在订阅与取消的录制里只有空对象，未声明并原样保留。
  - `dj_difm_channel_unsubscribe` → `DjDifmChannelUnsubscribeBody`：只收紧 `code`；`message` 宽松，`data` 在订阅与取消的录制里只有空对象，未声明并原样保留。
  - `song_lyrics_mark_add` → `SongLyricsMarkAddBody`：收紧 `code`、摘录结果 `data` 和这条摘录自己的 `data.markId`；`data.success`、`data.updateTime` 和 `message` 宽松。
  - `song_lyrics_mark_del` → `SongLyricsMarkDelBody`：收紧 `code`、删除结果 `data` 和 `data.success`；删除已不存在的摘录时返回码仍是 `200`，`success` 是 `false`。
  - `user_social_status_edit` → `UserSocialStatusEditBody`：只收紧 `code`；`data` 是设置成功后的展示提示（录制里是「将展示7天」），`message` 是附带提示，都宽松。
  - `recommend_songs_dislike` → `RecommendSongsDislikeBody`：收紧 `code` 和接口返回的替换推荐歌曲 `data`、`data.id`；歌曲复用 core 的 `Song`，其余字段宽松。
  - `fm_trash` → `FmTrashBody`：收紧 `code`；`count` 宽松，`songs` 只有空数组证据、元素类型未知，未声明并原样保留。
  - `cloud_match` → `CloudMatchBody`：收紧 `code`、匹配后的云盘记录 `matchData` 和这条记录自己的 `matchData.songId`；`matchData` 内嵌歌曲复用 `LooseSong`，`message`（成功时是数字 `200`）和 `data`（布尔成功标记）宽松。三份录制的 `query.uid` 换成合成值 `10000001`，正文未改写。

  ### 行为变化
  - 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 非 200 业务码的公开状态跟着 Body 校验变：`cloud_match` 的无效纠错目标（`code: 400`，录制 `cloud_match.invalid-asid.json`）在 `SPECIAL_STATUS_CODES` 里，以前被归一成 `status: 200` 放行，现在按业务码 reject `status: 400`；`user_social_status_edit` 的全空字段（`code: 500`，录制 `user_social_status_edit.clear-rejected.json`）不在特殊码表里，改造前就是 reject `status: 500`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文都不变。两者的 `body` 都保留网易云原文。
  - 可逆写入的状态已回读确认恢复：DIFM 频道 10505 在 04:00:22Z 订阅后回读出现、04:00:35Z 取消后回读为空；05:00:10Z 清空后重新订阅（写前回读为空数组、写后含 10505），05:00:16Z 最终取消并回读 `data: []`，这组录制结束时该频道未订阅；已订阅时重复订阅的幂等分支未录制；歌曲 1394617453 的摘录新建、修改、删除后 `song_lyrics_mark` 回读与最终空列表；云盘歌曲 2706240277 匹配到 347230 后按 347230 回读为 `matched`，`asid=0` 撤销后回读恢复 `unmatched`。
  - `user_social_status_edit` 只能设置状态，模块内无法清空：四个字段全空时上游返回 `code: 500`（录制 `user_social_status_edit.clear-rejected.json`），本批用模块外的 `content` 为空原始请求清空，重新用 `user_social_status` 回读确认 `data` 为空对象。录制只覆盖设置成功（`user_social_status_edit.set.json`）和清空被拒两种正文，不把清空算作该模块的可逆能力。
  - 只能做一次的写入没有撤销调用：`recommend_songs_dislike`（日推歌曲 3431747417）和 `fm_trash`（歌曲 347230）只录单次成功正文，录制 `context.note` 写明半可逆或不可逆。
  - `user_update` 在本机账号上用 `api`/`eapi`/`weapi`/`linuxapi` 四种协议探测（未落盘）均返回 `code: 250`「用户资料初始化或修改失败」，尝试前后 `user_detail` 回读的资料没有变化；没有成功正文证据，本批不声明结构定义，`body` 仍原样返回。

  ### 迁移
  - 这 8 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `song_lyrics_mark_del` 的 `data.success` 收紧后类型是 `boolean`，删除已不存在的摘录时返回 `false`，不要再只看 `code`。
  - `cloud_match` 成功正文的 `message` 类型是 `number | null | undefined`，`data` 是 `boolean | null | undefined`。
  - 非 200 业务码要按 reject 处理：`cloud_match` 的 `code: 400` 从 resolve `status: 200` 变成 reject `status: 400`，调用方需要 try/catch 接住 `NcmApiResponse`；`user_social_status_edit` 的 `code: 500` 改造前后都是 reject `status: 500`，只是失败类型从 `ProtocolFailed` 变成 `UpstreamBusinessFailed`，公开状态和正文不变。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给搜索领域的 6 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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

- 0b7137a: 给 4 个乐谱、年度总结和星评只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `sheet_list` → `SheetListBody`：收紧 `code`、乐谱列表 `data.musicSheetSimpleInfoVOS`（可以没有）和每份乐谱自己的编号 `id`；没有乐谱时列表是 `null`（`other/sheet_list.empty.json`）。乐器筛选项 `data.sheetInstrumentTypeVOList` 同样可以为 `null`；`findSheet`、`uploadSheet`、`errorCode` 和乐谱展示字段全部宽松。
  - `sheet_preview` → `SheetPreviewBody`：收紧 `code`、乐谱页数组 `data`、每页自己的编号 `id` 和取图地址 `url`；不存在的乐谱返回空数组（`other/sheet_preview.empty.json`）。`sheetId`、`md5`、`pageNumber`、`size` 宽松；匿名调用同样返回 6 页（`other/sheet_preview.anonymous.json`）。
  - `summary_annual` → `SummaryAnnualBody`：只收紧 `code` 和通到年度报告的 `data`。报告正文按年份变化（2020 年起长键，2017–2019 走 `userdata` 短键），已声明字段全部宽松，未声明字段原样保留。本批保留 2018、2019 和 2022、2023 的录制，其他年份未验证；2018 的评论正文 `data.mlc` 是字符串，按 `number | string` 的宽松字段声明。没有报告的 2025 返回 `code: 404`，按业务拒绝原样转交。
  - `starpick_comments_summary` → `StarpickCommentsSummaryBody`：收紧 `code`、首页 block 列表 `data.blocks` 和每个 block 自己的编号 `blockCode`；星评评论在 `creatives[].resources[]` 里，`creatives` 是可以没有的路径，缺失或 `null` 照常返回，出现时坏一条仍报 502。`resources` 与每个 creative 的 `uiElement` 是宽松字段，坏值只丢该项；block 的 `extInfo` 未声明、原样保留，其余展示字段宽松。

  ### 行为变化
  - 这 4 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `summary_annual` 在没有报告的年份（2025）上游返回 HTTP 200 + `code: 404`。404 不在特殊码表里，改造前请求层就 reject `status: 404`（`ProtocolFailed`），并没有 resolve `status: 200`；现在 Body 校验按业务码 reject 相同状态（`UpstreamBusinessFailed`），公开 `status` 和 `body` 不变，只是失败类型变化（`record/summary_annual.no-report.json`）。
  - 空结果：`sheet_list` 对没有乐谱的歌曲返回 `musicSheetSimpleInfoVOS: null`（歌曲 7238118806）；`sheet_preview` 对不存在的乐谱返回 `data: []`（id=1）。`starpick_comments_summary` 没有可达的空 block 结果，数组本身允许为空。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`；`sheet_preview` 另保留匿名录制（同样 6 页），其余模块的录制都来自登录账号，除 `sheet_preview` 外未保留匿名对照，不对公开结构作相同性断言。`summary_annual.2018`/2019 的 `data.ouid`、`data.nkn` 和加密 uid，2019 的 `data.uun` 与 `data.aul`、2018 的 `data.aul`，以及 2022/2023 的加密用户 id 已换成合成值。
  - `starpick_comments_summary` 的录制保留 banner、歌单推荐和星评评论三个 block（原 15 个），有 creative 的 block 保留两条 creative、每条 creative 保留一条 resource；`context.truncated.length` 记原数组长度。
  - `yunbei_expense` 和 `yunbei_receipt` 本批没有补结构定义：登录账号探测两个上游路径仍返回 `code: 404`、消息“接口未找到”，没有成功返回体证据，SDK 继续原样转交正文。

  ### 迁移
  - 这 4 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - `summary_annual` 在没有报告的年份（2025）以前就是 reject `status: 404`（不是 resolve `status: 200`），现在仍 reject `status: 404`，调用方已按 404 处理的不需要改动。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `sheet_list` 的 `musicSheetSimpleInfoVOS` 和 `sheetInstrumentTypeVOList` 类型带 `null | undefined`，读取前要判空；`summary_annual` 的报告正文仍按年份自行收窄，SDK 只保证 `data` 是对象。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 5 个相似内容读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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

- 0b7137a: 给 2 个歌曲播放/下载链接模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `song_url` → `SongUrlBody`：描述的是 **SDK 最终体**，不是网易云原文。最终体只有 `{ code: 200, data }`，上游其他顶层字段不会保留，`data` 缺失时是空数组。收紧最终体的 `code`、`data`、`data[].id`、`data[].url`、`data[].code`；`data[].id` 兼容字符串和数字编号，`level`、`freeTrialInfo` 及其余地址字段宽松。本批新增的是最终体类型化与 `url` / `code` 收紧；`code` 合成 200、顶层只有 `code` / `data`、按请求 `id` 排序都不是新增行为（原实现已经这样做）。
  - `song_download_url` → `SongDownloadUrlBody`：正常录制与网易云原文逐字段一致；宽松字段类型不对时只丢该项。收紧 `code`、`data`、`data.id`、`data.url`、`data.code`；`level`、`size`、`auEff`、`freeTrialInfo` 等其余字段宽松。与 `song_url_v1`、`song_download_url_v1` 共用内部 `SongUrlData` 结构（已移到 `src/core/upstream-schemas.ts`）。

  ### 行为变化
  - 这两个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `song_url` 的最终体仍然只有 `code` 和 `data`，`code` 由模块合成 200，单项失败看 `data[].code`；上游顶层 `code` 被忽略。301 等非特殊状态码会在请求层先被拒绝，不会到达模块。`url` 不替换；`freeTrialInfo` 不合并片段，内部坏字段按宽松字段丢弃。
  - `song_download_url` 的顶层 `code` 为 404 时基线就由请求层拒绝（不是本批变化）。特殊状态码 400/302/803 以前 resolve `status: 200`，现在 reject：400/302 的 `status` 分别等于 400/302，803 落到 400，不是“等于业务码”；正文仍是网易云原文。条目级 `data.code` 为 `-105`/`-110` 时顶层仍是 200，SDK 正常返回正文，不报 502。
  - `song_download_url` 的 `data` 缺失、不是对象或缺少 `id` / `url` / `code` 时现在报 502；以前原样返回。
  - 上游码语义不稳定：同一请求在本次探测/重录中会从 200 翻转为 404（播放）或从 200 翻转为 `-110`（下载）。本批保留 `song_url.transient-404.json`、`song_download_url.transient-110.json` 作为翻转快照。`url: null` 时不能凭一次 `code` 判定无版权/无权限，先重试或交叉验证。

  ### 迁移
  - 这两个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `song_download_url` 遇到特殊状态码 400/302/803 时会 reject，用 `try/catch` 接住 `NcmApiResponse`，不要只检查 resolve 后的 `status`。
  - 下载前先重试一次；仍不满足 `data.code === 200`、`data.url !== null`、`data.size > 0` 时再标记失败。`size` 是宽松字段，缺失时无法核对文件字节数。
  - 本批只保留匿名和失效 Cookie 录制；失效 Cookie 不是登录证据，没有登录对照，不对登录后的 `freeTrialInfo`、`payed` 等字段作相同性断言。

  详见公开指南的[返回体结构](/guide/response-bodies#播放)。

- 0b7137a: 给 6 个曲风读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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

- 0b7137a: 给榜单、新碟、新歌和热门歌手的 8 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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

- 0b7137a: 给 7 个 UGC 百科只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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
  - 录制来自 issue #102，落在 `tests/fixtures/netease/ugc/`。登录对照先用 `login_status` 确认 `account.anonimousUser: false`；`ugc_detail` 和 `ugc_user_devote` 保留了匿名对照，未发现字段类型差异，其余五个模块只保留登录录制，不对匿名结构作相同性断言。
  - `ugc_detail` 的当前账号没有贡献，登录和匿名都只有空列表，非空 `wikiDetailResultVoList` 的元素形状没有证据，是缺口；需要有效贡献账号补录后再收紧。
  - `ugc_user_devote` 的两份录制里 `ugcCount`、`integration`、`cloudShell` 都是 0，非零计数没有证据；三个字段按宽松计数声明，缺了或类型不对只丢这一项。
  - 录制里的账号编号已换成合成值（`10000001` / `10000002`），响应侧 `data.userId` 不是原始 uid。

  ### 迁移
  - 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - `ugc_mv_get` 的未知 MV 以前就按 `status: 404` reject，现在相同，公开状态和正文不变；专辑、歌手、歌曲百科读取要先判断 `body.data` 是否存在。

  详见公开指南的[返回体结构](/guide/response-bodies#百科与用户贡献)。

- 0b7137a: 给 7 个用户账号读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `user_level` → `UserLevelBody`：收紧 `code`、`data`、`data.userId`、`data.level`；`info`、`progress`、`nowPlayCount`、`nowLoginCount`、`nextPlayCount`、`nextLoginCount` 和 `full` 宽松。
  - `user_subcount` → `UserSubcountBody`：只收紧 `code`；各项收藏计数全部宽松。
  - `user_binding` → `UserBindingBody`：收紧 `code`、`bindings`、`bindings[].id`；绑定时间、过期标记、`url`、`userId` 和 `tokenJsonStr` 宽松。
  - `user_social_status` → `UserSocialStatusBody`：收紧 `code`；社交状态 `data` 在录制里只有空对象，内部字段没有声明，按宽松对象保留。
  - `user_medal` → `UserMedalBody`：收紧 `code`、`data`、`data.obtainMedals`、`data.obtainMedals[].medalCode`、`data.categoryMedalBlockVos`、`data.categoryMedalBlockVos[].medalVOS`、`data.categoryMedalBlockVos[].subGroups[].medals`；分类块和分组里套着的徽章是嵌套记录，编号也宽松。`subGroups` 可以没有（缺失或 `null` 正常），出现时里面的记录仍按结构校验。
  - `user_cloud` → `UserCloudBody`：收紧 `code`、`data`、`data[].songId`；`privateCloud` 和 `simpleSong` 是记录里套着的对象，全部宽松，分别复用 core 的 `PrivateCloud` 和 `LooseSong`（`Song` 字段 + 宽松 `id`）。
  - `user_cloud_detail` → `UserCloudDetailBody`：收紧 `code`、`data`、`data[].songId`；`simpleSong` 同上。

  ### 行为变化
  - 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `user_medal` 查不存在的 uid 返回 `{ code: 499, message: '用户信息获取失败' }`。499 不在特殊码表里，改造前请求层就 reject `status: 499`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变，不报 502。
  - 空结果：`user_binding` 在不存在的 uid 下返回 `bindings: []`；`user_cloud` 的 `offset` 越过末尾返回 `data: []`；`user_cloud_detail` 传入不在云盘的歌曲 id 返回 `data: []`。这些数组本身允许为空。`user_medal` 本批录制与探测未发现可达的空结果；数组本身允许为空（`user_medal.unknown-user.json` 是 code 499，不是空结果）。
  - `user_cloud` 的 25 条云盘记录截到 3 条，`user_medal` 的 493 条已获得徽章截到 5 条、5 个分类块截到 3 个（按字段覆盖抽样，已获得徽章保留原下标 0/1/18/259/289，分类块为 0/1/2；`sideBarGuideText` 空串样例来自完整录制），截断长度写在对应录制的 `context.truncated`。
  - 只见过 `null` 的字段（如 `user_medal` 的 `medalTabs`、`musicMedalOperationVO`、`levelMedalPicUrl`、`userObtainProportion`、`detailPage`，`user_cloud` 的 `cursor`、`message`、`idVersions`）没有声明，继续作为未声明字段原样保留。
  - 本批录制全部来自登录视角（先经 `login_status` 确认 `anonimousUser: false`）；`user_account` 的匿名对照仍在既有 login 录制里，`user_detail` 没有匿名录制，两者的声明都不在本批改动范围内。

  ### 迁移
  - 这 7 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读宽松字段（如收藏计数、绑定时间、云盘文件的 `matchType`）时类型带 `null | undefined`；读收紧字段（`data.level`、`bindings[].id`、`data[].songId`、`obtainMedals[].medalCode`）时不再需要自己判空。
  - `user_social_status` 的 `data` 目前没有可依赖的内部字段，仍按 JSON 值保留。
  - 模块输入合同没有变化。
  - 工具链：模块表面与运行时行为不变；生成的 registry 只改类型标注（去掉 `as const`、加显式 `SdkModuleRegistry`），避免新增 Body 后 dts 超过 TypeScript 的序列化上限（TS7056）；生成内容重新生成后与提交一致。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 7 个用户社交列表读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。关注、取关等写操作不在本批范围。

  ### 新增公开结构定义
  - `user_follows` → `UserFollowsBody`：收紧 `code`、`follow`、`follow[].userId`；`more`、`touchCount` 宽松。
  - `user_followeds` → `UserFollowedsBody`：收紧 `code`、`followeds`、`followeds[].userId`；`more`、`newCount`、`size` 宽松。
  - `user_follow_mixed` → `UserFollowMixedBody`：收紧 `code`、`data`、`data.records`、`data.records[].followId`；`userProfile` 是可以没有的路径（艺术家记录里是 `null`）。
  - `user_mutualfollow_get` → `UserMutualfollowGetBody`：收紧 `code`、`data`（布尔结果）。
  - `user_comment_history` → `UserCommentHistoryBody`：收紧 `code`；`data.comments`、`data.hotComments` 是可以没有的路径，出现时 `commentId` 收紧。
  - `user_dj` → `UserDjBody`：收紧 `code`、`programs`、`programs[].id`，节目记录复用 `DjProgram`。
  - `user_event` → `UserEventBody`：收紧 `code`、`events`、`events[].id`；评论信息、作者、图片和计数宽松。

  ### 共享结构

  `artist_fans`、`user_follows`、`user_followeds`、`user_follow_mixed`、`user_event` 的用户记录里 VIP 权益字段一致，抽出 `src/core/upstream-schemas.ts` 的 `VipRights`，并声明 `relationType` 与 `extInfo.logo.logoDto` 的宽松字段（`memberLogo` 只见过 `null`，未声明）。`user_follows`、`user_followeds` 的关注/粉丝记录复用 `UserProfile` 的宽松字段，再补上 `py`、`time`、`vipRights`，`user_follows` 还补 `expertTags`；`remarkName` 只见过 `null`，没有声明。`user_event` 的动态作者也复用 `UserProfile`，评论串里补 `latestLikedUsers[]` 的 `s`、`t` 宽松字段；`user_comment_history` 的评论复用 `CommentRecord` 并补 `beRepliedContent`、`beRepliedUser`、`resourceInfo`、`resourceType`、`threadId`。

  ### 行为变化
  - 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在上述收紧路径缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - `user_follow_mixed` 未登录时上游返回 HTTP 200、`code: 400`、`message: "not login"`，SDK 按业务拒绝原样转交（`status: 400`，正文为网易云原文），不再返回 `status: 200`。
  - `user_comment_history` 的 `data.comments`、`data.hotComments` 缺失或 `null` 都照常返回；出现但里面一条评论缺 `commentId` 时报 502。
  - 空结果：关注列表越界分页（`user_follows.empty.json`）、无粉丝账号（`user_followeds.empty.json`）、越界 `cursor`（`user_follow_mixed.empty.json`）、无历史评论/未登录（`user_comment_history.empty.json`、`user_comment_history.anonymous.json`）、无节目账号（`user_dj.empty.json`）、无动态账号（`user_event.empty.json`）都返回空数组或 `null`，结构定义接受。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`，只保留 `user_follow_mixed`、`user_comment_history`、`user_mutualfollow_get` 的未登录录制；其余模块本批未保留未登录录制，不对公开结构作相同性断言。

  ### 工具链

  `scripts/gen-module-types.mts` 生成的 `sdkModuleRegistry` 改为显式标注 `SdkModuleRegistry`，修复新增 Body 后 declaration emit 的 TS7056（352 条目 `as const` 字面量超过编译器序列化上限）；运行时值与生成输出不变。

  ### 迁移
  - 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `follow[].userId`、`followeds[].userId`、`data.records[].followId`、`programs[].id`、`events[].id` 时不再需要自己判空；`data` 里的布尔结果和评论列表仍要按 `null | undefined` 处理。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给视频领域的 9 个只读模块补上结构定义（`ModuleBody`），并在运行时校验返回体。`video_sub` 已由本 release 的写操作批次补上 `VideoSubBody`。

  ### 新增公开结构定义
  - `video_category_list` → `VideoCategoryListBody`：收紧 `code`、`data`、`data[].id`；`abExtInfo` 只见过 `null`，未声明。
  - `video_detail` → `VideoDetailBody`：收紧 `code`、`data`、`data.vid`；`creator` 复用宽松的 `PlaylistUser`，`markTypes`（只见过空数组）和 `videoUserLiveInfo`（只见过 `null`）未声明。
  - `video_detail_info` → `VideoDetailInfoBody`：收紧 `code`、`commentCount`、`shareCount`、`likedCount`；`liked` 宽松。
  - `video_group` → `VideoGroupBody`：收紧 `code`；`datas` 在录制和对全部标签 id 的探测里只见过 `null`，元素类型无法确定，未声明；`msg` 只见过 `null`，也未声明。
  - `video_group_list` → `VideoGroupListBody`：收紧 `code`、`data`、`data[].id`；`relatedVideoType`、`abExtInfo` 只见过 `null`，未声明。
  - `video_timeline_all` → `VideoTimelineAllBody`：收紧 `code`、`datas`、`datas[].data.vid`；`hasmore`、`msg`、`rcmdLimit` 宽松。
  - `video_timeline_recommend` → `VideoTimelineRecommendBody`：收紧 `code`、`datas`、`datas[].data.vid`；`hasmore`、`msg` 宽松。
  - `video_url` → `VideoUrlBody`：收紧 `code`、`urls`、`urls[].id`、`urls[].url`。
  - `related_allvideo` → `RelatedAllvideoBody`：收紧 `code`；`data` 在两种 `type` 分支的录制里都是空数组，元素类型无法确定，未声明。

  两个 timeline 模块的视频记录在模块内分别声明：`creator` 复用宽松的 `PlaylistUser`，`resolutions[]`、`videoGroup[]`、`markTypes` 宽松，`relateSong[]` 是宽松字段里套着的歌曲记录（复用 `Song` 的字段并把 `id` 放宽）。`previewUrl` 只在 `video_timeline_all` 有非 `null` 证据，`urlInfo` 只在 `video_timeline_recommend` 有非 `null` 证据；`extAlg`、`relatedInfo`、`videoUserLiveInfo` 只见过 `null`，都没有声明。视频记录与 MV 记录字段不同，没有硬套 `MvSummary`；三个视频模块（`video_detail`、`video_timeline_all`、`video_timeline_recommend`）共用的 `resolutions[]` 条目和 `videoGroup[]` 引用提升为 core 的 `VideoResolutionEntry`、`VideoGroupRef`，属于 core 内部新增导出（未进包入口），不改既有结构。

  ### 行为变化
  - 这 9 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段仍然缺失、`null` 或类型不对都只丢这一项。
  - 空结果可以正常返回：`video_timeline_all` 的越界 `offset` 返回 `datas: []`；`video_timeline_recommend` 的越界 `offset=100` 返回 `datas: []`（录制 `video_timeline_recommend.empty.json`）；`video_url` 对未知视频返回 `urls: []`；`related_allvideo` 的两种 `type` 分支都返回空 `data`；`video_group` 返回 `datas: null`。`video_category_list`、`video_group_list` 本批录制与探测未发现可达的空结果。
  - `video_url` 覆盖三种清晰度（请求 1080 实际给到 720、480p、240p）；未探测到 `url` 为 `null`，所以 `urls[].url` 按必填字符串收紧，拿不到地址时上游返回空数组。付费/会员视频的 `urls[].url` 未覆盖；若上游给 `null`，会以 `UnexpectedUpstreamShape`（`status: 502`）拒绝。
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`。两个 timeline 模块的登录录制差异只在宽松字段（`relateSong` 出现歌曲记录、`markTypes` 出现值；`creator.experts` 的键集合差异只在 `video_timeline_all`，匿名录制多出 `experts.2`，`video_timeline_recommend` 两边都只有 `{1}` 或 `null`），登录录制保留为元素字段证据；其余 7 个模块只保留匿名录制，未保留登录对照，不对公开结构作相同性断言。
  - `video_detail_info` 的本地输入拒绝没有变化：非原始值 `vid` 仍在发请求前返回 400。`video_detail` 对数字视频 id 返回的 `code: 400` 作为业务失败原样转交。

  ### 迁移
  - 这 9 个模块的 `body` 类型从原始的 JSON 值变成了收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `video_timeline_all` / `video_timeline_recommend` 的 `datas[].data` 时，`vid` 是 `string`，`creator`、`markTypes`、`relateSong`、`resolutions`、`videoGroup` 等宽松字段带 `null | undefined`。
  - 读 `video_url` 的 `body.urls[].url` 时类型是 `string`；拿不到地址时数组为空，不要只检查顶层 `body.code`。
  - 读 `video_group` 的 `body.datas`、`related_allvideo` 的 `body.data` 时它们没有声明，类型是 JSON 值。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 8 个签到与云贝状态读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `signin_progress` → `SigninProgressBody`：收紧 `code`、签到页 `data`、今日签到状态 `data.today.todaySignedIn`、签到记录 `data.records` 及每条记录的 `day`、签到统计 `data.stats` 与 `data.today.todayStats` 及统计的 `id`；记录的 `signed`、统计描述、进度和奖品字段宽松，只见过 `null` 的 `currentSignDesc` 未声明。
  - `sign_happy_info` → `SignHappyInfoBody`：收紧 `code`、`data`、活动信息 `data.info` 及其 `id`；活动文案、资源链接、图片和热评字段宽松，只见过 `null` 的 `jumpText`、`specialJumpUrl`、`btnPicUrl`、`operator`、`videoStrId` 未声明。
  - `yunbei` → `YunbeiBody`：收紧 `code`、签到状态 `data` 及连续签到天数 `data.days`、当天获得的云贝 `data.shells`。
  - `yunbei_info` → `YunbeiInfoBody`：收紧 `code`、账户记录 `userPoint` 及其 `userId`、`balance`；账户等级、签到标记和票券文案宽松，只见过 `null` 的配置字段未声明。
  - `yunbei_today` → `YunbeiTodayBody`：收紧 `code`、`data` 及当天获得的云贝 `data.shells`。
  - `yunbei_tasks` → `YunbeiTasksBody`：收紧 `code`、任务列表 `data` 及每个任务的 `taskId`；任务说明、图标、链接和奖励明细宽松，只见过 `null` 的 `wordsPicUrl`、图标与目标状态字段未声明。
  - `yunbei_tasks_todo` → `YunbeiTasksTodoBody`：收紧 `code`、待办任务列表 `data` 及每个任务的 `userTaskId`（任务未开始时为 0）；任务名、奖励和链接宽松。
  - `yunbei_rcmd_song_history` → `YunbeiRcmdSongHistoryBody`：收紧 `code`、推歌历史 `data`；`data.records` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留，分页对象 `data.page` 宽松。

  ### 行为变化
  - 这 8 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对时丢这一项，`null` 原样保留。
  - 非 200 业务码的状态变化：`signin_progress` 的非法 `moduleId` 与 `yunbei_rcmd_song_history` 的负 `size` 都返回 HTTP 200 + `code: 400`。400 在 `SPECIAL_STATUS_CODES` 里，以前被归一成 resolve `status: 200` 并原样返回正文；现在按业务拒绝 reject `status: 400`，`body` 仍是网易云原文。
  - 匿名调用同样有特殊码变化：`yunbei`、`yunbei_today`、`sign_happy_info` 返回 `code: 302`（各模块的 `.anonymous.json`），302 以前被归一成 resolve `status: 200`，现在按业务码 reject `status: 302`，`body` 保留原文；`signin_progress` 匿名的 `code: 301` 不在特殊码表里，改造前就是 reject `status: 301`（`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态和正文不变。没有录到 HTTP 400 空正文，`ModuleBody` 不包含空字符串分支。
  - 写操作不在本批范围：`daily_signin`、`vip_growthpoint_get`、`yunbei_sign`、`yunbei_task_finish`、`yunbei_rcmd_song` 没有改动。

  ### 空结果与未覆盖路径
  - `signin_progress` 的默认录制来自一个未签到的登录账号（`records[].signed` 全为 `false`），同时是未签到证据；30 天记录、3 条统计和今日统计都是非空数组，空窗口没有录到。
  - `yunbei_today` 的录制是 0 云贝零值；`yunbei_rcmd_song_history` 的录制是空历史。
  - `yunbei_tasks`、`yunbei_tasks_todo` 和 `sign_happy_info` 在本批录制里只有非空列表，本批未录到空结果（未验证是否可达）。
  - `yunbei_expense`、`yunbei_receipt` 本次探测仍返回 `code: 404`（接口未找到），没有成功正文，未补结构定义。

  ### 登录对照
  - 录制前用同一 Cookie 调用 `login_status`，确认 `account.anonimousUser` 为 `false`；登录对照录制未落盘。匿名对照：`signin_progress` 返回 `code: 301`，`sign_happy_info`、`yunbei`、`yunbei_today` 返回 `code: 302`；`yunbei_info`、`yunbei_tasks`、`yunbei_tasks_todo`、`yunbei_rcmd_song_history` 返回 `code: 200` 且通过结构校验，录制分别是各模块的 `.anonymous.json`。

  ### 迁移
  - 这 8 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，读取时是 JSON 值。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 读 `signin_progress` 时用 `body.data.today.todaySignedIn`（收紧）和 `body.data.records[].signed`（宽松，类型含 `null | undefined`）判断签到状态；统计描述、进度和奖品仍是宽松字段。
  - `yunbei_rcmd_song_history.data.records` 未声明，使用前请自行校验。
  - 读 `yunbei_tasks.data[].taskId` 和 `yunbei_tasks_todo.data[].userTaskId` 等收紧字段时不再需要自己判空。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 3 个声音、播客与 mlog 读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `mlog_url` → `MlogUrlBody`：收紧 `code`、`data`、`data.id`、`data.resource`、`data.resource.id` 和接口要拿的播放地址 `data.resource.content.video.urlInfo.url`；mlog 正文（`content`）、视频其余字段、歌曲记录（复用 `MlogSong` 的字段并补 `startTime`、`endTime`、`isLiked`、宽松 `privilege`）和作者宽松。`businessEntrance`、`promotion`、`relatedActivity`、`showExtInfo`、`otherData`、`nextModule`、`srcId`、`logInfo` 以及资源里几个只见过 `null` 的字段没有声明，原样保留。
  - `mlog_to_video` → `MlogToVideoBody`：收紧 `code` 和接口要拿的视频 id `data`（32 位十六进制字符串）；`message` 宽松。
  - `user_audio` → `UserAudioBody`：收紧 `code`、用户创建的电台列表 `djRadios` 和每条电台自己的编号 `djRadios[].id`；`dj` 主播复用宽松的 `PlaylistUser`，电台简介、封面、分类、价格、计数和展示字段宽松，`count`、`subCount`、`hasMore` 是宽松的计数与分页提示。

  ### 行为变化
  - 这 3 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失、`null` 或类型不对只丢这一项。
  - `mlog_url`、`mlog_to_video` 的非法 mlog id 上游返回 HTTP 200 + 正文 `code: 400`（`mlog_to_video` 是 `msg: mlog无对应video`）。改造前模块按 `status: 200` 放行；现在 Body 校验先按业务码拒绝，公开结果从 `status: 200` 变成 `status: 400`，`body` 仍是网易云原文。
  - `voice_detail`、`voicelist_detail`、`voicelist_list` 是创作者工作台接口，只能读取自己的声音/播客。当前账号没有声音和播客，只录到拒绝正文和一条 `code: 200` + `data: null` 的空成功（`voice_detail` 未知 id）：`voice_detail` 访问他人声音返回 `401 不允许操作他人的声音`，未知 id 返回 `code: 200`、`data: null`；`voicelist_detail` 的未知 id 返回 `400 播客不存在`，读取他人公开播客返回 `400 只允许操作自己的播客`；`voicelist_list` 缺 `voiceListId` 返回 `400 参数错误`，读取他人播客返回 `400 只允许操作自己的播客`，不存在的 id 返回 `400 播客不存在`（`voicelist_list.missing.json`、`voicelist_list.other.json`、`voicelist_list.unknown.json`）。没有带字段的成功正文证据，本批没有为它们声明结构，`body` 仍原样返回。这些录制已入库，供后续有创作者账号时补录成功体。

  ### 空结果与登录
  - 登录对照先用 `login_status` 确认 `account.anonimousUser: false`；三个模块的成功录制都没有账号资料。`mlog_url` 的视频 mlog 用登录调用录制（匿名调用有时不返回 `song`，`showCollect` 可能 `true`/`false`，`songs`/`relateSongs` 3/3 存在；登录录制是为了拿到 `isLiked`/`privilege` 等登录态完整证据），`shareUrl` 里的账号编号已换成合成值 `10000001`（原始 uid 不再可复现）；分享歌曲的 mlog、`mlog_to_video` 和 `user_audio` 用匿名调用录制；`user_audio.empty` 的合成 uid `900000002` 匿名原样可复现。
  - `user_audio` 有真实空结果录制：没有创建电台的用户返回 `djRadios: []`（`user_audio.empty.json`），用户编号换成合成值；有创建电台的用户返回 1 条（`user_audio.default.json`）。
  - `mlog_url`、`mlog_to_video` 不是集合接口；录制覆盖视频 mlog（`a1PvyoDUbEJmk0`）和分享歌曲的 mlog（`a1qOVPTWKS1ZrK8`），两者都能成功。
  - `mlog_url` 的播放地址带 `wsSecret`/`wsTime` 签名，会随时间变化；`urlInfos[]` 是同一视频的其他清晰度，只有当前 `res` 选中的 `urlInfo` 收紧。

  ### 证据缺口

  `voice_detail`、`voicelist_detail`、`voicelist_list` 只录到拒绝正文和一条 `code: 200` + `data: null` 的空成功（`voice_detail` 未知 id），没有带字段的成功正文，未声明结构；`mlog_url` 只验证了视频和分享歌曲两类 mlog，`urlInfo` 在当前录制里始终存在，没有 `null` 或缺失证据；`data.resource.content.video` 按接口目的收紧，若上游对无视频 mlog 返回成功体，会报 502。`user_audio` 的 `descPicList`、`discountPrice`、`icon`、`liveInfo`、`manualTagsDTO`、`replaceRadio`、`shortName`、`videos` 只见过 `null`，未声明。以上结论只覆盖本批录制与探测。

  ### 迁移
  - 这 3 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 非法 mlog id 的公开结果从 `status: 200` + 正文 `code: 400` 变成 `status: 400`，正文仍是网易云原文；不要再按 `status === 200` 判断参数错误。
  - `MlogUrlBody['data']['resource']['content']['video']['urlInfo']['url']` 是签名地址，不要缓存或逐字比较。

  详见公开指南的[返回体结构](/guide/response-bodies)。

- 0b7137a: 给 7 个可逆写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

  ### 新增公开结构定义
  - `follow` → `FollowBody`：接口就是为了确认关注/取关成功，正文顶层的 `code` 收紧为 `200`；`msg` 是附带的提示，宽松。
  - `mv_sub` → `MvSubBody`：收紧 `code`；`message` 宽松，`data` 只见过 `null`，未声明。
  - `video_sub` → `VideoSubBody`：收紧 `code`；`message` 宽松，`data`、`debugInfo`、`failData` 只见过 `null`，未声明。
  - `dj_sub` → `DjSubBody`：正文只带 `code`，收紧为 `200`。
  - `broadcast_sub` → `BroadcastSubBody`：收紧 `code`；`data` 是操作结果标志、`message` 是提示，宽松。
  - `resource_like` → `ResourceLikeBody`：正文只带 `code`，收紧为 `200`。
  - `comment_like` → `CommentLikeBody`：正文只带 `code`，收紧为 `200`。

  ### 行为变化
  - 这 7 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失或类型不对时只丢这一项；`null` 照常保留为 `null`。
  - 非 200 返回码的处理随运行时校验变化，正文仍是网易云原文：
    - `code: 250` 落在 2xx、不是请求层的特殊码，改造前 resolve（`status: 250`）；现在按业务拒绝，变成 reject（`status: 250`，`body`/`cookie` 相同），调用方需要 try/catch。涉及 `follow`、`resource_like` 的关注/点赞方向（设备风控：`follow` 是 `message: 关注异常` + `dialog` 风险提示，`resource_like` 是 `msg` 风险提示 + `data.dialog`）和 `comment_like` 的点赞方向（`msg: 点赞异常，请稍后再试！`、`data.dialog: null`，不是设备风险提示）。
    - `code: 408` 不在 2xx、也不是特殊码，改造前请求层就 reject（`status: 408`，`ProtocolFailed`），现在仍 reject 相同状态（`UpstreamBusinessFailed`），公开状态、`body`/`cookie` 不变：`video_sub` 重复收藏。
    - 只有 `201`、`302`、`400`、`502`、`800`–`803` 这类特殊码会被请求层归一成 `status: 200`；本批 7 个模块的录制里没有这些码。
  - 录制证据：`mv_sub`、`video_sub`、`dj_sub`、`broadcast_sub` 对同一目标先正向再反向，并在两步之间和之后用读取接口回读核对（`mv_sublist`、`dj_sublist`、`broadcast_channel_collect_list`）；回读结论写在各录制文件的 `context.note`，没有单独保留状态读出文件。
  - 证据缺口：`follow`、`resource_like`、`comment_like` 的正方向（关注、点赞）在本机与本网络被上游拒绝（`code: 250`），没有成功正文；三个模块的成功结构证据只来自反向操作（取关、取消点赞），回读只用于确认这次没有改变账号状态，正向成功返回的字段集合未验证。`mv_sub` 的重复收藏是幂等的 `code: 200`；`dj_sub`、`broadcast_sub` 的重复收藏也是 `code: 200`。

  ### 迁移
  - 这 7 个模块的 `body` 类型从原始 JSON 值变成收窄后的结构；未声明字段仍在，但读取时是 JSON 值，要按需自行校验。
  - 需要处理新的 502：用 `body.upstreamShape` 判断上游结构变化，不要解析 `msg`。
  - 关注/点赞被拒时不再返回 `status: 250` 的 resolve 结果，改为抛错（`status: 250`，`body`/`cookie` 不变）；`video_sub` 重复收藏的 reject 行为不变。按 `status`/`code` 判断失败。

  详见公开指南的[返回体结构](/guide/response-bodies)。

## 3.1.0

### Minor Changes

- 7fd550c: 按 3.0.0 公布的“收紧与宽松”标准修正实现，并给 5 个原本只有原始返回的接口补上结构定义，发 3.1.0。

  ### 行为变化
  - **搜索结果的列表改成“可以没有”**：云搜索的 `result.songs`、`result.albums`、`result.artists`、`result.playlists`，以及搜索建议的 `result.songs`、`result.artists`、`result.albums`、`result.playlists`、`result.allMatch`，缺失或为 `null` 时照常返回；出现了仍按每条记录的编号（`allMatch` 是 `keyword`）收紧校验。坏一条记录时返回 `UnexpectedUpstreamShape`（`status: 502`），不再让整列消失。这些列表的类型变为 `ReadonlyArray<T> | null | undefined`。
  - **记录里套着的编号也宽松**：`playlist_create`、`playlist_detail`、`user_playlist` 的 `playlist.tracks[].id`，以及 `playlist_detail`、`playlist_track_all` 的 `privileges[].id`，类型从 `number` 变成 `number | null | undefined`。编号缺失或类型不对时只丢这个编号，不影响外层歌单或权限项。
  - **5 个模块新增公开结构定义和运行时校验**：
    - `artist_detail` → `ArtistDetailBody`：收紧 `code`、`data`、`data.artist`、`data.artist.id`。
    - `artists` → `ArtistsBody`：收紧 `code`、`hotSongs`、`hotSongs[].id`。
    - `user_record` → `UserRecordBody`：收紧 `code`；`allData` / `weekData` 是可以没有的路径，出现时每条记录必须有 `song`，`song.id` 收紧。
    - `vip_info` → `VipInfoBody`：收紧 `code`、`data`。
    - `vip_info_v2` → `VipInfoV2Body`：收紧 `code`、`data`。
  - 删除只见过 `null`、猜不出类型的字段声明（`crbt`、`rtUrl`、`songJumpInfo`、`songFeature`、`fansGroup`、`sharedUsers`、`shareStatus` 等字段），以及只见过空数组、元素类型猜不出的字段声明（`rtUrls`、`displayTags`、`orderSongs`、`distributeTags`、`msg` 等）。它们继续作为未声明字段原样保留。没有字段再声明成 `Schema.MutableJson`。
  - `experts`、`authType.tags`、登录 `bindings`、搜索建议 `order` 等字段按录制里实际出现的值声明为字符串、字符串数组或对象数组。

  ### 迁移
  - 读搜索结果时，列表类型多了 `null | undefined`；不要再假设“有总数就一定有列表”。
  - 以前遇到搜索结果里一条记录编号不对，会拿到一个没有该列表的 200 响应；现在会以 `UnexpectedUpstreamShape`（502）拒绝。需要容错时，调用方应自己决定是否重试或降级。
  - `playlist.tracks[].id`、`privileges[].id` 读取类型多了 `null | undefined`。
  - `artist_detail`、`artists`、`user_record`、`vip_info`、`vip_info_v2` 开始做运行时结构校验；对应的正文结构不合法时，以前原样返回，现在会报 `UnexpectedUpstreamShape`（502）。这 5 个模块同时新增了 `ArtistDetailBody`、`ArtistsBody`、`UserRecordBody`、`VipInfoBody`、`VipInfoV2Body` 公开导出。
  - 被删除声明的字段仍是未声明字段，继续原样保留，读取类型仍是 JSON 值；除新增的 5 个模块外，没有新增收紧字段。
  - `experts`、`authType.tags`、登录 `bindings`、搜索建议 `order` 的读取类型分别收窄为字符串记录、字符串数组、对象数组、字符串数组；它们仍都是宽松字段。

  详见公开指南的[返回体结构](/guide/response-bodies)和仓库的 [`agent-docs/API_CONVENTIONS.md`](https://github.com/nonhana/hana-music-api/blob/master/agent-docs/API_CONVENTIONS.md#收紧与宽松)。

## 3.0.0

### Major Changes

- 8233f6f: 按“收紧与宽松”重写全部返回体结构定义，发 3.0.0。

  ### 行为变化
  - **只有四类字段收紧**：返回码、通到接口要返回的东西的路径、这条记录自己的编号、接口就是为了拿它的那一项。这些字段缺失或类型不对时仍以 `UnexpectedUpstreamShape`（`status: 502`）拒绝。
  - **其余声明字段全部改为宽松字段**：可能缺失，也可能是 `null`；有值但类型不对时当成缺失，不再让整页 502。宽松字段整个值校验失败时都当成缺失，包括数组元素里的问题。
  - 新增歌曲的 `no`、`cd`、`alia`、`tns`、`publishTime` 和专辑的 `company` 声明。
  - 共用结构（`Song`、`Artist`、`PlaylistSummary`、`PlaylistUser`、`AlbumSummary`）、登录资料、专辑、搜索结果的记录结构，以及成功返回正文和嵌套对象补上了录制里出现过的字段；新字段都是宽松字段。
  - 去掉 `cloudsearch` 对 `al.name` 的单独放宽：共用歌曲结构本来就是宽松字段。

  ### 迁移

  声明过的内容字段（歌名、专辑名、歌单名、封面、播放次数、歌词、歌手和专辑的编号与名字等）的类型从 `T` 变成 `T | null | undefined`。升级后需要处理缺失和 `null`：

  ```ts
  // 2.x
  const title = body.playlist.name;

  // 3.0
  const title = body.playlist.name ?? '未知歌单';
  ```

  - 以前靠 502 发现内容字段缺失的调用方，现在会正常拿到返回体；需要自己判断字段是否可用。
  - 收紧字段的读取方式不变；`song_url_v1`、`song_download_url_v1` 的 `url` 仍可能是 `null`。
  - 新增声明的字段可以直接读取，类型都是 `T | null | undefined`。
  - 每个模块收紧哪些字段、其余字段为什么宽松，见公开指南的[返回体结构](/guide/response-bodies)和仓库的 [`agent-docs/API_CONVENTIONS.md`](https://github.com/nonhana/hana-music-api/blob/master/agent-docs/API_CONVENTIONS.md#收紧与宽松)。

## 2.13.0

### Minor Changes

- c0743f5: 修复 `cloudsearch` 单曲结果里有歌曲缺少专辑名时整页返回 502 的问题（#79）。`CloudsearchBody.result.songs[].al.name` 现在允许缺失，仍接受字符串和 `null`；读取类型从 `string | null` 变为 `string | null | undefined`，调用方需要处理缺失值。

  SDK 原样保留完整搜索结果，不补专辑名、不丢弃歌曲；专辑名为数字等错误类型时仍返回 `UnexpectedUpstreamShape`。只放宽搜索结果，不改变 `song_detail` 等模块的共用歌曲结构。新增两个复现关键词的完整真实录制、回放测试和公开类型检查，沿用 #48 的 minor 发版惯例。

### Patch Changes

- 1e20fe1: 补充 `song_download_url_v1` 的真实匿名会员歌录制与契约测试：standard、higher、exhigh 均返回 `data.code: -105`、`url: null`、`size: 0`，而不是试听文件。文档说明下载权限不足时的判断方式，以及顶层成功码与单曲下载返回码的区别；保留现有公开类型，不新增未经录制确认的试听字段。
- f4a85b2: Move the VitePress documentation root to `website/` and configure the repository's agent skills.

## 2.12.0

### Minor Changes

- 88c7803: Unify user playlist and playlist detail responses with shared PlaylistSummary and PlaylistUser types. Declare descriptions, tags, play counts, status, privacy, and additional optional playlist and user fields while preserving undeclared JSON fields.

## 2.11.0

### Minor Changes

- d0f4b87: 声明并校验 `PlaylistDetailBody.playlist.status` 数字字段，让调用方能识别仍返回成功正文的已删除歌单（状态为 10），同时保留未声明的上游字段。

## 2.10.0

### Minor Changes

- 54c17e1: Declare optional playlist suggestions with numeric IDs and names in `SearchSuggestBody`, and numeric playlist play counts in `CloudsearchBody`, preserving undeclared upstream fields.

## 2.9.1

### Patch Changes

- ba8fca3: `playlist_subscribe` 支持调用方提供易盾 `checkToken`，并补充已知限制说明。

  - 收藏（`t=1`）传入 `checkToken`（字符串或每次收藏前调用的 provider）时，改用 weapi 网页写法：`https://music.163.com/weapi/playlist/subscribe`、`os=web`，正文携带 `checkToken`，HTTP 头携带 `X-antiCheatToken`。取消收藏（`t=0`）走 weapi 网页写法，不取令牌。入参 `id`、`t` 和错误合同不变，写操作仍不自动重试。
  - 未传 `checkToken` 时收藏保留官网 weapi 网页写法。这条回退路径只适合低频调用，连续操作仍可能被上游 405 拒绝。
  - 验证：官方现代 web player 的收藏请求是 `/weapi/playlist/subscribe` + 170 字符 `X-antiCheatToken`，取消是 `/weapi/playlist/unsubscribe` 且不带 token。2026-10-18 02:08（CST）在真实客户端 origin `https://campanula-test.caelum.moe/` 用官方 Watchman 现取令牌，公开 SDK 的 weapi 收藏成功（HTTP 200 / `{ code: 200 }`，列表 54 → 55），取消后恢复 54/36；02:09 用同一个 Watchman 实例连续 3 轮、轮间隔 5 秒，收藏/取消全部 200，每轮恢复 54/36。SDK 不生成、不缓存、不重放令牌，HTTP 服务拒绝 `checkToken` 配置。
  - 已知限制：稳定的高频收藏取决于调用方提供的令牌是否来自已登记设备；没有稳定 provider 时，本接口不保证高频可用。`retryAfter` 只是退避建议，不是上游承诺的恢复时间。

## 2.9.0

### Minor Changes

- 018aea7: 声明每日推荐和单曲搜索结果中每首歌的 `privilege.id`、`privilege.st` 和 `privilege.pl`。
- 7c68285: 声明歌单详情中的 `playlist.tags` 和 `playlist.playCount`。

## 2.8.1

### Patch Changes

- 7af1815: 修复下游关闭 `skipLibCheck` 时，具名模块函数的公开声明因只读数组和可缺失字段而报 TS2411 的问题（#42）。生成的函数声明引用既有调用类型，已声明字段及未声明 JSON 字段的类型保持不变；同时移除 SDK 声明中由服务端类型入口带入的 Bun 类型依赖。严格类型检查需要加载 `@types/node`。

## 2.8.0

### Minor Changes

- 4f396df: Declare numeric `id`, `st`, and `pl` in `SongDetailBody.privileges` and each song's `privilege` in `AlbumBody` and `ArtistTopSongBody`. Validate these fields before returning SDK responses, preserve undeclared fields, and expose the same contract through the exported TypeScript types and Standard Schema validators.

## 2.7.1

### Patch Changes

- a29fbd8: 修复业务码 405 且说明为“操作频繁”或“操作过于频繁”时，因 HTTP 状态不是 405 而漏掉 `retryAfter` 的问题（#60）。限频识别不再依赖 HTTP 状态，保留网易云正文并补上建议等待秒数，不自动重试；其他 405 业务拒绝保持不变。

## 2.7.0

### Minor Changes

- d85cc6a: 修复没有简介的专辑让整个 `album` 返回以 502 拒绝的问题（#59）。`AlbumBody` 的 `album.description` 现在允许 `null`，专辑和歌曲原样返回；字段缺失或类型不符（如数字）仍返回 `UnexpectedUpstreamShape`。

  类型变化：`album.description` 从 `string` 变为 `string | null`，调用方使用简介前需要处理 `null`。沿用 #48 的 minor 发版规则。

## 2.6.0

### Minor Changes

- 37173f1: `ArtistAlbumBody` 新增顶层 `artist` 的 `id`、`name`、`img1v1Url`、`musicSize`、`albumSize` 结构定义和类型，供歌手页读取头像、歌曲数和专辑数（#53）。`name` 必须是字符串，未声明的字段原样保留；缺少 `artist` 或必填字段、字段类型不符时返回 `UnexpectedUpstreamShape`。

## 2.5.0

### Minor Changes

- ffa970c: 歌单编辑和收藏模块现在运行时校验返回体，并导出 Standard Schema 结构定义和推导类型（#22）。
- 7b6f60d: 搜索相关模块的返回体在运行时校验，并导出结构定义和类型（#21）

  - `cloudsearch`、`search_suggest` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增 `CloudsearchBody`、`SearchSuggestBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 云搜索的单曲、专辑、歌手、歌单四类结果分别在 `result.songs`、`albums`、`artists`、`playlists`，带上各自的总数；没有结果时列表整个缺失，所以在类型里是可选的。歌词搜索的结果也在 `songs` 里，同样校验；其他搜索类型（用户、MV 等）的结果不校验，原样返回。
  - 搜索建议默认按类别给出 `songs`、`artists`、`albums`，`type` 为 `mobile` 时给关键词 `allMatch`；没有建议时 `result` 是空对象。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这两个模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400` 等原来被当作成功、以 `status: 200` 返回的业务码；`301` 等原本就拒绝的业务码不变。

- a51eaee: 修复匿名注册因随机设备号的摘要包含 `+` 或 `/` 而失败的问题。公开 `generateDeviceId()` 生成合格设备号，并在 `ModuleCallConfig` 声明隐式匿名注册使用的 `deviceId` 配置（#30）。

## 2.4.0

### Minor Changes

- ed84209: 修复云盘上传的歌、凭据失效时的歌单让整个返回以 502 拒绝（#48）

  - 传到云盘、没有匹配上曲库的歌，歌手和专辑的编号是 0，名字是 `null`。以前歌曲详情、歌单中的歌曲等模块只要遇到一首这样的歌，整页都以 `status: 502` 拒绝；现在原样返回。
  - Cookie 里的 `MUSIC_U` 已经失效时，网易云给用户歌单、歌单详情的是没有登录的视角，`subscribed` 是 `null`。以前以 `status: 502` 拒绝，现在原样返回，调用方可以靠它认出需要重新登录。
  - 类型变化：歌曲的 `ar[].name`、`al.name`，专辑里的 `artist.name`、`artists[].name`，以及 `UserPlaylistBody`、`PlaylistDetailBody` 的 `subscribed`，类型都加上了 `null`。TypeScript 里直接当作字符串或布尔值使用的地方，需要先处理 `null`。
  - 这种歌只有上传者本人登录时能看到歌名。别人看、或者没有有效登录时，歌名也是 `null`，仍然以 `status: 502` 拒绝。

## 2.3.0

### Minor Changes

- 54913c9: 播放相关模块的返回体在运行时校验，并导出结构定义和类型（#20）

  - `song_url_v1`、`song_download_url_v1`、`lyric_new`、`scrobble` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增 `SongUrlV1Body`、`SongDownloadUrlV1Body`、`LyricNewBody`、`ScrobbleBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 播放地址带上试听、无版权的标记：`url` 是 `null` 时拿不到这首歌，原因看 `code`；`freeTrialInfo` 不是 `null` 时只能试听。下载地址同样用 `url` 和 `code` 标出无版权。歌词的逐行 `lrc` 一直都在，翻译、音译、逐字可能缺失。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这些模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400` 等原来被当作成功、以 `status: 200` 返回的业务码；`301` 等原本就拒绝的业务码不变。

### Patch Changes

- db440b9: 识别网易云 429 和 405 限频响应，返回 retryAfter 并禁止 SDK 自动重试。

## 2.2.0

### Minor Changes

- a1e7bcd: 曲库相关模块的返回体在运行时校验，并导出结构定义和类型（#19）

  - `user_playlist`、`playlist_detail`、`playlist_track_all`、`song_detail`、`album`、`album_sublist`、`artist_sublist`、`artist_top_song`、`artist_album`、`recommend_songs`、`likelist` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增这些模块的结构定义，如 `UserPlaylistBody`、`PlaylistDetailBody`、`SongDetailBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这些模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400` 等原来被当作成功、以 `status: 200` 返回的业务码；`301` 等原本就拒绝的业务码不变。

## 2.1.0

### Minor Changes

- c1c4fb0: 登录相关模块的返回体在运行时校验，并导出结构定义和类型（#18）

  - `login_qr_key`、`login_qr_create`、`login_qr_check`、`verify_getQr`、`captcha_sent`、`login_cellphone`、`user_account`、`login_status`、`user_detail`、`login_refresh`、`logout` 的 `body` 有了确定的类型，只声明真实返回里确认过的字段，其余字段原样保留。
  - 根入口新增这些模块的结构定义，如 `LoginQrCheckBody`、`UserAccountBody`，以及手机号登录被风控拦下时的 `LoginCellphoneRiskBody`。它们是 Standard Schema，不引入 Effect 也能调用 `~standard.validate`；同名类型可用 `import type` 单独引入。
  - 网易云改了返回结构时，Promise 以 `status: 502` 拒绝，`body.upstreamShape` 写明模块、路径、期望和实际类型。
  - 行为变化：这些模块遇到不认识的业务码时改为以网易云的原始正文拒绝，`status` 取业务码（不在 HTTP 状态码范围内时为 400）。受影响的是 `400`、`502` 等原来被当作成功、以 `status: 200` 返回的业务码；`301`、`8821` 等原本就拒绝的业务码不变。
  - `login_refresh` 文档改正：扫码登录和手机号登录得到的 Cookie 都能续期。

## 2.0.0

### Major Changes

- c2814d2: 去掉反作弊 token（checkToken）整套逻辑，并修复收藏歌单一律返回 405。

  - **不兼容：删掉配置项 `checkToken`。** `createRequest`、`createHanaMusicApi`、具名模块函数和 `invokeModule` 的配置都不再接受 `checkToken`，TypeScript 里写了它会编译报错，JavaScript 里写了会被忽略。SDK 内置的那个反作弊 token 是很早以前从官网抄下来的固定值，网易云会把它当成可疑请求：2026-10-09 实测，本来能成功的收藏请求带上它就变成 405。SDK 里也不再有任何模块用到它。HTTP 服务以前收到 `checkToken` 参数会返回 400，现在把它当普通参数，不再拒绝。
  - **修复 `playlist_subscribe`：** 请求固定以 iPhone 客户端身份发出（设备信息和 User-Agent 都用内置的 iPhone 配置，调用方传入的 `os`、`ua` 对这个接口不起作用），请求体只带歌单 `id`。2026-10-09 用真实账号实测，SDK 默认的 pc 设备身份或带上反作弊 token，网易云都会拒绝收藏；改用新写法后，收藏和取消收藏都成功。入参 `id`、`t` 不变。网易云拒绝时，SDK 原样返回它给的状态码和说明。
  - **已知局限：** 新写法只成功过一次收藏和一次取消，之后同一账号所有收藏请求都返回同样的 405，原因还没查清，后续验证见 #33。

## 1.4.0

### Minor Changes

- 4264128: 封面直传：新增 `image_upload_token` 模块（SDK 为 `imageUploadToken`，HTTP 路由 `/image/upload/token`），返回浏览器直传网易云图片存储所需的上传地址 `uploadUrl`、凭证 `token`、图片编号 `imgId` 和图片地址 `url_pre`，返回体带 TypeScript 类型。`playlist_cover_update` 新增 `imgId` 参数：传入已上传图片的编号时只发一次“设为封面”的请求，不再经手图片数据，失败后重试也不必重新上传；原来传 `imgFile` 整图上传的用法不变。`imgFile` 和 `imgId` 同时传入时返回 `status: 400`，不发出任何请求。

### Patch Changes

- b5c6d89: 修复 HTTP 服务从不提示“需要登录”：网易云返回数字 301 时，模块路由和演示页的接口调试都会在响应的 `msg` 里写上“需要登录”。以前拿字符串 `'301'` 去比较数字返回码，永远对不上。进程内直接调用 SDK 不受影响。

## 1.3.0

### Minor Changes

- 4c153e0: SDK 不再在本地限制发往网易云的请求频率，调用方需要自己控制请求频率。

  - 删掉进程级出口配额：以前每个身份每秒 2 次、每个上游域名每秒 4 次、同时最多 8 个请求在路上，超出的排队，排队超过 2 秒就返回 503。现在每次调用都立刻发给网易云，不排队、不延迟，也不会因为本地额度不足返回 503。
  - 删掉收到限频后的冷却：以前网易云对一个身份返回 429，会同时冷却这个身份和整个上游域名，同一进程里其他身份的调用也直接返回 429。现在这次调用照常以 429 失败、带上 `retryAfter`，SDK 不重试，也不影响其他调用。
  - 调用方（例如批量同步曲库的程序、音乐爬虫）要自己限制并发和频率，收到 429 后按 `retryAfter` 退避。
  - HTTP 服务按来访 IP 的入口限流不变（默认每个 IP 每秒 2 次、突发 10 次，最多同时执行 32 个模块），它仍然保护对外开放的 HTTP 服务。
  - 相同读请求合并、可选的结果暂存、8 秒总期限、eapi 加密和 Cookie 处理都不变。

## 1.2.1

### Patch Changes

- e59319b: SDK 现在可以在 Vercel 等 Serverless 函数里正常加载和调用：加载和首次调用都不再读写本地文件。

  - 版本号（`innerVersion` 接口和 HTTP 服务的 `/health`）改为构建时写进产物，运行时不再查找和读取 `package.json`。以前 SDK 被打包进云函数后，周围找不到 `package.json`，加载时就会报错 `Unable to locate package.json`。
  - SDK 启动时不再读取系统临时目录里的 `anonymous_token` 文件，匿名令牌只放在进程内存里：第一次不带 Cookie 的调用会注册匿名身份，函数实例被回收后，新实例会重新注册。
  - HTTP 服务和 CLI 的行为不变：启动时仍从 `ANONYMOUS_TOKEN_FILE`（缺省为系统临时目录的 `anonymous_token`）读取匿名令牌，缺少时注册并写回这个文件。

## 1.2.0

### Minor Changes

- b57dd49: 重写请求内核与模块执行架构：统一处理请求意图、身份快照、加密、限流、并发、缓存、重试、超时、取消、响应解释和资源释放。Effect 只用于内部编排，`createHanaMusicApi`、具名模块函数、`invokeModule` 与 `createRequest` 继续返回 Promise，响应继续保持 `{ status, body, cookie }` 外壳。

  所有 351 个模块现在都声明本地 `ModuleInput` 和输入解码器，并使用 `ModuleEffect` 执行；生成的 SDK 类型表与模块注册表同步更新。已确认输入会在发起请求前进行更严格的校验，依赖旧式宽松输入的调用需要按模块定义修正。

  自定义模块和动态模块作者需要采用 `ModuleDefinition`、`decodeInput`、`ModuleEffect` 与 `RequestCapability` 的新内部扩展约定；普通 SDK 使用者无需引入 Effect 或改变公开调用方式。

## 1.1.1

### Patch Changes

- 2198d3b: - 声明 MIT 开源协议。
  - 新增 LICENSE 文件，并在 package.json 中补齐 license: MIT 字段（npm 会随包发布，消费者可见）
  - 同步完善文档站：汉化 CHANGELOG、重写上手指南并新增「请求层进阶」系列文档（不影响运行时行为）

## 1.1.0

### 次要变更

- 786e9b6: 强化高频调用场景下的请求层能力与流量伪装策略。

  重点摘要：

  - 修复 weapi (`e_r`) 加密响应的解密逻辑，使其与旧实现保持一致；现在 eapi 与 weapi 的加密响应都会正确解密
  - SDK 调用路径下，当未显式提供 `ip` 或 `realIP` 时，默认注入运行时中国 IP（`cnIp`）；显式配置仍然优先，HTTP 服务路径不受影响
  - 为单次请求尝试引入保守的默认超时 8 秒；可通过 `timeoutMs: 0` 关闭
  - 默认重试“连接尚未建立”类传输错误；这类错误没有重复提交风险，而歧义性 socket 错误与业务状态码仍需显式开启重试
  - 支持通过 `acceptGzip` 显式开启 gzip eapi 响应
  - SDK 调用路径会懒加载匿名 token，并通过 single-flight 去重
  - 新增可选的 SDK 响应缓存（`cache`），同时支持 single-flight 请求去重
  - 新增可选的匿名身份池（`identityPool`），可在多次调用之间轮换 `deviceId`、`cnIp` 与 token

## 1.0.0

### 重大变更

- 9b71f47: 以 `1.0.0` 正式发布首个以 SDK 为中心的 npm 包契约。

  重点摘要：

  - 将根包导出面收敛为以 `createHanaMusicApi` 为核心的冻结 SDK 契约
  - 在根 SDK 导出面补齐 camelCase 形式的原始模块导出
  - 提供基于 tsdown 的纯 ESM 构建产物，并声明明确的 package exports
  - 补齐面向包消费者的契约校验、changesets 发版流程与 GitHub Release 自动化
