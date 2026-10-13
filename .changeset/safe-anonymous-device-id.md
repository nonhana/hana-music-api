---
'hana-music-api': minor
---

修复匿名注册因随机设备号的摘要包含 `+` 或 `/` 而失败的问题。公开 `generateDeviceId()` 生成合格设备号，并在 `ModuleCallConfig` 声明隐式匿名注册使用的 `deviceId` 配置（#30）。
