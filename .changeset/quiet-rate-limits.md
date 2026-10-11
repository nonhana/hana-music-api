---
'hana-music-api': patch
---

识别网易云 429 和 405 限频响应，返回 retryAfter 并禁止 SDK 自动重试。
