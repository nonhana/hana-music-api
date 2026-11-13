# #129 全量失败路径清单

由 `bun run failures:report` 从 `docs/acceptance/issue-129/failures/*.json` 生成，不手工编辑。

## 内核来源（全部 352 模块）

| 内部来源 | 公开 kind |
| --- | --- |
| UpstreamBusinessFailed / ProtocolFailed(reason=business) | `business` |
| UpstreamRateLimited | `rateLimited` |
| UnexpectedUpstreamShape | `upstreamShape` |
| DeadlineExceeded | `timeout` |
| caller AbortSignal / interrupt | `cancelled` |
| InvalidRequest / TargetRejected / InvalidModuleInput | `invalidRequest` |
| TransportFailed / ResponseDecodeFailed / ProtocolFailed | `transport` |
| unrecognized defect / legacy envelope / ModuleInvariantFailed | `unknown` |

`partialCompletion`/`completedStages` 由 `PartialUpload` 保留，不改变失败分类。
内核规则由 `tests/behavior/runtime/failure-contract.test.ts` 和 `tests/unit/runtime/failure-metadata.test.ts` 共享覆盖；下列证据是该模块自己的领域、回放或入口文件，`shared-kernel` 表示只有共享内核证据。
独立 Watchman 继续使用 `WatchmanError`，不在本清单内。

## 模块清单

上表是内核来源到公开 kind 的映射；每个模块实际可达的来源取决于它是否发起网络请求。原样返回的模块没有 `upstreamShape`，纯本地模块没有 `business`、`rateLimited`、`transport`、`timeout` 或 `cancelled`。“额外来源”列只列该模块额外的业务码或结构校验分支。

### account

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `activate_init_profile` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/tooling/upstream-endpoints.test.ts` |
| `avatar_upload` | imageAllocate, imageUpload, submit | 原样返回 | business, upstreamShape | uploadWork 多阶段与部分完成 | `tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/modules/special/special-chains.test.ts`<br>`tests/behavior/modules/upload/effect-upload-plugins.test.ts` |
| `captcha_sent` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/modules/input-encoding/account.ts` |
| `captcha_verify` | request | 原样返回 | — | — | `tests/behavior/modules/account/account-social.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/modules/input-encoding/account.ts` |
| `cellphone_existence_check` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-check-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `countries_code_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-check-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `inner_version` | — | ModuleBody（本地拼装） | — | 纯本地，无网络来源 | `tests/replay/discovery/misc-read-bodies.test.ts`<br>`tests/behavior/http/server.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `login` | password | 原样返回 | business, upstreamShape | 特殊 502 业务码本地改写与 Cookie 检查 | `tests/replay/account/login-bodies.test.ts`<br>`tests/replay/compat/narrowed-legacy-bodies.test.ts`<br>`tests/replay/creators/musician-bodies.test.ts` |
| `login_cellphone` | captcha, password | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts` |
| `login_qr_check` | request | decodeUpstreamBody | business, upstreamShape | 成功码 800-803 与 8821 业务拒绝 | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `login_qr_create` | — | ModuleBody（本地拼装） | — | 本地二维码不变式（unknown） | `tests/replay/account/login-bodies.test.ts`<br>`tests/replay/special/special-chains.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `login_qr_key` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/account/account-social-policy.test.ts` |
| `login_refresh` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `login_status` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-check-bodies.test.ts`<br>`tests/replay/account/account-social.test.ts`<br>`tests/replay/account/login-bodies.test.ts` |
| `logout` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/account/account-session.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `nickname_check` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-check-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |
| `rebind` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/modules/input-encoding/account.ts` |
| `register_anonimous` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/irreversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/modules/special-actions.test.ts` |
| `register_cellphone` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/modules/input-encoding/account.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `setting` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playability-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts`<br>`tests/behavior/modules/upload/image-direct-upload.test.ts` |
| `verify_getQr` | request | decodeUpstreamBody | business, upstreamShape | 上游 read + 本地二维码不变式（unknown） | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/account/account-social-policy.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts` |
| `verify_qrcodestatus` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-check-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/account.ts` |

### album

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `album` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/replay/creators/ugc-bodies.test.ts` |
| `album_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `album_detail_dynamic` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `album_list` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/modules/input-encoding/album.ts` |
| `album_list_style` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/modules/input-encoding/album.ts` |
| `album_new` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/modules/input-encoding/album.ts` |
| `album_newest` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `album_privilege` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `album_songsaleboard` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/modules/input-encoding/album.ts` |
| `album_sub` | sub, unsub | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/collection-actions.test.ts`<br>`tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts` |
| `album_sublist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/album.ts`<br>`tests/behavior/modules/input-encoding/album.ts` |

### artist

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `artist_album` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artist_desc` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `artist_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/compat/narrowed-legacy-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `artist_detail_dynamic` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `artist_fans` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artist_follow_count` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts` |
| `artist_list` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artist_mv` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `artist_new_mv` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artist_new_song` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artist_songs` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artist_sub` | sub, unsub | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/collection-actions.test.ts`<br>`tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts` |
| `artist_sublist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artist_top_song` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `artist_video` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/artist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `artists` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/compat/narrowed-legacy-bodies.test.ts`<br>`tests/replay/discovery/recommend-bodies.test.ts`<br>`tests/replay/discovery/simi-bodies.test.ts` |
| `ugc_album_get` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts` |
| `ugc_artist_get` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts` |
| `ugc_artist_search` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `ugc_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts`<br>`tests/behavior/modules/input-encoding/artist.ts` |
| `ugc_mv_get` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts` |
| `ugc_song_get` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts` |
| `ugc_user_devote` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/artist.ts` |

### comment

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `comment` | add, delete, reply | 原样返回 | — | — | `tests/replay/activity/sheet-annual-bodies.test.ts`<br>`tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/replay/podcast/dj-bodies.test.ts` |
| `comment_album` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_dj` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-extension-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_event` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-extension-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_floor` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-extension-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_hot` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-extension-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_hug_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-extension-bodies.test.ts`<br>`tests/behavior/modules/account/account-social-policy.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts` |
| `comment_like` | like, unlike | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts` |
| `comment_music` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_mv` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_new` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-extension-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_playlist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |
| `comment_video` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/comment-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/comment.ts`<br>`tests/behavior/modules/input-encoding/comment.ts` |

### dj

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `dj_banner` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_category_excludehot` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_category_recommend` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_catelist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_detail` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_difm_all_style_channel` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_difm_channel_subscribe` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_difm_channel_unsubscribe` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_difm_playing_tracks_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_difm_subscribe_channels_get` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_hot` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_paygift` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_personalize_recommend` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_program` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_program_detail` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_program_toplist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_program_toplist_hours` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_radio_hot` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_recommend` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_recommend_type` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_sub` | sub, unsub | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_sublist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/replay/writes/write-actions-bodies.test.ts` |
| `dj_subscriber` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_today_perfered` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts`<br>`tests/behavior/modules/input-encoding/dj.ts` |
| `dj_toplist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_toplist_hours` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_toplist_newcomer` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_toplist_pay` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `dj_toplist_popular` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |
| `djRadio_top` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-subscription-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts`<br>`tests/behavior/modules/input-contracts/dj.ts` |

### library

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `cloud` | allocate, check, information, publish, songAllocate, songLookup, songUpload | 原样返回 | business, upstreamShape | uploadWork 多阶段与部分完成 | `tests/replay/creators/musician-bodies.test.ts`<br>`tests/replay/library/album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts` |
| `cloud_import` | check, import | 原样返回 | business, upstreamShape | check 读 + import 写 | `tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts`<br>`tests/behavior/modules/special-actions.test.ts` |
| `cloudsearch` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/search/search-bodies.test.ts`<br>`tests/replay/search/search-optional-results.test.ts`<br>`tests/behavior/modules/discovery/search-discovery-policy.test.ts` |
| `fm_trash` | write | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/http/server.test.ts`<br>`tests/behavior/modules/discovery/search-discovery.test.ts` |
| `history_recommend_songs` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts` |
| `history_recommend_songs_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts` |
| `like` | like, unlike | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/replay/library/collection-actions.test.ts`<br>`tests/replay/playback/playability-bodies.test.ts` |
| `likelist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `personal_fm` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/personal-fm-bodies.test.ts`<br>`tests/behavior/http/server.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts` |
| `personal_fm_mode` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/personal-fm-bodies.test.ts`<br>`tests/behavior/modules/discovery/search-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts` |
| `pl_count` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-check-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts` |
| `recent_listen_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-broadcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts` |
| `record_recent_album` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts` |
| `record_recent_dj` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts` |
| `record_recent_playlist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts` |
| `record_recent_song` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts` |
| `record_recent_video` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts` |
| `record_recent_voice` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/library.ts`<br>`tests/behavior/modules/input-encoding/library.ts` |

### misc

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `batch` | request | 原样返回 | — | — | `tests/replay/playlist/playlist-write-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts`<br>`tests/behavior/http/server.test.ts` |
| `image_upload_token` | imageAllocate | ModuleBody（本地拼装） | — | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/replay/special/special-chains.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listen_data_realtime_report` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-stats-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts`<br>`tests/behavior/modules/input-encoding/misc.ts` |
| `listen_data_report` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-stats-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts`<br>`tests/behavior/modules/input-encoding/misc.ts` |
| `listen_data_today_song` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-stats-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listen_data_total` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-stats-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts`<br>`tests/mutation/targets/membership-business.ts` |
| `listen_data_year_report` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-stats-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listentogether_accept` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listentogether_end` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listentogether_heatbeat` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listentogether_play_command` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts`<br>`tests/behavior/modules/input-encoding/misc.ts` |
| `listentogether_room_check` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/activity/listen-broadcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listentogether_room_create` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listentogether_status` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-broadcast-bodies.test.ts`<br>`tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |
| `listentogether_sync_list_command` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/account/account-social-policy.test.ts` |
| `listentogether_sync_playlist_get` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/activity/listen-broadcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/misc.ts` |

### msg-topic

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `broadcast_category_region_get` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `broadcast_channel_collect_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `broadcast_channel_currentinfo` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `broadcast_channel_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts`<br>`tests/behavior/modules/input-encoding/msg-topic.ts` |
| `broadcast_sub` | cancel, collect | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts`<br>`tests/behavior/modules/input-encoding/msg-topic.ts` |
| `hot_topic` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/social/event-topic-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `msg_comments` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/msg-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts`<br>`tests/behavior/modules/input-encoding/msg-topic.ts` |
| `msg_forwards` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/msg-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts`<br>`tests/behavior/modules/input-encoding/msg-topic.ts` |
| `msg_notices` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/msg-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts`<br>`tests/behavior/modules/input-encoding/msg-topic.ts` |
| `msg_private` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/msg-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts`<br>`tests/behavior/modules/input-encoding/msg-topic.ts` |
| `msg_private_history` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/msg-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts`<br>`tests/behavior/modules/input-encoding/msg-topic.ts` |
| `msg_recentcontact` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/msg-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `starpick_comments_summary` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/sheet-annual-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `topic_detail` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/event-topic-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `topic_detail_event_hot` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/event-topic-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |
| `topic_sublist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/social/event-topic-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/msg-topic.ts` |

### musician-signin

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `daily_signin` | request | 原样返回 | — | — | `tests/behavior/http/server.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts`<br>`tests/behavior/modules/input-encoding/musician-signin.ts` |
| `musician_cloudbean` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/musician-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts` |
| `musician_cloudbean_obtain` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/musician-signin.ts`<br>`tests/behavior/modules/input-encoding/musician-signin.ts`<br>`tests/behavior/modules/membership/membership-business.test.ts` |
| `musician_data_overview` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/musician-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts` |
| `musician_play_trend` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/musician-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts` |
| `musician_sign` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/musician-signin.ts`<br>`tests/behavior/modules/membership/membership-business.test.ts` |
| `musician_tasks` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/musician-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts` |
| `musician_tasks_new` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/musician-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts` |
| `sign_happy_info` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts` |
| `signin_progress` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/musician-signin.ts`<br>`tests/behavior/modules/input-encoding/musician-signin.ts` |

### playback-video

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `audio_match` | match | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playability-bodies.test.ts`<br>`tests/behavior/modules/audio/audio-match.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts` |
| `cloud_match` | match | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/library/library-playback.test.ts` |
| `mv_all` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `mv_detail` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts` |
| `mv_detail_info` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `mv_exclusive_rcmd` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `mv_first` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `mv_sub` | sub, unsub | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `mv_sublist` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts` |
| `mv_url` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `playmode_intelligence_list` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/personal-fm-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `video_category_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `video_detail` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts` |
| `video_detail_info` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `video_group` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `video_group_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts` |
| `video_sub` | sub, unsub | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `video_timeline_all` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `video_timeline_recommend` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |
| `video_url` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playback-video.ts`<br>`tests/behavior/modules/input-encoding/playback-video.ts` |

### playlist

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `playlist_catlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_cover_update` | imageAllocate, imageUpload, submit | decodeUpstreamBody | business, upstreamShape | uploadWork 多阶段与部分完成 | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/replay/special/special-chains.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_create` | create | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_delete` | remove | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_desc_update` | update | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/replay/playlist/playlist-summary-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts` |
| `playlist_detail_dynamic` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_detail_rcmd_get` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_highquality_tags` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_hot` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_import_name_task_create` | empty, link, local, text | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_import_task_status` | poll | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_mylike` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_name_update` | update | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_order_update` | update | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/special/input-encoding.test.ts` |
| `playlist_privacy` | update | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_subscribe` | subscribe, unsubscribe | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/replay/playlist/subscribe.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts` |
| `playlist_subscribers` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_tags_update` | update | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/special/input-encoding.test.ts` |
| `playlist_track_add` | add | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_track_all` | playlist, songs | decodeUpstreamBody | business, upstreamShape | playlist 读 + songs 批量读 | `tests/replay/library/library-bodies.test.ts`<br>`tests/replay/special/special-chains.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_track_delete` | delete | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_tracks` | fallback, manipulate | decodeUpstreamBody | business, upstreamShape | 512 fallback 第二次写请求 | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/replay/special/special-chains.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_update` | batch | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts`<br>`tests/behavior/modules/input-encoding/playlist.ts` |
| `playlist_update_playcount` | report | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |
| `playlist_video_recent` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/playlist.ts` |

### program-voice

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `mlog_music_rcmd` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/personal-fm-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/input-encoding/program-voice.ts` |
| `mlog_to_video` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/voice-mlog-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/podcast/podcast-video-policy.test.ts` |
| `mlog_url` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/voice-mlog-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/input-encoding/program-voice.ts` |
| `program_recommend` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/input-encoding/program-voice.ts` |
| `voice_delete` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/input-encoding/program-voice.ts`<br>`tests/behavior/modules/podcast/podcast-video-policy.test.ts` |
| `voice_detail` | request | 原样返回 | — | — | `tests/replay/activity/listen-broadcast-bodies.test.ts`<br>`tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts` |
| `voice_lyric` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts` |
| `voice_upload` | allocate, complete, initialize, part, preCheck, submit | 原样返回 | business, upstreamShape | uploadWork 多阶段与部分完成 | `tests/behavior/architecture/module-discovery.test.ts`<br>`tests/behavior/http/traffic.test.ts`<br>`tests/behavior/http/upload.test.ts` |
| `voicelist_detail` | request | 原样返回 | — | — | `tests/replay/video/voice-mlog-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts` |
| `voicelist_list` | request | 原样返回 | — | — | `tests/replay/activity/listen-broadcast-bodies.test.ts`<br>`tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/replay/podcast/podcast-video.test.ts` |
| `voicelist_list_search` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/input-encoding/program-voice.ts` |
| `voicelist_search` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/podcast-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/input-encoding/program-voice.ts` |
| `voicelist_trans` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/program-voice.ts`<br>`tests/behavior/modules/input-encoding/program-voice.ts`<br>`tests/behavior/modules/podcast/podcast-video.test.ts` |

### search-discovery

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `aidj_content_rcmd` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/personal-fm-bodies.test.ts`<br>`tests/behavior/modules/discovery/search-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `banner` | read, readPc | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/home-bodies.test.ts`<br>`tests/replay/podcast/dj-bodies.test.ts`<br>`tests/replay/social/comment-extension-bodies.test.ts` |
| `calendar` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/misc-read-bodies.test.ts`<br>`tests/behavior/modules/discovery/search-discovery-policy.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `homepage_block_page` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/home-bodies.test.ts`<br>`tests/replay/discovery/search-discovery.test.ts`<br>`tests/behavior/modules/discovery/search-discovery.test.ts` |
| `homepage_dragon_ball` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/home-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `personalized` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/recommend-bodies.test.ts`<br>`tests/replay/discovery/search-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `personalized_djprogram` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `personalized_mv` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/recommend-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `personalized_newsong` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/recommend-bodies.test.ts`<br>`tests/replay/discovery/search-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `personalized_privatecontent` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/recommend-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `personalized_privatecontent_list` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/recommend-bodies.test.ts`<br>`tests/replay/discovery/search-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `recommend_resource` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/recommend-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `recommend_songs` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `recommend_songs_dislike` | write | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/discovery/search-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `search` | read, voice | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/search/search-bodies.test.ts`<br>`tests/replay/search/search-optional-results.test.ts` |
| `search_default` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/search/search-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `search_hot` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/search/search-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `search_hot_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/search/search-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts` |
| `search_match` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/search/search-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts`<br>`tests/behavior/modules/input-encoding/search-discovery.ts` |
| `search_multimatch` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/search/search-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts`<br>`tests/behavior/modules/input-encoding/search-discovery.ts` |
| `search_suggest` | mobile, web | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/search/search-bodies.test.ts`<br>`tests/replay/search/search-optional-results.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts` |
| `sheet_list` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/sheet-annual-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts`<br>`tests/behavior/modules/input-encoding/search-discovery.ts` |
| `sheet_preview` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/sheet-annual-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts`<br>`tests/behavior/modules/input-encoding/search-discovery.ts` |
| `summary_annual` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/sheet-annual-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/search-discovery.ts`<br>`tests/behavior/modules/input-encoding/search-discovery.ts` |

### social

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `event` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/replay/discovery/misc-read-bodies.test.ts` |
| `event_del` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/replay/discovery/misc-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/social.ts` |
| `event_forward` | request | 原样返回 | — | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/social.ts` |
| `follow` | delfollow, follow | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/replay/social/msg-bodies.test.ts`<br>`tests/replay/social/user-social-bodies.test.ts` |
| `get_userids` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-check-bodies.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts`<br>`tests/behavior/modules/input-contracts/social.ts` |
| `hug_comment` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/social.ts`<br>`tests/behavior/modules/input-encoding/social.ts`<br>`tests/behavior/modules/special-actions.test.ts` |
| `resource_like` | like, unlike | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/write-actions-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/social.ts` |
| `send_album` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/social.ts`<br>`tests/behavior/modules/input-encoding/social.ts` |
| `send_playlist` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/social.ts`<br>`tests/behavior/modules/input-encoding/social.ts` |
| `send_song` | request | 原样返回 | — | — | `tests/replay/writes/irreversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/social.ts`<br>`tests/behavior/modules/input-encoding/social.ts` |
| `send_text` | request | 原样返回 | — | — | `tests/replay/writes/irreversible-write-bodies.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts`<br>`tests/behavior/modules/input-contracts/social.ts` |
| `share_resource` | request | 原样返回 | — | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/social.ts`<br>`tests/behavior/modules/input-encoding/social.ts` |

### song-lyric

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `check_music` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playability-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `lyric` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/creators/ugc-bodies.test.ts`<br>`tests/replay/playback/lyric-bodies.test.ts`<br>`tests/replay/playback/playback-bodies.test.ts` |
| `lyric_new` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playback-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/library/library-playback.test.ts` |
| `music_first_listen_info` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/record-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `scrobble` | play, start | decodeUpstreamBody | business, upstreamShape | start + play 两次写 | `tests/replay/playback/playback-bodies.test.ts`<br>`tests/replay/special/special-chains.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_chorus` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/lyric-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/behavior/architecture/module-discovery.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_downlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-collection-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_download_url` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/song-url-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_download_url_v1` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playback-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_dynamic_cover` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playability-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_like_check` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playability-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_lyrics_mark` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/lyric-bodies.test.ts`<br>`tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_lyrics_mark_add` | add | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_lyrics_mark_del` | delete | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_lyrics_mark_user_page` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/lyric-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_monthdownlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-collection-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_music_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/lyric-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_order_update` | update | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playlist/playlist-edit-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/special/input-encoding.test.ts` |
| `song_purchased` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-collection-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_red_count` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playability-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_singledownlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-collection-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_url` | read | decodeUpstreamBody | business, upstreamShape | 手工 data 数组校验与合成 code 200 | `tests/replay/playback/song-url-bodies.test.ts`<br>`tests/behavior/http/server.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |
| `song_url_v1` | read, sky | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/playback-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts`<br>`tests/behavior/modules/input-encoding/song-lyric.ts` |
| `song_wiki_summary` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/playback/lyric-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/song-lyric.ts` |

### toplist-style

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `digitalAlbum_detail` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `digitalAlbum_ordering` | request | 原样返回 | — | — | `tests/replay/writes/irreversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `digitalAlbum_purchased` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `digitalAlbum_sales` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/replay/membership/membership-business.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `related_allvideo` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/video-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `related_playlist` | page | 原样返回 | business, upstreamShape | — | `tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/playlist/related.test.ts`<br>`tests/behavior/modules/special/special-chains.test.ts` |
| `simi_artist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/simi-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `simi_mv` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/simi-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `simi_playlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/simi-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `simi_song` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/simi-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `simi_user` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/simi-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `style_album` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/style-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `style_artist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/style-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `style_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/style-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `style_list` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/style-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `style_playlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/style-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `style_preference` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/misc-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `style_song` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/discovery/style-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `top_album` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `top_artists` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `top_list` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/behavior/modules/discovery/search-discovery-policy.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `top_mv` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/mv-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `top_playlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/search-discovery.test.ts`<br>`tests/replay/playlist/playlist-list-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |
| `top_playlist_highquality` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `top_song` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `toplist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/replay/podcast/dj-program-bodies.test.ts`<br>`tests/replay/podcast/dj-subscription-bodies.test.ts` |
| `toplist_artist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts`<br>`tests/behavior/modules/input-encoding/toplist-style.ts` |
| `toplist_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/toplist-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/toplist-style.ts` |

### user

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `user_account` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_audio` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/video/voice-mlog-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `user_binding` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/user-account-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_cloud` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/user-account-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_cloud_del` | delete | 原样返回 | — | — | `tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_cloud_detail` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/account-social.test.ts`<br>`tests/replay/account/user-account-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_comment_history` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/user-social-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_detail` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/login-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/sdk/module-api.test.ts` |
| `user_dj` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/user-social-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_event` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/activity/listen-together-bodies.test.ts`<br>`tests/replay/social/user-social-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_follow_mixed` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/user-social-bodies.test.ts`<br>`tests/behavior/modules/account/account-social.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_followeds` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/user-social-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_follows` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/user-social-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_level` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/user-account-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/sdk/module-api.test.ts` |
| `user_medal` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/user-account-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_mutualfollow_get` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/social/user-social-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_playlist` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-bodies.test.ts`<br>`tests/replay/playlist/playlist-summary-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_playlist_collect` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-collection-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_playlist_create` | read | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/library/library-collection-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_record` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/compat/narrowed-legacy-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_replacephone` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |
| `user_social_status` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/user-account-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_social_status_edit` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/misc-read-bodies.test.ts`<br>`tests/replay/writes/reversible-write-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_social_status_rcmd` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/misc-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_social_status_support` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/discovery/misc-read-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts` |
| `user_subcount` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/account/user-account-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/sdk/module-decoders.test.ts` |
| `user_update` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/user.ts`<br>`tests/behavior/modules/input-encoding/user.ts` |

### vip-yunbei

| 模块 | 动作 | 返回体校验 | 额外来源 | 特有分支 | 证据 |
| --- | --- | --- | --- | --- | --- |
| `vip_growthpoint` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts` |
| `vip_growthpoint_details` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts` |
| `vip_growthpoint_get` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts`<br>`tests/behavior/modules/membership/membership-business-policy.test.ts` |
| `vip_info` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/compat/narrowed-legacy-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts` |
| `vip_info_v2` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/compat/narrowed-legacy-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts` |
| `vip_tasks` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts` |
| `vip_timemachine` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/digital-album-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts` |
| `yunbei` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts` |
| `yunbei_expense` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts`<br>`tests/behavior/modules/membership/membership-business.test.ts` |
| `yunbei_info` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts` |
| `yunbei_rcmd_song` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts`<br>`tests/behavior/modules/membership/membership-business.test.ts` |
| `yunbei_rcmd_song_history` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts` |
| `yunbei_receipt` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts`<br>`tests/behavior/modules/membership/membership-business.test.ts` |
| `yunbei_sign` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/membership/membership-business.test.ts` |
| `yunbei_task_finish` | request | 原样返回 | — | — | `tests/behavior/modules/input-contracts/vip-yunbei.ts`<br>`tests/behavior/modules/input-encoding/vip-yunbei.ts`<br>`tests/behavior/modules/membership/membership-business.test.ts` |
| `yunbei_tasks` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts` |
| `yunbei_tasks_todo` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts` |
| `yunbei_today` | request | decodeUpstreamBody | business, upstreamShape | — | `tests/replay/commerce/vip-status-bodies.test.ts`<br>`tests/behavior/modules/input-contracts/vip-yunbei.ts` |

