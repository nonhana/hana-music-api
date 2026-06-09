---
title: "hana-music-api SDK 发布计划（ralplan 2026-06-08）"
tags: ["sdk", "release", "ralplan", "npm", "typescript"]
created: 2026-06-08T09:57:00.623Z
updated: 2026-06-08T09:57:00.623Z
sources: []
links: []
category: reference
confidence: medium
schemaVersion: 1
---

# hana-music-api SDK 发布计划（ralplan 2026-06-08）

## 当前结论

- 新专题方向成立：以 `hana-music-api` 作为单包 SDK-first、ESM-only npm 包推进。
- 默认公开形态采用 `createHanaMusicApi(config)` 的 client-first 入口。
- 同时保留原始模块函数导出和 `invokeModule(identifier, query, config?)` 作为低层与动态逃生口。
- Bun server/CLI/docs/demo 不进入 `1.0.0` npm 合同。

## 冻结的 1.0.0 合同

1. 包名：优先无 scope 的 `hana-music-api`；若所有权/治理阻塞，则执行前停下并单独改名决策。
2. 运行时：SDK 面向 Node `>=20`，仅 ESM。
3. 发布工作流：GitHub-hosted Actions，Node `>=22.14.0`，npm `>=11.5.1`，`id-token: write`。
4. 根导出：`createHanaMusicApi(config)`、`invokeModule(identifier, query, config?)`、生成的模块函数、精选低层 utility、public types。
5. 子路径：`hana-music-api/api/<module-identifier>`，无扩展名，使用规范模块标识符拼写。
6. 命名：对外函数与 client 方法采用 camelCase，由模块标识符生成；动态调用继续使用原始字符串 identifier。
7. `exports`：由 `package.json` 显式维护并人工 review；不把 tsdown 的 experimental auto-exports 当作唯一真相。
8. Changesets：作为唯一版本/发布说明引擎；任何自定义 version/publish 脚本都必须保持 `changeset version` 语义。
9. 1.0.0 硬门槛：`npm pack`、临时 ESM 消费者安装、root import、subpath import、negative import、d.ts 消费、tree-shaking/package validation、release rehearsal 全部通过。

## 关键风险

- 当前根入口仍混合 server/CLI/request/crypto，必须显式 allowlist 导出面。
- 当前 repo 的 TS 配置依赖 Bun types，发布前必须证明打包后的 d.ts 对纯 Node 消费者可用。
- `.github/` 和 `.changeset/` 目前不存在，release governance 仍是 greenfield。

## ralplan 门状态

- Architect：`ITERATE`。主因是合同冻结决策需要直接写入持久 artifacts。
- Critic：`ITERATE`。主因同上，且要求把 Node-only d.ts 消费、安全的 root allowlist、workflow 版本约束写成可验证硬门槛。

## 说明

本轮 ralplan 已产出 context / PRD / test-spec 初稿，并在会话 state 中记录了进一步冻结的合同增量；但当前 native hook 对 `.omx/plans` 的后续重写存在阻断，导致 revision delta 尚未回写进 PRD/test-spec 文件本身。后续需要先解决该持久化问题，才能让 Critic 正式通过。
