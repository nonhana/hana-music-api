# Phase 0 架构骨架

## 目录职责

- `index.ts`：公共门面，只暴露稳定导出
- `src/app`：CLI 与服务启动流程
- `src/server`：Hono 服务构建与基础路由
- `src/core`：后续承接加密、请求、配置、缓存等核心基础设施
- `src/modules`：后续承接旧仓库 `module/*.js`
- `src/plugins`：后续承接上传等插件能力
- `src/types`：共享边界类型
- `tests`：行为验证与回归测试
- `scripts`：迁移辅助脚本

## 当前运行链路

在 `Phase 0`，运行链路被刻意收敛为最小闭环：

1. `index.ts` 导出 `createServer()` 与 `startServer()`
2. `src/app/cli.ts` 负责读取环境变量并启动 Bun 服务
3. `src/server/create-server.ts` 创建 Hono 实例
4. `src/server/routes.ts` 注册基础路由

## 约束

1. Hono 仅用于 HTTP 服务壳层，不进入未来的 `src/core` 基础设施。
2. 根目录 `index.ts` 不承载业务实现，只作为稳定公共入口。
3. 旧项目行为真相以 `netease-music-api` 的 JS 实现为准，不以旧半成品 TS 目录为准。
4. 在 `crypto -> request -> server` 主链路打通前，不做大规模模块迁移。
