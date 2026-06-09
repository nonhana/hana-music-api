---
title: 'hana-music-api SDK 发布计划补充（ralplan delta 2026-06-08）'
tags: ['sdk', 'release', 'ralplan', 'delta', 'npm']
created: 2026-06-08T09:58:17.428Z
updated: 2026-06-08T09:58:17.428Z
sources: []
links: []
category: reference
confidence: medium
schemaVersion: 1
---

# hana-music-api SDK 发布计划补充（ralplan delta 2026-06-08）

本页用于把 `ralplan` 在 Architect / Critic 迭代中冻结下来的执行级合同补充写成持久化文本，解决 `.omx/plans` 在本轮会话下无法继续重写的问题。

## 1.0.0 执行级合同补充

## 根导出 allowlist

`1.0.0` 根入口只允许导出以下命名：

1. `createHanaMusicApi`
2. `invokeModule`
3. 生成的全部公开模块函数（camelCase 名称）
4. `createRequest`
5. `createOption`
6. public SDK types：
   - `CreateHanaMusicApiConfig`
   - `ModuleCallConfig`
   - `ModuleIdentifier`
   - `ModuleQueryOf`
   - `ModuleResponseOf`
   - `NcmApiResponse`
   - `CookieRecord`
   - `RequestCrypto`
   - `RuntimeState`
   - `FetchLike`

## 根导出 denylist

`1.0.0` 根入口不得导出：

1. `startServer`
2. `serveNcmApi`
3. `createServer`
4. `ensureAnonymousToken`
5. `generateConfig`
6. `registerAnonymous`
7. 所有 docs / demo / Bun server 相关入口
8. 所有低层 crypto helper（除非后续单独开题并通过新的合同评审）
9. 面向 Bun server 的类型导出

## 子路径合同

1. 模块函数子路径固定为 `hana-music-api/api/<module-identifier>`。
2. 子路径使用无扩展名 specifier。
3. `<module-identifier>` 保留当前规范模块标识符拼写，如 `song_url`。
4. 任何不在 `exports` map 内的路径都必须在消费者测试中解析失败。

## 命名合同

1. 根入口与 client 方法名均采用 camelCase，从 canonical module identifier 派生。
2. `invokeModule` 保留原始 identifier 字符串调用能力。
3. 生成阶段若发生命名冲突，直接失败并阻断 release。

## Node-only 声明安全门

发布前必须新增并通过一个**纯 Node 消费者 typecheck**：

1. 不注入 `@types/bun`。
2. 仅使用打包后产物和 `.d.ts`。
3. 验证 root import、subpath import、type import 均能在 Node `20.x` 消费者项目中通过。

## Release workflow 硬约束

1. 发布 workflow 必须运行在 GitHub-hosted Actions。
2. Node 版本必须为 `>=22.14.0`。
3. npm 版本必须为 `>=11.5.1`。
4. workflow 需要 `id-token: write`。
5. 必须配置 npm trusted publisher。
6. 若仓库可见性或 runner 策略不满足 provenance / trusted publishing 前提，必须中止 `1.0.0` 正式发布并返回决策层，不允许静默降级。

## Changesets 硬约束

1. `.changeset/config.json` 必须显式设置 `baseBranch`。
2. 任何自定义 `version` 脚本都必须保留 `changeset version` 语义。
3. 任何自定义 `publish` 脚本都必须保留 version PR -> publish 的发布模型。

## Packed tarball 验证补充

除了 negative import 失败外，还必须验证：

1. 打包产物本身不要求 Bun server/CLI/docs/demo 文件才能完成 root / subpath SDK 导入。
2. tarball 中不包含意外的 server-facing runtime contract 文件。

## 当前 ralplan 状态

- 方向：单包、SDK-first、ESM-only。
- 共识：主方向已收敛。
- 阻塞：需要把这些补充重新合并回 `.omx/plans` 持久 artifact，当前会话 hook 在 planning mode 下错误阻止该类重写。
