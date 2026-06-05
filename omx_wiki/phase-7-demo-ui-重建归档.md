---
title: 'Phase 7：本地 Demo UI 重建归档'
tags: ['history', 'phase-7', 'demo-ui']
created: 2026-06-05T05:36:15.238Z
updated: 2026-06-05T05:36:15.238Z
sources: ['stash/phase-7-demo-ui-modernization-plan.md']
links: []
category: reference
confidence: medium
schemaVersion: 1
---

# Phase 7：本地 Demo UI 重建归档

- **状态**：completed
- **历史窗口**：在服务、模块与文档主链路稳定后，重建本地调试 UI
- **原始来源**：`stash/phase-7-demo-ui-modernization-plan.md`

## 原始意图

Phase 7 的目标，是彻底放弃旧 `public/` 静态托管思路，把本地调试入口统一迁到新的 `/demo/*` 路由体系中，并坚持：

- 不再引入独立前端工程
- 沿用 Bun + Hono + TypeScript 主技术栈
- 让 `bun dev` 仍然是单命令、单进程入口
- 把 Demo UI 与 docs 文档站职责分离

## 后来实际落地了什么

当前仓库已经具备完整的 Phase 7 落地结果：

- `src/server/demo-routes.tsx` 负责注册 `/demo`、`/demo/*`、静态脚本与听歌识曲资源。
- `src/demo/pages/*` 提供了 Demo 首页、API debug、搜索、扫码登录、歌单封面上传、听歌识曲等页面。
- `src/demo/client/*` 承担局部客户端交互脚本。
- `tests/server.test.ts` 已验证 demo 首页、首批页面、client assets 与音频识别资源可访问。
- 服务层已不存在 `src/server/static.ts` 一类旧静态托管主线文件，说明旧 `public/` 路径已退出运行主链路。

## 为什么可以判定为已完成

原始文档中的 Phase 7 大多数条目已经不再是“推荐怎么做”，而是“当前代码就是这么做的”。

它最初是一份方案文档；在今天，它更像是对当前 Demo 子系统落地形态的历史说明。

## 与原始文档相比的变化

- 原文还把“当前服务层仍有静态路由/旧 `public/`”作为现状背景，但当前代码已经进入 `/demo/*` 新结构。
- 原文还按未来阶段拆 Demo UI 的迁移分期；今天这些分期已经大幅转化为真实文件与路由。

## 当前仍有用的部分

- 解释为什么 Demo UI 不采用独立 React/Vue/Vite 工程
- 解释为什么 `/demo/*` 与 `/docs` 被明确分离
- 为后续新增或维护 demo 页面提供设计边界参考

## 后续接替文档

- 当前架构现实：见 [架构演进记录](./architecture-evolution.md)
- 当前阶段定位：见 [阶段总览与当前定位](./phase-map.md)
