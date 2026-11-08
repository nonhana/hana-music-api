# ADR-0001：请求动作与客户端身份分别声明

状态：已采用，适用于 [#105](https://github.com/nonhana/hana-music-api/issues/105)、[#106](https://github.com/nonhana/hana-music-api/issues/106) 、[#109](https://github.com/nonhana/hana-music-api/issues/109) 、[#110](https://github.com/nonhana/hana-music-api/issues/110) 、[#111](https://github.com/nonhana/hana-music-api/issues/111) 、[#112](https://github.com/nonhana/hana-music-api/issues/112) 和 [#113](https://github.com/nonhana/hana-music-api/issues/113) 的动作迁移。

## 原因与决定

模块原来能分别指定协议、域名、UA 和 Cookie，歌单收藏还需要改写 Call 才能形成网页请求。现在由 profile 统一决定这些客户端身份字段、加密响应等协议选项；模块按动作声明业务语义、缓存和重试资格，checkToken 是通用可选调用配置，位置由协议准备统一决定。profile 不保存 MUSIC_U、MUSIC_A 等会话，它们继续来自每次调用的不可变身份快照。

模块导出的 `moduleActions` 同时进入生成的 SDK registry 与 HTTP 动态 loader，调用时复制并冻结，避免等待 token 时声明被改动。动作可以使用固定 API 路径或有边界的动态路径；请求层按 URL 的规范化结果检查边界，再核对最终 URL。纯本地模块用空动作集，多请求模块逐动作声明。

保留 SDK/HTTP → runCall → 模块 → RequestCapability/RequestIntent → requestEffect → prepareRequest → transport 这条执行链。token 在请求层按次读取，不缓存、不重放，不进入 URL、Cookie 或事件日志；provider 等待属于本次期限。写动作绕过 ReadStore，无论模块名是否落在旧读取白名单中，都不合并、不缓存、不自动重试。

## 首条合同与证据

`playlist_subscribe` 的收藏和取消都使用 web：weapi、music.163.com、浏览器 UA、os=web，e_r=false，不接受 x-aeapi。appver、channel、osver、clientSign、buildver、mobilename、versioncode、resolution、brand、mode 及其大小写变体不进入网页请求；其余 Cookie 按调用快照保留，原有设备与网页 Cookie 的生成规则继续适用。

所有 SDK 模块的收藏、取消和读取均可配置字符串/provider：没配置不取值、不附加，配置失败或为空在发送前失败；动作不声明 token 需求。正文 checkToken 与 HTTP 头 X-antiCheatToken 使用同一个值。HTTP 通用执行配置继续拒绝 checkToken。

协议、目标和 token 位置依据 [#77 的官方现代 web player 调查](https://github.com/nonhana/hana-music-api/issues/77#issuecomment-6238560685) 与 [PR #78](https://github.com/nonhana/hana-music-api/pull/78)。本次以本地 fetcher 检查最终请求并解密测试正文；旧响应录制保持原来源，不作为本次真实上游或完整浏览器 Cookie 抓包证据。

## 兼容边界与过渡删除条件

保留 Promise、id/t 业务参数、status/body/cookie 外壳、返回体 Schema 和用户会话。普通配置不能再覆盖本模块的受控身份字段；这延续收藏模块原来强制网页请求的约定。本次不删除其他模块的公开配置字段；P12 删除公开字段时使用 major changeset，并保留显式低层 createRequest 及其目标和凭据外送校验。

当前已迁移289个模块：playlist_subscribe、album_sub、artist_sub、search、lyric、song_detail、playlist_detail 与 #110 的77个模块、#111 的55个模块、#112 的83个模块和 #113 的67个模块。其余 63 个模块由生成的 generatedPendingActionModuleIdentifiers 完整枚举；该清单只说明迁移范围，不代表所有模块已通过 profile 验收。旧默认协议、模块名缓存名单和 URI 语义判定仅供这些未迁移模块沿原执行链使用。P2、P5 及各领域批次完成后，P12 必须删除可选动作声明分支和旧判定，装配时要求每个模块声明所有实际动作；纯本地模块也不能省略空声明。

## P2：四个共享读取

search 的普通/语音分支分别声明固定目标，lyric、song_detail、playlist_detail 各声明一个动作；五个动作均为 read、cache shared、retry read。只有操作明确声明资格才进入 ReadStore，不能只凭 read 语义获得缓存或扩大重试。Call 的键继续包含动作合同、有效输入、不可变身份、配置及实际 transport 引用；ReadStore 不重写，等待者自己的期限和取消仍包住完整正文消费。

search、lyric、playlist_detail 使用 eapi profile，固定 interface.music.163.com、eapi、既有默认 UA、PC 的 os/appver/channel/osver、e_r=false 和不声明 x-aeapi。来源是基线 eb8f861 的模块、config.ts 与 request-plan.ts：默认确实组合 PC 字段和既有 iPhone UA，这里将既有组合显式列出，没有将其宣称为官方 PC 客户端，也没有构造新的仿官方身份。它是有明确范围和理由的协议例外：P2 无新增官方请求证据，因此不切换这三个接口到 weapi。未来更换协议或身份组合需要单独的上游证据；本次本地解密和严格 fake 只证明声明实际执行，旧响应录制仍只证明响应兼容。

song_detail 保留原 weapi 目标并采用已有完整 web 身份。普通配置不能覆盖这五个动作的协议、域名、UA 或协议选项，会话、设备、实际 fetcher 和期限继续来自 Call。由于四个读取原来允许这些覆盖，本次用 major changeset 记录运行时兼容变化；P12 再统一删除公开配置字段，低层 createRequest 不受影响。

## P5：通用 token 与专辑/歌手

checkToken 不再属于动作合同，未迁移模块也沿原链路获得同一可选能力。带 token 调用不进入 ReadStore，也不自动重试；provider 每个 API 请求重新取值，不共享结果或 Promise。固定字符串只允许同一模块调用的一次 API 请求，再次需要时发送前明确失败；调用者在不同调用中显式提供的值按当次输入处理。纯本地模块与外部 plain 上传不取值，外部上传不带 token 或网易云会话。

weapi 的正文 checkToken 与 HTTP X-antiCheatToken 同值；eapi 同时写入加密 header.X-antiCheatToken，生成 Cookie 后才向加密头加 token，避免凭据外送。两者依据 #77 的既有调查。api 在表单、linuxapi 在加密转发 params 传值，并设置 HTTP 头；这是统一编码规则，无对应官方抓包或接受保证。已批准网易云 plain 请求仅在 HTTP 头传值；外部 NOS 不取值。token 自身触发安全 API 目标约束，不依赖账号 Cookie。模块输入和头的 token 清理不影响低层 createRequest 的原始正文/头合同。请求事件及传输/解码错误隐藏当前 token，provider 原始异常不外露。

album_sub/artist_sub 分别声明 sub/unsub，固定 web、write、cache none、retry never。原协议和地址不变，但旧默认 Cookie 的 os=pc、appver/channel/osver 改为 os=web 并清除桌面字段，不能称为等价迁移。真实兼容与账号恢复按 issue-109 的 AC-13 独立验收，离线请求/响应证据不代替它。历史 #105/#107 按旧 token 合同通过的记录保留来源，当前策略按本票重新验收。

## P6：曲库与播放保持现有协议和身份组合

固定基线 c2c8fa1 中，本批38个 weapi 模块实际使用浏览器 UA 和默认 PC Cookie，另39个模块是 eapi 与既有默认身份组合。因此新增 weapiPc profile，复用 OS_PROFILES.pc 和既有 weapi UA；不套用会清除桌面字段的 web。沿用 eapi profile，两个组合都固定 e_r=false、无 x-aeapi，会话与设备按 Call 传递。基线不是官方客户端身份声明；默认组合保持，普通覆盖不再生效，用 major changeset 说明。唯一共享产品接缝是 profile registry 新增一项，没有改请求内核或低层 createRequest。

77模块本地声明82个动作：红心/取消、导入 local/text/link/empty 和 sky/普通播放分别显式选择；其他数据分支复用同一动作并逐分支验收。动态路径给出规范化 prefix 边界。local 元数据导入仍创建上游任务，batch 更新仍是一请求内的三个子操作；本批没有纯本地或多请求模块。

全部 cache=none。八个列表/查询读取虽然旧 URI 策略误标为写或上传，迁移后仍 retry=never，避免扩大上游自动重放；三条原来允许显式读取重试的 URI 保留 read，其余读取 connect，写与导入轮询 never。语义来自实际动作，不能从命名推断或让 read 自动授予共享资格。

基线默认请求经最终编排和独立解码保存122份离线对照；候选另从生成 client/HTTP loader 验证。历史原始响应继续单独回放，云盘删除没有录制，合成样本只守返回与流量合同；不改 Schema，不把离线结果称为网易云当前可用。完整清单、来源和边界见 [验收依据](../acceptance/issue-110.md)。

## P7：搜索、推荐与发现

固定基线cb4bcae的55模块实际采用39个weapi浏览器UA加PC Cookie、16个eapi既有组合，均与现有weapiPc/eapi相符，因此复用，不新增profile或执行链。56个请求动作逐一声明，search_suggest将原有限路径拼接改为mobile/web两个固定目标；top_list的idx本地拒绝保持。

全部cache=none，FM垃圾桶和推荐不感兴趣是write/never；FM两模块、私人DJ、首页刷新保守采用read/never，收紧原连接前重试，避免连续推荐流重放。现有源码和历史响应无法证明其是否持久推进上游状态，不能将此推测写成已验证写入；mode/subMode是请求输入。五个搜索模块保留原read重试，其余只读connect。请求144分支的独立解码与150份历史响应的固定基线返回对照分别取证，来源保持，详见 [issue-111](../acceptance/issue-111.md)。

## P8：账号、登录与社交

固定基线11f7b81的83模块使用46个weapiPc和37个eapi默认组合，逐267份离线最终请求独立解码后复用现有profile，没有新产品接缝。89动作显式声明验证码/密码、评论add/delete/reply、点赞/取消和关注/取关；动态资源路径保留目录边界。本票无纯本地或单调用多请求模块，verify_getQr仍在一次上游后本地生成二维码。

全部cache=none。登录/凭据变更用login、风控和一起听检查用poll或login、心跳/命令/社交写入用write，均never。消息读取可能触及已读、会话和访问者状态、强制刷新以及带提醒的读取采用read/never，避免重放；材料不能证明上游持久副作用，不把推测写成事实。user_follow_mixed业务为读取但旧URI策略判write，保留never上限。其余无状态读取只保留connect，无新增共享或读取重试。

会话来自每次Call，profile不保存账号凭据；登录/刷新/退出返回Cookie而不自动更新全局Cookie jar。隐式匿名初始化的状态更新及失败不污染、初始化不消费业务token保持既有合同。149份原录制逐份回放独立于请求证据，旧login_qr_key/login_status包含SDK包装时按既有测试提取data；不改原文件或来源。#38的8821仍无真实样本，保留原拒绝处理，不推测Schema。[完整依据](../acceptance/issue-112.md)。

## P9：播客、视频与音频

固定基线fa40cad6的67模块采用44个weapiPc和23个eapi，独立解码370分支后复用现有profile；71动作明确广播收藏/取消与DJ/MV/视频订阅分支，user_dj保留动态目录边界。没有新增profile或执行器，voice_upload仍归P11。全部cache=none；声音删除和声音列表排序是write/never，时间线、分组视频、个性推荐、今日优选、DIFM播放列表和mlog推荐保守read/never，材料不能证明上游持久推进。广播收藏列表和DIFM已收藏频道列表保持原never上限，其余读取只保留connect。currentinfo查询频道快照，mlog_to_video查询对应ID，均不因名称推成poll或write。155份历史返回逐份回放与最终请求证据独立，缺失工作台成功样本不猜Schema。[完整依据](../acceptance/issue-113.md)。
