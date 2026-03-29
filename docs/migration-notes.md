# Phase 3 迁移记录

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
3. 虽然 `src/modules` 已完成批量迁移，但大部分文件仍处于“兼容优先”的机械迁移阶段，后续仍需逐批去掉 `@ts-nocheck` 并收紧类型。
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

1. 服务层已经可以稳定承接后续模块迁移，这也是 Phase 3 可以直接批量推进的前提。
2. 当前缓存实现是轻量内存缓存，目标是先对齐旧行为，而不是立即引入更重的缓存后端。
3. `createServer()` 与 `startServer()` 已经变为异步边界，因为模块加载本身是异步过程。

## Phase 3 已完成

本阶段已经在新仓库内完成模块层的首轮批量迁移：

- 新增 `scripts/migrate-modules.ts`，可重复执行旧模块到新模块的机械迁移
- `src/modules/` 已生成 366 个 `.ts` 模块，对应旧仓库全部 `module/*.js`
- `src/plugins/upload.ts` 与 `src/plugins/song-upload.ts` 已作为模块兼容支撑一并迁入
- `src/modules/_migration.ts` 负责收敛旧模块的多种返回值形态，补齐默认 `cookie` 与 `status`
- `src/server/module-loader.ts` 已跳过以下划线开头的内部辅助文件，避免把迁移 helper 误装载为业务模块
- `package.json` 已补充 `migrate:modules` 脚本，便于后续重复生成与增量覆盖

## Phase 3 当前边界

1. 当前批量迁移以“先恢复装载与行为闭环”为首要目标，因此模块文件统一保留了 `@ts-nocheck` 过渡标记。
2. 为了兼容旧模块中的二维码、上传、XML 解析和音频元信息逻辑，当前新增了 `axios`、`qrcode`、`xml2js`、`music-metadata`、`md5`、`crypto-js` 等运行时依赖。
3. 高频模块虽然已经进入新装载链路，但尚未逐个建立真实上游回归用例；这一部分应在后续 Phase 5 按批次补齐。
4. 插件目录目前只迁入了被模块直接依赖的最小支撑集，不代表 Phase 4 已整体完成。
