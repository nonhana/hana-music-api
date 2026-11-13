# 公共 API

在修改 `index.ts`、SDK runtime、生成的 client、包导出映射或兼容性行为前阅读本文件。

## 发布边界

`package.json` 的 `exports` 开放根入口 `.` 和独立的 `./watchman`。根类型和运行时代码指向 `dist/index.d.ts` 与 `dist/index.js`；浏览器子路径指向 `dist/watchman.d.ts` 与 `dist/watchman.js`，公开 `initializeWatchman`、`WatchmanError` 与配套类型，不从根入口转导出。`files` 只发布 `dist/`。下游不得依赖 `src/`、`src/server/` 或生成文件的内部路径。

Watchman 实现使用独立的完整 DOM 类型环境，公开声明仍不要求 DOM 或 Node 类型。同一 tarball 的子路径声明须在 `lib=ES2022/types=[]` 和完整 DOM 两种严格消费者中通过；前者不得因导入声明而获得 window/document，后者不得获得 Bun/Node 全局。构建须只写入约定产物目录，不向源码或类型用例目录发射文件。

根入口同时公开独立的 `ModuleCallConfig` 和 `CreateRequestOptions` 类型。根入口公开 `createHanaMusicApi`、生成的 camelCase 模块函数、`invokeModule`、`createRequest`、`createOption`、`generateDeviceId` 及其支持类型，以及收窄过返回体的模块的 `<模块名>Body` 结构定义和类型（由 `src/sdk/generated/bodies.generated.ts` 生成）。失败契约另公开 `NcmApiFailure`、`NcmFailureInfo`、`isNcmApiResponse` 和 `getNcmFailureInfo`；内部错误类、Effect 和 Layer 不导出。`startServer`、`createServer`、匿名配置生成和模块加载等服务内部能力不属于根 SDK 导出。

## 失败契约

所有公开入口（client、具名函数、`invokeModule`、`createRequest`）的拒绝对象仍是 `{ status, body, cookie }`，被拒绝时顶层另带可序列化的 `failure`，类型是 `NcmApiFailure`。成功响应不增加 `failure`；HTTP 响应只写 `body`，不暴露元数据。

`failure.kind` 固定为八类：`business`、`rateLimited`、`upstreamShape`、`timeout`、`cancelled`、`invalidRequest`、`transport`、`unknown`。分类在 `normalizeFailure` 的唯一边界产生：业务码以正文中确认的数字 code 为事实，不看 HTTP 状态补猜；plain 上传等非 2xx 是 `transport`；`ModuleInvariantFailed` 是 `unknown`。`partialCompletion`/`completedStages` 保持，分类不承诺可重试。

`isNcmApiResponse(value)` 只做结构守卫：非数组对象、`status` 有限数值、`cookie` 为字符串数组且存在 `body`。`getNcmFailureInfo(value)` 对合法新失败返回判别联合，对普通 Error、成功响应、无元数据的历史响应或无效元数据返回 `undefined`，不抛异常，也不判断业务成功。调用者应使用这两个根导出，不再手写键存在检查。

兼容影响：旧的三字段读取方式不变；新增顶层字段会影响按对象形状严格比较拒绝结果的消费者，发布前由 changeset 说明。实现依据见 [ADR-0004](../docs/adr/0004-public-failure-classification.md)。

## 调用形状

- `createHanaMusicApi(config)` 创建可连续调用的 client。
- 具名模块函数适合按需调用单个端点。
- `invokeModule(identifier, query, config)` 适合模块名来自运行时的场景。
- `createRequest(target, data, options)` 是公开的底层请求原语。

以上入口都返回 Promise；响应继续保持 `{ status, body, cookie }` 外壳。Effect、Hono、`Layer` 和内部错误类型不穿过公开边界。

query 只承载端点业务输入，config 承载 Cookie、代理、fetcher、重试、期限、取消和运行时状态。SDK 的 `fetcher` 必须兼容标准 fetch 签名并遵守 `AbortSignal`；请求总期限包含重试等待和完整正文读取。

所有程序化 SDK 模块统一接受可选 `checkToken` 字符串或异步 provider，读取、收藏和取消均按调用者配置处理，不按动作判定必填或禁用。未配置不取值、不附加，也不因缺 token 在本地拒绝；已配置却失败或为空在发送前失败。token 值必须能原样写入 HTTP 头，首尾空白或非法头字符在发送前以 400 拒绝，避免正文与头不一致。provider 等待计入总期限，取消/超时后不再发送；独立调用及同一次多请求调用逐次取值。带 token 调用不缓存、不合并、不自动重试；固定字符串在同一模块调用只允许一次 API 请求，第二次需求以 400 拒绝，改用 provider 可逐请求提供新值。纯本地和外部 plain 上传不取值、不发送 token。HTTP 仍拒绝通用 checkToken 配置，显式低层 createRequest 不新增模块 token 参数。

playlistSubscribe、albumSub、artistSub 固定 web：weapi、music.163.com、浏览器 UA、os=web，清除受控桌面/移动端 Cookie 字段并保留会话，普通配置不能覆盖身份。专辑/歌手此前默认 Cookie 含 PC 身份字段，此次改为 web 是兼容变化。四个共享读取的原 profile 保持：search、lyric、playlistDetail 为 eapi，songDetail 为 web/weapi；无 token 时缓存、重试、等待者期限/取消保持。公开配置字段已在 #116 移除，相关兼容变化用 major changeset 记录。

#110 的77个曲库与播放模块也固定各自的基线请求身份：38个使用 weapiPc（weapi、浏览器 UA、PC Cookie），39个使用既有 eapi。普通 config 的 crypto、domain、ua、e_r、acceptGzip 和受控身份 Cookie 不再覆盖声明；MUSIC_U/MUSIC_A、__csrf 与设备仍随本次调用传递。默认请求组合、业务输入与返回体保持；需要显式协议控制时使用低层 createRequest。本批不新增共享读取或重试资格，详见 [迁移依据](../docs/acceptance/issue-110.md)。

协议准备统一放置 token：weapi 加密正文 checkToken 与 HTTP X-antiCheatToken；eapi 另将同值放入加密 header.X-antiCheatToken，Cookie 不含 token；api 表单和 linuxapi 加密 params 按各自正文容器携带，并设置 HTTP 头。已批准网易云 plain 请求只在 HTTP 头传值，不改 URL 或原始正文；外部上传不取值、不携带。token 自身属于凭据，即使没有账号 Cookie 也只能送往安全 API/已批准特殊目标。编码合同不承诺任意接口接受任意 token。根 SDK 不加载 Watchman，调用者主动取值并转交。

## 兼容性规则

- 模块输入类型由模块本地 `ModuleInput` 生成，公共类型表由 `types:modules:generate` 维护。全部模块使用具体业务结构；`LegacyModuleInput` 和根入口的 `LegacyModule*` 类型已删除。调用者传编号数组、对象、布尔和枚举，SDK 负责逗号串、JSON 串和分号串编码；旧协议输入在发送前以 400 拒绝。这是 major 兼容变化。
- 未确认的上游响应字段保持未知 JSON；调用者只能依赖模块已经验证的字段。结构定义对外只承诺 Standard Schema 的 `~standard.validate` 和推导出的类型，它们同时是 Effect Schema 这一点不在兼容承诺内。
- 公开包的 ESM 根入口、Promise 返回形式、`status/body/cookie` 响应外壳和 legacy Cookie 行为属于兼容性合同。拒绝对象新增的顶层 `failure` 是可序列化附加事实，不改写原有三字段；严格比较拒绝对象形状的消费者需要按 changeset 调整。
- 修改公开导出后，必须通过 `bun run test:sdk-contract`、`bun run verify:sdk` 和 `bun run build:check`。

使用说明见 `website/guide/programmatic-api.md`、`website/guide/create-request-and-create-option.md` 和 `website/guide/sdk-package-contract.md`。

#111 的55个搜索、推荐与发现模块同样固定各自基线身份：39个weapiPc、16个eapi。普通覆盖收口属于major兼容变化，业务输入、响应Schema和低层createRequest保持。FM、私人DJ和首页刷新不再自动重试连接前失败；不新增缓存或共享。详见 [issue-111](../docs/acceptance/issue-111.md)。

#112 的83个账号、登录与社交模块固定基线身份（46个weapiPc、37个eapi），普通配置覆盖收口按major说明；输入、响应Schema与Cookie外壳保持。消息读取、会话探测、风控/轮询和刷新不自动重放或共享。SDK返回Set-Cookie，由调用者选择后续会话，不自动建立跨调用登录Cookie jar；HTTP仍按请求来源优先级选择Cookie并写回响应属性。低层createRequest保持，详见[issue-112](../docs/acceptance/issue-112.md)。

#113 的67个播客、视频与音频模块固定原默认身份（44个weapiPc、23个eapi）；普通协议/身份覆盖收口属于major兼容变化。输入、返回Schema、Promise和Cookie外壳保持；低层createRequest继续提供显式请求控制。全部不共享或缓存；声音排序/删除和订阅取消不自动重放，时间线及连续推荐采用保守never。详见[issue-113](../docs/acceptance/issue-113.md)。

#114 的50个会员、云贝、音乐人与其他业务模块固定原默认身份（36个weapiPc、14个eapi）。普通协议/身份覆盖收口属于major兼容变化；业务输入、返回Schema、Promise与Cookie外壳保持，低层createRequest继续接受显式配置。下单、签到、领取、云贝推歌与batch不自动重放；报告、签到活动信息及云贝收入/支出查询保持原never上限。全部不新增缓存或共享，详见[issue-114](../docs/acceptance/issue-114.md)。

#115 的13个特殊模块也固定原默认协议、目标与身份，普通覆盖收口属于major兼容变化。图片与声音上传的plain阶段发送原始字节，不带网易云会话或checkToken；API阶段继续逐次provider，固定字符串第二次API发送前失败。两个本地模块不取token。业务输入、返回Schema和低层createRequest保持。[阶段清单](../docs/acceptance/issue-115.md)列出完整依据。

#122明确批准上述各历史批次的身份变化：state.deviceId优先于旧Cookie.deviceId，再用匿名/运行时兜底，调用者负责设备与会话保存；有效值不含空白或控制字符。现有EAPI采用iPhone字段，原weapiPc浏览器动作使用web，clientlog使用自洽macOS组合，原协议和返回体保持。普通配置不能污染受控平台；低层createRequest的显式原始选项保留。详见[全动作迁移](../docs/acceptance/issue-122-actions.md)，通用旧类型已由#116收口。

#116 的 `ModuleCallConfig` 与低层 `CreateRequestOptions` 独立。普通模块只接受 cookie、代理/fetcher、ip/realIP、state、期限/取消、连接/事件、受动作限制的retry和可选checkToken。crypto、ua、domain、e_r、acceptGzip、headers、顶层deviceId与未知键（即使值undefined）在运行时拒绝，不能放query；client无效默认配置抛TypeError，调用拒绝status400。设备迁移到state.deviceId，头Cookie迁移到cookie。createOption只供createRequest，低层默认eapi并保留原始选项/目标安全；没有动作语义的原始请求不自动重放。内部动态程序入口也采用query/config分离；装配与发现强制有效动作，本地必须空集。此为major，见[配置迁移表](../website/guide/config-reference.md)。

请求数据流收敛保留上述根 Promise API。内部自定义模块改用绑定本地 moduleActions 的二元 request(actionName,args)，生产 server/动态装配删除 requestHandler，并明确拒绝旧 JavaScript 键；这是 major 迁移。测试网络通过 fetcher，内部 execution 仍不是根发布面。

#137 更新默认协议和部分逻辑目标，以上各历史批次的“保持协议”以本节为准。61 个完整动作与 Banner PC 分支使用 web；普通 search 仍为 EAPI，voice/lyric/playlistDetail 已迁 web，songDetail 保持 web。普通 songUrlV1 使用 web，显式 sky、移动 Banner、通用 batch、歌曲排序和云盘原生阶段继续保留各自合同。公开输入、Schema、失败分类及低层 createRequest 不变。身份与地址变更按 major 发布，调用方继续提供可选 token，多请求用 provider；源码和离线包验证不保证真实账号的当前权益或反作弊接受。完整范围见[固定清单](../docs/acceptance/web-endpoint-sync-2026-11-inventory.md)。
