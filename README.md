# hana-music-api

`hana-music-api` 正在从 Bun 服务仓库演进为一个 **SDK-first、ESM-only** 的 npm 包。冻结中的 `1.0.0` 公开合同以 Node.js 消费者为中心：根入口提供 `createHanaMusicApi(config)`，同时保留 `invokeModule(identifier, query, config?)` 作为动态逃生口，并暴露按 camelCase 命名的原始模块函数。

> 当前仓库仍保留 Bun 服务、CLI、文档站与部署脚本；这些能力会继续存在于仓库内，但**不属于 `1.0.0` npm SDK 默认合同**。

## 1.0.0 SDK 合同摘要

- **单包发布**：包名方向为 `hana-music-api`
- **运行时**：面向 Node.js 消费者，**仅 ESM**
- **默认入口**：`createHanaMusicApi(config)`
- **低层逃生口**：`invokeModule(identifier, query, config?)`
- **原始函数层**：根入口公开 camelCase 命名的模块函数
- **子路径合同**：保留显式的 extensionless SDK 子路径（如 `hana-music-api/api/<module-identifier>`）
- **明确排除**：Bun server / CLI / docs / demo 不进入 `1.0.0` npm 默认导出面

## 推荐的 SDK 使用方式

### 1. 创建绑定配置的 client

```ts
import { createHanaMusicApi } from 'hana-music-api'

const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
})

const result = await hana.search({
  keywords: '周杰伦',
  limit: 5,
})
```

适合需要共享 Cookie、代理、请求实现或其他执行上下文的场景。

### 2. 直接导入单个原始函数

```ts
import { songUrl } from 'hana-music-api'

const result = await songUrl(
  {
    id: '347230',
    br: 320000,
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

适合追求 tree-shaking、只调用少量模块的场景。

### 3. 使用动态模块调用逃生口

```ts
import { invokeModule } from 'hana-music-api'

const result = await invokeModule(
  'user_account',
  {},
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

适合模块标识符来自运行时字符串、脚本配置或插件系统的场景。

## Query / Config 分离原则

`1.0.0` SDK 合同要求把**业务 query**与**执行配置**分开：

- `query` 只承载接口业务参数
- `config` 承载 Cookie、代理、fetch 实现、运行时状态等执行上下文

这让 `createHanaMusicApi(config)` 可以复用共享配置，也让原始函数和 `invokeModule` 的调用形态保持一致。

补充语义约束：

- factory 级 `config` 与单次调用的 `config` 采用**浅层覆盖**合并
- 单次调用 `config` 优先级更高
- `headers` 这类嵌套对象不会做 deep merge；如果你需要组合多个嵌套配置，请先在应用侧自行合并后再传入

## 仓库内仍保留的能力

以下能力仍然属于当前仓库工程的一部分，但不进入 `1.0.0` npm 根导出 allowlist：

- Bun HTTP 服务与 CLI
- 内嵌 `/docs` 文档站
- PM2 部署脚本与服务运维流程
- 仅面向 Bun server 的运行时能力

如果你需要自部署 HTTP 服务，当前仓库仍可继续用于本地运行、文档构建与服务验证；但 npm SDK 发行面会优先围绕 Node.js 消费者整理。

## 文档阅读建议

- 了解 SDK 合同：`docs/guide/programmatic-api.md`
- 了解 Cookie / 登录态输入原则：`docs/guide/authentication.md`
- 浏览 HTTP 接口能力：`docs/api/`

## 当前发布执行说明

本次 SDK 发布专题仍在实施中，仓库中的历史 Bun 服务说明与 SDK 文档正在逐步替换为新的 `1.0.0` 合同表述。若发现旧的 `createModuleApi()` / `NeteaseCloudMusicApi` 示例残留，应以冻结的 SDK 合同为准：

- `createHanaMusicApi`
- camelCase 原始模块函数
- `invokeModule`
- 显式子路径导出
