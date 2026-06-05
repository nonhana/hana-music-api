---
title: '迁移总 Plan 的起点与改写'
tags: ['history', 'plan', 'migration']
created: 2026-06-05T05:36:15.238Z
updated: 2026-06-05T05:36:15.238Z
sources: ['stash/PLAN.md']
links: []
category: reference
confidence: medium
schemaVersion: 1
---

# 迁移总 Plan 的起点与改写

- **状态**：superseded
- **历史窗口**：Phase 0 ~ Phase 4 之前的迁移起点说明
- **原始来源**：`stash/PLAN.md`

## 原始意图

`stash/PLAN.md` 的职责，是在项目还处于迁移起步阶段时，为后续接手者说明：

1. 旧仓库 `netease-music-api` 才是行为真相来源。
2. 新仓库 `hana-music-api` 才是 Bun + TypeScript + Hono 重写的落点。
3. 迁移必须优先打通 `crypto -> request -> server -> modules` 主链路，而不是先追求抽象或完整产品化。

它同时还给出了目录职责、源目录映射、阶段拆分、测试策略与风险矩阵，是最早的一份“迁移从哪里开始”的统一说明。

## 当时的重要判断

这份总 Plan 固定了几件对后续非常关键的事情：

- 目标仓库是 `hana-music-api`，不是在旧仓库原地继续补丁。
- 新服务层明确采用 Hono，而不是回到 Express/Fastify/Node 原生 HTTP。
- 工具链应服从新仓库现有基线，不重新引入另一套格式化或构建模板。
- 根目录 `index.ts` 应作为公共门面，而不是把全部业务堆在根入口。

这些判断后来都延续进了当前代码结构中。

## 后来实际落地了什么

当前仓库现实已经远超这份总 Plan 写作时的基线：

- `src/modules/` 已经装载了大规模迁移模块。
- `src/server/`、`src/app/`、`src/core/` 已形成可运行服务链路。
- `tests/` 已建立 Phase 5 回归、服务层验证、程序化 API 验证、上传链路辅助验证。
- `README.md`、`docs/`、`ecosystem.config.cjs` 与 `.env.example` 已经把项目推进到可部署服务形态。

## 与原 Plan 的主要偏差

最大偏差不是“方向错了”，而是**它停留在更早的时间点**：

- 文档中的“当前新仓库仍只有骨架”的描述已经失效。
- 文档里的某些阶段拆分，后来在实际推进中已经被合并、提前完成或由测试与文档面接手。
- 它仍然适合解释迁移为什么这样开始，但不再适合回答“现在项目进行到哪一步”。

## 当前仍有用的部分

即使被后续实现覆盖，这份总 Plan 仍保留三类长期价值：

1. **项目原始目标**：为什么要做 Bun + TS + Hono 重写。
2. **早期约束来源**：为什么目录职责、入口边界、Hono 使用边界会长成现在这样。
3. **阶段命名起点**：后续的 Phase 5~8 都是在这个框架上演化出来的。

## 后续接替文档

- 当前阶段定位：见 [阶段总览与当前定位](./phase-map.md)
- 当前架构现实：见 [架构演进记录](./architecture-evolution.md)
- 当前代码事实：见 `src/`、`tests/` 与 `omx_wiki/` 当前快照
