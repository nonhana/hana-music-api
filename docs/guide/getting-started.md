# 快速开始

本页描述的是 `hana-music-api` **SDK 1.0.0 冻结合同**，而不是历史上的 Bun 服务根入口。目标消费者是 **Node.js + TypeScript + ESM** 项目。

## 目标运行时

- Node.js `>=20`
- 仅 ESM
- TypeScript 项目推荐直接消费导出的 `.d.ts`

> Bun server / CLI / docs / demo 仍保留在仓库中，但不属于 `1.0.0` npm SDK 默认合同。

## 推荐入口

### 1. 默认：创建绑定配置的 client

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

### 2. 低层：直接导入单个原始模块函数

```ts
import { songUrl } from 'hana-music-api'

const result = await songUrl(
  {
    id: '347230',
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

### 3. 动态调用：保留 `invokeModule`

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

## Query / Config 分离

SDK 的调用形状有一个关键约束：

- `query` 只放业务参数
- `config` 只放执行配置（Cookie、代理、fetch、运行时状态等）

这意味着：

- `createHanaMusicApi(config)` 用来绑定共享上下文
- 原始函数保持 `(query, config?)` 形状
- `invokeModule(identifier, query, config?)` 保留动态字符串调用能力

## 子路径合同

`1.0.0` 计划保留显式的 extensionless 子路径导出，用于消费者按需导入稳定 SDK 面：

- `hana-music-api/api/<module-identifier>`
- 以及其它显式列入 `exports` map 的公开子路径

任何未进入 `exports` map 的深层路径，都不应被视为稳定消费面。

## 什么时候用哪种入口

- 需要共享 Cookie / 代理 / fetch 实现：优先 `createHanaMusicApi()`
- 只调用少量接口、关注 tree-shaking：优先直接导入单个原始函数
- 模块名来自运行时字符串：使用 `invokeModule()`

## 关于当前仓库

如果你当前使用的是仓库内 Bun 服务能力（HTTP server、CLI、PM2、自托管 `/docs`），请把它视为**仓库工程能力**而不是 npm SDK 默认公开面。SDK 发布完成后，两者会有更明确的文档边界。
