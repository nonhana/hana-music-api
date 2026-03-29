# Phase 2 架构骨架

## 目录职责

- `index.ts`：公共门面，只暴露稳定导出
- `src/app`：CLI 与服务启动流程
- `src/server`：Hono 服务构建、请求适配、模块装载与路由注册
- `src/core`：加密、请求、配置、缓存、运行时状态等核心基础设施
- `src/modules`：后续承接旧仓库 `module/*.js`
- `src/plugins`：后续承接上传等插件能力
- `src/types`：共享边界类型
- `tests`：行为验证与回归测试
- `scripts`：迁移辅助脚本

## 当前运行链路

在 `Phase 2`，运行链路已经从“最小骨架”提升为“可承接模块调用”的服务层闭环：

1. `index.ts` 导出 `createServer()` 与 `startServer()`
2. `src/app/cli.ts` 负责读取环境变量并启动 Bun 服务
3. `src/server/create-server.ts` 创建 Hono 实例并装配 CORS、缓存与模块表
4. `src/server/module-loader.ts` 负责从 `src/modules` 动态加载模块定义
5. `src/server/routes.ts` 负责基础路由、特殊路由映射、query/body/cookie 合并、请求适配与响应回写
6. `src/core/request.ts` 负责发起上游网易请求

## 已恢复的服务层行为

1. CORS 与预检请求支持
2. 请求头 Cookie 解析
3. query/body 合并与 `cookie` 字段覆盖语义
4. 特殊路由映射：
   - `daily_signin`
   - `fm_trash`
   - `personal_fm`
5. 模块层到 `createRequest()` 的请求适配，并自动注入客户端 IP
6. HTTPS 请求下的 `Set-Cookie` 安全属性补丁
7. 轻量内存缓存

## 约束

1. Hono 仅用于 HTTP 服务壳层，不进入 `src/core` 基础设施。
2. 根目录 `index.ts` 不承载业务实现，只作为稳定公共入口。
3. 旧项目行为真相以 `netease-music-api` 的 JS 实现为准，不以旧半成品 TS 目录为准。
4. 当前模块装载器已经兼容旧下划线命名和迁移期 kebab-case 命名，但仍以旧行为兼容优先。
