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

- **状态**：partially-landed
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

## 为什么还不能算完全闭环

虽然“可部署服务形态”已经基本成立，但正式发布层面还有几步没有完成：

1. **仓库还没有版本 tag**，无法证明首个稳定源码版本已经正式发出。
2. **服务默认版本字符串仍是 `phase-6`**，没有切到正式版本元信息策略。
3. **`docs/changelog.md` 还未形成与版本发布同步的演进记录。**

因此，Phase 8 当前更适合被描述为：

> **发布标准化主体已落地，release closeout 尚未完成。**

## `phase-8-release-checklist` 的当前身份

`stash/phase-8-release-checklist.md` 仍然是有价值的，但今天它不应再被理解为“未来阶段草稿”，而应被理解为：

- 首次正式发布前的人工检查模板
- 后续打 tag 前的重复检查单

## 当前仍有用的部分

- 明确 Bun 是生产运行时，而非 Node.js 回退方案
- 明确 docs build 是显式步骤，而不是安装副作用
- 明确 PM2 的单实例 fork 是当前安全选择
- 为未来真正打 `v0.1.0` 之类标签提供直接检查口径

## 后续接替文档

- 当前阶段定位：见 [阶段总览与当前定位](./phase-map.md)
- 文档漂移：见 [文档漂移登记](./drift-register.md)
