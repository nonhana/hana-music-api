---
'hana-music-api': major
---

准备 4.x 预发布候选：根 SDK 仅支持 Node.js >=24/Bun ESM，浏览器只使用独立的 hana-music-api/watchman。包仅公开根与 Watchman 子路径，普通模块配置与底层请求选项分别使用独立类型。

迁移说明集中覆盖配置拒绝、调用者保存设备和会话、统一可选 token、协议保持与已批准的身份变化、共享读取和上传多阶段行为。发布使用 next tag，稳定 latest 保持原版本；本地验证不代表候选已发布或真实上游可用。
