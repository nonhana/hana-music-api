---
title: 'Phase 8：发布标准化归档'
tags: ['history', 'phase-8', 'release', 'pm2']
created: 2026-06-05T05:36:15.238Z
updated: 2026-06-05T05:36:15.238Z
sources: ['stash/phase-8-bun-pm2-release-plan.md', 'stash/phase-8-release-checklist.md']
links: []
category: reference
confidence: medium
schemaVersion: 1
---

# Phase 8：发布标准化归档

- **状态**：completed
- **历史窗口**：把迁移后的项目整理成可部署、可验证、可回滚的 Bun HTTP 服务
- **原始来源**：`stash/phase-8-bun-pm2-release-plan.md`、`stash/phase-8-release-checklist.md`

## 原始意图

Phase 8 的目标非常明确：

- 让用户可以通过 Git tag 拉取源码版本部署服务
- 显式执行 `bun run docs:build`
- 用 PM2 托管 Bun HTTP 服务
- 用 `/health` 做健康检查
- 保留升级与回滚路径
- 不在当前阶段追求 npm package 分发或 Node.js 兼容

## 后来实际落地了什么

当前仓库已经落实了 Phase 8 的大部分执行项：

- `.env.example` 已存在，并包含 `ANONYMOUS_TOKEN_FILE` 默认路径。
- `ecosystem.config.cjs` 已存在，并采用单实例 fork + Bun interpreter。
- `package.json` 已包含 `verify`、`pm2:*` 与显式 `docs:*` 脚本。
- `README.md` 已写明 Bun 运行时、PM2 托管、升级、回滚、健康检查与 docs build。
- `src/app/cli.ts` 已在主入口中处理匿名 token 初始化，并补上 `SIGINT` / `SIGTERM` 优雅退出。
- 当前仓库可以成功执行 `bun run docs:build`，并在本地启动后返回 `/health` 与 `/docs`。

## 这次收口完成了什么

本轮以 `0.0.1` 为首个正式源码服务版本，补齐了 Phase 8 最后的发布闭环：

1. **仓库具备正式版本元信息**：`package.json` 明确声明 `0.0.1`。
2. **运行时版本出口已统一**：`/health` 与 `/inner/version` 默认返回 `0.0.1`。
3. **发布文档已同步**：`README.md`、`docs/changelog.md` 与部署/回滚说明已改为正式发布口径。
4. **发布前 gate 已验证**：`bun run verify` 全绿，并通过本地 `/health`、`/inner/version`、`/docs` 与代表性业务接口冒烟。

因此，Phase 8 现在更准确的描述是：

> **发布标准化与首次服务版本收口已经完成，`v0.0.1` 成为后续维护与升级的起点。**

## `phase-8-release-checklist` 的当前身份

`stash/phase-8-release-checklist.md` 仍然是有价值的，但今天它不应再被理解为“未来阶段草稿”，而应被理解为：

- 首次正式发布前的人工检查模板
- 后续打 tag 前的重复检查单

## 当前仍有用的部分

- 明确 Bun 是生产运行时，而非 Node.js 回退方案
- 明确 docs build 是显式步骤，而不是安装副作用
- 明确 PM2 的单实例 fork 是当前安全选择
- 为后续服务版本继续沿用 tag、verify 与回滚锚点提供直接检查口径

## 后续接替文档

- 当前阶段定位：见 [阶段总览与当前定位](./phase-map.md)
- 文档漂移：见 [文档漂移登记](./drift-register.md)
