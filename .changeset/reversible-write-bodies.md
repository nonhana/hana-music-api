---
'hana-music-api': minor
---

给 8 个写操作模块补上结构定义（`ModuleBody`），并在运行时校验返回体；部分写操作没有撤销调用（`recommend_songs_dislike`、`fm_trash` 已在模块页说明）。`user_update` 因上游拒绝没有成功正文证据，本批不改。

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
