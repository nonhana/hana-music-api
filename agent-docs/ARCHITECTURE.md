# 架构边界

在修改核心请求链路、运行时服务、HTTP 层、模块加载或共享状态前阅读本文件。

## 目录职责

- `index.ts`：公开 Node/Bun SDK 入口，只组合公开导出；`src/browser/watchman.ts` 是独立浏览器入口。
- `src/app/`：CLI 启动、服务启动和匿名配置生成。
- `src/server/`：Hono 应用、路由、准入、Cookie/body 解析、模块发现和文档服务。
- `src/core/`：Effect 请求内核、加密、目标策略、transport、运行时、缓存和身份状态。
- `src/modules/`：每个网易云端点一个模块，负责业务输入和请求意图。
- `src/sdk/`：Promise SDK runtime，以及由模块生成的 client、registry 和具名 API 文件。
- `src/plugins/`：上传等可组合能力；`src/types/`：共享公开类型和内部合同。
- `tests/`：分层测试；`website/`：面向使用者的 VitePress 文档；`docs/`：agent 与 domain 文档；`_notes/`：历史报告和验收证据。

## 唯一执行链路

公开入口先解码业务输入并建立不可变 `Call`，冻结配置、Cookie、身份指纹和总期限。模块将输入编译为 `RequestIntent`，再通过 `RequestCapability` 进入唯一的 `RequestEffect`；目标检查、协议准备、重试、期限、transport、完整正文消费和响应解释都在这条链路中完成。

已迁移模块导出本地 `moduleActions`，按动作声明 profile、语义、token、缓存和重试资格；生成 registry 与动态 loader 读取同一份声明，并冻结到本次 `Call.actions`。`requestEffect` 只接受当前模块已声明的动作与目标；profile 统一决定协议、域名、UA、身份 Cookie 默认字段、协议选项和 token 位置，会话仍来自 Call。歌单收藏使用 web，收藏 token 为 optional，取消为 none。

迁移阶段分别生成未声明动作的 `generatedPendingActionModuleIdentifiers` 与仍使用过渡 profile 的 `generatedTransitionActionModuleIdentifiers`，两者合并为 `generatedPendingProfileModuleIdentifiers`。P2 的 `eapiTransition` 透明保留搜索、歌词和歌单详情原有的 PC Cookie/iPhone UA 组合，只证明策略已接通；取得一致身份依据后替换并删除。清单记录声明和 profile 生命周期，不证明每个端点的新协议已通过上游验证。P12 只有在未声明和过渡清单均清空、逐动作证据核对完成后才能删除可选声明、旧默认协议与旧策略判定；本地模块声明空动作集。模块清单之外的游客初始化请求也须独立收口。具体决策见 [ADR-0001](../docs/adr/0001-request-actions-and-profiles.md)。

Effect 只用于内部实现。公开 SDK、模块函数、`invokeModule` 和 `createRequest` 仍返回 Promise；内部组合和 transport 不自行调用 `Effect.runPromise`。公开边界统一由 `src/core/runtime.ts` 负责执行和错误映射。

## 服务与共享状态

- `ProcessServices` 只提供运行时状态读取，供模块调用准备身份时使用；请求内核 `requestEffect` 只依赖 `Call`。
- 每个 client、HTTP 服务实例和程序化 API 实例拥有自己的 `ReadStore`；共享读取只共享上游执行，等待者仍各自拥有取消和期限。
- `ReadStore` 用一个原子状态决策处理缓存命中、在飞任务合并和任务清理。已声明模块只有全部动作明确为 read 且允许 shared 时才进入共享读取；目前仅四个模块声明该资格。键包含动作/profile/目标、有效输入、完整身份快照与执行/transport 引用；重试资格由当前动作限制。未声明模块的旧判定只保留到 P12。
- SDK 不在本地限制出口请求频率，也不在收到上游限频后冷却身份或域名；调用方自己控制频率。只有 HTTP 服务按来访 IP 和模块容量做入口准入（`src/server/admission.ts`），多进程不会共享这份内存状态，需要在可信反向代理层补充共享限流。
- SDK 入口和 `src/core/` 在加载和调用时不读写本地文件，以便在 Serverless 函数里运行：版本号由构建内联 `package.json`，运行时状态只在内存；匿名令牌文件只由 `src/app/` 的 CLI 读写。`tests/contract/sdk-release-contract.test.ts` 用单文件打包产物守住这一点。

## 依赖方向

Hono 只属于 `src/server/`。`src/core/` 必须能够脱离 Hono 测试；模块不得直接调用 `fetch`，也不得启动第二套 Promise 请求执行器。请求 target、协议、方法和语义由 `RequestIntent` 表达，transport 是唯一上游发送位置，并拒绝未经允许的重定向。

上传按阶段执行；已经完成的上游写入不能回滚，失败时由模块报告部分完成阶段。自定义 fetcher 必须遵守传入的 `AbortSignal`，库只能保证自身资源会释放。

重构背景与验收证据见 `_notes/effect-refactor/final-report.md` 和 `website/guide/request-layer-overview.md`。
