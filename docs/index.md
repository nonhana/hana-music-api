---
layout: home

hero:
  name: hana-music-api
  text: SDK-first 网易云音乐 TypeScript 接口封装
  tagline: 面向 Node.js 消费者的 ESM-only SDK，保留动态模块逃生口与显式子路径合同
  actions:
    - theme: brand
      text: SDK 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 编程式调用合同
      link: /guide/programmatic-api
    - theme: alt
      text: API 参考
      link: /api/
---

## 这份站点当前覆盖什么

- **SDK 1.0.0 冻结合同**：`createHanaMusicApi`、`invokeModule`、camelCase 原始函数与公开类型
- **HTTP API 能力目录**：按分类浏览当前仓库维护的模块接口
- **认证与调用约定**：Cookie、登录态、缓存、代理等高频实践
- **仓库内遗留能力边界**：说明 Bun server / CLI / docs 哪些保留在仓库、但不进入 npm 合同

## 推荐阅读顺序

1. 先看 [快速开始](/guide/getting-started)
2. 再看 [认证机制](/guide/authentication) 与 [调用约定](/guide/request-convention)
3. 最后进入 [API 参考](/api/) 查找具体模块

## 关于 Bun 服务边界

当前仓库仍保留 Bun 服务、CLI、自托管文档站与运维脚本，但 `1.0.0` npm 发布合同是 **SDK-first**：这些能力不会作为默认根导出的一部分进入正式 npm SDK 公开面。
