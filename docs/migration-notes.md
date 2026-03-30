# Phase 5 迁移与回归记录

## 目标

`Phase 5` 的核心目标不再是继续大规模迁移功能，而是为已经完成的迁移结果建立可信回归基线，确认当前仓库不是“能跑就算完成”，而是能够被重复验证、被后续维护者接手的实现。

## 当前阶段结论

当前仓库已经从 `Phase 4` 进入 `Phase 5`。判断依据如下：

- `crypto -> request -> server -> modules` 主链路已经完整接通
- `public/`、`data/`、程序化 API 与 CLI 启动链路已经恢复
- `src/modules/` 中的 `366` 个迁移模块已可被服务层和程序化入口装载
- `typecheck` 与基础测试已通过，开始具备建立回归基线的条件

## Phase 5 已落地内容

### 1. 默认回归策略已明确

当前默认采用“离线契约回归”策略：

- 直接加载 `src/modules` 中的真实迁移模块
- 通过注入 `requestHandler` 观测模块发出的上游请求路径、参数、加密模式与 Cookie 语义
- 对不依赖真实网易上游的链路做本地稳定验证，例如：
  - 二维码生成
  - 匿名 token 初始化
  - 程序化 API 加载
  - 特殊路由映射

这样可以避免：

- 上游接口波动导致 CI 不稳定
- 把登录 Cookie、手机号等敏感信息固化到仓库
- 因网络或风控因素让迁移验收结果失真

### 2. 最小回归集已补齐离线验证

当前已为以下高风险路径补齐可重复执行的行为回归：

- `/search`
- `/song/url`
- `/playlist/detail`
- `/user/account`
- `/login/cellphone`
- `/login/qr/create`
- `/batch`
- `/daily_signin`
- `/personal/fm`

这些回归重点验证的不是完整响应快照，而是：

- 请求路径是否与旧行为一致
- 参数构造是否保持兼容
- 加密模式是否正确
- Cookie / 登录态语义是否明确
- 旧项目中的特殊返回值收敛是否仍成立

### 3. 服务层与程序化入口补齐了真实模块验收

本阶段新增的验收重点包括：

- 使用真实 `src/modules` 文件做服务层 E2E 验证
- 使用真实迁移模块校验 `loadProgrammaticApi()`、`createModuleApi()`、`invokeModule()`
- 为 CLI 匿名 token 初始化逻辑补可测边界，验证“缺 token 时生成、已有 token 时复用”

## 与 Phase 4 的差异

`Phase 4` 更关注“能力是否已经迁进来”，而 `Phase 5` 更关注“这些能力是否已经有稳定证据证明它们仍然成立”。

因此，`Phase 5` 的验收重点已经从功能骨架转成以下五类证据：

1. 加密与请求层测试
2. 真实迁移模块的行为回归
3. 服务层真实装载链路验证
4. 程序化 API 与 CLI 启动链路验证
5. 与当前阶段一致的文档与工程校验策略

## 当前工程策略

### 默认 lint 范围

由于 `src/modules/` 中的大量文件仍保留迁移期 `@ts-nocheck`，当前默认 `lint` 只覆盖以下目录：

- `index.ts`
- `src/app`
- `src/core`
- `src/server`
- `src/types`
- `tests`

如果需要审计全仓库迁移债，可使用 `bun run lint:full`。

### 默认环境变量

当前默认离线回归不依赖新增环境变量。服务启动仍继续使用已有环境变量：

- `HOST`
- `PORT`

## 当前已知边界

1. PAC 代理仍未在当前 Bun `fetch` 适配器中恢复。
2. `multipart/form-data` 已可解析，但尚未逐项对齐旧版 `express-fileupload` 的全部边角行为。
3. `src/modules/` 中的大多数迁移文件仍处于“兼容优先”状态，后续仍需按优先级逐步去掉 `@ts-nocheck`。
4. 静态资源已可托管，但 `public/` 下的历史页面目前仍以“可访问、可格式校验”为主，尚未逐页做浏览器级回归。
5. 匿名 token 自动准备仅发生在 CLI 主入口；程序化调用 `startServer()` 仍保持显式、可控的启动语义。
