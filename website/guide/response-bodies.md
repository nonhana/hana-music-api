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

| 模块                                   | 结构定义            | 收紧的字段                                                                                                                                                 |
| -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [云搜索](/api/search/cloudsearch)      | `CloudsearchBody`   | `code`、`result`；`result.songs`、`result.albums`、`result.artists`、`result.playlists` 可以没有，出现了则 `[].id` 收紧                                    |
| [搜索建议](/api/search/search-suggest) | `SearchSuggestBody` | `code`、`result`；`result.songs`、`result.artists`、`result.albums`、`result.playlists`、`result.allMatch` 可以没有，出现了则 `[].id` 或 `[].keyword` 收紧 |

云搜索按 `type` 只给一类结果。结果列表（`songs`、`albums`、`artists`、`playlists`）是可以没有的路径：没有结果时只有总数（0），列表整个缺失或是 `null`；出现了就按每项记录的编号（`[].id`）收紧校验，坏一条记录会报 502，不会整列消失。各总数（`songCount`、`albumCount`、`artistCount`、`playlistCount`）是宽松字段。专辑的其他声明字段是 `name`、`picUrl`、`artists`（`id`、`name`）、`publishTime`、`company`；歌手的其他声明字段是 `name`、`picUrl`、`musicSize`（歌曲数）；歌单的其他声明字段是 `name`、`coverImgUrl`、`trackCount`、`playCount`、`creator`（`userId`、`nickname`）。这些全部宽松，包括云搜索里的 `al.name`；共用歌曲的 `al.name` 本来就是宽松字段，不再需要单独放宽。

搜索建议默认按类别给出，某一类没有建议时对应列表整个缺失或是 `null`（包括 `playlists`），出现了就按每项建议的编号（`allMatch` 是 `keyword`）收紧校验；`type` 为 `mobile` 时只给关键词 `allMatch`，没有建议时 `result` 是空对象。每项建议的 `name` 都是宽松字段。

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
