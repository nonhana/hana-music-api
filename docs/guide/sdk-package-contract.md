# SDK 包合同（1.0.0 冻结草案）

> 状态：已冻结执行级合同，等待实现与 consumer 验证全部通过后再进入正式 `1.0.0` 发布。
>
> 本页描述的是 **npm SDK 发布合同**，不是当前 `0.0.x` Bun 服务根入口的完整镜像。

## 目标定位

`hana-music-api` 的 `1.0.0` 目标是一个：

- **单包**
- **SDK-first**
- **ESM-only**
- 面向 **Node `>=20`** 的 npm 包

这意味着 `1.0.0` 的包合同会优先服务 SDK 消费者，而不是继续把当前 Bun server / CLI / docs / demo 入口整体带入 npm 默认导出面。

## 根入口允许导出的能力

`1.0.0` 根入口只允许暴露以下能力：

1. `createHanaMusicApi`
2. `invokeModule`
3. 全部公开模块的 camelCase 原始函数导出
4. `createRequest`
5. `createOption`
6. 面向 SDK 消费者的 public types

其中默认推荐入口是：

```ts
import { createHanaMusicApi } from 'hana-music-api'

const api = createHanaMusicApi({
  cookie: 'MUSIC_U=your-cookie',
})

const account = await api.userAccount({})
```

低层逃生口仍然保留：

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

## 根入口明确不进入 1.0.0 合同的内容

下列能力不属于 `1.0.0` npm 根导出合同：

- `startServer`
- `serveNcmApi`
- `createServer`
- `ensureAnonymousToken`
- `generateConfig`
- `registerAnonymous`
- Bun server / CLI / docs / demo 相关入口
- 未经单独评审的底层 crypto helper
- 面向 Bun server 的专用类型导出

换句话说：**仓库里仍可保留这些实现，但它们不是 `1.0.0` SDK 默认公开面的一部分。**

## 子路径合同

公开模块函数子路径固定为：

```txt
hana-music-api/api/<module-identifier>
```

约束如下：

1. 使用无扩展名 specifier。
2. `<module-identifier>` 保持规范模块标识符拼写，例如 `song_url`。
3. 不在 `exports` map 内的深层路径，必须在消费者验证里解析失败。

## 命名合同

- 根入口导出的模块函数使用 **camelCase**。
- `createHanaMusicApi()` 返回的 client 方法也使用 **camelCase**。
- `invokeModule()` 继续保留原始字符串 identifier 调用能力。
- 若模块命名转换发生冲突，生成阶段必须直接失败并阻断发布。

## query / config 分离原则

`1.0.0` SDK 的原始函数层会把：

- 业务查询参数（query）
- 执行上下文（cookie / proxy / signal / runtime config）

明确分离，避免把执行配置继续混入业务 query 对象。

这既服务 `createHanaMusicApi()` 的共享配置能力，也降低原始函数调用的歧义。

## Node-only 消费者硬门槛

正式发布前必须证明打包后的声明文件对纯 Node 消费者成立：

1. 不注入 `@types/bun`
2. 只消费打包产物与 `.d.ts`
3. root import / subpath import / type import 都能在 Node `20.x` 消费者项目中通过

只要这组验证失败，就不能把当前产物视为可发布 SDK。

## 发布治理合同

`1.0.0` 发布流程也属于产品合同的一部分：

- GitHub-hosted Actions
- Node `>=22.14.0`
- npm `>=11.5.1`
- `id-token: write`
- npm trusted publishing
- public publish 时生成 provenance
- Changesets 作为唯一版本与发布说明引擎

若仓库权限、runner 策略或 npm trusted publisher 前提不满足，必须停止正式发布，而不是静默降级。

## 文档边界

阅读当前文档时请注意两个边界：

1. **现有服务文档** 仍主要描述 `0.0.x` 阶段的 Bun 服务与历史程序化入口。
2. **本页** 描述的是已经冻结的 `1.0.0` npm SDK 合同。

因此在实现完全落地前，若两者出现差异，请优先按本页理解 SDK 发布边界。

## 发布前必须完成的消费者验证

至少需要补齐并通过以下验证，`1.0.0` 才可进入最终发布判断：

- `npm pack`
- 临时 ESM 消费者安装
- root import
- subpath import
- negative import
- `.d.ts` 消费
- tree-shaking / package validation
- release rehearsal

这也是为什么 `1.0.0` 不能等价于“本地 build 一次成功”。
