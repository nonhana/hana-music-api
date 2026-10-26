---
'hana-music-api': minor
---

给 5 个私人 FM、心动模式与推荐读取模块补上结构定义（`ModuleBody`），并在运行时校验返回体。

### 新增公开结构定义

- `personal_fm` → `PersonalFmBody`：收紧 `code`、`data`、`data[].id`；歌曲用模块内的 `FmSong`（复用 `ProgramMainSong`，补 `alg`、`alias`、`fmRecReason`、`privilege`、`reason`、`reasonId`、`transName`、`transNames` 等录制里出现的旧版字段，全部宽松）；`extTransMap`、`popAdjust` 宽松，`tag` 只见过 `null`，未声明。
- `personal_fm_mode` → `PersonalFmModeBody`：与 `personal_fm` 同构；`mode`/`submode` 只改请求参数，不改变响应结构；`extTransMap` 是以歌曲编号为键、`fmRecReason` 为值的宽松映射。录制覆盖 `DEFAULT`、`FAMILIAR`、`EXPLORE`、`aidj` 和 `SCENE_RCMD` 的 `FOCUS`/`EXERCISE`/`NIGHT_EMO` 分支。
- `playmode_intelligence_list` → `PlaymodeIntelligenceListBody`：收紧 `code`、`data`、`data[].id`；`songInfo` 是宽松字段并复用 `LooseSong`（嵌套歌曲编号也宽松，坏 `id` 只丢编号，不会让整条 `songInfo` 消失），`alg`、`recommended`、`message` 宽松。
- `aidj_content_rcmd` → `AidjContentRcmdBody`：收紧 `code`、`data`、`data.aiDjResources`；每条资源的 `type` 和 `value` 宽松，`tagName`、`message`、`trp.rules` 宽松。`value` 里声明录制有证据的 `songId`（字符串）、`includeVoice`、`songData`、`songPrivilege`、`audioList`（音频编号、地址、时长、文案等展示字段），全部宽松；`songData` 用模块内的 `AiDjSong`（复用 `ProgramMainSong`，补 `alias`/`transName`/`transNames`，歌曲编号在宽松 `value` 里也宽松）。声明了这些字段，其余原样保留；宽松字段可能缺席，例如 `with-location` 录制里的 song 资源没有 `audioList`。
- `mlog_music_rcmd` → `MlogMusicRcmdBody`：收紧 `code`、`data.feeds`、`data.feeds[].id`；`resource` 是附带的 mlog 记录，整体宽松；声明 `mlogBaseData.userId`/`coverDetail`/`video`/`mixInfo.status`、`userProfile`（昵称、编号、头像等）和 `source` 等有证据的字段，`video` 里声明 `urlInfo`/`rcmdUrlInfo`/`urlInfos`（`id`、`r`、`size`、`validityTime`、`resolution`；`url` 只见过 `null` 未声明），嵌套歌曲复用 `MlogSong`；`matchField`、`sameCity`、`type`、`more`、`message` 宽松，`data.msg` 只见过 `null`，未声明。声明了这些字段，其余原样保留（如 `urlInfo.url`、`relatedPubUsers`、`mlogPlaylists`）。

### 行为变化

- 这 5 个模块开始做运行时结构校验：以前畸形返回原样放行，现在会在收紧字段缺失或类型不对时以 `UnexpectedUpstreamShape`（`status: 502`，`body.upstreamShape` 带模块名和路径）拒绝。宽松字段缺失、`null` 或类型不对只丢这一项。
- `playmode_intelligence_list` 缺少 `pid` 时上游返回 `code: 500`，探测到的另一个歌单返回 `code: 400`；两者仍按业务拒绝原样转交，不报 502。
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
