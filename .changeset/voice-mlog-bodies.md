---
'hana-music-api': minor
---

给 3 个声音、播客与 mlog 读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

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
