---
'hana-music-api': minor
---

新增独立的 `hana-music-api/watchman` 浏览器入口，加载官方 Watchman，页面复用初始化，每次调用现取 token。支持业务参数、CSP nonce 和有界超时，初始化失败后可主动重试；保留根 SDK 的 Node/Bun 与 SSR 导入边界。

浏览器实现独立使用完整 DOM 类型，类型检查与声明构建按运行环境分开；公开子路径声明同时兼容完整 DOM 和无 DOM/Node 类型的消费者。
