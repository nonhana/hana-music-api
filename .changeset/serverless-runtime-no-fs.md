---
'hana-music-api': patch
---

SDK 现在可以在 Vercel 等 Serverless 函数里正常加载和调用：加载和首次调用都不再读写本地文件。

- 版本号（`innerVersion` 接口和 HTTP 服务的 `/health`）改为构建时写进产物，运行时不再查找和读取 `package.json`。以前 SDK 被打包进云函数后，周围找不到 `package.json`，加载时就会报错 `Unable to locate package.json`。
- SDK 启动时不再读取系统临时目录里的 `anonymous_token` 文件，匿名令牌只放在进程内存里：第一次不带 Cookie 的调用会注册匿名身份，函数实例被回收后，新实例会重新注册。
- HTTP 服务和 CLI 的行为不变：启动时仍从 `ANONYMOUS_TOKEN_FILE`（缺省为系统临时目录的 `anonymous_token`）读取匿名令牌，缺少时注册并写回这个文件。
