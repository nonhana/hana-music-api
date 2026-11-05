---
'hana-music-api': minor
---

新增 `hana-music-api/watchman` 浏览器入口：复用官方初始化实例，每次操作获取新令牌，支持 CSP nonce、参数与超时；Node 和 SSR 可安全导入。
