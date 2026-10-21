# 返回体结构

部分模块的返回体在 SDK 里做了运行时校验：SDK 在返回结果之前，先用这个模块的结构定义检查 `body`，检查不通过就不返回，而是报“上游结构变了”。这些模块的 `body` 有确定的 TypeScript 类型，可以直接读声明过的字段，不用再自己判断。

做了校验的模块按领域列在下面，以后新收窄的模块也会补进对应的表。

### 登录

| 模块                                       | 结构定义                 | 声明的字段                                                                                                                            |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| [获取二维码 key](/api/user/login-qr-key)   | `LoginQrKeyBody`         | `code`、`data.unikey`                                                                                                                 |
| [生成二维码](/api/user/login-qr-create)    | `LoginQrCreateBody`      | `code`、`data.qrurl`、`data.qrimg`                                                                                                    |
| [查询扫码状态](/api/user/login-qr-check)   | `LoginQrCheckBody`       | `code`（800–803）、`cookie`；802 另有 `nickname`、`avatarUrl`                                                                         |
| [行为验证二维码](/api/other/verify-get-qr) | `VerifyGetQrBody`        | `code`、`data.qrCode`、`data.qrurl`、`data.qrimg`                                                                                     |
| [发送验证码](/api/user/captcha-sent)       | `CaptchaSentBody`        | `code`、`data`                                                                                                                        |
| [手机号登录](/api/user/login-cellphone)    | `LoginCellphoneBody`     | `code`、`cookie`、`account.id`、`profile` 的 `userId`、`nickname`、`avatarUrl`                                                        |
| 手机号登录被风控拦下                       | `LoginCellphoneRiskBody` | `code`（10004）、`message`、`redirectUrl`                                                                                             |
| [账号信息](/api/user/user-account)         | `UserAccountBody`        | `code`、`account`（`id`、`anonimousUser`、`vipType`）、`profile`（`userId`、`nickname`、`avatarUrl`、`vipType`），两者都可能是 `null` |
| [登录状态](/api/user/login-status)         | `LoginStatusBody`        | `data` 里是与账号信息相同的结构                                                                                                       |
| [用户详情](/api/user/user-detail)          | `UserDetailBody`         | `code`、`profile` 的 `userId`、`nickname`、`avatarUrl`、`vipType`                                                                     |
| [刷新登录](/api/user/login-refresh)        | `LoginRefreshBody`       | `code`、`cookie`                                                                                                                      |
| [退出登录](/api/user/logout)               | `LogoutBody`             | `code`                                                                                                                                |

### 曲库

| 模块                                             | 结构定义               | 声明的字段                                                                                                                                                                                                          |
| ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [用户歌单](/api/playlist/user-playlist)          | `UserPlaylistBody`     | `code`、`more`、`playlist`（`PlaylistSummary[]`，共用歌单类型，见下文）                                                                                                                                             |
| [歌单详情](/api/playlist/playlist-detail)        | `PlaylistDetailBody`   | `code`、`playlist`（`PlaylistSummary` 加 `trackIds[].id`）                                                                                                                                                          |
| [歌单中的歌曲](/api/playlist/playlist-track-all) | `PlaylistTrackAllBody` | `code`、`songs`（歌曲）                                                                                                                                                                                             |
| [歌曲详情](/api/music/song-detail)               | `SongDetailBody`       | `code`、`songs`（歌曲）、`privileges` 的 `id`、`st`、`pl`                                                                                                                                                           |
| [专辑内容](/api/album/album)                     | `AlbumBody`            | `code`、`songs`（歌曲，含 `privilege` 的 `id`、`st`、`pl`）、`album` 的 `id`、`name`、`picUrl`、`size`、`artist`（`id`、`name`，`name` 可能是 `null`）、`publishTime`、`description`（没有简介时为 `null`）         |
| [已收藏专辑](/api/album/album-sublist)           | `AlbumSublistBody`     | `code`、`hasMore`、`data` 的 `id`、`name`、`picUrl`、`size`、`artists`（`id`、`name`，`name` 可能是 `null`）                                                                                                        |
| [已收藏歌手](/api/artist/artist-sublist)         | `ArtistSublistBody`    | `code`、`hasMore`、`data` 的 `id`、`name`、`picUrl`、`albumSize`                                                                                                                                                    |
| [歌手热门歌曲](/api/artist/artist-top-song)      | `ArtistTopSongBody`    | `code`、`songs`（歌曲，含 `privilege` 的 `id`、`st`、`pl`）                                                                                                                                                         |
| [歌手专辑](/api/artist/artist-album)             | `ArtistAlbumBody`      | `code`、`more`、顶层 `artist`（`id`、`name`、`img1v1Url`、`musicSize`、`albumSize`，`name` 是字符串）；`hotAlbums` 的 `id`、`name`、`picUrl`、`size`、`artist`（`id`、`name`，`name` 可能是 `null`）、`publishTime` |
| [每日推荐歌曲](/api/recommend/recommend-songs)   | `RecommendSongsBody`   | `code`、`data.dailySongs`（歌曲，含 `privilege` 的 `id`、`st`、`pl`）                                                                                                                                               |
| [喜欢音乐列表](/api/music/likelist)              | `LikelistBody`         | `code`、`ids`                                                                                                                                                                                                       |

两个接口共用 `PlaylistSummary`，其中 `creator` 和可选的 `subscribers[]` 共用 `PlaylistUser`。这两个 TypeScript 类型都可以从 `hana-music-api` 根入口直接导入。

`PlaylistSummary` 必须包含：数字字段 `id`、`trackCount`、`updateTime`、`trackUpdateTime`、`playCount`、`privacy`、`specialType`、`status`；字符串 `name`、`coverImgUrl`；`description`（字符串或 `null`）；`tags`（字符串数组）；`subscribed`（布尔值或 `null`）；`creator`（用户）。`status` 正常为 0，已删除为 10，其他数值也原样保留。

以下字段可以缺失；存在时仍会检查类型：

| 类型           | `PlaylistSummary` 的可选字段                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| number         | `adType`、`backgroundCoverId`、`cloudTrackCount`、`coverImgId`、`createTime`、`subscribedCount`、`titleImage`、`trackNumberUpdateTime`、`userId` |
| string         | `commentThreadId`                                                                                                                                |
| string 或 null | `backgroundCoverUrl`、`coverImgId_str`、`englishTitle`、`titleImageUrl`、`updateFrequency`                                                       |
| boolean        | `copied`、`highQuality`、`mix`、`newImported`、`opRecommend`、`ordered`                                                                          |
| 用户数组       | `subscribers`                                                                                                                                    |

`PlaylistUser` 必须包含数字 `userId` 和字符串 `nickname`，其余声明的字段均可缺失：

| 类型              | `PlaylistUser` 的可选字段                                                                                                                                                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| number            | `accountStatus`、`authStatus`、`authenticationTypes`、`authority`、`avatarImgId`、`backgroundImgId`、`birthday`、`city`、`djStatus`、`gender`、`province`、`userType`、`vipType` |
| string            | `avatarImgIdStr`、`avatarImgId_str`、`avatarUrl`、`description`、`detailDescription`、`signature`、`backgroundImgIdStr`                                                          |
| string 或 null    | `backgroundUrl`                                                                                                                                                                  |
| boolean           | `anchor`、`defaultAvatar`、`followed`、`mutual`                                                                                                                                  |
| 字符串数组或 null | `expertTags`                                                                                                                                                                     |
| 对象或 null       | `avatarDetail`、`experts`，对象内部的字段保持为 JSON                                                                                                                             |

歌单和用户都原样保留未声明字段。`sharedUsers`、`tracks`、`remarkName` 未作具体类型声明，仍为 JSON 值。必填字段缺失或已声明字段类型错误时，SDK 以 `UnexpectedUpstreamShape`（502）拒绝。

### 歌单编辑与收藏

| 模块                                                   | 结构定义                  | 声明的字段                                                                    |
| ------------------------------------------------------ | ------------------------- | ----------------------------------------------------------------------------- |
| [红心](/api/music/like)                                | `LikeBody`                | `code`、`playlistId`、`songs`                                                 |
| [收藏专辑](/api/album/album-sub)                       | `AlbumSubBody`            | `code`、`time` 或 `message`                                                   |
| [收藏歌手](/api/artist/artist-sub)                     | `ArtistSubBody`           | `code`、`data`、`message`                                                     |
| [歌单分类](/api/playlist/playlist-catlist)             | `PlaylistCatlistBody`     | `code`、`all`、`categories`、`sub`                                            |
| [新建歌单](/api/playlist/playlist-create)              | `PlaylistCreateBody`      | `code`、`id`、`playlist.id`、`playlist.name`                                  |
| [删除歌单](/api/playlist/playlist-delete)              | `PlaylistDeleteBody`      | `code`                                                                        |
| [修改歌单简介](/api/playlist/playlist-desc-update)     | `PlaylistDescUpdateBody`  | `code`                                                                        |
| [修改歌单名称](/api/playlist/playlist-name-update)     | `PlaylistNameUpdateBody`  | `code`                                                                        |
| [调整歌单顺序](/api/playlist/playlist-order-update)    | `PlaylistOrderUpdateBody` | `code`                                                                        |
| [公开隐私歌单](/api/playlist/playlist-privacy)         | `PlaylistPrivacyBody`     | `code`                                                                        |
| [设置歌单标签](/api/playlist/playlist-tags-update)     | `PlaylistTagsUpdateBody`  | `code`                                                                        |
| [往歌单加歌或删歌](/api/playlist/playlist-tracks)      | `PlaylistTracksBody`      | `code`、`count`、`cloudCount`、可能有 `trackIds`；SDK 去掉 200 响应的额外包装 |
| [收藏或取消收藏歌单](/api/playlist/playlist-subscribe) | `PlaylistSubscribeBody`   | `code`                                                                        |
| [设置歌单封面](/api/playlist/playlist-cover-update)    | `PlaylistCoverUpdateBody` | `code`、`data.code`、`data.url`                                               |
| [歌曲排序](/api/music/song-order-update)               | `SongOrderUpdateBody`     | `code`；大批量调整可能回 `-1`，但网易云可能已经完成排序，SDK 仍按失败返回     |
| [申请图片上传凭证](/api/playlist/image-upload-token)   | `ImageUploadTokenBody`    | `code`、`data.imgId`、`data.token`、`data.uploadUrl`、`data.url_pre`          |

表里的“歌曲”共用这些字段：`id`、`name`、`ar`（歌手的 `id`、`name`）、`al`（专辑的 `id`、`name`、`picUrl`）、`dt`（时长，毫秒）、`fee`（网易云给的付费类型，原样保留数值）。云搜索的专辑名另允许缺失，见下文“搜索”。时间字段都是毫秒时间戳。

歌曲权限只声明数值字段 `id`、`st`、`pl`，其余字段原样保留。`song_detail` 把权限放在顶层 `privileges`，可按 `id` 与歌曲匹配；`album`、`artist_top_song`、`recommend_songs`、`cloudsearch` 放在每首歌的 `privilege`。`st < 0` 表示无版权，`pl` 是当前账号可在线播放的最高码率，0 表示不能播放完整歌曲；是否实际给到试听片段仍看播放地址里的 `freeTrialInfo`。SDK 原样保留这些数值，不把 `st` 限制成固定的枚举。

歌手和专辑的 `name` 可能是 `null`：传到云盘、没有匹配上曲库的歌（网易云返回的 `t` 是 1），歌手和专辑的编号是 0，名字是 `null`。专辑里的 `artist`、`artists` 用的也是这种歌手结构，`name` 的类型同样是 `string | null`。这种歌只有上传者本人登录时能看到歌名；别人看、或者没有有效登录时，歌名也是 `null`，这时结构对不上，按下面的 [结构变了时](#结构变了时) 以 `status: 502` 拒绝。

`subscribed` 是 `null` 表示网易云给的是没有登录的视角：Cookie 里的 `MUSIC_U` 已经失效时，用户歌单和歌单详情都是 `null`；完全不带 Cookie 时，用户歌单是 `null`，歌单详情是 `false`。

### 播放

| 模块                                                             | 结构定义                | 声明的字段                                                                                                     |
| ---------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| [获取音乐 url - 新版](/api/music/song-url-v1)                    | `SongUrlV1Body`         | `code`、`data` 的 `id`、`url`、`code`、`level`、`expi`、`freeTrialInfo`（`start`、`end`）                      |
| [获取客户端歌曲下载链接 - 新版](/api/music/song-download-url-v1) | `SongDownloadUrlV1Body` | `code`、`data`（一个对象）的 `id`、`url`、`code`、`level`、`size`                                              |
| [获取逐字歌词](/api/music/lyric-new)                             | `LyricNewBody`          | `code`、`lrc`；可能缺失的 `tlyric`、`romalrc`、`yrc`、`ytlrc`、`yromalrc`、`pureMusic`。每种歌词只声明 `lyric` |
| [听歌打卡](/api/music/scrobble)                                  | `ScrobbleBody`          | `code`                                                                                                         |

播放地址和下载地址里，`url` 是 `null` 表示拿不到地址，原因看条目里的 `code`，不能只检查顶层 `body.code` 或 HTTP 状态。播放地址的 `freeTrialInfo` 不是 `null` 表示只能试听，`url` 是试听片段，`start`、`end` 是片段在整首里的起止秒数，不应假定固定为 30 秒。

下载地址的 `data` 是一个对象，不是数组。2026-10-21 使用真实国内 IP、不带账号 Cookie 请求会员歌 `1409311773`，`standard`、`higher`、`exhigh` 三档都返回顶层 `code: 200`，但 `data.code: -105`、`url: null`、`level: null`、`size: 0`；同一游客身份的播放接口仍返回试听片段。因此，这个只能试听的场景在下载接口中通过已声明的数值字段 `data.code` 识别，本次录制的值为 `-105`，表示当前身份没有下载权限，而不是拿到了可下载的试听文件。无版权的下载录制则是 `data.code: -110`（播放地址的无版权录制是 404）。这些是已录到的场景，不把 `-105` 解释为所有账号、所有歌曲都只能试听的通用结论，也没有录到会员到期的情况。

下载前同时检查 `data.code === 200`、`data.url !== null`、`data.size > 0`；不满足时标记下载失败，保留返回码说明原因，不要改用播放接口的试听地址补位。下载录制中的 `freeTrialInfo` 均为 `null`，没有下载试听片段的证据，因此仍不声明这个字段。本次没有录到下载接口的 `code: 404`，不据此推断它的含义。

`level` 是实际给到的音质，可能比请求的低；`expi` 是播放地址有效的秒数，`size` 是文件字节数。歌词除 `lrc` 外的几种可能整个缺失，也可能在、但 `lyric` 是空串，两种都表示没有这种歌词。

### 搜索

| 模块                                   | 结构定义            | 声明的字段                                                                                                                                                                                              |
| -------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [云搜索](/api/search/cloudsearch)      | `CloudsearchBody`   | `code`、`result`；`result` 里可能缺失的 `songs`（歌曲，含 `privilege` 的 `id`、`st`、`pl`）、`albums`、`artists`、`playlists`，以及各自的总数 `songCount`、`albumCount`、`artistCount`、`playlistCount` |
| [搜索建议](/api/search/search-suggest) | `SearchSuggestBody` | `code`、`result`；`result` 里可能缺失的 `songs`、`artists`、`albums`、`playlists`（每项 `id`、`name`）和 `allMatch`（每项 `keyword`）                                                                   |

云搜索按 `type` 只给一类结果：专辑声明了 `id`、`name`、`picUrl`、`artists`（`id`、`name`）、`publishTime`；歌手声明了 `id`、`name`、`picUrl`（没有头像时是 `null`）、`musicSize`（歌曲数）；歌单声明了 `id`、`name`、`coverImgUrl`、`trackCount`、`playCount`（播放次数，数字）、`creator`（`userId`、`nickname`）。没有结果时只有总数（0），列表整个缺失；其他 `type`（用户、MV 等）的结果没有声明，原样保留。搜索建议默认按类别给出，某一类没有建议时对应列表整个缺失（包括 `playlists`）；`type` 为 `mobile` 时只给关键词 `allMatch`；没有建议时 `result` 是空对象。

云搜索的 `result.songs[].al.name` 可以缺失，也可以是字符串或 `null`；读取时类型为 `string | null | undefined`，调用方显示专辑名之前需要处理这两种空值。SDK 保留缺失状态，不补空字符串、不丢弃歌曲。`al` 本身及其 `id`、`picUrl` 仍是必填，`al.name` 为数字等错误类型仍以 `UnexpectedUpstreamShape`（502）拒绝；这项放宽不改变歌曲详情等其他接口的共用歌曲结构。

结构定义只声明真实返回里确认过的字段；共用歌单和用户类型还声明了上表列出的可选字段，其余字段原样保留在 `body` 里，类型是 JSON 值。字段的取值来自脱敏后的真实返回，按领域保存在仓库的 `tests/fixtures/netease/` 下。

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
  body.code === 802 ? `${body.nickname} 已扫码，等待确认` : body.code;

const isMember = (body: UserAccountBody) => (body.account?.vipType ?? 0) > 0;
```

`code` 是字面量，按 `code` 判断后 TypeScript 会收窄到对应的分支。只用类型时写 `import type`，不会把 SDK 打包进浏览器端。

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

`validate` 是同步的。适合在测试里检查自己的假数据是否和 SDK 认可的结构一致。

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

返回码认识、但字段缺失或类型不对时，Promise 以 `status: 502` 拒绝，`body` 带上出错的位置：

```json
{
  "code": 502,
  "msg": "Unexpected upstream shape in login_qr_check at body.nickname: expected present, got missing",
  "upstreamShape": {
    "module": "login_qr_check",
    "path": "body.nickname",
    "expected": "present",
    "actual": "missing"
  }
}
```

用 `body.upstreamShape` 判断是不是这种失败，不要解析 `msg`。`path` 指向 SDK 返回的 `body` 里的位置；`expected` 为 `present` 表示字段缺失，其余是期望的类型或取值。这种失败说明网易云改了返回结构，需要升级 SDK 或报告问题，重试通常没有用。
