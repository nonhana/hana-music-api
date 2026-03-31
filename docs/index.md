---
layout: home

hero:
  name: hana-music-api
  text: 网易云音乐 API 文档站
  tagline: 基于 Bun、TypeScript 与 Hono 的现代化 API 文档与程序化调用指南
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /api/
    - theme: alt
      text: GitHub
      link: https://github.com/nonhana/hana-music-api

features:
  - icon: 🚀
    title: 完整站点
    details: 使用 VitePress 组织文档源码，提供多层级导航、搜索与静态构建能力。
  - icon: 🧩
    title: 366 个公开模块
    details: 以 `src/modules/` 的真实迁移模块为基准生成接口页面，减少文档与实现脱节。
  - icon: 🔎
    title: 全文搜索
    details: 启用本地搜索，支持按中文标题、接口路径、模块名和参数关键词快速定位内容。
  - icon: 🛠️
    title: 可持续维护
    details: 文档页面和侧边栏由脚本批量生成，后续新增模块时无需手工维护整站导航。
---

## 这份站点包含什么

- 面向 HTTP 调用者的 API 使用说明
- 面向 Bun / TypeScript 用户的程序化调用方式
- 从历史接口资料中整理出的注意事项、示例和限制说明
- 与当前 `hana-music-api` 路由和模块标识一致的站点结构

## 推荐阅读顺序

1. 先看 [快速开始](/guide/getting-started)
2. 再看 [认证机制](/guide/authentication) 与 [调用约定](/guide/request-convention)
3. 最后进入 [API 参考](/api/) 按分类查找具体接口
