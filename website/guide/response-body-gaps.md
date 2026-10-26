# 返回体缺口与补录条件

`bun run schema:audit status` 是模块覆盖的唯一口径。当前 352 个模块中 315 个已声明 `ModuleBody`，剩余 37 个没有结构定义：其中普通 raw 模块 33 个、`batch` 1 个、上传工作流 3 个（`avatar_upload`、`cloud`、`voice_upload`）。这份清单把 37 个例外逐项登记为“明确例外 + 补录条件”，不是待办占位：每一项都给出了当前证据，或说明为什么现在拿不到成功正文。

按现状原因分组：

| 类别                | 数量 | 说明                                                           |
| ------------------- | ---: | -------------------------------------------------------------- |
| 已录到拒绝          |   12 | 有录制或探测，但上游只返回风控、频率限制、权限、参数错误或 404 |
| 需专用账号/状态     |   10 | 成功体依赖登录凭据、刚注册、音乐人、会员或当天未签到等账号状态 |
| 需专用资源/第二账号 |    5 | 需要第二账号、可操作的评论、自己的播客/声音或已上传的云盘文件  |
| 不可逆/高副作用     |    5 | 删除、扣云贝、换绑手机号等操作会真实改变账号数据               |
| 上传/批量工作流     |    4 | `batch` 与三个多段上传模块没有单一固定返回体                   |
| 其他                |    1 | `related_playlist` 的 HTML 抓取源已不可用                      |

“已录到拒绝”的 12 个再按上游返回细分：`code: 250` 4 个（3 个风控 250、1 个业务失败“用户资料初始化或修改失败”）、`code: 2201` 频率限制 2 个、`code: 401` 权限拒绝 1 个、`code: 400` 参数错误/资源不存在 2 个、HTTP 400 空正文 1 个、`code: 404` 2 个。这些例外都没有可用于字段声明的成功正文：`voice_detail` 的 `code: 200` + `data: null` 是空成功，没有字段可声明，所以也不声明 `ModuleBody`；`playlist_track_add`/`playlist_track_delete` 只有 401/404 拒绝证据，同样只收紧 `code`、不声明其余字段。两者口径一致：空成功和拒绝录制都不当作字段声明的证据。

## 总表

| 模块                                                            | 类别                | 现状证据                                                                                                                                                                             | 补录条件                                                            |
| --------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [comment](/api/comment/comment)                                 | 已录到拒绝          | `comment/comment.add-rejected.json`：新增（`t=1`）被风控拒绝 `code: 250`；换短内容、自然内容、其他歌曲和歌单评论同样 250；删除（`t=0`）没有调用                                      | 风控解除后先录新增成功体拿到评论 id，再用该 id 录删除并回读确认消失 |
| [event_forward](/api/social/event-forward)                      | 已录到拒绝          | `event/event_forward.default.json`：转发自己的动态 `code: 250`（分享异常）；另一条自己的动态探测同样 250（探测未保留录制）                                                           | 风控解除后转发一条可删除的测试动态，录成功体后清理                  |
| [share_resource](/api/social/share-resource)                    | 已录到拒绝          | `event/share_resource.default.json`：`code: 250`（安全验证分享异常）；`song`、`album`、`playlist`、`noresource` 探测同样 250                                                         | 风控解除后分享可清理的测试资源，按类型补录成功体                    |
| [send_song](/api/social/send-song)                              | 已录到拒绝          | `msg/send_song.rejected.json`：发给自己 `code: 2201`（发送过于频繁）；发给自己可能本身不允许                                                                                         | 用第二账号接收私信，录成功体                                        |
| [send_text](/api/social/send-text)                              | 已录到拒绝          | `msg/send_text.rejected.json`：发给自己 `code: 2201`（发送过于频繁）；换自然内容重试同样被拒                                                                                         | 用第二账号接收私信，录成功体                                        |
| [digitalAlbum_ordering](/api/album/digital-album-ordering)      | 已录到拒绝          | `digital-album/digitalAlbum_ordering.missing-params.json`：缺 `id`/`payment` 时 HTTP 400 空正文；未实际下单、未支付                                                                  | 在不会产生真实订单和支付的测试环境补录成功体                        |
| [voice_detail](/api/dj/voice-detail)                            | 已录到拒绝          | `voice/voice_detail.other-voice.json`：读取他人声音 `code: 401`；`voice/voice_detail.unknown.json`：未知 id 是 `code: 200`、`data: null` 的空成功，没有字段可声明，故无 `ModuleBody` | 用有自己声音的创作者账号录到带字段的成功正文                        |
| [voicelist_detail](/api/dj/voicelist-detail)                    | 已录到拒绝          | `voice/voicelist_detail.missing.json`、`voice/voicelist_detail.other.json`：均 `code: 400`（播客不存在/只允许操作自己的播客）                                                        | 用有自己播客的创作者账号录到带字段的成功正文                        |
| [voicelist_list](/api/dj/voicelist-list)                        | 已录到拒绝          | `voice/voicelist_list.missing.json`、`.other.json`、`.unknown.json`：均 `code: 400`（参数错误/只允许自己的播客/播客不存在）                                                          | 用有自己播客的创作者账号录到带字段的成功正文                        |
| [yunbei_expense](/api/vip/yunbei-expense)                       | 已录到拒绝          | 2026-10-26 用登录账号探测仍返回 `code: 404`（接口未找到）；见[返回体结构](/guide/response-bodies)与 `.changeset/sheet-annual-bodies.md`，未保留录制                                  | 上游恢复该接口并出现成功返回后补录                                  |
| [yunbei_receipt](/api/vip/yunbei-receipt)                       | 已录到拒绝          | 与 `yunbei_expense` 同日探测，仍返回 `code: 404`（接口未找到）；未保留录制                                                                                                           | 上游恢复该接口并出现成功返回后补录                                  |
| [user_update](/api/user/user-update)                            | 已录到拒绝          | 探测返回 `code: 250`（用户资料初始化或修改失败），前后用[用户详情](/api/user/user-detail)回读资料未变化；见模块页，未保留录制                                                        | 风控解除后修改可回滚字段并回读确认                                  |
| [login](/api/user/login)                                        | 需专用账号/状态     | 邮箱密码登录需要真实凭据，成功响应会带真实 `MUSIC_U` Cookie；`tests/fixtures/netease/login/` 里登录成功体只有短信、二维码和匿名注册三种，`login` 没有成功体录制                      | 用可弃用的测试邮箱账号登录，Cookie 脱敏后录制                       |
| [activate_init_profile](/api/user/activate-init-profile)        | 需专用账号/状态     | API 页要求“刚注册的账号（需登录）”；没有刚注册且未初始化昵称的测试账号，未录制                                                                                                       | 新注册一个测试账号后立即录制                                        |
| [register_cellphone](/api/user/register-cellphone)              | 需专用账号/状态     | 需要未注册手机号和有效短信验证码，并会创建真实账号；未录制                                                                                                                           | 用可弃用手机号和真实验证码注册测试账号                              |
| [captcha_verify](/api/user/captcha-verify)                      | 需专用账号/状态     | 需要一次性短信验证码（`phone` + `captcha`）；未录制                                                                                                                                  | 获取可弃用手机号的验证码后立即录制                                  |
| [daily_signin](/api/vip/daily-signin)                           | 需专用账号/状态     | 需要登录账号且当天未签到；模块注释记录重复签到返回 `code: -2`；未录制                                                                                                                | 用当天未签到的测试账号录制成功体                                    |
| [musician_sign](/api/vip/musician-sign)                         | 需专用账号/状态     | 音乐人签到会改变账号状态；`.changeset/musician-read-bodies.md` 记为写操作、未在本批执行；未录制                                                                                      | 用音乐人测试账号执行一次签到                                        |
| [musician_cloudbean_obtain](/api/vip/musician-cloudbean-obtain) | 需专用账号/状态     | 需要音乐人账号和可领取任务（`id`/`period` 来自 `/musician/tasks`）；未录制                                                                                                           | 用有可领取任务的音乐人账号录制                                      |
| [vip_growthpoint_get](/api/vip/vip-growthpoint-get)             | 需专用账号/状态     | 需要登录账号和可领取任务 `ids`（来自 `/vip/tasks`）；写操作未执行；未录制                                                                                                            | 用有可领取成长值任务的账号录制                                      |
| [yunbei_sign](/api/vip/yunbei-sign)                             | 需专用账号/状态     | 云贝签到会改变账号状态；写操作未执行；未录制                                                                                                                                         | 用未签到状态的测试账号录制                                          |
| [yunbei_task_finish](/api/vip/yunbei-task-finish)               | 需专用账号/状态     | 需要可领取的 `userTaskId`（参数表）；未录制                                                                                                                                          | 用有未领取任务的账号录制                                            |
| [hug_comment](/api/comment/hug-comment)                         | 需专用资源/第二账号 | 抱一抱评论是写操作，需要一条可安全操作的评论 id；`.changeset/comment-extension-bodies.md` 记为尚未执行的写操作；未录制                                                               | 用一条属于测试账号或可撤回的评论，录成功体                          |
| [send_album](/api/social/send-album)                            | 需专用资源/第二账号 | 与 `send_text`/`send_song` 共用 `/api/msg/private/send`；那两条发给自己只得到 `code: 2201`，本模块没有单独录制                                                                       | 用第二账号接收专辑私信，录成功体                                    |
| [send_playlist](/api/social/send-playlist)                      | 需专用资源/第二账号 | 与 `send_text`/`send_song` 共用 `/api/msg/private/send`；本模块没有单独录制                                                                                                          | 用第二账号接收歌单私信，录成功体                                    |
| [voicelist_trans](/api/dj/voicelist-trans)                      | 需专用资源/第二账号 | 创作者工作台写操作（调整声音在播客中的顺序），需要自己的播客/声音；`.changeset/podcast-read-bodies.md` 记本机账号没有播客；未录制                                                    | 用有自己播客/声音的创作者账号执行一次排序调整                       |
| [cloud_import](/api/cloud/cloud-import)                         | 需专用资源/第二账号 | 需要一首已上传云盘的歌曲（`md5`/文件元数据），先调 `cloud/upload/check/v2` 再调 `cloud/user/song/import`；未录制                                                                     | 先完成一次可弃用的云盘上传，再用该文件元数据录导入                  |
| [user_cloud_del](/api/cloud/user-cloud-del)                     | 不可逆/高副作用     | 删除云盘歌曲不可逆；未执行，未录制                                                                                                                                                   | 上传一首可弃用的测试歌曲后删除并回读确认                            |
| [voice_delete](/api/dj/voice-delete)                            | 不可逆/高副作用     | 删除自己的声音不可逆；账号没有声音；写操作未执行；未录制                                                                                                                             | 上传一条可弃用的测试声音后删除并回读确认                            |
| [yunbei_rcmd_song](/api/vip/yunbei-rcmd-song)                   | 不可逆/高副作用     | 推歌消耗云贝（`yunbeiNum` 默认 10）；写操作未执行；未录制                                                                                                                            | 用可弃用的云贝余额提交一次推歌                                      |
| [rebind](/api/user/rebind)                                      | 不可逆/高副作用     | 换绑手机号需要原手机和新手机两个验证码，会改变账号绑定（参数表）；未录制                                                                                                             | 用可弃用的测试手机号完成一次换绑并回读确认                          |
| [user_replacephone](/api/user/user-replacephone)                | 不可逆/高副作用     | 与 `rebind` 同一上游路径 `/api/user/replaceCellphone`，需要登录和原/新手机验证码；未录制                                                                                             | 用可弃用的测试手机号完成一次换绑并回读确认                          |
| [batch](/api/other/batch)                                       | 上传/批量工作流     | 请求体是 `/api/...` 路由到子请求参数的映射，响应逐路由返回子请求结果，没有单一固定结构；未录制                                                                                       | 结构取决于子模块；若声明需按实际子路由建模，否则保持原样 JSON       |
| [avatar_upload](/api/user/avatar-upload)                        | 上传/批量工作流     | 多段上传（文件上传 → `/api/user/avatar/upload/v1`），公开体由上传插件结果与上游响应拼装；未录制                                                                                      | 用可弃用的测试图片完成一次上传（会改头像）                          |
| [cloud](/api/cloud/cloud)                                       | 上传/批量工作流     | 多段上传（check → NOS → info → pub），公开体由 check 与 published 两段响应拼装；未录制                                                                                               | 用可弃用的测试音频完成一次上传（可能产生云盘歌曲）                  |
| [voice_upload](/api/dj/voice-upload)                            | 上传/批量工作流     | 多段上传（NOS 分片 → 工作台 preCheck/upload），需要发布权限；未录制                                                                                                                  | 用有发布权限的创作者账号和可弃用音频完成一次上传                    |
| [related_playlist](/api/playlist/related-playlist)              | 其他                | 靠抓取歌单页 HTML 解析相关歌单；API 页标注“现已无法抓取歌单”，模块自己组装 `{ code, playlists }`；未录制                                                                             | 抓取源恢复时补录；文档已建议改用 `playlist_detail_rcmd_get`         |

## 类别说明

**已录到拒绝。** 这些模块有失败录制或明确的探测结果，但没有成功正文。上游返回的风控码（`250`）、频率限制（`2201`）、权限拒绝（`401`/`400`）、参数错误（HTTP 400 空正文）或接口不存在（`404`）只能证明失败路径，不能用来猜成功字段。`voice_detail` 的 `code: 200`、`data: null` 也是空成功，没有字段可声明，因此与只有 401/404 拒绝证据的 `playlist_track_add`/`playlist_track_delete` 一样，不把这两类响应当作字段声明证据。

**需专用账号/状态。** 成功体依赖当前录制账号不具备的身份或状态：邮箱密码凭据、刚注册账号、未注册手机号与短信验证码、音乐人身份、会员任务，或当天未签到。没有这些条件时，调用只会得到登录失效、风控或无任务可领，不构成成功正文证据。

**需专用资源/第二账号。** 私信类需要另一个账号实际接收；`hug_comment` 需要一条可安全操作的评论；创作者工作台需要自己的播客/声音；`cloud_import` 需要一首已经上传到云盘的文件。资源不具备时，接口只会返回参数错误或权限拒绝。

**不可逆/高副作用。** 删除云盘歌曲、删除声音、消耗云贝推歌、换绑手机号都会真实改变账号数据，且部分操作不能撤销。没有可弃用的资源或明确的回滚路径时，不执行这些调用，也不根据失败路径猜成功体。

**上传/批量工作流。** `batch` 的正文由调用方提交的子路由决定，没有单一结构；三个上传模块的公开体是多段上游响应和上传插件结果拼装出来的，成功体需要真实文件、NOS 交互和发布权限。它们不适合套普通 `*Body`，单独留作例外。

**其他。** `related_playlist` 的 HTML 抓取源已经不可用，API 页建议改用[相关歌单推荐](/api/playlist/playlist-detail-rcmd-get)。在抓取源恢复前，没有可验证的成功正文。

## 核对与维护

这些例外不是遗漏。重跑 `bun run schema:audit status` 应仍得到：352 个模块、315 个有 `ModuleBody`、37 个没有（raw 33、batch 1、upload 3）。`bun run schema:audit status --list` 列出的模块应与本页 37 行一一对应；`bun run schema:audit check` 用于检查结构定义写法，`bun run schema:audit recordings --recordings tests/fixtures/netease` 用于确认本仓库现有录制都能通过校验。`schema:audit` 的默认录制根是 Campanula 仓库的 `../campanula-svelte-main/tests/fixtures/netease`，在 SDK 仓库里必须显式传 `--recordings tests/fixtures/netease`。

补录成功后，按 [`agent-docs/API_CONVENTIONS.md` 的“收紧与宽松”](https://github.com/nonhana/hana-music-api/blob/master/agent-docs/API_CONVENTIONS.md#收紧与宽松)新增 `ModuleBody`、契约测试和模块页说明，再从本页删除对应行并更新[返回体结构](/guide/response-bodies)。如果审计数字变化但本页没有同步，以 `bun run schema:audit status` 为准并先修正本页。
