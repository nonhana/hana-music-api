# Phase 3 架构骨架

## 目录职责

- `index.ts`：公共门面，只暴露稳定导出
- `src/app`：CLI 与服务启动流程
- `src/server`：Hono 服务构建、请求适配、模块装载与路由注册
- `src/core`：加密、请求、配置、缓存、运行时状态等核心基础设施
- `src/modules`：已承接旧仓库 `module/*.js` 的首轮批量迁移结果
- `src/plugins`：当前已迁入模块直接依赖的上传插件，其余能力留待后续阶段
- `src/types`：共享边界类型
- `tests`：行为验证与回归测试
- `scripts`：迁移辅助脚本

## 当前运行链路

在 `Phase 3`，运行链路已经从“服务层闭环”继续提升为“可批量装载真实业务模块”的迁移基线：

1. `index.ts` 导出 `createServer()` 与 `startServer()`
2. `src/app/cli.ts` 负责读取环境变量并启动 Bun 服务
3. `src/server/create-server.ts` 创建 Hono 实例并装配 CORS、缓存与模块表
4. `src/server/module-loader.ts` 负责从 `src/modules` 动态加载模块定义，并忽略以下划线开头的内部辅助文件
5. `src/server/routes.ts` 负责基础路由、特殊路由映射、query/body/cookie 合并、请求适配与响应回写
6. `src/core/request.ts` 负责发起上游网易请求
7. `scripts/migrate-modules.ts` 负责把旧仓库模块与最小支撑插件批量迁入当前目录结构

## 当前模块层状态

1. `src/modules/` 已生成 366 个迁移后的 TypeScript 文件，并保留旧项目的一文件一端点结构。
2. 每个迁移模块都通过 `src/modules/_migration.ts` 做一层兼容包装，用于：
   - 归一化旧模块返回值
   - 给缺失的 `cookie` 数组补默认值
   - 把旧式 `throw { status, body }` 错误收敛为新服务层可识别的响应对象
3. 当前批量迁移结果优先保证“能被装载、能进入新服务链路、核心行为不因返回值形态差异而失真”，而不是一步到位完成模块级严格类型化。

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
