# hana-music-api

`hana-music-api` 是对旧版 `netease-music-api` 的 Bun + TypeScript + Hono 重写仓库。

当前仓库已经进入 `Phase 5`：核心链路、服务层、程序化 API、静态资源和首轮模块迁移都已具备，当前工作的重点已经从“继续迁功能”切换为“建立可信回归基线”。

## 当前状态

- 核心加密与请求链路已迁入 `src/core`
- Hono 服务层已恢复模块分发、Cookie、缓存与特殊路由
- `366` 个旧模块已批量迁入 `src/modules`
- 旧仓库 `public/` 与 `data/` 已迁入当前仓库
- 已恢复程序化模块调用 API
- 已补齐一组围绕真实迁移模块的 `Phase 5` 离线回归测试

## 常用命令

```bash
bun install
bun run dev
bun run start
bun run test
bun run test:phase5
bun run typecheck
bun run lint
bun run fmt:check
bun run migrate:modules
```

## Phase 5 回归策略

当前默认采用的是“离线契约回归”策略，而不是把真实网易上游请求直接作为默认 CI 验收：

- 测试直接加载 `src/modules` 中的真实迁移模块
- 通过注入 `requestHandler` 来记录请求路径、参数、加密模式、Cookie 语义和返回值归一化行为
- 对二维码生成、匿名 token 初始化、服务层特殊路由映射等不依赖上游网络的链路，直接做可重复执行的本地验证

这样做的原因是：

- 避免真实上游接口波动导致 CI 失真
- 避免把登录 Cookie、手机号、密码等敏感信息写入仓库
- 让 `Phase 5` 的验收先建立在“模块行为与迁移契约稳定”之上

当前默认回归不依赖新增环境变量。运行服务时仍可使用现有环境变量：

- `HOST`：覆盖默认监听主机
- `PORT`：覆盖默认监听端口

已知边界：

- PAC 代理仍未恢复
- `multipart/form-data` 虽可解析，但尚未逐项对齐旧版 `express-fileupload`
- `src/modules` 里的大部分文件仍保留迁移期 `@ts-nocheck`，默认 `lint` 当前只覆盖入口、核心层、服务层与测试目录；全仓库扫描可使用 `bun run lint:full`

## 程序化调用

```ts
import {
  NeteaseCloudMusicApi,
  createModuleApi,
  ensureAnonymousToken,
  invokeModule,
} from 'hana-music-api'

await ensureAnonymousToken()

const search = await NeteaseCloudMusicApi.search({
  keywords: '周杰伦',
})

const api = createModuleApi()
const detail = await api.song_url({
  id: '347230',
})

const account = await invokeModule('user_account', {
  cookie: 'MUSIC_U=your-cookie',
})
```

## HTTP 服务

```bash
bun run start
```

默认会启动 Hono 服务，并保留根路径的元信息接口；旧仓库的静态资源由根目录 `public/` 提供。CLI 主入口在真正监听端口前，会先检查匿名 token，缺失时自动调用 `generateConfig()` 进行补齐。
