# Phase 6 架构与收尾基线

## 目录职责

- `index.ts`：公共门面，暴露服务启动、程序化模块调用和核心基础能力
- `src/app`：CLI 与服务启动流程
- `src/server`：Hono 服务构建、请求适配、模块装载与路由注册
- `src/core`：加密、请求、配置、缓存、运行时状态等核心基础设施
- `src/modules`：已承接旧仓库 `module/*.js` 的首轮批量迁移结果
- `src/plugins`：已迁入旧仓库的实际插件实现
- `src/demo`：本地专用 Demo UI 子系统，负责 `/demo/*` 页面、样式和局部客户端脚本
- `src/types`：共享边界类型
- `tests`：行为验证与回归测试
- `scripts`：迁移辅助脚本
- `data`：旧仓库迁入的只读数据资源

## 当前运行链路

进入 `Phase 7` 的第一轮 Demo UI 重建后，运行时主链路不再保留旧静态托管，而是在 `Phase 6` 的“服务 + 程序化 API”基础上新增统一的 `/demo/*` 本地调试入口：

1. `index.ts` 导出 `createServer()` 与 `startServer()`
2. `src/app/cli.ts` 负责读取环境变量并启动 Bun 服务
3. `src/server/create-server.ts` 创建 Hono 实例并装配 CORS、缓存与模块表
4. `src/server/module-loader.ts` 负责从 `src/modules` 动态加载模块定义，并忽略以下划线开头的内部辅助文件
5. `src/server/routes.ts` 负责基础路由、特殊路由映射、query/body/cookie 合并、请求适配与响应回写
6. `src/server/demo-routes.tsx` 负责注册 `/demo/*` 路由，并把请求映射到 `src/demo/pages/*`
7. `src/core/request.ts` 负责发起上游网易请求
8. `scripts/migrate-modules.ts` 负责把旧仓库模块与最小支撑插件批量迁入当前目录结构
9. `src/app/module-api.ts` 负责构建程序化模块调用入口
10. `src/types/` 已拆分为 `runtime.ts`、`request.ts`、`server.ts`、`module-contracts.ts`、`upstream.ts` 与 `modules.ts`

## 当前模块层状态

1. `src/modules/` 已生成 366 个迁移后的 TypeScript 文件，并保留旧项目的一文件一端点结构。
2. 每个迁移模块都通过 `src/modules/_migration.ts` 做一层兼容包装，用于：
   - 归一化旧模块返回值
   - 给缺失的 `cookie` 数组补默认值
   - 把旧式 `throw { status, body }` 错误收敛为新服务层可识别的响应对象
3. 当前批量迁移结果优先保证“能被装载、能进入新服务链路、核心行为不因返回值形态差异而失真”，而不是一步到位完成模块级严格类型化。

## 当前 Phase 6 输出

1. 新服务层已经同时支持：
   - HTTP 模块路由
   - `/demo/*` 本地调试 UI
   - 程序化模块直接调用
2. `index.ts` 现在不仅导出 `createServer()` / `startServer()`，还导出面向模块调用的公共门面。
3. CLI 主入口会在真正监听端口前尝试准备匿名 token，以补齐旧项目启动链路中的关键初始化动作。
4. 测试层已经开始直接复用真实迁移模块，而不是只依赖伪造模块定义。
5. 程序化 API 已引入显式模块契约映射，默认对外暴露受约束的模块标识和 query 类型。
6. `voice_upload.ts` 已用内部 XML helper 替换 `xml2js`，并补了上传链路最小回归。

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

## Phase 6 回归基线

当前默认的 phase 6 验收策略仍然是“离线契约回归”，但新增了类型与上传链路收尾验证：

1. 使用真实的 `src/modules` 迁移模块作为被测对象。
2. 在测试中注入 `requestHandler`，记录模块发出的请求路径、参数、加密模式与 Cookie 语义。
3. 通过 `createServer()` 加载真实模块目录，验证服务层的路由映射、请求合并、响应回写与特殊路径。
4. 通过 `loadProgrammaticApi()` / `invokeModule()` 验证程序化入口并未脱离真实模块链路。
5. 通过独立 helper 测试与模块回归验证 `voice_upload` 的 XML 解析和 multipart 完成请求组装。
6. 对二维码生成、匿名 token 初始化等不依赖真实上游的路径，使用本地可重复测试补证。

这意味着当前阶段的测试重点已经从“骨架能否运行”切换为“迁移行为、输入契约与收尾边界能否被稳定证明”。

## 约束

1. Hono 仅用于 HTTP 服务壳层，不进入 `src/core` 基础设施。
2. 根目录 `index.ts` 不承载业务实现，只作为稳定公共入口。
3. 旧项目行为真相以 `netease-music-api` 的 JS 实现为准，不以旧半成品 TS 目录为准。
4. 当前模块装载器已经兼容旧下划线命名和迁移期 kebab-case 命名，但仍以旧行为兼容优先。
5. 当前版本明确不支持 PAC 代理；`src/core/request.ts` 中的显式报错属于有意边界而非待恢复债务。
6. 旧 `public/` 静态页已经退出运行时主线，复杂实验页后续统一回到 `/demo/experiments/*` 体系。
