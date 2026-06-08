# 编程式调用

本页描述的是 `hana-music-api` **SDK 1.0.0 冻结合同**。核心目标是提供一个对 npm 消费者友好的、**SDK-first + ESM-only** 的公开接口，同时保留高级用户需要的低层逃生口。

## 主入口

SDK 根入口将围绕三个层次组织：

1. `createHanaMusicApi(config)`：默认推荐入口，返回绑定配置的 client
2. camelCase 原始模块函数：适合细粒度导入与 tree-shaking
3. `invokeModule(identifier, query, config?)`：动态字符串模块调用逃生口

## createHanaMusicApi

```ts
import { createHanaMusicApi } from 'hana-music-api'

const hana = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
})

const searchResult = await hana.search({
  keywords: '周杰伦',
  limit: 5,
})

const detailResult = await hana.songUrl({
  id: '347230',
  br: 320000,
})
```

`createHanaMusicApi(config)` 适合：

- 多次调用多个模块
- 需要复用 Cookie / 代理 / fetch / 运行时状态
- 希望业务代码始终只传 query，不反复拼执行配置

## 原始模块函数

```ts
import { search, songUrl } from 'hana-music-api'

const searchResult = await search(
  {
    keywords: '林俊杰',
    limit: 3,
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)

const songUrlResult = await songUrl(
  {
    id: '347230',
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

这一层的设计目标是：

- 命名符合 JavaScript / TypeScript 常见习惯（camelCase）
- 支持 tree-shaking
- 让单模块调用不需要先创建 client

## invokeModule

```ts
import { invokeModule } from 'hana-music-api'

const account = await invokeModule(
  'user_account',
  {},
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

`invokeModule` 保留了对规范 module identifier 的直接调用能力，适合：

- identifier 来自配置文件、数据库或插件系统
- 需要保留原始模块命名（如 `song_url`、`user_account`）
- 不想在上层代码里预先绑定所有模块函数

## Query / Config 分离原则

`1.0.0` 合同的核心变化之一，是把接口业务输入与执行上下文显式拆开。

### 推荐形状

```ts
await songUrl(
  {
    id: '347230',
    br: 320000,
  },
  {
    cookie: 'MUSIC_U=your-cookie',
  },
)
```

### 不再推荐的旧形状

```ts
await invokeModule('song_url', {
  id: '347230',
  br: 320000,
  cookie: 'MUSIC_U=your-cookie',
})
```

拆分后的好处：

- 业务 query 更清晰
- 共享 config 可以在 client 层统一绑定
- 原始函数、client 方法与动态调用保持一致的认知模型

## 命名与子路径合同

- 根入口与 client 方法采用 **camelCase**
- 动态调用继续使用规范的 snake_case module identifier
- `1.0.0` 计划保留 extensionless 子路径：`hana-music-api/api/<module-identifier>`
- 未写入 `exports` map 的路径都不属于稳定消费面

## 高阶使用场景

### 自定义 fetch

```ts
import { createHanaMusicApi } from 'hana-music-api'

const hana = createHanaMusicApi({
  fetch: globalThis.fetch,
})
```

### 每次调用覆盖部分配置

```ts
import { search } from 'hana-music-api'

const result = await search(
  {
    keywords: '周杰伦',
  },
  {
    proxy: 'http://127.0.0.1:7890',
  },
)
```

## 与仓库内 Bun 能力的关系

当前仓库仍然维护：

- Bun HTTP 服务
- CLI 与部署脚本
- 文档站构建
- 服务侧运维流程

这些能力不会进入 `1.0.0` npm 根导出 allowlist。编程式调用文档应优先服务 npm SDK 消费者，而不是继续让默认心智停留在 Bun 服务根入口。
