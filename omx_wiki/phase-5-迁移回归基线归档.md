---
title: 'Phase 5：迁移回归基线归档'
tags: ['history', 'phase-5', 'regression']
created: 2026-06-05T05:36:15.238Z
updated: 2026-06-05T05:36:15.238Z
sources: ['stash/migration-notes.md']
links: []
category: reference
confidence: medium
schemaVersion: 1
---

# Phase 5：迁移回归基线归档

- **状态**：completed
- **历史窗口**：从“主链路已打通”过渡到“真实行为可被重复证明”
- **原始来源**：`stash/migration-notes.md`

## 原始意图

Phase 5 的核心目标，是把项目从“已经迁了很多代码”推进到“这些迁移结果可以被稳定验证”。

它不再继续追求大规模功能迁移，而是强调：

- 用真实迁移模块做离线契约回归
- 用注入式 `requestHandler` 观察请求路径、参数、加密模式与 Cookie 语义
- 补齐程序化 API、CLI 匿名 token 初始化与特殊路由的验证
- 把仓库从“能跑”推进到“可重复验收”

## 后来实际落地了什么

当前仓库中，Phase 5 的目标已经明确变成长期测试基线：

- `tests/phase-5-regression.test.ts` 锁定了搜索、语音搜索、`song_url`、`playlist_detail`、`user_account`、`login_cellphone`、`login_qr_create`、`batch`、`daily_signin`、`personal_fm` 等关键兼容行为。
- `tests/server.test.ts` 会在真实迁移模块目录上验证服务层装载、特殊路由、Cookie 语义与 docs/demo 行为。
- `tests/module-api.test.ts` 直接验证 `loadProgrammaticApi()`、`createModuleApi()`、`invokeModule()` 是否仍走真实模块链路。
- `tests/cli.test.ts` 验证匿名 token 缺失/复用/环境变量覆盖等边界。

## 为什么可以判定为已完成

因为 Phase 5 定义的“回归基线”已经从计划转成了**默认工程现实**：

- `bun test` 当前可通过。
- 核心高风险路径已具备离线回归。
- 新增功能或收口阶段都继续依赖这些测试，而不是重新讨论是否要建立基线。

## 与原始文档相比的变化

原始文档仍然带有“现在刚进入 Phase 5”的语气；但在当前仓库中，Phase 5 不再是未来动作，而是**现有工程基线的一部分**。

因此它的身份已经从“计划文档”变成“已完成阶段说明”。

## 当前仍有用的部分

- 说明为什么测试层重视**行为对齐**而不是空洞覆盖率
- 说明为什么很多测试会直接注入 `requestHandler`
- 说明为什么 Phase 5 的回归项持续影响后续代码收口

## 后续接替文档

- Phase 6 收尾：见 [Phase 6：收尾与类型化归档](./phase-06-finalization-archive.md)
- 当前阶段定位：见 [阶段总览与当前定位](./phase-map.md)
