# 返回体结构

部分模块的返回体在 SDK 里做了运行时校验：SDK 在返回结果之前，先用这个模块的结构定义检查 `body`。声明的字段分两类：

- **收紧字段**：缺了这次调用就等于没成功。缺失或类型不对时，SDK 报“上游结构变了”（`status: 502`）。
- **宽松字段**：缺了只是少一项信息。可能缺失，也可能是 `null`；有值但类型不对时当成缺失，不报错。

还有一类**可以没有**的路径：正常情况下就可能整个缺失或为 `null`（例如搜索没有结果时的结果列表）。缺失或 `null` 时照常返回；出现了就按里面记录的收紧字段校验，坏一条记录会报 502，不会整列消失。

判断标准和写法的完整说明见 [`agent-docs/API_CONVENTIONS.md` 的“收紧与宽松”](https://github.com/nonhana/hana-music-api/blob/master/agent-docs/API_CONVENTIONS.md#收紧与宽松)。下面按领域列出每个模块的**收紧字段**和**可以没有**的路径；其余已声明字段都是宽松字段，未声明的字段原样保留在 `body` 里，类型是 JSON 值。

宽松字段里套着的记录（例如歌单的 `tracks[]`、`privileges[]`）不按“记录自己的编号”收紧：这些编号也宽松，类型不对只让这一项或整个宽松字段缺失，不会 502。只有不在宽松容器里的收紧字段才会报 `UnexpectedUpstreamShape`。例如 `song_detail.privileges[].id` 在必填的 `privileges` 数组里，缺失会 502；歌曲里可选的 `privilege` 对象用的是宽松的 `LooseSongPrivilege`，里面的 `id` 也是宽松字段，类型不对只丢这一个 `id`，`privilege` 的其余字段仍在。

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

## 用户资料

| 模块                                                     | 结构定义                 | 收紧的字段                                                                                                                                                                                     |
| -------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [账号等级](/api/user/user-level)                         | `UserLevelBody`          | `code`、`data`、`data.userId`、`data.level`                                                                                                                                                    |
| [收藏计数](/api/user/user-subcount)                      | `UserSubcountBody`       | `code`                                                                                                                                                                                         |
| [登录绑定](/api/user/user-binding)                       | `UserBindingBody`        | `code`、`bindings`、`bindings[].id`                                                                                                                                                            |
| [用户状态](/api/user/user-social-status)                 | `UserSocialStatusBody`   | `code`；`data` 只见过空对象，宽松                                                                                                                                                              |
| [用户徽章](/api/user/user-medal)                         | `UserMedalBody`          | `code`、`data`、`data.obtainMedals`、`data.obtainMedals[].medalCode`、`data.categoryMedalBlockVos`、`data.categoryMedalBlockVos[].medalVOS`、`data.categoryMedalBlockVos[].subGroups[].medals` |
| [云盘数据](/api/cloud/user-cloud)                        | `UserCloudBody`          | `code`、`data`、`data[].songId`                                                                                                                                                                |
| [云盘数据详情](/api/cloud/user-cloud-detail)             | `UserCloudDetailBody`    | `code`、`data`、`data[].songId`                                                                                                                                                                |
| [设置](/api/user/setting)                                | `SettingBody`            | `code`、`setting`、`setting.userId`                                                                                                                                                            |
| [会员下载歌曲记录](/api/music/song-downlist)             | `SongDownlistBody`       | `code`、`info`、`info[].id`                                                                                                                                                                    |
| [会员本月下载歌曲记录](/api/music/song-monthdownlist)    | `SongMonthdownlistBody`  | `code`、`info`、`info[].id`                                                                                                                                                                    |
| [已购买单曲（下载记录）](/api/music/song-singledownlist) | `SongSingledownlistBody` | `code`                                                                                                                                                                                         |
| [已购单曲](/api/music/song-purchased)                    | `SongPurchasedBody`      | `code`、`data`                                                                                                                                                                                 |

这批接口都用登录账号录制（`viewer: authenticated`，先经 `login_status` 确认 `anonimousUser: false`）：`user_level`、`user_subcount`、`user_binding`、`user_medal`、`user_social_status` 和两个云盘接口返回当前登录账号自己的数据。`user_account` 的匿名对照仍在登录一节；`user_detail` 没有匿名录制，本批未改其声明。

`user_medal` 的徽章页在 `data`，`data.obtainMedals`、`data.categoryMedalBlockVos`、分类块的 `medalVOS` 和分组里的 `subGroups[].medals` 都是必填数组，收紧；`obtainMedals[].medalCode` 是记录自己的编号，也收紧，`medalVOS` 和 `subGroups[].medals` 里套着的徽章是嵌套记录，编号宽松。`subGroups` 在分类块里可以为 `null`（录制里“即将获得”块是 `null`），按“可以没有”处理：缺失或 `null` 照常返回，出现时里面的 `medals` 仍按记录校验，坏一条报 502；`subGroups` 里的 `hasMore`、`total`、`obtainedTotal`、`nextPage` 宽松。`medalTabs`、`musicMedalOperationVO`、`levelMedalPicUrl`、`userObtainProportion`、`detailPage`、`scene` 只见过 `null`，没有声明。不存在的 uid 返回 `code: 499`（`用户信息获取失败`），SDK 按业务拒绝原样转交。本批录制与探测未发现可达的空结果；数组本身允许为空（`user_medal.unknown-user.json` 是 code 499，不是空结果）。录制从 493 条已获得徽章截到 5 条、5 个分类块截到 3 个（见 `context.truncated`）；已获得徽章按字段覆盖抽样，保留原下标 0/1/18/259/289，分类块为 0/1/2；`sideBarGuideText` 的空串样例来自完整录制。

`user_cloud` 的 `data` 是云盘记录列表，每条记录自己的 `songId` 收紧；`privateCloud` 和 `simpleSong` 是记录里套着的对象，字段全部宽松，`simpleSong` 复用 core 的 `LooseSong`（`Song` 字段 + 宽松 `id`）。录制从 25 条截到 3 条；`offset` 越过末尾时 `data` 是空数组（`user_cloud.past-end.json`）。`user_cloud_detail` 按歌曲 id 批量查云盘记录，传入不在云盘的 id 时 `data` 是空数组（`user_cloud_detail.empty.json`）。`user_cloud` 的 `cursor`、`message`、`idVersions` 只见过 `null`，没有声明。

`user_binding` 在不存在的 uid 下返回 `bindings: []`（`user_binding.no-bindings.json`）；录制里的绑定 id 和账号编号已换成合成值，`tokenJsonStr` 按凭据规则替换成 `<redacted>`。`user_social_status` 的 `data` 在录制里是空对象，内部字段没有声明，仍原样保留。

`setting` 的 `setting` 和 `setting.userId` 收紧，其余设置项全部宽松；匿名调用也会返回一份设置，`userId` 是匿名账号的编号。只见过 `null` 的 `newSongDiskSetting` 没有声明，仍原样保留。

`song_downlist` 和 `song_monthdownlist` 的 `info` 是下载记录列表，每条记录只收紧自己的编号 `info[].id`；内嵌歌曲 `song` 复用宽松的 `LooseSong`（歌曲 `id` 也宽松），`firstTime`、`type` 宽松。`offset` 越过末尾时 `info` 是空数组（`song_downlist.empty.json`、`song_monthdownlist.empty.json`）；匿名调用同样是空 `info`，下载记录只在登录后出现。

`song_singledownlist` 只有 `code` 收紧：录制账号没有已购买单曲，`info` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留（`song_singledownlist.empty.json`）。`song_purchased` 收紧 `code` 和 `data`，`data.count`、`data.hasMore`、`message` 宽松；`data.list` 同样只有空数组证据（`song_purchased.empty.json`），未声明、原样保留。两个接口都没有另一个已购账号可补录非空列表。

这四个下载/已购模块的录制先用 `login_status` 确认 `account.anonimousUser: false`；`user_playlist_collect`、`user_playlist_create` 同样如此。两个歌单列表用公开账号 32953014 录制，`query.uid` 与正文一致、正文未改写；其中的第三方账号是歌单创建者，属于公开数据。

## 账号校验与基础查询

| 模块                                                          | 结构定义                      | 收紧的字段                                                        |
| ------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| [检测手机号码是否已注册](/api/user/cellphone-existence-check) | `CellphoneExistenceCheckBody` | `code`、`exist`                                                   |
| [重复昵称检测](/api/user/nickname-check)                      | `NicknameCheckBody`           | `code`、`duplicated`；`candidateNicknames` 可以没有               |
| [根据昵称获取 userid](/api/user/get-userids)                  | `GetUseridsBody`              | `code`、`nicknames`                                               |
| [国家编码列表](/api/other/countries-code-list)                | `CountriesCodeListBody`       | `code`、`data`、`data[].countryList`、`data[].countryList[].code` |
| [验证接口 - 二维码检测](/api/other/verify-qrcodestatus)       | `VerifyQrcodestatusBody`      | `code`、`data`、`data.qrCodeStatus`                               |
| [私信和通知接口](/api/other/pl-count)                         | `PlCountBody`                 | `code`                                                            |

`cellphone_existence_check` 的 `exist` 是接口要拿的注册状态（`1` 已注册、`-1` 未注册），和 `code` 一起收紧；回显的手机号、`nickname`、`avatarUrl`、`hasPassword`、`hasSnsBinded`、`countryCode` 宽松。已注册和未注册各一份录制（`cellphone_existence_check.default.json`、`cellphone_existence_check.unregistered.json`），手机号回显按凭据规则替换成 `<redacted>`。

`nickname_check` 收紧 `code` 和 `duplicated`；`candidateNicknames` 在昵称可用时缺失，按“可以没有”处理，出现但有一条不是字符串仍报 502；`nickname` 是回显的查询昵称，宽松。可用和重复昵称各一份录制（`nickname_check.default.json`、`nickname_check.duplicated.json`）。

`get_userids` 的 `nicknames` 是昵称到 user id 的映射，收紧为字符串到数字；不存在的昵称不出现在映射里。只查询不存在的昵称时映射是空对象（`get_userids.no-match.json`）；存在与不存在的昵称混合查询时只返回存在的键（`get_userids.multi.json`）。

`countries_code_list` 的 `data` 是国家分组数组，每组 `countryList` 里的国家记录只收紧自己的 `code`（国际区号）；`label`、`zh`、`en`、`locale` 和 `message` 宽松。接口没有分页或其他输入，本批用默认参数探测返回 22 组、189 个国家，未发现可达的空结果，数组本身允许为空。

`verify_qrcodestatus` 的 `code`、`data` 和 `data.qrCodeStatus` 收紧；`data.detailReason` 与 `message` 宽松，缺失或 `null` 照常返回；有值但类型不对时丢这一项。上游成功码是字符串 `"200"`，请求层会归一成数字 200，结构定义同时接受录制里的原始字符串和归一后的数字。本批没有可构造的扫码会话，只录到已失效二维码（`verify_qrcodestatus.expired.json`，`qrCodeStatus: 21`）；未扫（`0`）、已扫（`10`）、已确认（`20`）三态没有录制，未声明额外字段。接口需要登录：未登录（`verify_qrcodestatus.anonymous.json`，`code: 301`）和空 `qr`（`verify_qrcodestatus.empty.json`，`code: 400`）按业务拒绝原样转交。

`pl_count` 只有 `code` 收紧；私信、通知、关注等计数和 `friend`、`eventUser`、`sceneComments`、`battle` 里的字段全部宽松。匿名录制（`pl_count.anonymous.json`）里 `pushMsg` 是 `null`、`eventUser` 整个缺失。

这批 6 个模块的登录对照先用 `login_status` 确认 `account.anonimousUser: false`（账号 599663130）；`cellphone_existence_check`、`nickname_check`、`get_userids`、`countries_code_list` 本批未保留匿名对照，不对公开结构作相同性断言。`verify_qrcodestatus` 需要登录，`pl_count` 未登录时仍返回计数结构。

## 曲库

| 模块                                              | 结构定义                  | 收紧的字段                                                                                  |
| ------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| [用户歌单](/api/playlist/user-playlist)           | `UserPlaylistBody`        | `code`、`playlist`、`playlist[].id`                                                         |
| [收藏的歌单](/api/playlist/user-playlist-collect) | `UserPlaylistCollectBody` | `code`、`data`、`data.playlist`、`data.playlist[].id`                                       |
| [创建的歌单](/api/playlist/user-playlist-create)  | `UserPlaylistCreateBody`  | `code`、`data`、`data.playlist`、`data.playlist[].id`                                       |
| [歌单详情](/api/playlist/playlist-detail)         | `PlaylistDetailBody`      | `code`、`playlist`、`playlist.id`、`playlist.trackIds`、`playlist.trackIds[].id`            |
| [歌单中的歌曲](/api/playlist/playlist-track-all)  | `PlaylistTrackAllBody`    | `code`、`songs`、`songs[].id`                                                               |
| [歌曲详情](/api/music/song-detail)                | `SongDetailBody`          | `code`、`songs`、`songs[].id`、`privileges`、`privileges[].id`                              |
| [专辑内容](/api/album/album)                      | `AlbumBody`               | `code`、`songs`、`songs[].id`、`songs[].privilege.id`、`album`、`album.id`                  |
| [已收藏专辑](/api/album/album-sublist)            | `AlbumSublistBody`        | `code`、`data`、`data[].id`                                                                 |
| [已收藏歌手](/api/artist/artist-sublist)          | `ArtistSublistBody`       | `code`、`data`、`data[].id`                                                                 |
| [歌手热门歌曲](/api/artist/artist-top-song)       | `ArtistTopSongBody`       | `code`、`songs`、`songs[].id`、`songs[].privilege.id`                                       |
| [歌手专辑](/api/artist/artist-album)              | `ArtistAlbumBody`         | `code`、`hotAlbums`、`hotAlbums[].id`                                                       |
| [每日推荐歌曲](/api/recommend/recommend-songs)    | `RecommendSongsBody`      | `code`、`data`、`data.dailySongs`、`data.dailySongs[].id`、`data.dailySongs[].privilege.id` |
| [喜欢音乐列表](/api/music/likelist)               | `LikelistBody`            | `code`、`ids`                                                                               |
| [歌曲是否喜爱](/api/music/song-like-check)        | `SongLikeCheckBody`       | `code`、`ids`                                                                               |
| [歌曲红心数量](/api/music/song-red-count)         | `SongRedCountBody`        | `code`、`data`、`data.count`                                                                |
| [歌曲动态封面](/api/music/song-dynamic-cover)     | `SongDynamicCoverBody`    | `code`、`data`；`data.videoPlayUrl` 可以没有                                                |

`song_like_check` 的 `ids` 是这个账号已喜爱的歌曲编号，没喜欢过任何一首时是空数组；匿名调用返回空数组。空 `ids` 请求会被上游以 `{ code: 400 }` 拒绝，仍按业务拒绝原样转交。`song_red_count` 的 `data.count` 收紧，不存在的歌曲返回 `count: 0`；`countDesc` 只是展示文案，宽松。`song_dynamic_cover` 的 `data` 在歌曲没有动态封面时是空对象，`data.videoPlayUrl` 按可以没有处理：缺失或 `null` 照常返回，出现但类型不对报 502；URL 带 `wsSecret`/`wsTime` 签名参数，会随时间变化，不要缓存或逐字比较。`height`、`weight`、`needTransition` 宽松。三个接口都匿名可用，登录和匿名的结构相同，值差异来自账号数据、实时计数和签名/动态值。

### 歌曲

各个接口里的歌曲共用同一份声明：

- 收紧：`id`。
- 宽松：其余声明字段，包括 `name`、`ar`（歌手的 `id`、`name`）、`al`（专辑的 `id`、`name`、`picUrl`）、`dt`（时长，毫秒）、`fee`（网易云给的付费类型，原样保留数值）、`no`、`cd`、`alia`、`tns`、`publishTime`，以及音质、权限、版权、封面和搜索用的简化字段。

`no` 是歌曲在 CD 里的序号，`0` 表示没有；`cd` 是自由文本（如 `"1"`、`"01"`、`"1/2"`、`"A"`、`"无"`），云盘上传、没匹配上曲库的歌是 `null`，SDK 不把它解析成数字；`alia`、`tns` 是字符串数组；`publishTime` 是毫秒时间戳，`0` 表示没有，专辑接口里的歌可能没有这个字段。

专辑记录（`album`、`hotAlbums`、云搜索的 `albums`）另外声明了宽松字段 `company`（唱片公司，没写时是空串）；`album_sublist` 的录制里没有这个字段，因此没有声明。

只出现过 `null`、没录到非 `null` 值的字段（如 `crbt`、`rtUrl`、`songJumpInfo`、`songFeature`）没有声明，仍会作为未声明字段原样保留在返回体里；只出现过空数组、元素类型猜不出的字段（如 `rtUrls`、`displayTags`）也一样。

歌手和专辑的编号和名字都可能缺失或为 `null`：传到云盘、没有匹配上曲库的歌（网易云返回的 `t` 是 1），歌手和专辑的编号是 0，名字是 `null`。这种歌只有上传者本人登录时能看到歌名；别人看、或者没有有效登录时，歌名也可能是 `null`。这些字段宽松后都不会再让整页 502。

### 专辑列表与数字专辑

| 模块                                                      | 结构定义                    | 收紧的字段                                         |
| --------------------------------------------------------- | --------------------------- | -------------------------------------------------- |
| [数字专辑详情](/api/album/album-detail)                   | `AlbumDetailBody`           | `code`、`album`、`album.albumId`、`product`        |
| [数字专辑详情（购买页）](/api/album/digital-album-detail) | `DigitalAlbumDetailBody`    | `code`、`album`、`album.albumId`、`product`        |
| [数字专辑销量](/api/album/digital-album-sales)            | `DigitalAlbumSalesBody`     | `code`、`data`                                     |
| [我的数字专辑](/api/album/digital-album-purchased)        | `DigitalAlbumPurchasedBody` | `code`                                             |
| [专辑动态信息](/api/album/album-detail-dynamic)           | `AlbumDetailDynamicBody`    | `code`                                             |
| [数字专辑-新碟上架](/api/album/album-list)                | `AlbumListBody`             | `code`、`products`、`products[].albumId`           |
| [数字专辑-语种风格馆](/api/album/album-list-style)        | `AlbumListStyleBody`        | `code`、`albumProducts`、`albumProducts[].albumId` |
| [全部新碟](/api/album/album-new)                          | `AlbumNewBody`              | `code`、`albums`、`albums[].id`                    |
| [最新专辑](/api/album/album-newest)                       | `AlbumNewestBody`           | `code`、`albums`、`albums[].id`                    |
| [获取专辑歌曲的音质](/api/album/album-privilege)          | `AlbumPrivilegeBody`        | `code`、`data`、`data[].id`                        |
| [数字专辑&数字单曲-榜单](/api/album/album-songsaleboard)  | `AlbumSongsaleboardBody`    | `code`、`products`、`products[].albumId`           |

`album_detail` 是数字专辑商品详情，`album` 记录用 `albumId`、`albumName`、`artistName`，没有 `AlbumSummary` 的 `id`、`songs`；`product` 里的价格、售卖数量、简介和 `extInfo` 全部宽松，`board` 与购买状态字段也宽松。非数字专辑（录制 `album_detail.non-digital.json`）或未知 id 返回 `code: 404`（`无专辑商品`），SDK 按业务拒绝原样转交，不会报 502；本批录制与探测未发现可达的空结果。`album_detail_dynamic` 只有 `code` 收紧，普通专辑和数字专辑的字段不同（数字专辑多 `paid`、`sales`、`displayType`），写进同一个结构。

`digitalAlbum_detail` 与 `album_detail` 共用同一个上游详情接口，结构定义同样复用 `AlbumDetailBody`，登录对照未保留录制；`digitalAlbum_sales` 收紧 `code` 和 `data`，`data` 是以专辑 id 为键、销量为值的映射。`digitalAlbum_purchased` 收紧 `code`；录制账号没有购买记录，`paidAlbums` 只有空数组证据、元素类型未知，未声明并由 `UpstreamObject` 原样保留；`total` 宽松。没有另一个已购买账号可补录非空 `paidAlbums`。匿名和登录调用都返回空的 `paidAlbums`，列表为空时 `offset=100000` 仍为空（`digital-album/digitalAlbum_purchased.offset-100000.json`）。数字专辑的写操作（下单/购买，`digitalAlbum_ordering`）不在本批范围。

`album_new` 和 `album_newest` 的 `albums[]` 共用 `AlbumSummary`，只收紧 `id`；专辑里的 `songs` 只见过空数组或 `null`，没有声明。`album_new` 的 `offset` 越过总数时返回 `albums: []`（录制 `album_new.empty.json`），`total` 仍是 500；`album_newest` 没有分页，本批录制与探测未发现可达的空结果，数组本身允许为空。`album_list` 的上游忽略 `offset`：`album_list.offset-100000.json` 里 `offset=100000` 仍返回与第一页相同的 10 个 `albumId`。`album_list_style` 的越界分页返回 `code: 404`（`没有数据`）。这两个列表本批录制与探测未发现可达的空结果；数组本身允许为空。

`album_privilege` 的 `data[]` 共用 `SongPrivilege`，只收紧歌曲 `id`；登录后 `dl`、`pl`、`payed` 和 `freeTrialPrivilege.listenType` 会变化，登录对照录制保留为 `album_privilege.album-vip.json`。未知专辑 id 返回 `code: 404`；本批录制与探测未发现可达的空结果，数组本身允许为空。`album_songsaleboard` 的 `daily`/`week` 不带 `hasMore`（`album_songsaleboard.week.json`），`year`/`total` 才带，声明为宽松字段；未来年份（`year=2030`，录制 `album_songsaleboard.year-empty.json`）返回 `products: []`、`hasMore: false`，`albumType=99` 的周榜（录制 `album_songsaleboard.week-empty.json`）返回 `products: []` 且没有 `hasMore`，都是真实空结果。

登录对照只保留了 `album_detail` 和 `album_privilege`：其余六个模块的字段集合与类型相同；值差异来自封面 CDN、实时计数和榜单/新碟列表的实时更新，登录录制已删除。

### 歌单与用户

[用户歌单](/api/playlist/user-playlist)和[歌单详情](/api/playlist/playlist-detail)共用 `PlaylistSummary`，其中 `creator` 和可选的 `subscribers[]` 共用 `PlaylistUser`。这两个 TypeScript 类型都可以从 `hana-music-api` 根入口直接导入。

`PlaylistSummary` 只收紧 `id`。其余声明字段都是宽松字段，包括歌单名称、封面、`trackCount`、`updateTime`、`trackUpdateTime`、`playCount`、`privacy`、`specialType`、`status`、`description`、`tags`、`subscribed`、`creator`、`subscribers`、`tracks`，以及播放量、收藏数、分享数和各种审核/展示状态。`status` 正常为 0，已删除为 10，其他数值也原样保留。歌单里套着的 `tracks[].id` 和歌单详情/歌单中的歌曲的 `privileges[].id` 也宽松，类型不对只会丢掉这个编号，不会让整张歌单或整列消失。

`PlaylistUser` 的字段全部宽松：`userId`、`nickname` 也不例外。其余声明字段有 `accountStatus`、`authStatus`、`authenticationTypes`、`authority`、`avatarImgId`、`backgroundImgId`、`birthday`、`city`、`djStatus`、`gender`、`province`、`userType`、`vipType`、`avatarImgIdStr`、`avatarImgId_str`、`avatarUrl`、`description`、`detailDescription`、`signature`、`backgroundImgIdStr`、`backgroundUrl`、`anchor`、`defaultAvatar`、`followed`、`mutual`、`expertTags`、`avatarDetail`、`experts`；`experts` 是字符串到字符串的对象。

`subscribed` 是 `null` 表示网易云给的是没有登录的视角：Cookie 里的 `MUSIC_U` 已经失效时，用户歌单和歌单详情都是 `null`；完全不带 Cookie 时，用户歌单是 `null`，歌单详情是 `false`。

`user_playlist_collect` 和 `user_playlist_create` 分别返回用户的收藏歌单和创建歌单：`data.playlist` 是通到歌单列表的路径，每张歌单复用 `PlaylistSummary`，只收紧每张歌单自己的编号 `id`；`data.count`、`data.more`、`data.subCount` 宽松，其中 `subCount` 的真实含义未从录制确认。`offset` 越过总数时 `data.playlist` 是空数组（`user_playlist_collect.empty.json`、`user_playlist_create.empty.json`）。匿名调用仍返回列表（仅登录可见的私密歌单不出现），`subscribed` 是 `null`（`user_playlist_collect.anonymous.json`、`user_playlist_create.anonymous.json`）。

### 歌单读取

| 模块                                                        | 结构定义                      | 收紧的字段                                                                                |
| ----------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| [歌单详情动态](/api/playlist/playlist-detail-dynamic)       | `PlaylistDetailDynamicBody`   | `code`                                                                                    |
| [相关歌单推荐](/api/playlist/playlist-detail-rcmd-get)      | `PlaylistDetailRcmdGetBody`   | `code`；`data` 可以没有，出现时 `data.recPlaylist`、`data.recPlaylist[].playlist.id` 收紧 |
| [精品歌单标签列表](/api/playlist/playlist-highquality-tags) | `PlaylistHighqualityTagsBody` | `code`、`tags`、`tags[].id`                                                               |
| [热门歌单分类](/api/playlist/playlist-hot)                  | `PlaylistHotBody`             | `code`、`tags`、`tags[].id`                                                               |
| [获取点赞过的视频](/api/playlist/playlist-mylike)           | `PlaylistMylikeBody`          | `code`、`data`；`feeds` 只见过空数组，元素类型猜不出，没有声明                            |
| [歌单收藏者](/api/playlist/playlist-subscribers)            | `PlaylistSubscribersBody`     | `code`、`subscribers`、`subscribers[].userId`                                             |
| [最近播放的视频](/api/playlist/playlist-video-recent)       | `PlaylistVideoRecentBody`     | `code`、`data`、`data.videos`、`data.videos[].mlogBaseData.id`                            |
| [歌单 (网友精选碟)](/api/playlist/top-playlist)             | `TopPlaylistBody`             | `code`、`playlists`、`playlists[].id`                                                     |

`playlist_detail_dynamic` 只有返回码收紧，正文是扁平的计数和状态：`bookedCount`、`commentCount`、`followed`、`gradeStatus`、`playCount`、`shareCount`、`subscribed` 都是宽松字段；`remarkName`、`remixVideo` 只见过 `null`，没有声明。正文没有列表，本批录制与探测未发现可达的空结果。非 null 路径与类型相同；登录探测只在宽松字段上出现不同值（`subscribed` 从 `false` 变成 `true`），登录对照录制已删除。

`playlist_detail_rcmd_get` 的 `data` 是可以没有的路径：没有相关推荐时是 `null`（录制 `playlist_detail_rcmd_get.empty.json`），出现时 `data.recPlaylist` 和每个推荐歌单的编号 `data.recPlaylist[].playlist.id` 收紧，`rcmdTitle`、`jumpUrl`、`alg` 和歌单的其余字段宽松。非 null 路径与类型相同；登录只在宽松字段上多出现 null 或不同值，登录对照录制已删除。

`playlist_highquality_tags` 和 `playlist_hot` 都返回 `tags`，只收紧每个标签的 `id`；`playlist_hot` 嵌套的 `playlistTag` 是宽松字段，其中的 `id` 也宽松。这两个模块本批录制与探测未发现可达的空结果，数组本身允许为空。非 null 路径与类型相同；登录只在宽松字段上多出现 null 或不同值，登录对照录制已删除。

`playlist_mylike` 需要登录：匿名调用会以 `status: 302` 拒绝（录制 `playlist_mylike.anonymous.json`，正文是 `{ code: 302, message: null }`）；结构定义只接受 `code: 200`，没有为 302 写联合。`data.feeds` 在登录录制里只见过空数组（当前账号没有点赞过的视频），元素类型猜不出，没有声明，原样保留；`data.more`、`data.time`、`message` 宽松。本批录制到的是空结果（`playlist_mylike.empty.json`），没有发现非空 `feeds` 的可达录制。

`playlist_subscribers` 的 `subscribers` 和每个收藏者自己的编号 `subscribers[].userId` 收紧，其余收藏者字段沿用 `PlaylistUser` 的宽松写法（`avatarDetail`、`experts` 在收藏者录制里只见过 `null`，仍保留在共享结构里），`subscribeTime` 是模块内补的宽松字段；`total`、`more`、`reason` 是分页和降级提示，宽松。匿名视角的 `total` 上限是 30：`offset=0` 返回 20 条（`more: true`），`offset=20` 仍返回 10 条，但带 `reason: needLogin`、`more: false`；`offset=40/60/100` 返回空数组、`total: 0` 和 `reason: needLogin`。登录后 `total` 是完整数量（同歌单 2000，录制 `playlist_subscribers.authenticated-page-one.json`）；登录 `offset=100000` 返回空数组和 `total: 0`（`playlist_subscribers.empty.json`）。非 null 路径与类型相同；登录只在宽松字段上多出现 null 或不同值（`total` 等）。

`playlist_video_recent` 需要登录：匿名调用返回 `code: 200`、`data.videos: []`（`playlist_video_recent.anonymous.json`），所以元素字段的证据只来自登录录制。`data.videos` 和每段视频自己的编号 `mlogBaseData.id`（字符串）收紧；`mlogExtVO`、`mlogBaseData` 的其余字段和 `mlogBaseData.videos[]` 里的码流全部宽松；`userProfile`、`relatedPubUsers`、`mlogPlaylists`、`source`、`audio`、`coverDetail` 等只见过 `null`，没有声明。非空录制非连续保留 5 段视频（索引 0/1/20/21/26，原始 31 段，见 `context.truncated`）。

`top_playlist` 的 `playlists` 和每个歌单自己的编号 `playlists[].id` 收紧，歌单摘要共用 `PlaylistSummary`，并在模块内补了宽松的 `alg`、`backgroundImageId`、`originalCoverId`、`tsSongCount`；`total`、`more`、回显的 `cat` 宽松。模块只在成功返回体里把 `avatarImgId_str`（`creator`、`subscribers[]`）改写成 `avatarImgIdStr`，`TopPlaylistBody` 描述的是改写后的最终体，录制保存上游原文，契约测试用显式转换比较；业务拒绝的正文原样透传。`order=new` 返回真实空结果：`playlists: []`、`total: 0`、`more: false`（`top_playlist.empty.json`）。`order=hot` 下 `offset=680` 是真实尾页（6 条，含 `14089582600`，`more: false`，`top_playlist.last-page.json`）；`offset>=686` 返回本批录制里的另一份固定 6 条兜底列表（`18271967084` 等，与尾页不同，`limit` 不生效，`more: true`，`top_playlist.beyond-last-page.json`、`top_playlist.fallback-ignores-limit.json`）。`limit`/`offset` 等非数字参数时上游回 HTTP 400 和空字符串正文，网易云把它归一成 `status: 200`、`body: ''`，作为独立分支保留，不报 502（`top_playlist.invalid-limit.json`）。登录与匿名返回相同顶层键，条目顺序和值因个性化不同；登录录制里出现 `subscribed: true`，`creator.experts` 的键 `1`、`2` 都出现过，匿名只有键 `2`（`top_playlist.anonymous.json`）。

### 歌单编辑与收藏

| 模块                                                               | 结构定义                           | 收紧的字段                                                                               |
| ------------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| [红心](/api/music/like)                                            | `LikeBody`                         | `code`；`playlistId` 宽松，`songs` 没有声明                                              |
| [收藏专辑](/api/album/album-sub)                                   | `AlbumSubBody`                     | `code`；`time`、`message` 宽松                                                           |
| [收藏歌手](/api/artist/artist-sub)                                 | `ArtistSubBody`                    | `code`；`data`、`message` 宽松                                                           |
| [歌单分类](/api/playlist/playlist-catlist)                         | `PlaylistCatlistBody`              | `code`、`all`、`all.name`、`categories`、`sub`、`sub[].name`                             |
| [新建歌单](/api/playlist/playlist-create)                          | `PlaylistCreateBody`               | `code`、`id`、`playlist`、`playlist.id`；`playlist.tracks[].id` 宽松                     |
| [删除歌单](/api/playlist/playlist-delete)                          | `PlaylistDeleteBody`               | `code`                                                                                   |
| [修改歌单简介](/api/playlist/playlist-desc-update)                 | `PlaylistDescUpdateBody`           | `code`                                                                                   |
| [修改歌单名称](/api/playlist/playlist-name-update)                 | `PlaylistNameUpdateBody`           | `code`                                                                                   |
| [调整歌单顺序](/api/playlist/playlist-order-update)                | `PlaylistOrderUpdateBody`          | `code`                                                                                   |
| [公开隐私歌单](/api/playlist/playlist-privacy)                     | `PlaylistPrivacyBody`              | `code`                                                                                   |
| [设置歌单标签](/api/playlist/playlist-tags-update)                 | `PlaylistTagsUpdateBody`           | `code`                                                                                   |
| [往歌单加歌](/api/playlist/playlist-track-add)                     | `PlaylistTrackAddBody`             | `code`；成功正文没有录到；缺参 400 改为 reject 400；401/404 原样转交                     |
| [从歌单删歌](/api/playlist/playlist-track-delete)                  | `PlaylistTrackDeleteBody`          | `code`；成功正文没有录到；缺参 400 改为 reject 400；401/404 原样转交                     |
| [往歌单加歌或删歌](/api/playlist/playlist-tracks)                  | `PlaylistTracksBody`               | `code`；`count`、`cloudCount`、`trackIds` 宽松；SDK 去掉 200 响应的额外包装              |
| [更新歌单](/api/playlist/playlist-update)                          | `PlaylistUpdateBody`               | `code`；三条子路由的结果键和子路由 `code` 收紧，`message` 宽松                           |
| [歌单打卡](/api/playlist/playlist-update-playcount)                | `PlaylistUpdatePlaycountBody`      | `code`；缺少 `id` 时的空字符串正文作为独立分支保留                                       |
| [收藏或取消收藏歌单](/api/playlist/playlist-subscribe)             | `PlaylistSubscribeBody`            | `code`                                                                                   |
| [设置歌单封面](/api/playlist/playlist-cover-update)                | `PlaylistCoverUpdateBody`          | `code`、`data`、`data.code`；`data.url`、`msg` 宽松                                      |
| [歌曲排序](/api/music/song-order-update)                           | `SongOrderUpdateBody`              | `code`；大批量调整可能回 `-1`，但网易云可能已经完成排序，SDK 仍按失败返回                |
| [申请图片上传凭证](/api/playlist/image-upload-token)               | `ImageUploadTokenBody`             | `code`、`data`、`data.imgId`、`data.token`、`data.uploadUrl`、`data.url_pre`             |
| [歌单导入任务创建](/api/playlist/playlist-import-name-task-create) | `PlaylistImportNameTaskCreateBody` | `code`；`data`、`data.taskId`、`msg`、`message` 宽松（`local`/`link` 分支未录制）        |
| [歌单导入任务状态](/api/playlist/playlist-import-task-status)      | `PlaylistImportTaskStatusBody`     | `code`、`data`、`data.tasks`、`data.tasks[].id`、`data.tasks[].status`；其余任务字段宽松 |

歌单类写操作的录制都在一个临时歌单上完成，删除后 `playlist_detail` 仍回 `playlist.status: 10`；删除只是把歌单移出用户歌单列表，元数据并未抹除，已删除歌单仍接受 `playlist_update` 的名字/简介/标签和 `playlist_update_playcount` 的计数写入。导入任务不是歌单操作，只在无匹配文本时建了任务，没有生成歌单。`playlist_track_add`、`playlist_track_delete` 对自有歌单也回 401 无权限操作歌单，没有成功的字段证据，结构定义只收紧返回码，其余字段原样保留；这两个模块没有 `final: true` 的成功录制，`schema:audit module` 对它们返回 exit 1。

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

## 推荐

| 模块                                                            | 结构定义                             | 收紧的字段                            |
| --------------------------------------------------------------- | ------------------------------------ | ------------------------------------- |
| [获取每日推荐歌单](/api/recommend/recommend-resource)           | `RecommendResourceBody`              | `code`、`recommend`、`recommend[].id` |
| [推荐歌单](/api/recommend/personalized)                         | `PersonalizedBody`                   | `code`、`result`、`result[].id`       |
| [推荐 MV](/api/recommend/personalized-mv)                       | `PersonalizedMvBody`                 | `code`、`result`、`result[].id`       |
| [推荐新歌](/api/recommend/personalized-newsong)                 | `PersonalizedNewsongBody`            | `code`、`result`、`result[].id`       |
| [独家放送](/api/recommend/personalized-privatecontent)          | `PersonalizedPrivatecontentBody`     | `code`、`result`、`result[].id`       |
| [独家放送列表](/api/recommend/personalized-privatecontent-list) | `PersonalizedPrivatecontentListBody` | `code`、`result`、`result[].id`       |
| [获取相似歌单](/api/recommend/simi-playlist)                    | `SimiPlaylistBody`                   | `code`、`playlists`、`playlists[].id` |
| [获取相似音乐](/api/recommend/simi-song)                        | `SimiSongBody`                       | `code`、`songs`、`songs[].id`         |
| [相似 mv](/api/recommend/simi-mv)                               | `SimiMvBody`                         | `code`、`mvs`、`mvs[].id`             |
| [获取最近 5 个听了这首歌的用户](/api/recommend/simi-user)       | `SimiUserBody`                       | `code`；`userprofiles` 只见过空数组   |
| [私人 FM](/api/music/personal-fm)                               | `PersonalFmBody`                     | `code`、`data`、`data[].id`           |
| [私人 FM 模式选择](/api/music/personal-fm-mode)                 | `PersonalFmModeBody`                 | `code`、`data`、`data[].id`           |
| [心动模式/智能播放](/api/recommend/playmode-intelligence-list)  | `PlaymodeIntelligenceListBody`       | `code`、`data`、`data[].id`           |
| [私人 DJ](/api/recommend/aidj-content-rcmd)                     | `AidjContentRcmdBody`                | `code`、`data`、`data.aiDjResources`  |

每日推荐歌单和推荐歌单的卡片复用 `PlaylistSummary`，只收紧卡片自己的 `id`；`highQuality`、`trackNumberUpdateTime`、`playCount` 由 `PlaylistSummary` 声明，每日推荐歌单的小写 `playcount`、推荐歌单的 `canDislike`、`copywriter` 等卡片字段在模块内补成宽松字段。推荐 MV 复用 `MvSummary`，另补 `picUrl`、`canDislike`、`copywriter`、`type`、`alg`；`trackNumberUpdateTime` 在录制里只见过 `null`，没有声明。推荐新歌的 `song` 是旧版歌曲结构，复用节目记录的 `ProgramMainSong`（`album` 复用 `SimpleAlbum`、`artists` 复用 `Artist`），另补宽松的 `alias`、`exclusive`、`sqMusic`、`hrMusic`、`privilege`（`LooseSongPrivilege`）和 `transName`/`transNames`；`rtUrls`、`album.songs` 只见过空数组，`mp3Url`、`noCopyrightRcmd`、`rtUrl`、`sign` 等只见过 `null`，都没有声明。独家放送和独家放送列表的条目形状不同（后者多 `time`、少 `alg`），分别在各自模块里声明。

六个模块都补了匿名和登录两份录制，登录侧先经 `login_status` 确认 `anonimousUser: false`。`personalized`、`personalized_mv`、`personalized_privatecontent`、`personalized_privatecontent_list` 两边的字段路径和类型相同；`recommend_resource` 的 `creator.expertTags` 匿名 6/6 是 `null`，登录 19 条中 14 条仍是 `null`、5 条是非空数组；`personalized_newsong` 的匿名录制（查询参数不同，3 首）多出若干只见过 `null` 的字段和 `exclusive: false`，登录录制多出 `transName`/`transNames`、`trp` 的非空值，都落在同一份宽松声明里。差异只在条数、实时计数、CDN 地址和这些宽松字段的值。本批录制和探测没有找到可达的空结果：`personalized` 的 `limit=0` 会回落到默认 30，`personalized_newsong` 的 `limit=0` 回落到默认 10，`personalized_mv`、`personalized_privatecontent`、`recommend_resource` 没有分页参数，`personalized_privatecontent_list` 的越界 `offset=100000` 返回 `code: 404` 而不是空列表；数组本身仍然允许为空，契约测试用手写空数组覆盖。`personalized`、`personalized_newsong`、`personalized_privatecontent_list` 的非法数字参数（如 `limit=abc`）返回 `code: 400`：改造前 `code: 400` 经 `SPECIAL_STATUS_CODES` 映射为 resolve `status: 200`，现在被 Body 校验按业务拒绝为 reject `status: 400`、`body` 保留上游原文；`personalized_privatecontent_list` 的越界 `offset=100000`（`code: 404`）改造前是 resolve `status: 404`，现在是 reject `status: 404`。两者都不报 502。

`simi_song` 复用节目记录的 `ProgramMainSong`（旧版歌曲结构），`simi_playlist` 复用 `PlaylistSummary`，`simi_mv` 复用 `MvSummary`：只收紧列表本身和记录自己的 `id`，其余声明字段宽松。`simi_song` 另补录制里非 `null` 的 `alg`、`alias`、`mp3Url`、`privilege`、`recommendReason`、`sqMusic`、`transNames`；`simi_mv` 的 `desc`、`simi_song` 的 `rtUrl`、`crbt` 等只见过 `null`，没有声明。`simi_user` 的 `userprofiles` 只有空数组证据、元素类型未知，没有声明，由 `UpstreamObject` 原样保留；登录账号用 15 首歌曲探测都是空数组。`simi_artist.unknown.json`、`simi_playlist.unknown.json`、`simi_song.unknown.json` 是未知 id 的空数组；`simi_mv` 传入未知 `mvid` 仍返回默认 5 条（`simi_mv.unknown-mvid.json`），本批录制与探测未发现可达的空结果。这 5 个模块都用登录账号录制（`context.viewer` 是 `authenticated`），录制前经 `login_status` 确认 `anonimousUser: false`；本批未保留匿名对照录制。

`personal_fm` 和 `personal_fm_mode` 都返回 `data` 歌曲列表，歌曲用模块内的 `FmSong`（复用 `ProgramMainSong`，补 `alg`、`alias`、`fmRecReason`、`privilege`、`reason`、`reasonId`、`transName`、`transNames` 等录制里出现的旧版字段），只收紧每首歌自己的 `id`；`extTransMap` 是以歌曲编号为键、`fmRecReason` 为值的宽松映射（`personal_fm` 录制里是空对象或 `null`，`personal_fm_mode` 里出现非空值），`popAdjust` 宽松，`tag` 只见过 `null`，未声明并原样保留。`personal_fm_mode` 的 `mode`/`submode` 只改请求参数，响应与 `personal_fm` 同构；录制覆盖 `DEFAULT`、`FAMILIAR`、`EXPLORE`、`aidj` 和 `SCENE_RCMD` 的 `FOCUS`/`EXERCISE`/`NIGHT_EMO` 分支。旧版歌曲里的 `audition`、`crbt`、`mp3Url`、`rtUrl`、`rtUrls`、`rurl`、`sign` 只见过 `null` 或空数组，没有声明，仍原样保留。这两个接口在录制和探测里都没有找到可达的空结果（登录 3 首、匿名 1 首，非法 mode 仍返回 3 首），数组本身允许为空。

`playmode_intelligence_list` 的 `data[]` 每条记录自己的 `id` 收紧，`songInfo` 是宽松字段并复用 `LooseSong`（嵌套歌曲编号也宽松，坏 `id` 只丢编号，不会让整条 `songInfo` 消失）；`alg`、`recommended`、`message` 宽松。录制从原始 149 条截到 3 条，`context.truncated` 记录原始长度 149。录制账号用“我喜欢的音乐”歌单能成功，探测到的另一个歌单返回 `code: 400`（`不支持该歌单类型`，录制 `playmode_intelligence_list.unsupported-playlist.json`），缺少 `pid` 时上游返回 `code: 500`，都按业务拒绝转交，不报 502。本批录制和探测没有找到可达的空 `data`，数组本身允许为空。

`aidj_content_rcmd` 的 `data.aiDjResources` 收紧，每条资源的 `type` 和 `value` 宽松；`value` 里声明录制有证据的 `songId`（字符串）、`includeVoice`、`songData`、`songPrivilege`、`audioList`（音频编号、地址、时长等），全部宽松；`songData` 用模块内的 `AiDjSong`（复用 `ProgramMainSong`，补 `alias`/`transName`/`transNames`，歌曲编号也宽松）。`tagName`、`message`、`trp.rules` 宽松；声明了这些字段，其余原样保留（`songData` 里只见过 `null` 或空数组的字段也未声明）。宽松字段可能缺席，例如 `with-location` 录制里的 song 资源没有 `audioList`。没有找到可达的空资源列表，数组本身允许为空。

登录对照先用 `login_status` 确认 `account.anonimousUser: false`。`personal_fm`、`personal_fm_mode` 和 `aidj_content_rcmd` 另保留匿名录制；声明过的字段及其允许类型一致，差异只在宽松/未声明字段的出现与值（如 `reason`/`fmRecReason`/`extTransMap` 是否出现，`rscl`/`cannotListenReason` 的取值），不对所有账号、地区和版本作相同性断言。

## 歌手、听歌排行与会员

| 模块                                                   | 结构定义                    | 收紧的字段                                                                                                                                                                             |
| ------------------------------------------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [歌手详情](/api/artist/artist-detail)                  | `ArtistDetailBody`          | `code`、`data`、`data.artist`、`data.artist.id`                                                                                                                                        |
| [获取歌手描述](/api/artist/artist-desc)                | `ArtistDescBody`            | `code`、`introduction`                                                                                                                                                                 |
| [歌手详情动态](/api/artist/artist-detail-dynamic)      | `ArtistDetailDynamicBody`   | `code`                                                                                                                                                                                 |
| [歌手粉丝](/api/artist/artist-fans)                    | `ArtistFansBody`            | `code`；`data` 可以没有，出现时 `data[].userProfile`、`userProfile.userId` 收紧                                                                                                        |
| [歌手粉丝数量](/api/artist/artist-follow-count)        | `ArtistFollowCountBody`     | `code`、`data`                                                                                                                                                                         |
| [歌手分类列表](/api/artist/artist-list)                | `ArtistListBody`            | `code`、`artists`、`artists[].id`                                                                                                                                                      |
| [获取歌手 mv](/api/artist/artist-mv)                   | `ArtistMvBody`              | `code`、`mvs`、`mvs[].id`                                                                                                                                                              |
| [关注歌手新 MV](/api/artist/artist-new-mv)             | `ArtistNewMvBody`           | `code`、`data`、`data.newWorks`、`data.newWorks[].mvId`                                                                                                                                |
| [关注歌手新歌](/api/artist/artist-new-song)            | `ArtistNewSongBody`         | `code`、`data`、`data.newWorks`、`data.newWorks[].songLists[].id`                                                                                                                      |
| [歌手全部歌曲](/api/artist/artist-songs)               | `ArtistSongsBody`           | `code`、`songs`、`songs[].id`                                                                                                                                                          |
| [获取歌手视频](/api/artist/artist-video)               | `ArtistVideoBody`           | `code`、`data`、`data.records`、`data.records[].id`                                                                                                                                    |
| [歌手单曲](/api/artist/artists)                        | `ArtistsBody`               | `code`、`hotSongs`、`hotSongs[].id`                                                                                                                                                    |
| [获取相似歌手](/api/artist/simi-artist)                | `SimiArtistBody`            | `code`、`artists`、`artists[].id`                                                                                                                                                      |
| [听歌排行](/api/listen/user-record)                    | `UserRecordBody`            | `code`；`allData` / `weekData` 可以没有，出现时 `[].song` 收紧                                                                                                                         |
| [VIP 信息](/api/vip/vip-info)                          | `VipInfoBody`               | `code`、`data`                                                                                                                                                                         |
| [VIP 信息 v2](/api/vip/vip-info-v2)                    | `VipInfoV2Body`             | `code`、`data`                                                                                                                                                                         |
| [黑胶时光机](/api/vip/vip-timemachine)                 | `VipTimemachineBody`        | `code`、`data`；`data.detail` 可以没有，出现时 `data.detail[].rowKey` 收紧；`data.detail[].data` 必填（缺失/null/非对象 → 502）                                                        |
| [会员成长值](/api/vip/vip-growthpoint)                 | `VipGrowthpointBody`        | `code`、`data`、`data.userLevel`、`data.userLevel.userId`、`data.userLevel.growthPoint`                                                                                                |
| [会员成长值领取记录](/api/vip/vip-growthpoint-details) | `VipGrowthpointDetailsBody` | `code`、`data`、`data.details`                                                                                                                                                         |
| [会员任务](/api/vip/vip-tasks)                         | `VipTasksBody`              | `code`、`data`、`data.taskList`、`data.taskList[].taskItems`、`data.taskList[].taskItems[].taskId`                                                                                     |
| [签到进度](/api/vip/signin-progress)                   | `SigninProgressBody`        | `code`、`data`、`data.today`、`data.today.todaySignedIn`、`data.records`、`data.records[].day`、`data.stats`、`data.stats[].id`、`data.today.todayStats`、`data.today.todayStats[].id` |
| [签到活动信息](/api/vip/sign-happy-info)               | `SignHappyInfoBody`         | `code`、`data`、`data.info`、`data.info.id`                                                                                                                                            |
| [云贝签到状态](/api/vip/yunbei)                        | `YunbeiBody`                | `code`、`data`、`data.days`、`data.shells`                                                                                                                                             |
| [云贝账户信息](/api/vip/yunbei-info)                   | `YunbeiInfoBody`            | `code`、`userPoint`、`userPoint.userId`、`userPoint.balance`                                                                                                                           |
| [今日云贝](/api/vip/yunbei-today)                      | `YunbeiTodayBody`           | `code`、`data`、`data.shells`                                                                                                                                                          |
| [云贝任务](/api/vip/yunbei-tasks)                      | `YunbeiTasksBody`           | `code`、`data`、`data[].taskId`                                                                                                                                                        |
| [云贝待办任务](/api/vip/yunbei-tasks-todo)             | `YunbeiTasksTodoBody`       | `code`、`data`、`data[].userTaskId`（任务未开始时为 0）                                                                                                                                |
| [云贝推歌历史记录](/api/vip/yunbei-rcmd-song-history)  | `YunbeiRcmdSongHistoryBody` | `code`、`data`；`data.records` 未声明（只见过空数组）                                                                                                                                  |
| [账号云豆数](/api/vip/musician-cloudbean)              | `MusicianCloudbeanBody`     | `code`、`data`、`data.artistId`、`data.cloudBean`                                                                                                                                      |
| [音乐人数据概况](/api/vip/musician-data-overview)      | `MusicianDataOverviewBody`  | `code`、`data`                                                                                                                                                                         |
| [音乐人播放趋势](/api/vip/musician-play-trend)         | `MusicianPlayTrendBody`     | `code`、`data`、`data[].dateTime`、`data[].dataValue`                                                                                                                                  |
| [音乐人任务](/api/vip/musician-tasks)                  | `MusicianTasksBody`         | `code`、`data.list`、`data.list[].missionId`                                                                                                                                           |
| [音乐人任务(新)](/api/vip/musician-tasks-new)          | `MusicianTasksNewBody`      | `code`、`data.list`、`data.list[].missionId`                                                                                                                                           |

`data.artist.id`、`hotSongs[].id`、`data.records[].id` 是记录自己的编号，所以收紧；歌曲里套着的 `song.id`、MV 记录里的 `artist`、视频记录里的 `resource` 和会员权益对象是附带信息，字段宽松。听歌排行里 `allData` 和 `weekData` 按 `type` 二选一，两个都可以缺失或为 `null`。

歌手粉丝的 `data` 是可以没有的路径：越界分页/没有更多粉丝时上游返回 `data: null`（录制 `artist_fans.empty.json`，`offset=100000`），缺失或 `null` 都照常返回；出现时每个粉丝的 `userProfile` 和 `userProfile.userId` 按收紧校验，坏一条记录报 502。歌手分页列表 `artist_mv`、`artist_songs`、`artist_list` 在 `offset` 越过总数时返回空数组（录制 `artist_mv.empty.json`、`artist_songs.empty.json`、`artist_list.empty.json`），数组本身允许为空。`artist_video` 用越界 `cursor` 录到空 `records`（`artist_video.empty.json`）。`artist_desc` 的 `introduction` 在没有介绍条目时是空数组（`artist_desc.empty.json`）。

`artist_new_mv`、`artist_new_song` 返回的是登录账号关注歌手的新作品，登录录制都有非空结果：`artist_new_mv.default.json` 有 17 个 MV，`artist_new_song.default.json` 的 `newSongCount` 是 2213、原 20 个 block/62 首歌（截取保留 2 个 block、5 首歌，见 `context.truncated`）。`newWorks` 是需要校验的数组：匿名录制里是空数组（`artist_new_mv.anonymous-empty.json`、`artist_new_song.anonymous-empty.json`），这是正常结果；缺失、`null` 或坏一条记录都报 502。MV 的 `mvId` 和每首歌的 `songLists[].id` 收紧；MV 的 `artistId`、`artistName`、`artistImgUrl`、`mvName`、`playCount`、`duration`、`mvCoverUrl`、`publishTime`、`publishDate`、`artisAlias`、`artisTransName` 和新歌 block 的 `blockTitle`、`blockType`、`publishTime`、`albumId`、`albumSongCount`、`accompanimentIds` 都是宽松字段。

歌手全部歌曲的记录复用共享的 `Song`，另在模块内补了宽松的 `eq`，并把 `noCopyrightRcmd` 扩展成含 `expInfo`、`mvInfo` 的宽松结构。`artist_songs.default.json` 截取保留 30 首，`noCopyrightRcmd` 的嵌套证据在分页录制 `artist_songs.no-copyright.json`（`offset=70`，原始第 82 首；第 73 首在补录时已是 null）里。

MV 记录（`artist_mv` 的 `mvs[]`）本批在模块内声明：`id` 收紧，`artistName`、`duration`、`imgurl`、`imgurl16v9`、`name`、`playCount`、`publishTime`（`YYYY-MM-DD` 字符串）、`status`、`subed` 和 `artist`（复用宽松的 `Artist`）都是宽松字段。B9 已评估：MV 列表记录的字段集不同（`desc` 未声明、`alias`/`transNames` 只部分接口有），`artist_mv` 的局部 `Mv` 保留在模块内。

登录对照：这 8 个匿名接口在带 Cookie 重录时声明类型相同，值差异只来自关注状态（`followed`、`follow`、`followDay`）和实时计数/CDN 地址，登录录制已删除；个别声明字段的值可能为 `null` 或非 `null`（如 `artist_fans` 的 `vipRights`），属于记录数据本身的差异。

`vip_timemachine` 的周报列表 `data.detail` 是可以没有的路径：没有记录的周区间返回 `null`（录制 `vip/vip_timemachine.empty.json`），缺失或 `null` 都照常返回；出现时每份周报的 `rowKey` 收紧，报告体 `data.detail[].data` 必填（缺失、`null` 或非对象报 502），四种 `type` 的报告内容共用一个宽松结构。`vip_growthpoint` 收紧成长值记录 `data.userLevel` 及其 `userId`、`growthPoint`，等级卡 `levelCard` 是附带展示信息，字段全部宽松。`vip_growthpoint_details` 的记录列表 `data.details` 收紧，记录里的 `resourceId`、`descript`、`growthPoint`、`time` 都是宽松字段；`offset=100000` 越过列表返回空数组（`vip/vip_growthpoint_details.offset-100000.json`）。

`signin_progress` 的 `data` 是签到页，`data.today.todaySignedIn`、签到记录 `data.records[].day` 和统计 `id` 收紧；记录的 `signed`、签到描述、进度和奖品字段宽松，只见过 `null` 的 `currentSignDesc` 未声明。本账号录制时未签到（`records[].signed` 全为 `false`），默认录制同时是未签到证据；30 天记录、3 条统计和今日统计都是非空数组，空窗口没有录到。`sign_happy_info` 收紧活动信息 `data.info` 及其 `id`，活动文案、资源与热评宽松，只见过 `null` 的 `jumpText`、`specialJumpUrl`、`btnPicUrl`、`operator`、`videoStrId` 未声明。`yunbei` 收紧连续签到天数和当天云贝，`yunbei_today` 的录制是 0 云贝零值；`yunbei_info` 收紧 `userPoint` 及 `userId`、`balance`，等级和签到标记宽松，只见过 `null` 的配置字段未声明。`yunbei_tasks` 和 `yunbei_tasks_todo` 收紧任务数组及记录自己的 `taskId` / `userTaskId`，任务说明、奖励明细和链接宽松，`wordsPicUrl` 只见过 `null` 未声明。`yunbei_rcmd_song_history` 只收紧 `code` 和 `data`；`data.records` 只有空数组证据、元素类型未知，未声明并原样保留。签到与云贝的登录对照：`signin_progress` 匿名返回 `code: 301`，`sign_happy_info`、`yunbei`、`yunbei_today` 匿名返回 `code: 302`；`yunbei_info`、`yunbei_tasks`、`yunbei_tasks_todo`、`yunbei_rcmd_song_history` 匿名返回 `code: 200` 且通过结构校验。本账号录制前经 `login_status` 确认 `account.anonimousUser` 为 `false`（未落盘）。`yunbei_expense`、`yunbei_receipt` 本次探测仍返回 `code: 404`（接口未找到），没有成功正文，未补结构定义；签到和领取写操作不在本批。`signin_progress` 的非法 `moduleId` 与 `yunbei_rcmd_song_history` 的负 `size` 都返回 `status: 200` + `code: 400`，SDK 按业务失败转交为 HTTP 400；没有录到 HTTP 400 空正文，因此 `ModuleBody` 不包含空字符串分支。

B23 已补写（不属于 B37）：`vip_tasks` 收紧任务分组 `data.taskList`、组内任务 `data.taskList[].taskItems` 和任务的 `taskId`；B23 只录到一条任务，`taskId` 为字符串；B23 录制（匿名与登录）没有出现可达的空任务列表。登录对照先确认 `login_status` 的 `account.anonimousUser` 为 `false`；匿名对照录制保留为 `vip/vip_growthpoint.anonymous.json`、`vip/vip_growthpoint_details.anonymous.json`、`vip/vip_tasks.anonymous.json` 和 `digital-album/digitalAlbum_purchased.anonymous.json`，不对匿名与登录的公开结构作相同性断言。

`simi_artist` 的 `artists[]` 复用 `Artist` 的字段声明，只把记录自己的 `id` 收紧；相似歌手记录多出的 `alg`、`fansCount` 另声明为宽松字段，只见过 `null` 的 `identifyTag`、`isSubed`、`publishTime`、`showPrivateMsg` 没有声明，`mvSize` 按 `Artist` 的宽松声明处理。未知歌手 id 返回空数组（`simi_artist.unknown.json`）；本批录制来自登录账号（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `anonimousUser: false`），没有保留匿名对照录制。

`musician_cloudbean` 的 `data` 是当前音乐人账号的云豆对象，`data.artistId` 是记录自己的编号、`data.cloudBean` 是接口要拿的云豆数；`maxCloudBean`、`needPop`、`signed` 宽松，`musicianLevel`、`flowStage`、`dynamicNews` 只见过 `null`，没有声明。`musician_data_overview` 只收紧通到概况对象的 `data`，各项统计（`availableExtractIncomeTotal`、`productionTotal`、`musicianLevelScore`、`totalFansCount`）宽松，`playCount`、`totalPlayCount`、`fansPlayCount`、`fansPlayRatio`、`followerCountIncrement` 只见过 `null`，没有声明。

`musician_play_trend` 的 `data` 是日趋势数组，`data[].dateTime` 是日期键、`data[].dataValue` 是这一天的播放数（字符串，`"0"` 也正常），三项收紧。`startTime`/`endTime` 要传 `YYYY-MM-DD` 字符串；毫秒数、秒数或缺少参数会返回 `code: 400`（`musician_play_trend.ms-params.json`、`musician_play_trend.s-params.json`、`musician_play_trend.no-params.json`）。没有播放记录的区间返回 `data: []`（`musician_play_trend.empty.json`），匿名调用也返回空趋势（`musician_play_trend.anonymous-empty.json`）。

`musician_tasks` 和 `musician_tasks_new` 的 `data.list` 是必填任务数组，每个任务的 `missionId` 收紧；其余任务字段宽松，`extendInfo` 是 JSON 字符串。`musician_tasks_new` 的阶段目标 `data.list[].userStageTargetList` 是任务记录里套着的展示数据，整列宽松，坏一条只丢这一列。登录录制分别有 7 条和 5 条任务；本批没有录到任务列表为空的音乐人账号，`data.list` 在空账号下的实际表现未验证。

这 5 个模块都用音乐人账号录制（`context.viewer` 是 `authenticated`，录制前经 `login_status` 确认 `account.anonimousUser: false`（未落盘））。未登录（匿名）时 `musician_cloudbean`、`musician_data_overview`、`musician_tasks`、`musician_tasks_new` 分别返回 `code: 600`、`10000`、`301`、`301`，SDK 按请求层既有规则转交（`status` 分别为 `400`、`400`、`301`、`301`）；登录的非音乐人账号未录到，返回码与成功正文未验证。本次录到的 600/10000/301 在改造前就由请求层拒绝，行为不变。特殊码（201、302、400、502、800–803）改造前会被归一成 `status: 200` 进入模块，本批开始校验后按业务码拒绝：201、302、400、502 转成同名 `status`，800–803 这类不在 100–599 的码映射为 `status: 400`；`musician_play_trend` 录到的 `code: 400` 属于这一类。

## 听歌足迹

| 模块                                                         | 结构定义                       | 收紧的字段                                        |
| ------------------------------------------------------------ | ------------------------------ | ------------------------------------------------- |
| [总收听时长](/api/listen/listen-data-total)                  | `ListenDataTotalBody`          | `code`、`data.totalDuration`                      |
| [今日收听](/api/listen/listen-data-today-song)               | `ListenDataTodaySongBody`      | `code`、`data.songDTOs`、`data.songDTOs[].songId` |
| [年度听歌足迹](/api/listen/listen-data-year-report)          | `ListenDataYearReportBody`     | `code`、`data.yearItems`、`data.yearItems[].year` |
| [本周/本月收听时长](/api/listen/listen-data-realtime-report) | `ListenDataRealtimeReportBody` | `code`、`data`                                    |
| [周/月/年收听报告](/api/listen/listen-data-report)           | `ListenDataReportBody`         | `code`、`data`                                    |

`listen_data_total` 的 `data` 和 `totalDuration`、`listen_data_today_song` 的 `data.songDTOs` 与每首歌的 `songId`、`listen_data_year_report` 的 `data.yearItems` 与每年的 `year` 都是接口要返回的东西，所以收紧；`message`、`songName`、`aliasName`、`artists`（含 `artistId`）、`displayYear`、`playNum`、`playDuration` 等宽松。今日收听和年度足迹的列表允许为空数组，`[]` 是构造边界；本批只有一个有数据的登录账号，空账号下 `data`/列表的实际表现未验证，`listen_data_total` 的零数据账号表现同样未验证。

`listen_data_realtime_report` 和 `listen_data_report` 只收紧 `code` 和通到返回物的 `data`（`data` 是返回对象，不是某个时长字段；`listenTimeDistributionBlock` 等块内全部宽松）。两块统计内容都是展示用途，整块缺失或为 `null` 时原样保留：时长分布、今日/好友块、`topSongBlock`、`topArtistBlock`、`topStyleBlock`、`topAgeBlock`、`topLanguageBlock`、`vipBlock`、`wallpaperBlock` 内部的字段全部宽松，宽松容器里的 `songId`、`userId` 等编号也宽松。月报的好友块名是 `friendsListenMonthBlock` / `friendsKeyWordMonthBlock`，周报是 `friendsListenWeekBlock` / `friendsKeywordWeekBlock`；年报只返回时间范围和 `listenTimeBlock: null`（`listen_data_report.year.json`），没有收听记录的周所有块都是 `null`（`listen_data_report.empty.json`）。月维度实时报告另有 `listenTimeDistributionBlock.sleepTdBlock.sleepDurationDetails`，同样宽松；只见过 `null` 的 `userNickName`、`achievementTitle`、`sleepScene` 等字段没有声明，原样保留。

这 5 个接口都要求登录。录制来自 `authenticated` 账号（`context.viewer`，录制前经 `login_status` 确认 `account.anonimousUser: false`（未落盘））；5 个接口的匿名调用都返回 HTTP 200 + `code: 302`（各模块的 `.anonymous.json`），不保留为成功正文。

## MV

| 模块                                           | 结构定义              | 收紧的字段                                         |
| ---------------------------------------------- | --------------------- | -------------------------------------------------- |
| [全部 mv](/api/video/mv-all)                   | `MvAllBody`           | `code`、`data`、`data[].id`                        |
| [最新 mv](/api/video/mv-first)                 | `MvFirstBody`         | `code`、`data`、`data[].id`                        |
| [网易出品 mv](/api/video/mv-exclusive-rcmd)    | `MvExclusiveRcmdBody` | `code`、`data`、`data[].id`                        |
| [mv 排行](/api/toplist/top-mv)                 | `TopMvBody`           | `code`、`data`、`data[].id`                        |
| [获取 mv 数据](/api/video/mv-detail)           | `MvDetailBody`        | `code`、`data`、`data.id`                          |
| [mv 点赞转发评论数](/api/video/mv-detail-info) | `MvDetailInfoBody`    | `code`、`commentCount`、`shareCount`、`likedCount` |
| [mv 地址](/api/video/mv-url)                   | `MvUrlBody`           | `code`、`data`、`data.id`、`data.url`、`data.code` |
| [收藏的 MV 列表](/api/video/mv-sublist)        | `MvSublistBody`       | `code`、`data`、`data[].vid`                       |

`mv_all`、`mv_first`、`mv_exclusive_rcmd`、`top_mv` 的列表记录共用 `MvSummary`（`top_mv` 在模块内再补上榜字段）：只收紧记录自己的 `id`；`cover`、`name`、`playCount`、`briefDesc`、`artistId`、`artistName`、`duration`、`mark`、`subed`、`artists`（复用宽松的 `Artist`）、`alias`、`transNames` 全部宽松。`desc` 在四份列表录制里都只见过 `null`，没有声明，原样保留。`top_mv` 的 `lastRank`、`score`、`updateTime`、`hasMore` 和嵌套的 `mv`（含 `videos[].tagSign`）都宽松；录制 `top_mv.default.json` 原始 30 条，截取前 10 条（见 `context.truncated`）。`mv_all` 的 `count` 只在第一页出现，非零 `offset` 的录制（`mv_all.page-two.json`）里整个缺失，所以是宽松字段。`mv_first`、`mv_exclusive_rcmd` 分别用无效地区筛选和越界 `offset` 录到空 `data`（`mv_first.empty-area.json`、`mv_exclusive_rcmd.no-result.json`）；`mv_all` 和 `top_mv` 本批录制与探测未发现可达的空结果。

`mv_detail` 返回的不是列表记录，结构单独声明：`code`、`data`、`data.id` 收紧；`mp`、`loadingPic`、`bufferPic`、`subed` 和详情里的封面、计数、时长、发布时间、`brs[]`、`artists`、`desc` 都宽松。`data.price` 在录制里只见过 `null`、`videoGroup` 只见过空数组，都没有声明。

`mv_detail_info` 里接口要的 `commentCount`、`shareCount`、`likedCount` 收紧，`liked`（当前账号的点赞状态）宽松。`mv_url` 的 `data` 是对象：`data.id`、`data.url`（拿不到地址时是 `null`，原因看 `data.code`）、`data.code` 收紧，`r`、`size`、`md5`、`expi`、`msg` 等宽松；录制覆盖默认 1080p（`mv_url.default.json`）、720p（`mv_url.720p.json`）和上游间歇返回 `-125` 的不可用场景（`mv_url.unavailable.json`）。

`mv_sublist` 返回的是云视频收藏记录：`data[].vid` 是记录自己的编号，按字符串收紧；`title`、`durationms`、`creator`、`playTime`、`coverUrl`、`aliaName`、`transName`、`markTypes` 宽松，`alg` 只见过 `null` 没有声明。登录录制有 20 条，匿名录制（`mv_sublist.anonymous.json`）是空数组。其余列表模块的匿名与登录重录逐字段 diff 没有结构差异，登录对照录制已删除；`mv_sublist` 只对比到顶层字段（匿名时 `data` 是空数组），非空登录录制保留作为元素字段证据。收藏/取消收藏 MV（`mv_sub`）是写操作，本批没有收窄返回体。

## 视频

| 模块                                               | 结构定义                     | 收紧的字段                                         |
| -------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| [获取视频分类列表](/api/video/video-category-list) | `VideoCategoryListBody`      | `code`、`data`、`data[].id`                        |
| [视频详情](/api/video/video-detail)                | `VideoDetailBody`            | `code`、`data`、`data.vid`                         |
| [视频点赞转发评论数](/api/video/video-detail-info) | `VideoDetailInfoBody`        | `code`、`commentCount`、`shareCount`、`likedCount` |
| [视频标签/分类下的视频](/api/video/video-group)    | `VideoGroupBody`             | `code`；`datas` 只见过 `null`，未声明              |
| [视频标签列表](/api/video/video-group-list)        | `VideoGroupListBody`         | `code`、`data`、`data[].id`                        |
| [全部视频列表](/api/video/video-timeline-all)      | `VideoTimelineAllBody`       | `code`、`datas`、`datas[].data.vid`                |
| [推荐视频](/api/video/video-timeline-recommend)    | `VideoTimelineRecommendBody` | `code`、`datas`、`datas[].data.vid`                |
| [视频链接](/api/video/video-url)                   | `VideoUrlBody`               | `code`、`urls`、`urls[].id`、`urls[].url`          |
| [相关视频](/api/video/related-allvideo)            | `RelatedAllvideoBody`        | `code`                                             |
| [歌曲相关视频](/api/video/mlog-music-rcmd)         | `MlogMusicRcmdBody`          | `code`、`data.feeds`、`data.feeds[].id`            |

`video_category_list` 和 `video_group_list` 的 `data` 是通到分类/标签列表的路径，每条记录的 `id` 是记录自己的编号，收紧；`name`、`url`、`selectTab` 宽松。`video_category_list` 的 `relatedVideoType` 有字符串证据，声明为宽松字段；`video_group_list` 的 `relatedVideoType`、两个接口的 `abExtInfo` 都只见过 `null`，没有声明。当前上游忽略 `offset`，越界 `offset` 仍返回同样的分类，本批录制/探测未发现可达的空结果。

`video_detail` 的 `data` 和视频自己的编号 `data.vid` 收紧；`creator` 复用宽松的 `PlaylistUser`，封面、标题、描述、计数、时长、发布时间、`resolutions[]`、`videoGroup[]` 等其余字段宽松。`markTypes` 在详情录制里只见过空数组、`videoUserLiveInfo` 只见过 `null`，都没有声明，原样保留。`video_detail_info` 只收紧评论线程的 `commentCount`、`shareCount`、`likedCount`，`liked` 是当前账号状态，宽松。

`video_timeline_all` 和 `video_timeline_recommend` 的 `datas` 是通到视频列表的路径，每条视频的 `data.vid` 是记录自己的编号，按字符串收紧；`creator` 复用宽松的 `PlaylistUser`，`resolutions[]`、`videoGroup[]`、`markTypes` 宽松，`relateSong[]` 是宽松字段里套着的歌曲记录（编号也宽松，复用 `Song` 的字段并把 `id` 放宽）。`previewUrl` 只在 `video_timeline_all` 有非 `null` 证据，`urlInfo`（含地址、大小、有效期）只在 `video_timeline_recommend` 有非 `null` 证据；`extAlg`、`relatedInfo`、`videoUserLiveInfo` 只见过 `null`，没有声明。`video_timeline_all` 的 `offset=7` 越界页返回 `datas: []`、`hasmore: false`（录制 `video_timeline_all.empty.json`），`video_timeline_recommend` 的 `offset=100` 越界页返回 `datas: []`、`msg: "暂无推荐视频，请稍后再试"`、`hasmore: false`（录制 `video_timeline_recommend.empty.json`），空数组是正常结果。两个模块的 `resolutions[]` 和 `videoGroup[]` 复用 core 的 `VideoResolutionEntry`、`VideoGroupRef`。

`video_url` 的 `urls` 是通到播放地址的路径，条目里的 `id` 和 `url` 收紧；`r`、`size`、`validityTime`、`needPay` 宽松，`payInfo` 只见过 `null` 没有声明。录制覆盖请求 1080 实际给到 720（`video_url.default.json`）、480p（`video_url.480p.json`）、240p（`video_url.240p.json`）；未知视频返回 `urls: []`（`video_url.empty.json`），本批未探测到 `url` 为 `null`。`video_group` 的 `datas` 在本批录制和对全部标签 id 的探测里没有出现过非 `null` 值，元素类型无法确定，未声明并原样保留；`related_allvideo` 的 `data` 在十六进制视频 id（`type: 1`）和数字 id（`type: 0`）两种请求下都是空数组，同样未声明。

登录对照先用 `login_status` 确认 `account.anonimousUser: false`。`video_timeline_all`、`video_timeline_recommend` 的登录录制差异只在宽松字段（`relateSong` 出现歌曲记录、`markTypes` 出现值；`creator.experts` 的键集合差异只在 `video_timeline_all`，匿名录制多出 `experts.2`，`video_timeline_recommend` 两边都只有 `{1}` 或 `null`），这两份登录录制保留为元素字段证据；其余 7 个模块只保留匿名录制，未保留登录对照，不对公开结构作相同性断言。收藏/取消收藏视频（`video_sub`）是写操作，移到后续写操作批次（B22 关注/收藏/点赞），本批没有收窄返回体。

`mlog_music_rcmd` 的 `data.feeds` 是歌曲相关视频列表，每条记录自己的 `id` 按字符串收紧；`resource` 是附带的 mlog 记录，整体宽松（嵌套歌曲复用 `MlogSong`），声明 `mlogBaseData.userId`/`coverDetail`/`video`/`mixInfo.status`、`userProfile` 的昵称/编号/头像和 `source` 等有证据的字段；`video` 里声明 `urlInfo`/`rcmdUrlInfo`/`urlInfos`（`id`、`r`、`size`、`validityTime`、`resolution`）；`matchField`、`sameCity`、`type`、`more` 和 `message` 宽松，`data.msg` 只见过 `null`，未声明。声明了这些字段，其余原样保留（如 `urlInfo.url`、`relatedPubUsers`、`mlogPlaylists`）。录制覆盖有相关视频（歌曲 `1330348068`，1 条）和没有相关视频（歌曲 `347230`，`feeds: []`，`mlog_music_rcmd.empty.json`）两种情况，空数组和非空数组都通过同一结构。

## 首页与推荐位

| 模块                                                    | 结构定义                 | 收紧的字段                                                                                           |
| ------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| [首页轮播图](/api/recommend/banner)                     | `BannerBody`             | `code`、`banners`                                                                                    |
| [首页 block page](/api/recommend/homepage-block-page)   | `HomepageBlockPageBody`  | `code`、`data`、`data.blocks`、`data.blocks[].blockCode`；`data.blocks[].creatives` 是可以没有的路径 |
| [首页 dragon ball](/api/recommend/homepage-dragon-ball) | `HomepageDragonBallBody` | `code`                                                                                               |

这批 default 录制都用登录账号（先经 `login_status` 确认 `account.anonimousUser: false`）；`banner` 另有独立匿名录制（PC 视角，2 条 banner），`homepage_block_page` 另有失效凭据回匿名视角的录制（viewer 为 invalid-cookie）。两份录制都能通过同一结构校验；差异在宽松字段、`creatives` 是否出现（default 的 5 个 block 都有，invalid-cookie 的 banner block 没有）和 block 集合/顺序；不对所有账号/地区/版本作相同性断言。`banner` 的 `type` 0 是 PC、1–3 是移动端，两种形状的字段不同，按同一个对象声明为宽松字段；`song` 复用宽松的 `LooseSong`。`homepage_block_page` 的 `data.blocks` 是 block 列表，每个 block 的 `blockCode` 收紧；例如 banner 这类 block 用 `extInfo` 承载内容、没有 `creatives`，所以 `creatives` 是可以没有的路径，出现时里面的坏元素报 502；creative 的 `resources` 是宽松数组，整列校验失败时丢弃。block 的 `uiElement`、creative、resource 和 `resourceExtInfo` 都是随 `showType`/`resourceType` 变化的展示数据，按出现过的键声明成宽松字段，旧版歌曲复用 `ProgramMainSong`，新歌复用 `LooseSong`，权限复用 `LooseSongPrivilege`，主播复用 `ProgramDj`，创建者和话题用户复用 `PlaylistUser`，嵌着的电台节目复用 `DjProgram` 字段。

`homepage_dragon_ball` 在登录和匿名录制里 `data` 都是空数组，入口元素类型没有证据，`data` 未声明并原样保留。本批录入的录制与探测没有找到可达的空结果：`banner` 在 `type` 0–3 下都返回非空数组，`homepage_block_page` 在登录和失效凭据回匿名视角下都返回非空 `blocks`；非法 `cursor` 返回 `code: 50002`（录制 `homepage_block_page.invalid-cursor.json`，映射为 `status: 400`），数组本身允许为空。`event_del`、`event_forward` 是写操作，移到后续写操作批次；`event`、`hot_topic` 和 `calendar` 不在本批清单里，本批没有改它们的声明。

## 电台

| 模块                                                    | 结构定义                         | 收紧的字段                                                                                   |
| ------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| [电台 banner](/api/dj/dj-banner)                        | `DjBannerBody`                   | `code`、`data`                                                                               |
| [电台分类](/api/dj/dj-catelist)                         | `DjCatelistBody`                 | `code`、`categories`、`categories[].id`                                                      |
| [非热门电台分类](/api/dj/dj-category-excludehot)        | `DjCategoryExcludehotBody`       | `code`、`data`、`data[].id`                                                                  |
| [推荐电台分类](/api/dj/dj-category-recommend)           | `DjCategoryRecommendBody`        | `code`、`data`、`data[].categoryId`、`data[].radios`、`data[].radios[].id`                   |
| [电台详情](/api/dj/dj-detail)                           | `DjDetailBody`                   | `code`、`data`、`data.id`                                                                    |
| [热门电台](/api/dj/dj-hot)                              | `DjHotBody`                      | `code`、`djRadios`、`djRadios[].id`                                                          |
| [类别热门电台](/api/dj/dj-radio-hot)                    | `DjRadioHotBody`                 | `code`、`djRadios`、`djRadios[].id`                                                          |
| [推荐电台](/api/dj/dj-recommend)                        | `DjRecommendBody`                | `code`、`djRadios`、`djRadios[].id`                                                          |
| [分类推荐电台](/api/dj/dj-recommend-type)               | `DjRecommendTypeBody`            | `code`、`djRadios`、`djRadios[].id`                                                          |
| [付费精选电台](/api/dj/dj-paygift)                      | `DjPaygiftBody`                  | `code`、`data`、`data.list`、`data.list[].id`                                                |
| [用户电台节目](/api/dj/user-dj)                         | `UserDjBody`                     | `code`、`programs`、`programs[].id`                                                          |
| [电台节目](/api/dj/dj-program)                          | `DjProgramBody`                  | `code`、`programs`、`programs[].id`                                                          |
| [节目详情](/api/dj/dj-program-detail)                   | `DjProgramDetailBody`            | `code`、`program`、`program.id`                                                              |
| [电台节目榜](/api/dj/dj-program-toplist)                | `DjProgramToplistBody`           | `code`、`toplist`、`toplist[].program.id`                                                    |
| [电台24小时节目榜](/api/dj/dj-program-toplist-hours)    | `DjProgramToplistHoursBody`      | `code`、`data`、`data.list`、`data.list[].program.id`                                        |
| [推荐节目](/api/recommend/program-recommend)            | `ProgramRecommendBody`           | `code`、`programs`、`programs[].id`                                                          |
| [电台个性推荐](/api/dj/dj-personalize-recommend)        | `DjPersonalizeRecommendBody`     | `code`、`data`、`data[].id`                                                                  |
| [推荐电台](/api/recommend/personalized-djprogram)       | `PersonalizedDjprogramBody`      | `code`、`result`、`result[].id`                                                              |
| [电台今日优选](/api/dj/dj-today-perfered)               | `DjTodayPerferedBody`            | `code`                                                                                       |
| [电台排行榜获取](/api/dj/dj-radio-top)                  | `DjRadioTopBody`                 | `code`                                                                                       |
| [电台的订阅列表](/api/dj/dj-sublist)                    | `DjSublistBody`                  | `code`、`djRadios`、`djRadios[].id`                                                          |
| [电台订阅者列表](/api/dj/dj-subscriber)                 | `DjSubscriberBody`               | `code`、`subscribers`、`subscribers[].userId`                                                |
| [电台 - 新晋电台榜/热门电台榜](/api/dj/dj-toplist)      | `DjToplistBody`                  | `code`、`toplist`、`toplist[].id`                                                            |
| [电台 - 24 小时主播榜](/api/dj/dj-toplist-hours)        | `DjToplistHoursBody`             | `code`、`data`、`data.list`、`data.list[].id`                                                |
| [电台 - 主播新人榜](/api/dj/dj-toplist-newcomer)        | `DjToplistNewcomerBody`          | `code`、`data`、`data.list`、`data.list[].id`                                                |
| [电台 - 付费精品](/api/dj/dj-toplist-pay)               | `DjToplistPayBody`               | `code`、`data`、`data.list`、`data.list[].id`                                                |
| [电台 - 最热主播榜](/api/dj/dj-toplist-popular)         | `DjToplistPopularBody`           | `code`、`data`、`data.list`、`data.list[].id`                                                |
| [DIFM 分类频道](/api/dj/dj-difm-all-style-channel)      | `DjDifmAllStyleChannelBody`      | `code`、`data`、`data[].styles`、`data[].styles[].channels`、`data[].styles[].channels[].id` |
| [DIFM 播放列表](/api/dj/dj-difm-playing-tracks-list)    | `DjDifmPlayingTracksListBody`    | `code`、`data`、`data.list`、`data.list[].id`                                                |
| [DIFM 收藏列表](/api/dj/dj-difm-subscribe-channels-get) | `DjDifmSubscribeChannelsGetBody` | `code`                                                                                       |

这几个接口返回的电台记录不是同一份结构，各自在模块里声明：`dj_hot`、`dj_recommend` 的 `Radio` 16 个字段完全相同，但只有两个消费方，各自留在模块里；`dj_radio_hot`、`dj_recommend_type` 的 `Radio` 只差 `lastUpdateProgramName` 和 `DescPic` 的 `height`/`width`（这两项只在 `dj_recommend_type` 有数值证据），同样留在局部；`dj_category_recommend`、`dj_paygift` 的短推荐记录与上面两套都不同。`dj_radio_hot` 的 `operateUidList`、`participateUidList` 有非空数字数组证据，声明为宽松的数字数组。`dj` 主播统一复用宽松的 `PlaylistUser`，其中 `remarkName` 没有声明，原样保留。只有 `dj_radio_hot` 和 `dj_recommend_type` 的 `descPicList[]` 出现非 `null` 的图文结构，声明为 `type`、`id`、`content` 和 `nestedData.textList[].text` 宽松字段；`height`、`width` 只在 `dj_recommend_type` 声明，`dj_radio_hot` 里只见过 `null`，没有声明。

`dj_banner` 的 `data` 是通到 banner 列表的路径，banner 自己的 `targetId` 是它指向的目标编号，不算记录编号，宽松；本批录制与探测未发现可达的空结果，数组本身允许为空。`dj_catelist` 和 `dj_category_excludehot` 的分类记录字段完全相同，但只有两个模块使用，按“三个模块才进共享结构”的规则各自留在模块里；两个接口都只收紧分类自己的 `id`，封面和展示字段宽松，本批录制与探测未发现可达的空结果。

`dj_category_recommend` 的 `data` 是通到推荐分类的路径，`categoryId` 是分类自己的编号，`radios` 是分类下的电台列表，电台条目只收紧自己的 `id`；`icon` 在部分条目里是 `{ type, value, color }`，`textColor`、`borderColor`、`realBizType` 只见过 `null`，没有声明。`dj_detail` 的 `data` 是通到电台详情的路径，`data.id` 是电台自己的编号；主播、`commentDatas[]` 和展示字段宽松，`commentDatas[].userProfile` 复用 `PlaylistUser`，`unlockInfo`、`activityInfo`、`toplistInfo`、`labelDto`、`labels`、`toast`、`limitFreeToast`、`msg` 在本批录制里只见过 `null`，没有声明。付费电台录制 `dj_detail.paid` 覆盖 `feeInfo`：`slogan`、`buyed`、`finished`、`undershelf`、`purchaseCount`、`price`、`originalPrice` 和 `modules[]`（含 `modules[].data[]` 节目记录、旧版 `mainSong` 及其 `album`/`artists`）宽松声明；`feeInfo.discountPrice` 只见过 `null`，没有声明；`feeInfo.videos` 只见过空对象，声明为空对象。

`dj_hot`、`dj_radio_hot`、`dj_recommend_type`、`dj_paygift` 都有真实空结果录制：`offset=100000` 的越界分页返回空数组（录制 `dj_hot.empty.json`、`dj_radio_hot.empty.json`、`dj_paygift.empty.json`），未知分类 `type=999999` 返回空数组（录制 `dj_recommend_type.empty.json`），`dj_radio_hot` 的未知分类 `cateId=999999` 返回空数组和 `count: 0`（录制 `dj_radio_hot.empty-cate.json`）；`dj_recommend` 没有分页，本批录制与探测未发现可达的空结果。`dj_radio_hot` 的非空录制按字段覆盖保留非连续子集（索引 7/8/19/23，原始 31 条，见 `context.truncated`），其余模块保留完整列表。

`dj_detail`、`dj_radio_hot`、`dj_recommend_type` 缺少必选参数时上游返回 HTTP 200、正文 `code: 400`、`msg: 参数错误`（录制 `*.missing-param.json`）；`dj_detail` 的未知 `rid` 返回 `code: 404`、`msg: radio not exist`（录制 `dj_detail.unknown-rid.json`），`dj_hot`、`dj_radio_hot`、`dj_paygift` 的非数字 `limit` 也返回 `code: 400`（录制 `*.invalid-limit.json`）。结构定义只接受 `code: 200`，所以这些路径从“原样返回 `status: 200`、正文非 200 业务码”变成 `status` 等于业务码的业务拒绝，正文仍是网易云原文；批量收窄返回体的模块都按这个规则处理。

登录对照在本地用登录 Cookie 重放 `login_status` 确认过 `account.anonimousUser: false`，但本批未保留登录对照录制，不对公开结构作相同性断言。本批结论只覆盖这 10 个接口的匿名录制与探测，不据此推断字段集合在所有账号、地区和上游版本下一致。

B13 的电台榜单与订阅：`dj_toplist_hours`、`dj_toplist_newcomer`、`dj_toplist_popular` 的主播条目字段完全相同，提升到 `src/core/upstream-schemas.ts` 的 `DjAnchorRank`，只收紧主播自己的 `id`，头像、认证、直播状态和排名宽松；`avatarDetail` 复用既有 `AvatarDetail`。三个主播榜的 envelope（`code`、`data.total`、`data.updateTime`、`data.list`）也相同，本批作为模块公开合同暂留，后续统一榜单结构时再抽 core。`dj_toplist` 和 `dj_sublist` 的电台记录字段集合不同（榜单单条更短、订阅列表是完整电台记录），按“三个模块才进共享结构”的规则各自留在模块里；订阅列表的简介图文复用 `ProgramDescPic`，主播复用 `PlaylistUser`。`dj_toplist`、`dj_sublist`（匿名）、`dj_subscriber`（`time=1` 游标越界）都有真实空结果录制；`dj_toplist_hours`、`dj_toplist_pay`、`dj_toplist_popular` 没有 `offset`，`dj_toplist_newcomer` 的 `offset` 被上游忽略，`limit=0` 会被 SDK 的 `limit || 100` 替换成默认 `100`，本批录制和探测里没有可达的空结果。`djRadio_top` 在本账号的一次登录录制里 `data` 是空数组，元素类型无法确认，`data` 未声明并原样透传；匿名调用返回 `code: 302`（录制 `djRadio_top.anonymous.json`）。`dj_sublist` 必须登录才能看到订阅，匿名返回空 `djRadios`；五个榜单和 `dj_subscriber` 的登录与匿名录制字段集合相同，差异只在宽松字段的实时值。非数字 `limit`（五个榜单和 `dj_sublist`）返回正文 `code: 400`；大于 `100` 的 `limit` 只有 `dj_toplist_hours`、`dj_toplist_newcomer`、`dj_toplist_pay`、`dj_toplist_popular` 返回 `code: 400`，`dj_toplist`、`dj_sublist`、`dj_subscriber` 的 `limit=101` 在本批匿名探测里仍返回 200。SDK 按业务码拒绝转交 `status: 400`；`djRadio_top` 的非数字 `djRadioId` 返回 HTTP 400 空正文，网易云把 400 归一成 `status: 200`，结构定义允许空字符串分支。

### 播客与声音

| 模块                                          | 结构定义                  | 收紧的字段                                                                        |
| --------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| [播客列表](/api/dj/voicelist-search)          | `VoicelistSearchBody`     | `code`、`data`；`data.total`、`data.hasMore` 宽松；列表元素未声明，原样保留       |
| [播客声音搜索](/api/dj/voicelist-list-search) | `VoicelistListSearchBody` | `code`、`data`；`data.total`、`data.hasMore` 宽松；列表元素未声明，原样保留       |
| [获取声音歌词](/api/dj/voice-lyric)           | `VoiceLyricBody`          | `code`、`data`；`data` 可以没有（无歌词时是 `null`），出现时 `data.lyricUrl` 收紧 |

`voicelist_search`、`voicelist_list_search` 的 `data` 是通到播客/声音列表的路径，`data.total`、`data.hasMore` 是宽松的分页提示；登录账号没有播客/声音，匿名调用同样为空，两种录制都是 `data.list: []`，列表元素类型没有证据，未声明并原样保留。`voice_lyric` 的 `data` 是没有歌词时可以没有的路径（录制 `voice_lyric.without-lyric.json` 里是 `null`），出现时 `data.lyricUrl` 收紧；`data.source` 和 `message` 只见过 `null`，未声明。`voicelist_list`、`voicelist_detail`、`voicelist_trans` 和 `voice_detail` 是创作者工作台接口，只允许操作自己的播客/声音；本机账号没有播客，工作台接口对非所有者返回 `code: 400`，`voice_detail` 访问他人声音返回 `code: 401`，个别不存在的 id 返回 HTTP 200、正文 `code: 200`、`data: null`。这些路径都没有带字段的成功正文可录，未声明结构。

## 广播电台

| 模块                                                      | 结构定义                          | 收紧的字段                                                                                               |
| --------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [分类/地区信息](/api/other/broadcast-category-region-get) | `BroadcastCategoryRegionGetBody`  | `code`、`data`、`data.categoryList`、`data.categoryList[].id`、`data.regionList`、`data.regionList[].id` |
| [全部电台](/api/other/broadcast-channel-list)             | `BroadcastChannelListBody`        | `code`、`data`、`data.list`、`data.list[].id`                                                            |
| [电台信息](/api/other/broadcast-channel-currentinfo)      | `BroadcastChannelCurrentinfoBody` | `code`、`data`、`data.id`、`data.playUrl`                                                                |
| [我的收藏](/api/other/broadcast-channel-collect-list)     | `BroadcastChannelCollectListBody` | `code`                                                                                                   |

`broadcast_category_region_get` 的 `data.categoryList`、`data.regionList` 是分类和地区列表，每条记录只收紧自己的 `id`，名称宽松；这是静态目录，本批录制与探测未发现可达的空结果，数组本身允许为空。`broadcast_channel_list` 的 `data.list` 是电台列表，每条记录只收紧自己的 `id`，封面、名称、地区、来源、分数、订阅状态和房间号宽松；`data.total`、`data.hasMore` 是宽松的分页提示，未知地区 `regionId=999999` 返回空列表和 `total: 0`（录制 `broadcast_channel_list.empty.json`），按分类筛选的录制保留 5 条。

`broadcast_channel_currentinfo` 的 `data` 是频道当前信息，`data.id` 是频道自己的编号，`data.playUrl` 是直播播放地址，三项收紧；`programId`、`programName`、`startTime`、`endTime`、`duration`、`currentTime`、`thirdChannelId`、`thirdProgramId` 和展示字段宽松。空闲频道（录制 `broadcast_channel_currentinfo.default.json`）的 `programId`/`startTime`/`endTime`/`duration` 是 `0`，`programName`、`thirdProgramId` 是 `null`；正在播出节目的频道（录制 `broadcast_channel_currentinfo.program.json`）有节目编号和起止时间，`broadcaster` 是空数组。`broadcaster` 只在录制里见过 `null` 和空数组，元素类型没有证据，未声明。已下架/无当前信息的频道返回 HTTP 200、正文 `code: 400`（录制 `broadcast_channel_currentinfo.delisted.json`），SDK 按业务拒绝转交 `status: 400`。

`broadcast_channel_collect_list` 只收紧 `code`。`data` 在登录和匿名录制里都是空数组（登录账号没有收藏，匿名调用同样为空），元素类型没有证据，未声明并原样保留。登录对照用 `login_status` 确认 `account.anonimousUser: false`：`broadcast_category_region_get` 只有地区列表顺序不同，`broadcast_channel_list` 只有 11 处 `coverUrl` 的 CDN 主机（p3/p4）不同（`subed` 全 `false`、`total` 都是 `843`），`broadcast_channel_currentinfo` 只有 `currentTime` 不同，`broadcast_channel_collect_list` 逐字段相同；`voicelist_search`、`voicelist_list_search`、`voice_lyric` 也逐字段相同。

## 一起听与最近常听

| 模块                                                              | 结构定义                            | 收紧的字段                                                                           |
| ----------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| [一起听状态](/api/together/listentogether-status)                 | `ListentogetherStatusBody`          | `code`、`data`、`data.inRoom`                                                        |
| [一起听-同步歌单](/api/together/listentogether-sync-playlist-get) | `ListentogetherSyncPlaylistGetBody` | `code`、`data`                                                                       |
| [一起听-房间检查](/api/together/listentogether-room-check)        | `ListentogetherRoomCheckBody`       | `code`、`data`、`data.joinable`、`data.status`                                       |
| [最近听歌列表](/api/listen/recent-listen-list)                    | `RecentListenListBody`              | `code`、`data`；`data.resources` 可以没有，出现时 `data.resources[].resourceId` 收紧 |

`listentogether_status` 的 `data` 是通到房间状态的路径，接口就是为了拿 `data.inRoom`，两项收紧；`anotherFollowStatus` 宽松，`roomInfo`、`anotherDeviceInfo` 和 `data.status` 在登录与匿名录制里都只见过 `null`，未声明并原样保留。本批只录到未加入房间的状态：`inRoom` 是 `false`，`roomInfo`、`anotherDeviceInfo`、`data.status` 都是 `null`，没有 `joinable`/`copywriting` 字段，也没有房间内的成功正文。

`listentogether_sync_playlist_get` 的 `data` 是通到当前列表的路径，按对象收紧；没有房间或房间已失效时 `data` 是空对象。本批探测 `roomId=0`、`1`、`9999999999` 都返回 `data: {}`，列表字段没有证据，未声明并原样保留。

`listentogether_room_check` 的 `data`、`data.joinable`、`data.status` 收紧；`copywriting` 是展示文案，宽松；`type` 只见过 `null`，未声明。本批探测 `roomId=0`、`1`、`9999999999` 都返回已失效房间：`status` 是 `"EXPIRED"`、`joinable` 是 `false`、`copywriting` 是失效提示文案，`type` 是 `null`；没有录到可加入或房间内的状态。

`recent_listen_list` 的 `data` 是通到最近常听列表的路径，`data.resources` 在各条记录自己的 `resourceId` 上收紧；匿名调用返回 `title: null`、`resources: null`（录制 `recent_listen_list.anonymous.json`），所以 `resources` 按可以没有处理，出现坏记录仍报错。登录录制有 12 条资源（11 个歌单、1 张专辑）；`resourceCode`、`similarFmType`、`dateNum`、`coverExt`、`songIdList`、`playIndex` 只见过 `null`，未声明。

登录对照先用 `login_status` 确认 `account.anonimousUser: false`；3 个一起听接口都保留了登录和匿名录制，正文逐字段相同；`recent_listen_list` 的匿名正文是 `resources: null`。本批结论只覆盖这些录制与探测，不据此推断所有账号、地区和上游版本一致。

## 播放记录

| 模块                                                                  | 结构定义                          | 收紧的字段                                                                                                            |
| --------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [最近播放-歌曲](/api/listen/record-recent-song)                       | `RecordRecentSongBody`            | `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`limit` 非数字时空正文作为独立分支      |
| [最近播放-歌单](/api/listen/record-recent-playlist)                   | `RecordRecentPlaylistBody`        | `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`limit` 非数字时空正文作为独立分支      |
| [最近播放-专辑](/api/listen/record-recent-album)                      | `RecordRecentAlbumBody`           | `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`limit` 非数字时空正文作为独立分支      |
| [最近播放-视频](/api/listen/record-recent-video)                      | `RecordRecentVideoBody`           | `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`（字符串或数字）；`limit` 非数字时空正文  |
| [最近播放-电台](/api/listen/record-recent-dj)                         | `RecordRecentDjBody`              | `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.id`；`limit` 非数字时空正文作为独立分支      |
| [最近播放-声音](/api/listen/record-recent-voice)                      | `RecordRecentVoiceBody`           | `code`、`data`、`data.list`、`data.list[].resourceId`、`data.list[].data.pubDJProgramData.id`；`limit` 非数字时空正文 |
| [获取历史日推可用日期列表](/api/recommend/history-recommend-songs)    | `HistoryRecommendSongsBody`       | `code`、`data`、`data.dates`；`data.dates[]` 是日期字符串                                                             |
| [获取历史日推详情数据](/api/recommend/history-recommend-songs-detail) | `HistoryRecommendSongsDetailBody` | `code`、`data`、`data.songs`、`data.songs[].id`                                                                       |
| [回忆坐标](/api/other/music-first-listen-info)                        | `MusicFirstListenInfoBody`        | `code`、`data`、`data.songInfoDto.songId`、`data.musicFirstListenDto.date`；缺少 `id` 时空正文作为独立分支            |

六个最近播放模块的 `data.list` 和每条记录的 `resourceId`（字符串）收紧；记录里的资源编号也收紧：歌曲、歌单、专辑复用共享结构，电台用模块内的 `RecentRadio`，视频/MLOG 的 `data.id` 是字符串或数字，声音用 `data.pubDJProgramData.id`。`playTime`、`resourceType`、`os`（歌曲录制里没有）、`multiTerminalInfo`、`total`、`message` 和资源展示字段宽松。录制里的 `record_recent_album` 记录还带 `songs`（专辑的完整歌曲数组，录制里长度等于 `size`）和 `lastSong`，都是宽松字段；`transName` 在模块内补成宽松字段（`transNames` 已由 `AlbumSummary` 声明）。`record_recent_video` 同一次返回混有 MLOG 和 MV：MLOG 的 `id` 是字符串、带 `title`/`creator`，MV 的 `id` 是数字、带 `name`/`artists`，没有统一的区分字段，所以两边的字段都声明成宽松、可以没有。`record_recent_voice` 的 `pubDJProgramData` 复用 `DjProgram` 并补上最近播放列表额外返回的统计和分类字段。

登录对照先用 `login_status` 确认 `account.anonimousUser: false`。六个最近播放接口匿名调用返回 `total: 0`、`list: []`，作为各自列表的真实空结果；`history_recommend_songs` 登录和匿名录制的 `data.songs` 都是 `null`（没有非 null 证据，未声明），匿名录制的 `data.dates` 是空数组；`history_recommend_songs_detail` 匿名返回 `songs: []`，`data.dates` 和 `data.description` 在录制里只见过空数组/`null`，未声明；`music_first_listen_info` 匿名返回 `data: {}`，各信息块按可以没有处理，出现时仍按里面的收紧字段校验。

六个最近播放接口的 `limit` 传入非数字（如 `limit=abc`）时上游回 HTTP 400 空正文，SDK 按既有行为归一成 `status: 200`、`body: ''`；结构定义用联合保留这个空字符串分支，避免误报 502。`music_first_listen_info` 缺少歌曲 `id` 时同样返回空字符串分支。`history_recommend_songs_detail` 的日期格式不合法时上游返回 `code: 400` 的业务拒绝，SDK 原样转交。

录制从登录账号补录：`record_recent_song` 300→40 条、`record_recent_playlist` 30→15 条、`record_recent_album` 54→8 条、`record_recent_voice` 100→10 条、`history_recommend_songs_detail` 33→20 首，截断记录写在 `context.truncated`。本批结论只覆盖这些录制与探测，不据此推断所有账号、地区和上游版本一致。本批 9 个模块都是只读接口，没有写操作。

## 曲风

| 模块                                   | 结构定义            | 收紧的字段                                                                   |
| -------------------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| [曲风列表](/api/style/style-list)      | `StyleListBody`     | `code`、`data`、`data[].tagId`                                               |
| [曲风详情](/api/style/style-detail)    | `StyleDetailBody`   | `code`；`data` 可以没有（未知曲风 id 时是 `null`），出现时 `data.tagId` 收紧 |
| [曲风-歌手](/api/style/style-artist)   | `StyleArtistBody`   | `code`、`data.artists`、`data.artists[].id`                                  |
| [曲风-专辑](/api/style/style-album)    | `StyleAlbumBody`    | `code`、`data.albums`、`data.albums[].id`                                    |
| [曲风-歌单](/api/style/style-playlist) | `StylePlaylistBody` | `code`、`data.playlist`、`data.playlist[].id`                                |
| [曲风-歌曲](/api/style/style-song)     | `StyleSongBody`     | `code`、`data.songs`、`data.songs[].id`                                      |

四个带分页的曲风列表模块（`style_artist`、`style_album`、`style_playlist`、`style_song`）的 `data.page`（`cursor`、`size`、`more`、`total`）字段完全相同，共用 `StylePage`，作为分页提示全部宽松。`style_list` 的曲风记录有三层嵌套，只有顶层记录的 `tagId` 收紧；`childrenTags` 嵌在宽松字段里，子曲风的 `tagId` 也宽松，第三层的 `childrenTags` 只见过 `null`，没有声明。`style_artist` 复用 `Artist`、`style_album` 复用 `SimpleAlbum`、`style_song` 复用 `Song`，各自只把记录自己的 `id` 收紧；`style_playlist` 的记录很短，创建者的 `userId` 不算歌单自己的编号，宽松。

所有带 `tagId` 的曲风接口缺参时，上游返回 HTTP 200、正文 `code: 400`、`msg: 参数错误`（录制 `style_detail.missing-tag.json`、`style_artist.missing-tag.json`、`style_album.missing-tag.json`、`style_playlist.missing-tag.json`、`style_song.missing-tag.json`）。结构定义只接受 `code: 200`，这些路径从原样返回 `status: 200`、正文非 200 业务码，变成 `status: 400` 的业务拒绝，正文仍是网易云原文。`style_detail` 的 `data` 是可以没有的路径：未知曲风 id 返回 `code: 200`、`data: null`（录制 `style_detail.unknown-tag.json`）；出现时 `data.tagId` 仍收紧。四个带分页的曲风列表模块的未知曲风 id 都返回空数组（录制 `*.unknown-tag.json`）。`style_list` 没有参数，本批录制与探测未发现可达的空结果，`data` 本身允许为空数组。

登录对照只保留了 `style_detail` 和 `style_song`：`style_detail` 匿名时 `professionalReviews`、`favouriteSong`、`tagPortrait` 都是 `null`，登录后才有内容；`style_song` 的声明字段在匿名和登录录制里相同，差异只在宽松字段的值（`privilege.freeTrialPrivilege` 的 `listenType`、`cannotListenReason` 匿名时是数字、登录时是 `null`，同一首歌的封面 CDN 主机在 `p3.music.126.net` 和 `p4.music.126.net` 之间变化，以及音质和实时计数）。其余四个模块没有保留登录对照。本批结论只覆盖这 6 个接口在录制和探测中出现的字段，不据此推断所有账号、地区和上游版本下字段集合一致。

节目记录（`DjProgram`）在 `dj_program`、`dj_program_detail`、`dj_program_toplist`、`dj_program_toplist_hours`、`program_recommend` 之间声明结构相同（各录制里的宽松字段可有差异，例如 `reason` 只在 `program_recommend` 有非 `null` 值），提升到 `src/core/upstream-schemas.ts`：只收紧节目自己的 `id`，`mainSong`（旧版歌曲，`album` 复用 `SimpleAlbum`、`artists` 复用 `Artist`，四个音质档共用一份声明）、`dj` 主播（`ProgramDj` = `PlaylistUser` 加 `brand`）、参与主播 `participateAnchors`（元素只声明 `userId`、`type`、`anchorInfo`）和 `radio` 电台摘要（简介图文的 `timeStamp` 只见过 `null`，未声明）全部宽松；`programDesc`（简介图文，与电台摘要的 `descPicList` 同结构）和 `specialTags` 也有非空证据，声明为宽松字段。节目里 `icon` 是对象但子字段只见过 `null`，`songs`、`programGuests` 在本批录制与探测的节目中未发现非空，均未声明、原样保留。`personalized_djprogram` 的节目是另一种结构（多 `publish`、`subscribed`、`userId`、`adjustedPlayCount`，`songs`、`titbits` 只见过 `null`，电台摘要多 `whiteList`、`hightQuality`），在模块里单独声明，只复用 `ProgramMainSong` 和 `ProgramDj`；`dj_personalize_recommend` 的电台记录与前面的电台列表记录字段不同，也留在模块里。

`dj_program`、`program_recommend` 的越界分页返回空数组（录制 `dj_program.empty.json`、`program_recommend.empty.json`）；`dj_difm_all_style_channel` 的 `sources: '[]'` 返回空 `data`（`dj_difm_all_style_channel.empty.json`），`dj_difm_playing_tracks_list` 的未知 `channelId` 返回空 `data.list` 和 `total: 0`（`dj_difm_playing_tracks_list.unknown.json`）。`dj_program_toplist` 和 `dj_program_toplist_hours` 的榜单条目还声明了宽松的 `programFeeType`（录制里是非 `null` 数值）。`dj_program_toplist`（`limit` 由 SDK 默认 `100` 后再请求，上游忽略 `offset`）、`dj_program_toplist_hours`（SDK 默认 `100`，没有 `offset`）、`dj_personalize_recommend`（SDK 默认 `6`）、`personalized_djprogram`（没有分页参数）在本批录制与探测里未发现可达的空结果，数组本身允许为空。`dj_today_perfered` 和 `dj_difm_subscribe_channels_get` 只收紧 `code`（后者 `message` 宽松）：`data` 在匿名、登录和不同参数的探测里都是空数组，元素类型没有证据，未声明并原样保留。

`dj_program` 缺少 `rid` 返回 `code: 400`（录制 `dj_program.missing-rid.json`），`dj_program_detail` 的未知节目 id 返回 `code: 404`（录制 `dj_program_detail.unknown.json`），SDK 按业务拒绝转交对应 `status`，正文仍是网易云原文。

登录对照先用 `login_status` 确认 `account.anonimousUser: false`。11 个模块都带 Cookie 重录过：登录录制能通过同一结构校验，宽松字段的值与覆盖有差异（`aiGenerated` 的 `null`/`boolean`、`radio.descPicList` 的 `null`/数组、`mainSong.mMusic`/`hMusic` 的 `null`/对象、`dj.experts` 的键集合）；没有保留登录对照，不对公开结构作相同性断言。`dj_program`、`program_recommend`、`personalized_djprogram`、`dj_program_toplist` 的录制按字段覆盖保留非连续子集，`dj_difm_all_style_channel` 保留 1/15 个风格，`dj_difm_playing_tracks_list` 把每条 `wave` 截到 32 个点，原始数量和索引写在 `context.truncated` 与 `context.note`。DI.FM 频道订阅/取消订阅（`dj_difm_channel_subscribe`、`dj_difm_channel_unsubscribe`）是写操作，留给写操作批次，本批没有收窄返回体。

## 播放

| 模块                                                             | 结构定义                | 收紧的字段                                                                                      |
| ---------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| [获取音乐 url](/api/music/song-url)                              | `SongUrlBody`           | 最终体的 `code`、`data`、`data[].id`、`data[].url`、`data[].code`；其余字段宽松                 |
| [获取客户端歌曲下载链接](/api/music/song-download-url)           | `SongDownloadUrlBody`   | `code`、`data`、`data.id`、`data.url`、`data.code`；`level`、`size` 宽松                        |
| [获取音乐 url - 新版](/api/music/song-url-v1)                    | `SongUrlV1Body`         | `code`、`data`、`data[].id`、`data[].url`、`data[].code`；`level`、`expi`、`freeTrialInfo` 宽松 |
| [获取客户端歌曲下载链接 - 新版](/api/music/song-download-url-v1) | `SongDownloadUrlV1Body` | `code`、`data`、`data.id`、`data.url`、`data.code`；`level`、`size` 宽松                        |
| [获取逐字歌词](/api/music/lyric-new)                             | `LyricNewBody`          | `code`、`lrc`、`lrc.lyric`；其余歌词形式和 `pureMusic` 宽松                                     |
| [听歌打卡](/api/music/scrobble)                                  | `ScrobbleBody`          | `code`                                                                                          |
| [音乐是否可用](/api/music/check-music)                           | `CheckMusicBody`        | 最终体的 `code`、`success`、`message`；上游 `code`、`data`、`data[].code`                       |
| [听歌识曲](/api/music/audio-match)                               | `AudioMatchBody`        | `code`、`data`；`data.result` 可以没有，出现时 `data.result[].song.id` 收紧                     |

`song_url` 的 `ModuleBody` 描述的是 SDK 最终体，不是网易云原文：上游顶层 `code` 被模块忽略并合成 `code: 200`（301 等非特殊状态码仍会先被请求层拒绝），上游 `data[]` 按请求 `id` 的顺序重排，顶层重建为 `{ code: 200, data }`，上游其他顶层字段不会保留；`data` 缺失时最终体是空数组。条目里的 `url` 不替换；`freeTrialInfo` 不合并片段，内部坏字段按宽松字段丢弃。`song_download_url` 正常录制与上游逐字段一致；宽松字段类型不对时只丢该项。`song_download_url` 的 `data` 是对象，不是数组；`auEff` 等字段来自播放地址的共享内部结构，下载录制里只见过 `null`，仍按宽松字段处理。

播放和下载的上游码语义不稳定：同一请求在本次探测/重录中会从 200 翻转为 404（播放）或从 200 翻转为 `-110`（下载）。本批保留的 `song_url.transient-404.json`（与 `song_url.anon-trial.json` 同 query，`404`/`url: null`）和 `song_download_url.transient-110.json`（与 `song_download_url.free.json` 同 query，`-110`/`url: null`）就是翻转后的快照。因此 `url: null` 时不能凭一次 `code` 判定无版权/无权限，先重试或交叉验证；本批无版权录制里播放是 `404`、下载是 `-110`，但这些码也会出现在可播放/免费歌曲上，本次快照不代表稳定映射。

播放地址的 `freeTrialInfo` 不是 `null` 表示这次返回的是试听片段，`url` 是试听地址，`start`、`end` 是片段在整首里的起止秒数，不应假定固定为 30 秒；这些字段本身是宽松字段。下载地址的 `-105` 在本批会员歌录制里表示当前身份没有下载权限，但同样不能当作稳定映射。

下载前先重试一次；仍不满足 `data.code === 200`、`data.url !== null`、`data.size > 0` 时再标记下载失败，保留 `data.code` 说明原因，不要用播放接口的试听地址补位。`size` 是宽松字段，缺失时无法核对文件字节数。下载录制中的 `freeTrialInfo` 均为 `null`，没有下载试听片段的证据；它按宽松字段声明，调用方不要假定下载接口一定会给试听片段。

本批只保留匿名和失效 Cookie 录制；失效 Cookie 不是登录证据，没有登录对照，不对登录后的 `freeTrialInfo`、`payed` 等字段作相同性断言。

`level` 是实际给到的音质，可能比请求的低；`expi` 是播放地址有效的秒数。歌词除 `lrc` 外的几种可能整个缺失，也可能在、但 `lyric` 是空串，两种都表示没有这种歌词。

`check_music` 的 `ModuleBody` 也描述 SDK 最终体，不是网易云原文：模块只读取上游顶层 `code` 和 `data[0].code`，合成 `{ code: 200, success, message }`，上游 `data` 数组不会保留。上游返回码是 200 且 `data[0].code` 是 200 时 `success` 是 `true`、`message` 是 `"ok"`；否则 `success` 是 `false`、`message` 是 `"亲爱的,暂无版权"`。旧实现已经会拒绝：正文不是对象（旧路径 `body.code`）、`data` 不是数组或 `null`、`data[0]` 不是对象、`data[0].code` 缺失或不是数字；相对基线新增的是 `data` 缺失（旧实现返回 `success: false`），`data[0]` 非对象现在报 `body.data[0]`、缺 `code` 的 `actual` 是 `missing`。`data[1..]` 不校验，空数组按不可播放返回 `success: false`。上游顶层返回码不是 200 时按业务拒绝原样转交，`status` 取上游返回码。录制保存上游原文，最终体写在 `context.expect`。`check_music` 匿名可用；本次快照里匿名录制的条目 `code` 是 404、登录录制是 200（与 `song_url` 的上游码翻转一致），结构相同，不对两种视角的可播放结果作相同性断言。

`audio_match` 是普通 GET，需要真实音频指纹：`data.result` 有命中时是匹配列表，没有命中时是 `null`，同时 `data.noMatchReason` 给出原因（本次无命中录制是 10）。`data.result[].song` 复用歌曲声明，`song.id` 收紧；`queryId`、`type`、`moduleList`、`noMatchReason`、`startTime` 和 `message` 宽松。未声明的顶层字段原样保留。有命中指纹来自真实歌曲片段（《平凡之路》 id 28815250，源 FLAC 从登录态播放地址取得；播放地址 FLAC 前段转 8 kHz 单声道，偏移 1 秒取 3 秒），可用 `bun scripts/audio-fingerprint.mts <音频文件> --offset 1` 复现；匿名播放地址是 30 秒试听 MP3，未用于该指纹。`no-match` 用 440 Hz 合成音频，`bun scripts/audio-fingerprint.mts --tone 440` 可复现。登录和匿名录制的字段集合相同，`queryId` 等动态值不同。

## 歌词与歌曲附属

| 模块                                                                 | 结构定义                     | 收紧的字段                                                    |
| -------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| [获取歌词](/api/music/lyric)                                         | `LyricBody`                  | `code`、`lrc`、`lrc.lyric`；其余歌词形式、贡献者和标记宽松    |
| [副歌时间](/api/music/song-chorus)                                   | `SongChorusBody`             | `code`、`chorus`、`chorus[].id`、`data`、`data[].id`          |
| [歌曲音质详情](/api/music/song-music-detail)                         | `SongMusicDetailBody`        | `code`、`data`、`data.songId`；各档音质、`sks` 和状态字段宽松 |
| [音乐百科基础信息](/api/music/song-wiki-summary)                     | `SongWikiSummaryBody`        | `code`、`data`、`data.blocks`、`data.blocks[].id`             |
| [歌词摘录 - 歌词摘录信息](/api/lyrics-mark/song-lyrics-mark)         | `SongLyricsMarkBody`         | `code`、`data`                                                |
| [歌词摘录 - 我的歌词本](/api/lyrics-mark/song-lyrics-mark-user-page) | `SongLyricsMarkUserPageBody` | `code`、`data`；`data.offset`、`data.hasMore` 宽松            |

老版歌词（`lyric`）的 `lrc` 一直都在：没收录时 `lyric` 是“暂无歌词”，纯音乐也会带一行说明，所以 `lrc`、`lrc.lyric` 按收紧字段处理。`tlyric`、`romalrc`、`klyric` 可能整个缺失，也可能在、但 `lyric` 是空串；它们和 `lyricUser`、`transUser`（复用 `LyricUser`）、`pureMusic`、`needDesc`、`uncollected` 都是宽松字段。`briefDesc` 只见过 `null`，没有声明。

副歌时间的 `chorus` 和 `data` 是同一组记录（`id`、`startTime`、`endTime`、`ugcLocked`），每条记录的 `id` 收紧，其余字段宽松。未知歌曲返回两个空数组（录制 `song_chorus.empty.json`），空数组是正常结果。

歌曲音质详情的 `data` 和歌曲自己的编号 `data.songId` 收紧；`h`、`m`、`l`、`sq`、`vi`、`sk`、`jm`、`je` 各档音质和 `sks` 数组宽松，其中 `hr`、`db` 在录制里只见过 `null`，没有声明。未知歌曲是上游 HTTP 200、正文 `{ data: null, code: 400, message: '参数异常', success: false, error: true }`；SDK 以前 resolve `status: 200`，现在以 `status: 400` reject，调用方需要 `try/catch` 接住 `NcmApiResponse`，不能只检查 resolve 后的 `status`。这个响应的 `code` 不是 200，不进入结构校验。

音乐百科基础信息返回的是按 `showType` 组装的 UI 区块：`data`、`data.blocks` 和每个区块自己的字符串编号 `id` 收紧，区块里的 `showType`、`code`、`position`、`creatives[].resources[]`、`uiElement`（标题、图片、按钮、描述、链接）等按普通 UI 字段全部宽松；只见过 `null` 的字段（如 `adInfo`、`blockConfig`、`md5`、`colorList`）没有声明。未知歌曲仍返回 `code: 200`，只剩“相关歌单”一个区块（录制 `song_wiki_summary.unknown.json`），本批未发现可达的空 `blocks`。`cursor` 是 JSON 字符串，原样保留。

两个歌词摘录接口在本次录制账号上都没有摘录内容：`song_lyrics_mark` 的 `data.markVOList`、`data.markCountList` 和 `song_lyrics_mark_user_page` 的 `data.markVOList` 都是空数组，匿名和登录调用结果相同。空数组给不出元素类型，这些数组没有声明，原样保留；登录后出现摘录记录的形状要等补录（写入操作 `song_lyrics_mark_add`、`song_lyrics_mark_del` 在后续写操作批次处理，本批没有收窄它们的返回体）。

登录对照先用 `login_status` 确认 `account.anonimousUser: false`。本次登录对照未发现结构差异；登录录制没有保留，不对公开结构作相同性断言。两个歌词摘录接口的匿名和登录都返回空列表。

## 百科与用户贡献

| 模块                                                     | 结构定义              | 收紧的字段                                          |
| -------------------------------------------------------- | --------------------- | --------------------------------------------------- |
| [专辑简要百科信息](/api/ugc/ugc-album-get)               | `UgcAlbumGetBody`     | `code`、`data`（可以没有）、`data.albumId`          |
| [歌手简要百科信息](/api/ugc/ugc-artist-get)              | `UgcArtistGetBody`    | `code`、`data`（可以没有）、`data.artistId`         |
| [搜索歌手](/api/ugc/ugc-artist-search)                   | `UgcArtistSearchBody` | `code`、`data`、`data.list`、`data.list[].artistId` |
| [MV 简要百科信息](/api/ugc/ugc-mv-get)                   | `UgcMvGetBody`        | `code`、`data`、`data.mvId`                         |
| [歌曲简要百科信息](/api/ugc/ugc-song-get)                | `UgcSongGetBody`      | `code`、`data`（可以没有）、`data.songId`           |
| [用户贡献内容](/api/ugc/ugc-detail)                      | `UgcDetailBody`       | `code`、`data`                                      |
| [用户贡献条目、积分、云贝数量](/api/ugc/ugc-user-devote) | `UgcUserDevoteBody`   | `code`、`data`、`data.userId`                       |

专辑、歌手和歌曲的百科记录在未知 id 时返回 `code: 200` 但没有 `data`（录制 `ugc_album_get.missing.json` 等），所以 `data` 写成“可以没有”：缺失或 `null` 时照常返回，出现却没有自己的编号仍报 502。未知 MV 是另一个形状：`code: 404`、正文只有 `message`，SDK 按业务拒绝原样转交（`status: 404`），不进入结构校验。

专辑的 `data.albumId` 是专辑自己的编号；专辑名、封面、公司、发行时间、简介、语言、类型和标签全部宽松。随行的歌手（`artistRepVos`）和歌曲（`songRepVos`）是宽松字段，里面的编号也宽松，坏一条只丢整个列表。`songRepVos` 里的 `albumRepVo`、歌词、播放地址等字段在录制里只见过 `null`，没有声明，原样保留。

歌手记录的 `data.artistId` 收紧；`artistName`、`alias`、`headPicUrl`、`avatarPicUrl`、`area`、`type`、`desc` 和 `production` 宽松，`transName` 只见过 `null`。

搜索歌手的 `data.list` 是数组：关键字、歌手 id 和无结果三种录制里都存在，无结果时是空数组（`ugc_artist_search.empty.json`）。每条结果的 `artistId` 收紧，`artistName`、`artistAvatarPicUrl` 宽松；`totalCount` 和 `msg` 宽松，`extraCount` 只见过空对象，没有声明。

MV 记录的 `data.mvId` 收紧；名称、封面、发行时间和简介宽松，`desc` 可以是空串。随行的歌手和关联歌曲记录宽松，`albumRepVo` 里只声明见过值的 `albumId`、`albumName`。

歌曲记录的 `data.songId` 收紧；歌曲名、歌手、专辑引用、语言、歌词正文和翻译、播放地址、锁状态和时长宽松。录制里 `no`、`mvIds`、`songTags`、`originalSong`、`roleArtists` 只见过 `null`，`arrangeArtists` 只见过空数组，这些字段没有声明，原样保留。`playUrl` 是带时效的地址，宽松处理。

用户贡献内容在当前录制账号上没有内容：登录和匿名都返回 `data.total: 0` 和空数组 `data.wikiDetailResultVoList`。空数组给不出元素类型，列表没有声明，非空贡献记录的形状是缺口。用户贡献计数的 `data.userId` 是记录自己的编号，收紧；`ugcCount`、`integration`、`cloudShell` 是附带计数，全部宽松。登录和匿名录制里三个计数都是 0，非零计数没有证据，字段缺失或类型不对只丢这一项。

登录对照先用 `login_status` 确认 `account.anonimousUser: false`。`ugc_detail` 和 `ugc_user_devote` 保留了匿名对照，未发现字段类型差异；其余五个模块只保留登录录制，不对匿名结构作相同性断言。

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

| 模块                                            | 结构定义              | 收紧的字段                                                                                                |
| ----------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| [歌曲评论](/api/comment/comment-music)          | `CommentMusicBody`    | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [专辑评论](/api/comment/comment-album)          | `CommentAlbumBody`    | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [歌单评论](/api/comment/comment-playlist)       | `CommentPlaylistBody` | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [MV 评论](/api/comment/comment-mv)              | `CommentMvBody`       | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [视频评论](/api/comment/comment-video)          | `CommentVideoBody`    | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [电台节目评论](/api/comment/comment-dj)         | `CommentDjBody`       | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [动态评论](/api/comment/comment-event)          | `CommentEventBody`    | `code`、`comments`、`comments[].commentId`；`hotComments` 可以没有，出现时 `hotComments[].commentId` 收紧 |
| [楼层评论](/api/comment/comment-floor)          | `CommentFloorBody`    | `code`、`data.comments`、`data.comments[].commentId`                                                      |
| [热门评论](/api/comment/comment-hot)            | `CommentHotBody`      | `code`、`hotComments`、`hotComments[].commentId`                                                          |
| [评论抱一抱列表](/api/comment/comment-hug-list) | `CommentHugListBody`  | `code`、`data.hugComments`                                                                                |
| [评论](/api/comment/comment-new)                | `CommentNewBody`      | `code`、`data.comments`、`data.comments[].commentId`                                                      |

这五个固定资源评论列表共用 `src/core/upstream-schemas.ts` 里的 `CommentRecord`、`CommentReply` 和 `CommentUser`：本批录制里 5 个模块的评论记录字段和类型完全一致。`commentId` 是每条评论自己的编号，所以收紧；`user` 和 `beReplied` 是评论里套着的记录，字段全部宽松，包括 `beReplied[].beRepliedCommentId`。`likedCount`、`liked`、`favorited`、`time`、`timeStr`、`status`、`parentCommentId`、`commentLocationType`、`decoration`、`ipLocation`、`pendantData` 也是宽松字段。

`comments` 是通到评论列表的路径，缺失、`null` 或不是数组都报 502；空结果是真实可达的：无评论资源返回 `comments: []`（录制 `comment_music.empty.json`、`comment_album.empty.json`、`comment_playlist.empty.json`），越界分页返回 `comments: []`、`total` 保持原值。`hotComments` 是可以没有的路径：`offset` 越过总数时网易云整个不返回 `hotComments`（录制 `comment_music.out-of-range.json` 等），缺失或 `null` 都照常返回；出现时按 `commentId` 收紧校验，坏一条报 502。`topComments` 在录制里只见过空数组，元素类型猜不出，没有声明；`commentBanner` 只见过 `null`，也没有声明。两者和评论里的 `aiCommentLabel`、`showFloorComment`、`repliedMark`、`userBizLevels`、`medal`、`grade`、`likeAnimationMap` 等未声明字段一样原样保留。

5 份非空录制保留的是覆盖各字段的非连续子集，原条数与保留条数为：`comment_music` 20/15 → 5/5，`comment_album` 20/9 → 5/4，`comment_playlist` 20/15 → 5/4，`comment_mv` 20/15 → 6/4，`comment_video` 20/15 → 6/4（`comments`/`hotComments`）；`context.truncated.length` 记的是原数组长度。

`total`、`more`、`moreHot`、`cnum`、`isMusician`、`userId` 是宽松字段；`userId` 是查看者自己的编号，匿名时也存在。登录对照先用 `login_status` 确认 `account.anonimousUser: false`，再逐模块抽查：五个模块的非 `null` 路径与类型相同，登录响应只会在宽松字段上多出现值为 `null` 的路径（如 `comments[].user.vipRights`、`beReplied[].content`/`richContent`、`beReplied[].ipLocation.userId`、`beReplied[].user.avatarDetail`），这些字段本来就是宽松字段，登录录制未保留。`/api/resource/comments/${action}` 的 `comment` 模块是评论增删回复的写操作，无法在不产生真实副作用的前提下录全各 action，本批没有给它加结构定义。

评论扩展的 6 个只读模块中，`comment_dj` 和 `comment_event` 的返回体与上面五个固定资源评论列表一致：`comments` 是通到评论列表的路径，`hotComments` 可以没有——越界分页时网易云整个不返回它（录制 `comment_dj.out-of-range.json`、`comment_event.out-of-range.json`），缺失或 `null` 都照常返回，出现时按 `commentId` 收紧。两者的空结果是真实的：零评论电台（`comment_dj.empty.json`，电台 1230174483）和零评论动态（`comment_event.empty.json`，`A_EV_2_38014023821_17062533682`）都返回空的 `comments`、`hotComments`。评论记录继续复用 `CommentRecord`。

`comment_hot` 的 `hotComments` 是接口要返回的热门评论列表，收紧；空资源录制 `comment_hot.empty.json`（云盘歌曲 1984488794；私有云盘上传，匿名不可见，`total: 0` 可能来自匿名不可访问）返回 `hotComments: []`、`total: 0`。`hasMore`、`total` 宽松；`topComments` 只见过空数组，没有声明。

`comment_floor` 的 `data.comments` 是通到楼层回复列表的路径，每条回复复用 `CommentRecord`，`commentId` 收紧；`data.ownerComment` 是父评论的附带信息，用编号也宽松的 `LooseCommentRecord` 声明。没有楼层时 `data.comments` 是空数组（录制 `comment_floor.empty.json`，父评论 9673055460），`ownerComment` 仍然存在；有回复的录制 `comment_floor.default.json` 保留 6 条楼层回复（原 20 条）。`message`、`hasMore`、`totalCount`、`time` 宽松；`bestComments` 只见过空数组、`currentComment` 只见过 `null`，没有声明。

`comment_hug_list` 的 `data.hugComments` 是抱一抱列表，收紧；元素只有 `hugContent` 和 `user`，都宽松。`data.currentComment` 是被抱评论的附带信息，编号一并放开，v2 多出的 `threadId`、`replyCount`、`showFloorComment`、`extInfo`、`commentVideoVO` 等按宽松记录声明。空列表录制 `comment_hug_list.empty.json`（评论 9673055460）返回 `hugComments: []`、`hugTotalCounts: 0` 并保留 `currentComment`；非空录制 `comment_hug_list.default.json` 有 3 条抱一抱。`hasMore`、`cursor`、`idCursor`、`hugTotalCounts` 宽松。

`comment_new` 的 `data.comments` 是 v2 评论列表，收紧，每条评论的 `commentId` 也收紧。v2 评论复用 `CommentRecord` 后额外声明 `args`、`threadId`、`track`、`replyCount`、`privacy`、`repliedMark`、`highlight`、`userTop`、`voiceDurationMillSecond`、`showFloorComment`、`extInfo`、`commentVideoVO`，用户额外声明 `encryptUserId`、`isHug` 和会员角标 `vipRights.extInfo.logo`。空资源录制 `comment_new.empty.json`（云盘歌曲 1984488794；私有云盘上传，匿名不可见，`total: 0` 可能来自匿名不可访问）返回 `comments: []`、`totalCount: 0`；非空录制 `comment_new.default.json`（歌曲 2092595510）保留 6 条评论（原 27 条）。`data` 里的标题、游标、排序和计数宽松；`tag`、`likeAnimationMap`、`outShowComments` 只见过空容器，没有声明，原样保留。

`comment_dj`、`comment_event`、`comment_floor`、`comment_hot`、`comment_hug_list`、`comment_new` 的登录对照都先用 `login_status` 确认 `account.anonimousUser: false`，只抽查了本批匿名录制中非 `null` 的路径与类型；登录录制未保留；不对公开结构作相同性断言。大录制保留覆盖各字段的非连续子集并记录原始条数：`comment_floor` 20 → 6、`comment_hot` 20 → 6、`comment_new` 27 → 6（`context.truncated.length` 记原数组长度）。

## 社交与用户列表

| 模块                                               | 结构定义                  | 收紧的字段                                                                                         |
| -------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| [关注列表](/api/social/user-follows)               | `UserFollowsBody`         | `code`、`follow`、`follow[].userId`                                                                |
| [粉丝列表](/api/social/user-followeds)             | `UserFollowedsBody`       | `code`、`followeds`、`followeds[].userId`                                                          |
| [关注混合列表](/api/social/user-follow-mixed)      | `UserFollowMixedBody`     | `code`、`data`、`data.records`、`data.records[].followId`                                          |
| [是否互相关注](/api/social/user-mutualfollow-get)  | `UserMutualfollowGetBody` | `code`、`data`                                                                                     |
| [用户动态](/api/social/user-event)                 | `UserEventBody`           | `code`、`events`、`events[].id`                                                                    |
| [获取动态列表](/api/social/event)                  | `EventBody`               | `code`、`event`、`event[].id`                                                                      |
| [热门话题](/api/social/hot-topic)                  | `HotTopicBody`            | `code`、`hot`、`hot[].actId`                                                                       |
| [收藏的专栏](/api/social/topic-sublist)            | `TopicSublistBody`        | `code`、`data`、`data[].id`                                                                        |
| [话题详情](/api/social/topic-detail)               | `TopicDetailBody`         | `code`、`act`、`act.actId`                                                                         |
| [话题热门动态](/api/social/topic-detail-event-hot) | `TopicDetailEventHotBody` | `code`、`events`、`events[].id`                                                                    |
| [用户历史评论](/api/comment/user-comment-history)  | `UserCommentHistoryBody`  | `code`；`data.comments` 可以没有，出现时 `data.comments[].commentId` 收紧；`data.hotComments` 同样 |

`user_follows` 和 `user_followeds` 的关注/粉丝记录都复用 `UserProfile` 的宽松字段，再补上列表特有的 `py`、`time`、`vipRights`（`user_follows` 还补 `expertTags`）：只有记录自己的 `userId` 收紧，`vipRights` 复用 core 的 `VipRights`（`artist_fans`、`user_follow_mixed`、`user_event` 也用同一份），其中 `relationType`、`extInfo` 已声明为宽松字段，`memberLogo` 只见过 `null`、未声明。`remarkName` 在三份录制里只见过 `null`，也没有声明。`more`、`touchCount`、`newCount`、`size` 都是宽松字段；`newCount` 只在部分粉丝列表响应里出现。空列表分别是真实可达的：账号 13595690613 没有粉丝（`user_followeds.empty.json`），`offset=100000` 的越界分页返回空关注（`user_follows.empty.json`）。

`user_follow_mixed` 的 `data.records` 是通到关注混合列表的路径，每条记录只收紧自己的 `followId`；`type` 区分艺术家（`type: 2`，此时 `userProfile` 为 `null`）和用户（`type: 3`）。`userProfile` 是可以没有的路径：艺术家记录里是 `null`，出现用户资料时按对象校验，里面的 `userId` 是附带对象的编号、保持宽松；`artistInfo`、`fansGroupInfo`、`showContent`、`page`、`extData` 都是宽松字段。越界 `cursor` 返回 `records: []`（`user_follow_mixed.empty.json`）；未登录调用上游返回 HTTP 200、`code: 400`、`message: "not login"`（`user_follow_mixed.anonymous.json`），SDK 按业务拒绝原样转交。

`user_mutualfollow_get` 的 `data` 就是接口要拿的布尔结果，收紧为 `boolean`；互相关注（`user_mutualfollow_get.mutual.json`）和不互相关注（`user_mutualfollow_get.not-mutual.json`）都有录制，未登录时上游同样返回 `200` 和 `data: false`（`user_mutualfollow_get.anonymous.json`）。

`user_comment_history` 的 `data.comments`、`data.hotComments` 是可以没有的路径：没有历史评论或未登录时上游返回 `null`（`user_comment_history.empty.json`、`user_comment_history.anonymous.json`），缺失或 `null` 都照常返回，出现时每条评论复用 `CommentRecord` 的字段并补上 `beRepliedContent`、`beRepliedUser`（宽松），`commentId` 收紧。`commentCount`、`hasMore`、`reminder` 宽松。

`user_event` 的事件记录只收紧自己的 `id`；`json` 是动态正文的 JSON 字符串，`info` 是评论信息，`user`、`pics`、`ipLocation` 和计数/展示字段都宽松。`info.commentThread` 是评论串（`latestLikedUsers[]` 的 `s`、`t` 是宽松数字字段），`events[].user` 复用 core 的 `EventUser`（`UserProfile` 的宽松字段加 `urlAnalyze`、`vipRights`），都是附带对象，编号不收紧。没有动态的账号返回空数组（`user_event.empty.json`）。`pics[]` 复用 core 的 `EventPic`（本批含 `pcRectangleIdStr`、`pcSquareIdStr`、`rectangleIdStr`、`squareIdStr` 四个宽松字段）；`commentThread.resourceInfo.resourceType` 已按 `user_event` 录制里的非 null 数字恢复声明，返回体值不变；类型仍是 `number | null`。`lasttime`、`more`、`size` 宽松。已知例外：`adInfo`、`anonymityInfo`、`bottomActivityInfos`、`extJsonInfo`、`likeAnimationMap`、`pointTopicInfo`、`privacySettingInfo`、`pubSource`、`topActivityInfos`、`topEvent`、`xInfo` 等扩展块未声明，字段原样保留（JSON）；`ipLocation.ip`、`commentThread.resourceInfo.imgUrl`、`vipRights.memberLogo` 等只见过 `null` 的子字段也未声明。

`event` 的动态记录与 `user_event` 使用 core 里同一组事件附带结构（`EventUser`、`EventIpLocation`、`EventPic`、`EventResourceInfo`、`EventLikedUser`、`EventCommentThread`、`EventInfo`）；事件记录本身字段不同，留在模块内声明：只收紧动态自己的 `id`，`json`、`info`、`user`、`pics`、`ipLocation`、`topEvent` 和计数/展示字段宽松；`privacySetting`、`uuid` 也按宽松字段声明；`contentDeclaration`、`repostSource` 按事件列表里的空串证据声明为宽松字符串，`resourceUniqueId` 的宽松字符串类型证据来自 `user_event` 录制。`event` 是通到动态列表的路径；登录账号用 `lasttime=1` 取到空结果（`event.empty.json`），返回 `event: []`、`more: false`，此时没有 `lasttime`。已知例外：非 null 扩展对象 `adInfo`、`anonymityInfo`、`bottomActivityInfos`、`extJsonInfo`、`pointTopicInfo`、`privacySettingInfo`、`pubSource`、`xInfo` 未声明；`likeAnimationMap` 只见过空对象、`topActivityInfos` 只见过空数组；`tailMark` 在本批事件列表录制里只有 `null`。非空录制原 20 条保留 3 条（索引 0/4/9，id 37982331004、37819249612、37812157222）。`event` 和 `topic_detail_event_hot` 的事件记录各声明 37 个字段，`user_event` 是 32 个；`user_event` 的 B17 声明未加 `contentDeclaration`、`repostSource`、`privacySetting`、`topEvent`、`uuid`（37/37/32）。

`hot_topic` 的 `hot` 是通到热门话题列表的路径，每条话题自己的编号 `hot[].actId` 收紧；`title`、`text`、`participateCount`、`sharePicUrl`、`reason`、`isDefaultImg`、`alg` 宽松，只见过 `null` 的 `iconUrl`、`readCnt`、`topicDisplayType`、`bizId`、`bizType`、`memberCount`、`onlineNum` 没有声明。`topic_sublist` 的 `data` 是通到收藏专栏列表的路径，`data[].id` 收紧；越界分页（`topic_sublist.out-of-range.json`，`offset=100000`）返回 `data: []`，`count` 保持原值。`topic_detail` 的 `act` 是通到话题详情的路径，`act.actId` 收紧；未知话题返回 `code: 404`（`topic_detail.unknown.json`），按业务拒绝原样转交。`topic_detail_event_hot` 的 `events` 是通到话题热门动态列表的路径，`events[].id` 收紧；动态记录与 `event` 一样从 core 复用事件附带结构，`topEvent` 是宽松布尔字段，`contentDeclaration`、`repostSource`、`resourceUniqueId` 按共享记录一并声明为宽松字符串（类型证据来自 `event` 录制）；扩展块例外与 `event` 相同（`adInfo`、`pubSource` 在本录制里只有 `null`，`tailMark` 有非 null 对象）。未知话题同样返回 `code: 404`（`topic_detail_event_hot.unknown.json`）。本批没有找到 `hot_topic` 可达的空列表，`hot: []` 由契约测试构造覆盖；`hot_topic` 的 `offset=100000` 与默认调用返回同一份内容。`topic_detail_event_hot` 的话题 47972517 没有热门动态，返回 `events: []`（`topic_detail_event_hot.empty.json`）；非空录制原 5 条保留 2 条（索引 0/4）。

本批 5 个模块的登录对照都先用 `login_status` 确认 `account.anonimousUser: false`（账号 599663130）：`event` 的匿名调用返回与登录空结果相同的 `event: []`、`more: false`；`hot_topic`、`topic_detail` 的匿名响应与登录响应字段集合一致，CDN 主机可能不同（本次对照只有 `topic_detail` 的 p3/p4 差异）；匿名录制未提交，也不对公开结构作相同性断言。

本批 7 个模块的登录对照都先用 `login_status` 确认 `account.anonimousUser: false`：`user_follow_mixed` 未登录被上游拒绝，`user_comment_history` 未登录看不到历史评论，`user_mutualfollow_get` 未登录对同一 uid 返回 `false`；其余模块本批未保留未登录录制，不对公开结构作相同性断言。录制只覆盖账号 599663130 与录制里出现的其他账号，不据此推断字段集合在所有账号、地区和上游版本下一致。

## 非 200 业务码的状态码变化

本批 5 个动态与话题模块开始做 Body 校验后，上游 HTTP 200 + `code: 400` 的响应会在 `decodeUpstreamBody` 里先按业务码拒绝（解码 Body 之前），公开结果为 `status: 400`、`body` 保留上游原文。请求层原有的 `SPECIAL_STATUS_CODES` 会把 `code: 400` 先映射成 200；这个映射只在没有 Body 校验时决定公开状态，Body 校验在返回前执行，所以最终看到的是 400。改造前同样是这些参数错误，模块会按 200 放行。

- `event`：`pagesize=abc`（`event.invalid-pagesize.json`）
- `hot_topic`：`limit=abc`（`hot_topic.invalid-limit.json`）
- `topic_sublist`：`offset=abc`（`topic_sublist.invalid-offset.json`）
- `topic_detail`：缺失 `actid`（`topic_detail.missing-actid.json`）
- `topic_detail_event_hot`：缺失 `actid`（`topic_detail_event_hot.missing-actid.json`）

`SPECIAL_STATUS_CODES` 里的其他码同样会在 Body 校验时拒绝：201/302/502 以原码拒绝，800–803 因超出 100–599 钳位为 400。不在该表里的码（如 404）原样转交，公开 `status` 仍是 404，不会变成 502。契约测试对以上 5 份 400 录制和 2 份 404 录制都断言状态码和原文。

B38 的 `song_like_check` 空 `ids` 请求（`song_like_check.empty-ids.json`）同样是上游 HTTP 200 + `code: 400`，Body 校验后公开为 `status: 400`、正文保留原文。B38 其他模块没有录到顶层非 200 返回：`check_music` 的 `{ code: 400 }` 只在探测里以非 JSON 原文出现，不能作为业务拒绝证据；`audio_match`、`song_red_count`、`song_dynamic_cover`、`setting` 的非 200 分支只按通用拒绝路径测试。

推荐批次的 `personalized`、`personalized_newsong`、`personalized_privatecontent_list` 同理：`code: 400` 的录制（`personalized.invalid-limit.json`、`personalized_newsong.invalid-limit.json`、`personalized_privatecontent_list.invalid-offset.json`）改造前按 200 放行，现在是 reject `status: 400`；`personalized_privatecontent_list` 的越界 `offset=100000`（`personalized_privatecontent_list.offset-out-of-range.json`）是 `code: 404`，改造前是 resolve `status: 404`，现在是 reject `status: 404`。两者都保留上游原文，不报 502。

B6 的歌单写操作同样受影响：`playlist_track_add` 缺 `pid`（`playlist_track_add.missing-pid.json`）、`playlist_track_delete` 缺 `id`（`playlist_track_delete.missing-id.json`）、`playlist_import_name_task_create` 缺 `text`（`playlist_import_name_task_create.missing-text.json`）的上游 `code: 400` 从 `status: 200` 放行变成 `status: 400` 拒绝，`body` 保留原文。`playlist_track_add`/`playlist_track_delete` 的 401 和 404、`playlist_import_task_status` 的 500 不在 `SPECIAL_STATUS_CODES` 里，改造前就按 `ProtocolFailed` 拒绝，状态不变。`playlist_update_playcount` 缺 `id` 的空正文是 HTTP 400、没有 `code`，仍归一成 `status: 200` 和空字符串，空字符串作为结构定义的独立分支保留。

B31 的播客/电台读取同样受影响：`broadcast_channel_currentinfo` 的已下架/无当前信息频道（录制 `broadcast_channel_currentinfo.delisted.json`）和 `voice_lyric` 的无播放权限声音（录制 `voice_lyric.unavailable.json`）都是上游 HTTP 200、正文 `code: 400`；改造前模块把这两种响应当成功放行 `status: 200`，现在 Body 校验按业务码拒绝为 `status: 400`，`body` 保留网易云原文。

B30 的相似内容接口：`simi_artist` 缺 `id`（`simi_artist.missing-id.json`）和 `simi_song` 缺 `id`（`simi_song.missing-id.json`）的上游是 HTTP 200 + `code: 400`，改造前按 `status: 200` 放行，现在 reject `status: 400` 并保留原文，两个模块的错误正文键不同（`message` / `msg`）。`simi_playlist`、`simi_user` 缺 `id` 时上游是 HTTP 400 空正文（`simi_playlist.missing-id.json`、`simi_user.missing-id.json`），归一成 `status: 200` 和空字符串；空字符串作为结构定义的独立分支原样返回，不报 502。

B33 的 5 个听歌足迹接口同理：未登录调用上游返回 HTTP 200 + `code: 302`（5 个模块各有一份 `.anonymous.json`），改造前模块按 `status: 200` 放行，现在按业务码拒绝为 `status: 302`，`body` 保留原文。本批没有录到其他非 200 业务码。

B39 的账号校验与基础查询开始运行时校验后，畸形成功返回从原样放行变成 502；其中 `verify_qrcodestatus` 的空 `qr`（`verify_qrcodestatus.empty.json`，`code: 400`）原本被 `SPECIAL_STATUS_CODES` 映射成 `status: 200` 放行，现在按业务码拒绝为 `status: 400`；未登录（`verify_qrcodestatus.anonymous.json`，`code: 301`）的公开状态原本就是 `301`，改造前是 resolve，现在是 reject，`body` 都保留原文（`code` 已由请求层归一成数字）。其余 5 个模块本批没有保留非 200 业务码录制。

## 消息

| 模块                                        | 结构定义                | 收紧的字段                                            |
| ------------------------------------------- | ----------------------- | ----------------------------------------------------- |
| [通知 - 评论](/api/social/msg-comments)     | `MsgCommentsBody`       | `code`、`comments`、`comments[].commentId`            |
| [通知 - @我](/api/social/msg-forwards)      | `MsgForwardsBody`       | `code`、`forwards`、`forwards[].id`                   |
| [通知 - 通知](/api/social/msg-notices)      | `MsgNoticesBody`        | `code`、`notices`、`notices[].id`                     |
| [通知 - 私信](/api/social/msg-private)      | `MsgPrivateBody`        | `code`、`msgs`、`msgs[].user.id`                      |
| [私信内容](/api/social/msg-private-history) | `MsgPrivateHistoryBody` | `code`、`msgs`、`msgs[].id`                           |
| [最近联系人](/api/social/msg-recentcontact) | `MsgRecentcontactBody`  | `code`、`data`、`data.follow`、`data.follow[].userId` |

`msg_comments` 的 `comments` 是收到的评论列表，每条评论复用 `CommentRecord` 的字段，再补上 `beRepliedContent`、`beRepliedUser`、`combindId`、`commentExist`、`commentStatus`、`resourceJson`、`resourceType`、`subCommentExist`、`threadId` 这些宽松字段；只有 `code`、`comments`、`comments[].commentId` 收紧，`total`、`more` 和评论的其他字段宽松。`before` 取一个早于全部评论的时间（`before=1`）时返回 `comments: []`（`msg_comments.empty.json`）。

`msg_forwards` 的 `forwards` 是 @我 列表，每条转发只收紧自己的 `id`；正文 `json`、`time`、`type`、`userId`、`resourceExist` 和来源对象 `uf` 宽松（`uf.id` 在宽松对象里，也宽松）。`newCount`、`lasttime`、`more` 宽松；`offset=100000` 越界时返回空数组（`msg_forwards.empty.json`）。

`msg_notices` 的 `notices` 每条只收紧自己的 `id`；`notice` 是通知正文的 JSON 字符串，`time`、`type`、`userId`、`queued` 和游标 `lastTime`、`more` 都宽松。`lasttime` 传早于账号创建的游标时返回 `notices: []`（`msg_notices.empty.json`）。

`msg_private` 的 `msgs` 是会话列表，每个会话只收紧自己的编号 `msgs[].user.id`；会话双方 `fromUser`、`toUser` 是附带资料，复用 `UserProfile` 的字段但把 `userId` 放宽，另补 `expertTags` 宽松字段，整个对象用宽松字段声明；`lastMsg` 是最后一条消息的 JSON 字符串，`lastMsgId`、`lastMsgTime`、`msgSenderType`、`newMsgCount`、`noticeAccountFlag`、`more` 都宽松。`offset=100000` 越界时返回 `msgs: []`（`msg_private.empty.json`）。

`msg_private_history` 的 `msgs` 每条私信只收紧自己的 `id`；`msg` 是消息正文的 JSON 字符串，双方资料与 `msg_private` 一样宽松，`time`、`batchId` 宽松；`isArtist`、`isSubed`、`hint`、`more` 也宽松。`before` 早于会话开始时间时返回 `msgs: []`、`more: false`（`msg_private_history.empty.json`）。

`msg_recentcontact` 的 `data.follow` 是最近联系人列表，每条记录复用 `UserProfile`（`userId` 收紧），再补 `py`、`onlined`、`expertTags` 宽松字段；`data` 里只声明 `follow`。账号 599663130 登录时有最近联系人，本批没有登录态的空结果；未登录时上游返回 `code: 200`、`data.follow: []`（`msg_recentcontact.anonymous.json`）。

这 6 个读取模块都需要登录，写操作不在本批范围。登录对照先用 `login_status` 确认 `account.anonimousUser: false`：`msg_comments`、`msg_forwards`、`msg_notices` 未登录时上游返回 `code: 301`，SDK 按业务拒绝原样转交；`msg_private`、`msg_private_history`、`msg_recentcontact` 未登录时返回 `code: 200` 和空列表，其中 `msg_private_history` 的 `isSubed` 为 `false`。录制只覆盖账号 599663130 与录制里出现的其他账号，不据此推断字段集合在所有账号、地区和上游版本下一致。

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
