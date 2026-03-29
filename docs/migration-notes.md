# Phase 0 迁移记录

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

1. 当前服务层只提供最小骨架，尚未恢复旧项目的 CORS、Cookie、Body 合并、文件上传与特殊路由映射。
2. `src/core`、`src/modules`、`src/plugins` 目前仍是占位目录，尚未进入高风险核心迁移。
3. 根入口的程序化 API 只定义了初始边界，未来迁移 `main.js` 能力时需要继续审视兼容策略。
4. TypeScript 版本在迁移初期仍应保持 `^5` 约束，避免和业务迁移同时引入编译语义变化。

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
