---
'hana-music-api': major
---

重构 SDK 打包产物、子路径导出、类型声明与依赖树：

### 破坏性变更（Breaking Changes）

- **根入口 `*Body` 校验器改为纯类型导出**：根入口 `hana-music-api` 不再导出 315 个 `*Body` 与 `LoginCellphoneRiskBody` 的运行时值，仅保留 `export type` 类型导出。运行时 Standard Schema v1 校验器迁移至 `hana-music-api/schemas`、`hana-music-api/schemas/<module>` 与 `hana-music-api/api/<module>`。
- **收敛运行时依赖树**：`dependencies` 仅保留 `effect`。`hono` 移入 `devDependencies`；`undici`、`music-metadata`、`qrcode` 转为可选 `peerDependencies`（`peerDependenciesMeta: { optional: true }`），按需动态加载：
  - Node.js 环境传入 `proxy` 且未安装 `undici` 时，拒绝为 `status: 400`（`failure.kind === 'invalidRequest'`）并提示安装 `undici`；
  - 未安装 `qrcode` 时，`loginQrCreate({ key })` 仍正常返回空 `qrimg`，而 `loginQrCreate({ key, qrimg: true })` 与 `verifyGetQr` 拒绝为 `failure.kind === 'unknown'` 并提示安装 `qrcode`；
  - 未安装 `music-metadata` 时，`cloud` 优雅回退至文件名与默认标签。

### 新能力与优化

- **开放 7 组公开子路径**：`package.json#exports` 开放 `.`、`./api/*`、`./schemas`、`./schemas/*`、`./core`、`./utils` 与 `./watchman`，构建产物切换为 `tsdown` `unbundle: true`。
- **新增组合式按需客户端 `createClient(modules, config)`**：由 `.` 与 `./core` 导出，仅绑定传入模块子集并共享缓存、身份池与默认配置，支持完整 Tree-shaking。
- **零 Effect 纯工具入口 `./utils`**：导出 `generateDeviceId`、`isNcmApiResponse`、`getNcmFailureInfo`、`createOption` 与纯类型，不引入 `effect` 或业务模块。
- **纯 Standard Schema v1 `.d.ts` 收口与精确 `effect/*` 子路径**：通过 `BodySchema<T>` 收口 315 个返回体声明，消除 8.59 MB 单体 `.d.ts` 与 Effect 内部类型泄漏；发布图源码全面切换至精确 `effect/*` 子路径导入。
