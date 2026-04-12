# Phase 8 Bun HTTP 服务发布与 PM2 托管标准化计划

> 最后校准日期：2026-04-12  
> 本文档是 Phase 8 的主要执行说明，面向后续 LLM 或开发者。  
> 当前阶段不追求完整 npm 库打包、不承诺 Node.js 服务端运行、不改造模块化 npm 消费入口。  
> 本阶段只把项目整理成一个稳定、可部署、可验证、可回滚的 Bun HTTP 服务。

## 一、阶段目标

Phase 8 的目标是让用户可以按稳定版本部署服务：

1. 从 Git 仓库 clone 或 checkout 指定 tag。
2. 执行 `bun install --frozen-lockfile` 安装依赖。
3. 显式构建文档资源，而不是安装时隐式构建。
4. 使用 PM2 长期托管 Bun HTTP 服务。
5. 通过 `/health` 做启动后健康检查。
6. 支持清晰的升级与回滚流程。

完成后，推荐用户部署路径应类似：

```bash
git clone https://github.com/<owner>/hana-music-api.git
cd hana-music-api
git checkout v0.1.0

bun install --frozen-lockfile
bun run docs:build

cp .env.example .env
mkdir -p logs data/runtime

pm2 start ecosystem.config.cjs
pm2 save

curl -f http://127.0.0.1:3021/health
```

## 二、非目标

以下事项不属于 Phase 8：

1. 不发布 npm package。
2. 不设计 npm `exports`、`types`、`bin` 的完整库分发方案。
3. 不把 TypeScript 源码编译到 `dist/` 后运行。
4. 不承诺 `node index.js` 或 `node dist/index.js` 能启动服务。
5. 不改造全部运行时以兼容 Node.js。
6. 不引入 Docker、systemd、Kubernetes 等额外部署体系。
7. 不重写模块加载器、请求核心、Demo UI 或文档站架构。

如果后续要做 npm 包分发，应作为 Phase 9 或独立专题处理。

## 三、当前仓库真实状态

截至 2026-04-12，仓库当前状态如下：

1. 主启动入口是 `src/app/cli.ts`。
2. `package.json` 中已有：
   - `start`: `bun src/app/cli.ts`
   - `dev`: `bun --watch src/app/cli.ts`
   - `test`
   - `typecheck`
   - `lint`
   - `fmt:check`
   - `docs:build`
3. HTTP 服务由 `Bun.serve()` 启动。
4. 服务默认监听：
   - `HOST` 缺省为 `0.0.0.0`
   - `PORT` 缺省为 `3021`
5. `createServer()` 已注册 `/health`。
6. 文档站由 VitePress 构建，产物在 `docs/.vitepress/dist`。
7. 当前 `package.json` 仍包含 `postinstall: bun docs:build`。
8. 当前没有 PM2 配置文件。
9. 当前没有 `.env.example`。
10. 当前匿名 token 默认写入系统临时目录，不利于长期服务的持久化。
11. 当前 CLI 尚未显式处理 `SIGINT` / `SIGTERM` 优雅退出。

## 四、Phase 8 冻结决策

本节是后续实现时默认接受的决策，不应在执行中反复重开讨论。

### 4.1 运行时决策

Phase 8 明确把 Bun 作为生产运行时。

要求：

1. README 和部署文档必须写清楚需要 Bun。
2. PM2 配置使用 `interpreter: 'bun'` 或 Bun 绝对路径。
3. 不在当前阶段处理 Node.js 兼容。

### 4.2 发布形态决策

Phase 8 采用源码发布：

1. 使用 Git tag 表示稳定版本。
2. 用户通过 `git checkout vX.Y.Z` 固定部署版本。
3. 不使用 npm package 作为交付物。
4. 不依赖构建后的 `dist/` 目录运行服务。

### 4.3 安装副作用决策

`bun install` 不应隐式构建文档。

因此必须移除或替换 `postinstall: bun docs:build`。文档构建应由用户、部署脚本或发布流程显式执行。

### 4.4 PM2 决策

Phase 8 只提供单实例 fork 模式配置：

1. `exec_mode: 'fork'`
2. `instances: 1`
3. 不启用 cluster 模式。

理由：

1. 当前服务存在本地运行态，例如匿名 token、内存缓存。
2. 项目尚未设计多实例共享缓存、共享状态或 sticky session。
3. 单实例方案更容易解释、验证和回滚。

## 五、推荐改动清单

### 5.1 工作项 A：调整 `package.json` 脚本

优先级：P0

目标：

1. 移除安装时隐式文档构建。
2. 提供统一验证入口。
3. 提供 PM2 操作脚本。

建议修改：

```json
{
  "scripts": {
    "dev": "bun --watch src/app/cli.ts",
    "start": "bun src/app/cli.ts",
    "start:prod": "NODE_ENV=production bun src/app/cli.ts",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "test": "bun test",
    "typecheck": "tsc --noEmit",
    "lint": "oxlint .",
    "lint:fix": "oxlint . --fix",
    "fmt": "oxfmt .",
    "fmt:check": "oxfmt . --check",
    "verify": "bun test && bun run typecheck && bun run lint && bun run fmt:check && bun run docs:build",
    "pm2:start": "pm2 start ecosystem.config.cjs",
    "pm2:reload": "pm2 reload hana-music-api",
    "pm2:stop": "pm2 stop hana-music-api",
    "pm2:logs": "pm2 logs hana-music-api"
  }
}
```

注意：

1. 删除 `postinstall`。
2. 不新增 `build` 作为生产启动前置，避免误导用户以为服务必须编译。
3. 如果仓库中还有文档引用 `lint:full`，要同步改为当前真实脚本或补回别名。

验收：

```bash
bun install --frozen-lockfile
bun run verify
```

### 5.2 工作项 B：新增 PM2 配置

优先级：P0

新增文件：`ecosystem.config.cjs`

建议内容：

```js
module.exports = {
  apps: [
    {
      name: 'hana-music-api',
      script: 'src/app/cli.ts',
      interpreter: 'bun',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      kill_timeout: 10000,
      max_memory_restart: '512M',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '3021',
        ANONYMOUS_TOKEN_FILE: './data/runtime/anonymous_token',
      },
    },
  ],
}
```

如果部署机器上 PM2 找不到 `bun`，用户应执行：

```bash
which bun
```

然后把 `interpreter` 改成绝对路径，例如：

```js
interpreter: '/home/deploy/.bun/bin/bun'
```

验收：

```bash
mkdir -p logs data/runtime
pm2 start ecosystem.config.cjs
pm2 status hana-music-api
curl -f http://127.0.0.1:3021/health
```

### 5.3 工作项 C：新增 `.env.example`

优先级：P0

新增文件：`.env.example`

建议内容：

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3021
ANONYMOUS_TOKEN_FILE=./data/runtime/anonymous_token
```

文档中应说明：

1. `HOST=0.0.0.0` 适合服务器对外监听。
2. 如果只允许本机反向代理访问，可改为 `HOST=127.0.0.1`。
3. `PORT` 可以按部署环境调整。
4. `ANONYMOUS_TOKEN_FILE` 应指向可持久化目录。

验收：

```bash
cp .env.example .env
bun start
```

### 5.4 工作项 D：支持匿名 token 持久路径环境变量

优先级：P0

目标：

让长期服务不要默认依赖系统临时目录中的 `anonymous_token`。

建议实现：

1. 在 `src/app/cli.ts` 中读取 `Bun.env.ANONYMOUS_TOKEN_FILE`。
2. 启动时把该路径传给 `ensureAnonymousToken()`。
3. 保持现有函数参数优先级，不破坏测试中手动传入的 `tokenFilePath`。

建议逻辑：

```ts
function resolveGenerateConfigOptions(options: GenerateConfigOptions = {}): GenerateConfigOptions {
  return {
    ...options,
    tokenFilePath: options.tokenFilePath ?? Bun.env.ANONYMOUS_TOKEN_FILE,
  }
}
```

然后在 `ensureAnonymousToken()` 内部统一使用解析后的 options。

验收：

```bash
rm -rf data/runtime
mkdir -p data/runtime
ANONYMOUS_TOKEN_FILE=./data/runtime/anonymous_token bun start
test -f data/runtime/anonymous_token
```

如果测试环境不允许真实请求上游生成 token，应补单元测试验证：

1. 环境变量存在时使用环境变量路径。
2. 显式传入 `tokenFilePath` 时优先使用显式参数。

### 5.5 工作项 E：为 CLI 增加优雅退出

优先级：P1

目标：

PM2 reload、stop 或系统发送 `SIGTERM` 时，服务可以主动停止 Bun server。

当前 `src/app/cli.ts` 的 `startServer()` 返回 `StartedServer`，其中包含 `server`。后续可以在 `import.meta.main` 分支中保存返回值并注册信号处理。

建议实现方向：

```ts
if (import.meta.main) {
  await ensureAnonymousToken()
  const startedServer = await startServer()

  const stop = () => {
    startedServer.server.stop()
    process.exit(0)
  }

  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)
}
```

注意：

1. 如果 Bun 的 `server.stop()` 支持 graceful 参数，可优先使用官方语义。
2. 不要把信号处理写入 `startServer()`，避免影响程序化调用者。
3. 测试中不要让信号处理干扰 test runner。

验收：

```bash
pm2 start ecosystem.config.cjs
pm2 reload hana-music-api
pm2 stop hana-music-api
```

并确认没有端口残留：

```bash
lsof -i :3021
```

### 5.6 工作项 F：更新 README 的生产部署章节

优先级：P0

目标：

README 必须让普通用户按步骤部署，不需要自己猜 PM2 命令。

建议新增或调整章节：

1. 环境要求
2. 本地启动
3. 生产部署
4. PM2 托管
5. 健康检查
6. 升级
7. 回滚
8. 环境变量

建议生产部署内容：

```bash
git clone https://github.com/<owner>/hana-music-api.git
cd hana-music-api
git checkout v0.1.0

bun install --frozen-lockfile
bun run docs:build

cp .env.example .env
mkdir -p logs data/runtime

pm2 start ecosystem.config.cjs
pm2 save
```

建议健康检查内容：

```bash
curl -f http://127.0.0.1:3021/health
curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"
```

建议升级内容：

```bash
git fetch --tags
git checkout v0.1.1
bun install --frozen-lockfile
bun run docs:build
pm2 reload hana-music-api
curl -f http://127.0.0.1:3021/health
```

建议回滚内容：

```bash
git checkout v0.1.0
bun install --frozen-lockfile
bun run docs:build
pm2 reload hana-music-api
curl -f http://127.0.0.1:3021/health
```

注意：

1. 不要继续强调 npm 包安装。
2. 不要写“支持 Node.js 启动服务”。
3. 不要要求用户执行不存在的脚本。
4. 如果 README 中仍有 `lint:full`，要修正为真实脚本。

### 5.7 工作项 G：补充发布检查清单

优先级：P1

建议新增文件：`stash/phase-8-release-checklist.md` 或在 README 中保留简版。

维护者发布前执行：

```bash
git status --short
bun install --frozen-lockfile
bun run verify
HOST=127.0.0.1 PORT=3021 bun start
curl -f http://127.0.0.1:3021/health
```

发布 tag：

```bash
git tag v0.1.0
git push origin main --tags
```

GitHub Release 内容至少包含：

1. 安装方式
2. 启动方式
3. PM2 托管方式
4. 环境变量
5. 升级说明
6. 回滚说明
7. 已知限制

## 六、建议执行顺序

后续 LLM 接手时，按以下顺序执行，避免中途引入不必要变量。

### 6.1 第一步：确认基线

运行：

```bash
git status --short
bun install --frozen-lockfile
bun test
bun run typecheck
```

如果工作区已有无关改动：

1. 不要回滚用户改动。
2. 只记录当前状态。
3. 避免修改与 Phase 8 无关的文件。

### 6.2 第二步：脚本与配置

修改：

1. `package.json`
2. `ecosystem.config.cjs`
3. `.env.example`

然后运行：

```bash
bun run verify
```

### 6.3 第三步：运行态持久化

修改：

1. `src/app/cli.ts`
2. 必要时补充 `tests/cli.test.ts`

目标：

1. 支持 `ANONYMOUS_TOKEN_FILE`
2. 保持显式 `tokenFilePath` 优先
3. 不破坏既有匿名 token 测试

运行：

```bash
bun test tests/cli.test.ts
bun run typecheck
```

### 6.4 第四步：PM2 生命周期

修改：

1. `src/app/cli.ts`
2. 必要时补轻量测试，或通过手工验证覆盖

运行：

```bash
mkdir -p logs data/runtime
pm2 start ecosystem.config.cjs
pm2 reload hana-music-api
curl -f http://127.0.0.1:3021/health
pm2 stop hana-music-api
```

如果本地没有 PM2，不要为了测试把 PM2 加进项目依赖。记录“PM2 手工验证未运行”，并至少完成普通 Bun 启动验证。

### 6.5 第五步：文档收口

修改：

1. `README.md`
2. 如有必要，修改 `docs/guide/getting-started.md`
3. 如有必要，修改 `docs/index.md`

注意：

1. README 面向普通部署用户。
2. `stash/` 文档面向后续维护者和 LLM。
3. 不要把 Phase 8 内部计划原样塞进 README。

运行：

```bash
bun run docs:build
```

### 6.6 第六步：最终验证

运行：

```bash
bun run verify
HOST=127.0.0.1 PORT=3021 bun start
```

另开终端或后台检查：

```bash
curl -f http://127.0.0.1:3021/health
curl "http://127.0.0.1:3021/search?keywords=周杰伦&limit=5"
```

如果真实上游请求不稳定，至少要说明：

1. `/health` 是否通过。
2. `/search` 是否失败。
3. 失败状态码和错误体是什么。

## 七、验收标准

Phase 8 完成时必须满足：

1. `bun install --frozen-lockfile` 不会自动构建文档。
2. `bun run verify` 可作为发布前唯一主检查入口。
3. `ecosystem.config.cjs` 存在，并能说明如何用 PM2 启动。
4. `.env.example` 存在，并包含生产部署必要变量。
5. README 中存在清晰的 PM2 部署、健康检查、升级、回滚说明。
6. 匿名 token 可以通过 `ANONYMOUS_TOKEN_FILE` 持久化到项目指定目录。
7. PM2 停止或 reload 时服务能正常退出或重启。
8. `/health` 可作为部署后检查命令。
9. 所有改动不引入新的 npm 打包承诺。
10. 不修改与 Phase 8 无关的模块接口行为。

## 八、风险与处理

### 8.1 PM2 找不到 Bun

症状：

```text
Interpreter bun is NOT AVAILABLE
```

处理：

1. 执行 `which bun`。
2. 把 `ecosystem.config.cjs` 中的 `interpreter` 改成绝对路径。
3. README 中保留这一排查说明。

### 8.2 文档构建失败

处理顺序：

1. 先确认 `bun run docs:build` 单独是否失败。
2. 如果失败来自已知文档生成脚本缺失，不要绕过 `verify`，应先修文档构建链。
3. 如果决定暂不把文档构建纳入 `verify`，必须在本文档和 README 中说明原因。

### 8.3 匿名 token 生成依赖上游

风险：

1. 首次启动可能访问上游注册匿名 token。
2. 上游不稳定会影响首次启动体验。

处理：

1. 持久化 `ANONYMOUS_TOKEN_FILE`。
2. 已存在 token 时不重复生成。
3. README 中说明 `data/runtime/anonymous_token` 应被保留。

### 8.4 PM2 reload 后端口未释放

处理：

1. 确认 `SIGTERM` 是否被 CLI 捕获。
2. 确认 `server.stop()` 是否被调用。
3. 调整 `kill_timeout`。
4. 使用 `lsof -i :3021` 辅助定位。

## 九、发布版本规则

即使 Phase 8 不发 npm，也必须使用语义化 Git tag。

建议：

1. 首个稳定部署版本：`v0.1.0`
2. 修复部署脚本或文档：`v0.1.1`
3. 新增服务端能力但兼容部署方式：`v0.2.0`
4. 改变部署方式或破坏配置兼容：`v1.0.0` 前也必须在 release notes 中显式标注

发布前要求：

```bash
git status --short
bun run verify
```

打 tag：

```bash
git tag v0.1.0
git push origin main --tags
```

如果当前分支不是 `main`，按仓库实际默认分支替换。

## 十、交付结果模板

后续 LLM 完成 Phase 8 实现后，最终回复应包含：

```text
已完成 Phase 8 Bun HTTP 服务发布标准化：

- 调整 package.json，移除 postinstall，新增 verify 与 pm2 脚本
- 新增 ecosystem.config.cjs
- 新增 .env.example
- 支持 ANONYMOUS_TOKEN_FILE
- 为 CLI 增加 PM2 友好的退出处理
- 更新 README 的生产部署、健康检查、升级与回滚说明

验证：
- bun run verify 通过
- bun test tests/cli.test.ts 通过
- PM2 本地验证：已运行 / 未运行，原因是 ...
- /health 检查：通过 / 未通过，原因是 ...
```

如果有验证未运行，必须写明原因，不能只写“未测试”。
