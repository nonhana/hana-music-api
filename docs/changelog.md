# 更新日志与发布轨迹

从 `hana-music-api` SDK `1.0.0` 开始，**发布说明的权威来源将迁移到 Changesets 生成结果与 GitHub Releases**。

这意味着：

- 手写 `docs/changelog.md` 不再作为长期维护的主发布历史来源
- 正式 npm SDK 版本的变更说明，应以 release PR、changeset 条目与 GitHub release notes 为准
- 本页只保留迁移说明与历史仓库阶段的归档摘要

## 迁移后的发布历史读取方式

- 查看 Changesets 生成的版本说明
- 查看 GitHub Releases 中对应版本的 release notes
- 结合 SDK 消费者验证记录、pack 产物与发布工作流证据判断是否可升级

## 历史归档（手工阶段）

### 2026-06-08

- 发布首个正式源码服务版本 `v0.0.1`
- 将 `/health` 与 `/inner/version` 的默认版本元信息统一到 `0.0.1`
- 固化 Bun + PM2 的首次部署、升级与回滚流程
- 将 `bun run verify`、`bun run docs:build` 与服务冒烟检查纳入正式发布前基线
- 确认当前 modules 类型系统重构成果作为 `0.0.1` 的工程基线进入发布面

### 2026-03-31

- 发布 `hana-music-api` 文档站
- 提供按分类浏览的 API 参考页
- 补充认证机制、调用约定与编程式调用指南
- 支持文档搜索、静态构建与本地预览

## 说明

当前仓库仍在从 Bun 服务导向的历史叙事，迁移到 SDK-first 的 npm 发布叙事。若本页内容与 Changesets / GitHub Releases 不一致，应以后者为准。
