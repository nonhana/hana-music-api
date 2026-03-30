# hana-music-api

`hana-music-api` 是对旧版 `netease-music-api` 的 Bun + TypeScript + Hono 重写仓库。

当前仓库已经进入 `Phase 6`：主链路与 `Phase 5` 离线回归基线已经稳定，当前工作的重点转为类型边界收敛、程序化 API 类型映射、上传链路现代化与文档定稿。

## 当前状态

- 核心加密与请求链路已迁入 `src/core`
- Hono 服务层已恢复模块分发、Cookie、缓存与特殊路由
- `366` 个旧模块已批量迁入 `src/modules`
- 旧仓库 `public/` 与 `data/` 已迁入当前仓库
- 已恢复程序化模块调用 API
- 已补齐一组围绕真实迁移模块与上传链路 helper 的离线回归测试
- `src/types/` 已拆分为运行时、请求、模块契约与上游边界几个子文件
- `voice_upload` 已移除 `xml2js` 依赖，改为轻量 XML helper

## 常用命令

```bash
bun install
bun run dev
bun run start
bun run test
bun run test:phase5
bun run typecheck
bun run lint
bun run lint:full
bun run lint:fix
bun run fmt
bun run fmt:check
bun run migrate:modules
```

## Phase 6 基线

当前默认采用的是“离线契约回归”策略，而不是把真实网易上游请求直接作为默认 CI 验收：

- 测试直接加载 `src/modules` 中的真实迁移模块
- 通过注入 `requestHandler` 来记录请求路径、参数、加密模式、Cookie 语义和返回值归一化行为
- 对二维码生成、匿名 token 初始化、服务层特殊路由映射等不依赖上游网络的链路，直接做可重复执行的本地验证

这样做的原因是：

- 避免真实上游接口波动导致 CI 失真
- 避免把登录 Cookie、手机号、密码等敏感信息写入仓库
- 让 phase 6 的收尾建立在“模块行为、输入契约和程序化调用边界都可验证”的基线上

当前默认回归不依赖新增环境变量。运行服务时仍可使用现有环境变量：

- `HOST`：覆盖默认监听主机
- `PORT`：覆盖默认监听端口

已知边界：

- 当前版本明确不支持 PAC 代理；如未来确有需求，应以独立专题实现
- `multipart/form-data` 已补齐旧上传对象兼容层，并已有服务层回归覆盖；但仍建议在真实上传场景下继续做手工回归
- 当前仓库已经移除 `src/` 内全部 `@ts-nocheck`；`bun run lint` 和 `bun run lint:full` 都可直接用于全量审计
- 高频模块的 query 类型、程序化 API 模块标识和上游类型边界已开始收紧，但长尾模块仍以兼容型边界为主，后续会继续渐进细化

后续收尾取舍与执行方案见 `docs/phase-6-finalization-plan.md`。

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
