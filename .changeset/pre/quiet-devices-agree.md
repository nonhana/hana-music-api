---
'hana-music-api': major
---

统一每次调用的设备与请求身份。有效的 state.deviceId 优先于旧网易云 Cookie 的 deviceId，其次才用匿名或运行时设备；匿名注册正文与 HTTP Cookie 使用同一设备。调用者继续负责创建设备和保存会话。

保留各动作协议、目标和业务返回，EAPI 使用已有 iPhone 平台四项，原 weapiPc 浏览器动作改为干净 web 身份，clientlog 的 macOS UA 与 Cookie 对齐。不再为这些请求生成没有依据的 buildver、versioncode、机型和分辨率。普通模块不接受平台字段回流；显式低层 createRequest 原始选项继续保留。真实上游兼容性由父票下游验证单独记录。
