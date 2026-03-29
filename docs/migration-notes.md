# Phase 2 迁移记录

## 目标

`Phase 0` 的职责不是迁移旧业务，而是把 `hana-music-api` 从 Bun 初始化模板收敛成可承接后续迁移的最小工程骨架。

## 本阶段已收敛的内容

- 补齐 `package.json` 的基础脚本：`dev`、`start`、`test`、`typecheck`
- 引入 HTTP 壳层依赖 `hono`
- 明确根目录 `index.ts` 只作为公共导出入口
- 建立 `src/app`、`src/server`、`src/core`、`src/modules`、`src/plugins`、`src/types`、`tests`、`scripts` 目录骨架
- 提供最小可运行的 Hono 服务与健康检查路由
- 添加一组最小 smoke test，验证服务骨架可直接调用

## 当前公共导出边界

当前根入口只对外导出以下能力：

- `createServer()`：创建 Hono 应用实例
- `startServer()`：启动 Bun HTTP 服务
- `CreateServerOptions` / `StartServerOptions` / `StartedServer`：程序化调用边界类型

这意味着后续迁移即便要接入 Cookie 解析、模块路由映射和请求适配，也应继续在 `src/` 内部完成，而不是把业务逻辑直接堆回根目录入口。

## 已知风险

1. `multipart/form-data` 已可经 Hono 解析，但旧仓库 `express-fileupload` 的全部细节行为尚未逐项回归。
2. PAC 代理暂未在当前 Bun `fetch` 适配器中恢复。
3. 真实业务模块尚未批量迁入，当前服务层主要通过测试注入模块定义验证行为。
4. TypeScript 版本在迁移初期仍保持 `^5` 约束，避免和业务迁移同时引入编译语义变化。

## Phase 1 前置提醒

进入下一阶段前，必须先以旧仓库 JS 实现为真相，逐步迁移并验证以下核心模块：

- `util/crypto.js`
- `util/index.js`
- `util/option.js`
- `util/request.js`
- `generateConfig.js`

## Phase 1 已完成

本阶段已经在新仓库内补齐以下核心能力：

- `src/core/crypto.ts`
- `src/core/utils.ts`
- `src/core/options.ts`
- `src/core/request.ts`
- `src/core/runtime.ts`
- `src/app/generate-config.ts`

当前新增的公共可调用能力包括：

- `createRequest()`
- `createOption()`
- `generateConfig()`
- `registerAnonymous()`
- `weapi()` / `linuxapi()` / `eapi()` 及对应解密工具

## Phase 1 当前边界

1. `request` 层已经改为 Bun 原生 `fetch`，不再依赖 `axios`。
2. 常规 HTTP/HTTPS 代理可透传给 Bun 的 `fetch`，但 PAC 代理暂未在当前适配器中恢复。
3. 旧项目依赖的 `global.deviceId` / `global.cnIp` / 匿名 token 文件状态，已被 `src/core/runtime.ts` 收敛为显式运行时状态。
4. `generateConfig()` 已可完成匿名 token 的生成与写入，但完整 CLI 启动串联仍留待后续服务层阶段继续接入。

## Phase 2 已完成

本阶段已经在新仓库内完成 Hono 服务层重建：

- `src/server/create-server.ts`
- `src/server/routes.ts`
- `src/server/module-loader.ts`
- `src/server/parse-body.ts`
- `src/server/cookies.ts`
- `src/core/cache.ts`

已恢复或明确实现的行为包括：

- 基础 CORS 处理
- 请求头 Cookie 解析
- query/body 合并
- `cookie` 字段覆盖逻辑
- 特殊路由映射
- 模块请求适配与客户端 IP 注入
- `Set-Cookie` 透传
- HTTPS 请求下 `SameSite=None; Secure` 补丁
- 轻量内存缓存

## Phase 2 当前边界

1. 服务层已经可以稳定承接后续模块迁移，但 `src/modules` 目前仍未进入大规模迁移阶段。
2. 当前缓存实现是轻量内存缓存，目标是先对齐旧行为，而不是立即引入更重的缓存后端。
3. `createServer()` 与 `startServer()` 已经变为异步边界，因为模块加载本身是异步过程。
