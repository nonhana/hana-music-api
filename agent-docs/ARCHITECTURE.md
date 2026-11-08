# 架构边界

在修改核心请求链路、运行时服务、HTTP 层、模块加载或共享状态前阅读本文件。

## 目录职责

- `index.ts`：唯一公开 SDK 入口，只组合公开导出。
- `src/browser/watchman.ts`：独立的浏览器 Watchman 子路径，不依赖业务 SDK 或核心请求链；页面状态与证据边界见 ADR-0003。
- `src/app/`：CLI 启动、服务启动和匿名配置生成。
- `src/server/`：Hono 应用、路由、准入、Cookie/body 解析、模块发现和文档服务。
- `src/core/`：Effect 请求内核、加密、目标策略、transport、运行时、缓存和身份状态。
- `src/modules/`：每个网易云端点一个模块，负责业务输入和请求意图。
- `src/sdk/`：Promise SDK runtime，以及由模块生成的 client、registry 和具名 API 文件。
- `src/plugins/`：上传等可组合能力；`src/types/`：共享公开类型和内部合同。
- `tests/`：分层测试；`website/`：面向使用者的 VitePress 文档；`docs/`：agent 与 domain 文档；`_notes/`：历史报告和验收证据。

## 唯一执行链路

公开入口先解码业务输入并建立不可变 `Call`，冻结配置、Cookie、身份指纹和总期限。模块将输入编译为 `RequestIntent`，再通过 `RequestCapability` 进入唯一的 `RequestEffect`；目标检查、协议准备、重试、期限、transport、完整正文消费和响应解释都在这条链路中完成。

已迁移模块导出本地 `moduleActions`，逐动作声明 profile、目标或动态路径边界、语义、缓存和重试资格。生成的 SDK registry 和 HTTP loader 读取同一份声明，`runCall` 校验后将其冻结到 `Call.actions`；请求层只执行本模块声明过的动作，并核对规范化路径与最终 URL。profile 决定协议、域名、UA、身份 Cookie 字段和协议选项，token 由协议准备统一编码，会话仍来自本次 Call。操作声明优先于旧模块名缓存白名单，写动作不共享、不缓存、不重放。

当前已迁移339个模块：playlist_subscribe、album_sub、artist_sub、四个共享读取 search、lyric、song_detail、playlist_detail，以及 #110 的77个曲库与播放模块、#111 的55个搜索与发现模块、#112 的83个账号与社交模块、#113 的67个播客、视频与音频模块和 #114 的50个会员、云贝、音乐人与其他业务模块。三类收藏/取消使用 web；歌曲详情使用 web，其余三个读取保留 eapi。所有 SDK 模块统一接受可选 checkToken，不按模块或动作分类。带 token 调用绕过 ReadStore，禁自动重试；provider 每个 API 请求独立取值，固定字符串在一次模块调用中只允许一次 API 请求，后续需求明确失败；纯本地/外部上传不取值。未配置 token 时保留声明的 shared cache/read retry 和独立等待者合同。

#110 的38个 weapi 动作模块采用 weapiPc，保留浏览器 UA 与 PC Cookie 的既有组合；39个 eapi 模块复用 eapi。全部声明 cache=none，按原上限分别使用 never/connect/read，不扩共享读取。导入四分支、红心/取消、sky 音质及动态路径都在本地动作合同中表达；local 导入和 batch 更新各发一次请求。完整基线与证据选择见 [issue-110](../docs/acceptance/issue-110.md)。

`generatedPendingActionModuleIdentifiers` 枚举其余 13 个模块，它们沿同一执行链获得通用 token 能力，尚不计为 profile 迁移通过。P12 删除可选声明、旧默认协议和旧策略路径；本票不提前移除全部公开配置。决策与证据边界见 [ADR-0001](../docs/adr/0001-request-actions-and-profiles.md)。

Effect 只用于内部实现。公开 SDK、模块函数、`invokeModule` 和 `createRequest` 仍返回 Promise；内部组合和 transport 不自行调用 `Effect.runPromise`。公开边界统一由 `src/core/runtime.ts` 负责执行和错误映射。

## 服务与共享状态

- `ProcessServices` 只提供运行时状态读取，供模块调用准备身份时使用；请求内核 `requestEffect` 只依赖 `Call`。
- 每个 client、HTTP 服务实例和程序化 API 实例拥有自己的 `ReadStore`；共享读取只共享上游执行，等待者仍各自拥有取消和期限。
- `ReadStore` 用一个原子状态决策处理缓存命中、在飞任务合并和任务清理。
- SDK 不在本地限制出口请求频率，也不在收到上游限频后冷却身份或域名；调用方自己控制频率。只有 HTTP 服务按来访 IP 和模块容量做入口准入（`src/server/admission.ts`），多进程不会共享这份内存状态，需要在可信反向代理层补充共享限流。
- SDK 入口和 `src/core/` 在加载和调用时不读写本地文件，以便在 Serverless 函数里运行：版本号由构建内联 `package.json`，运行时状态只在内存；匿名令牌文件只由 `src/app/` 的 CLI 读写。`tests/package/release.test.ts` 用单文件打包产物守住这一点。

## 依赖方向

Hono 只属于 `src/server/`。`src/core/` 必须能够脱离 Hono 测试；模块不得直接调用 `fetch`，也不得启动第二套 Promise 请求执行器。请求 target、协议、方法和语义由 `RequestIntent` 表达，transport 是唯一上游发送位置，并拒绝未经允许的重定向。

上传按阶段执行；已经完成的上游写入不能回滚，失败时由模块报告部分完成阶段。自定义 fetcher 必须遵守传入的 `AbortSignal`，库只能保证自身资源会释放。

重构背景与验收证据见 `_notes/effect-refactor/final-report.md` 和 `website/guide/request-layer-overview.md`。

内部实例装配见 [ADR-0002](../docs/adr/0002-testing-runtime-and-evidence.md)。`buildCallServices(config, initializeAnonymous, execution)` 的第三个参数只供内部装配；Call 保存冻结依赖，公开 fetcher 与显式 Clock 保持优先。SDK 内部 client factory 由生成器产出且不从根导出；HTTP 的 runtimeOptions 不从请求输入读取。测试仍执行同一请求链。

#111 的55模块声明56个请求动作，复用39个weapiPc和16个eapi组合；search_suggest的mobile/web分别固定目标，top_list的idx本地拒绝零请求。全部cache=none；FM垃圾桶与推荐不感兴趣write/never，连续推荐与首页刷新read/never，其他读取不扩大原重试上限。源码/离线材料不证明推荐流是否持久推进上游状态。没有新增产品共享接缝，完整清单和证据边界见 [issue-111](../docs/acceptance/issue-111.md)。

#112 的83模块声明89动作，46个weapiPc、37个eapi，保持原协议/身份与业务返回。验证码/密码、评论/点赞/关注的有限路径分别声明，动态资源路径按规范化目录约束；消息/会话/刷新读取采用保守never重试，不扩大共享。SDK不自动保存登录Cookie；隐式匿名初始化的内存更新保持，业务token不被初始化消耗。详见[issue-112](../docs/acceptance/issue-112.md)。

## P9：播客、视频与音频

固定基线fa40cad6的67模块采用44个weapiPc和23个eapi，独立解码370分支后复用现有profile；71动作明确广播收藏/取消与DJ/MV/视频订阅分支，user_dj保留动态目录边界。没有新增profile或执行器，voice_upload仍归P11。全部cache=none；声音删除和声音列表排序是write/never，时间线、分组视频、个性推荐、今日优选、DIFM播放列表和mlog推荐保守read/never，材料不能证明上游持久推进。广播收藏列表和DIFM已收藏频道列表保持原never上限，其余读取只保留connect。currentinfo查询频道快照，mlog_to_video查询对应ID，均不因名称推成poll或write。155份历史返回逐份回放与最终请求证据独立，缺失工作台成功样本不猜Schema。[完整依据](../docs/acceptance/issue-113.md)。

## P10：会员、云贝、音乐人与其他业务

固定基线06f1791的50模块采用36个weapiPc和14个eapi，240个最终请求分支独立解码后复用现有profile，声明50动作。batch无论封装多少子操作都只发送一次/api/batch，保守write/none/never；summary_annual按年度拼接userdata/data，并限制到/api/activity/summary/annual/目录。daily_signin保留特殊HTTP路由/daily_signin，digitalAlbum_*保留大小写入口。没有新增profile或执行器。

下单、签到、任务/成长值/云豆领取与云贝推歌均write/never。听歌报告查询、签到活动信息和云贝收入/支出明细是读取，因旧URI策略禁止重试而继续never；其他读取只保留connect，全部不共享或缓存。统计、历史、年度和乐谱只迁移声明，不改变Schema或业务含义。102份历史返回逐份回放与请求对照分开；十个无录制模块及数字专辑下单缺成功样本如实保留，不执行付费或真实账号操作。[完整依据](../docs/acceptance/issue-114.md)。
