---
'hana-music-api': major
---

所有程序化 SDK 模块统一接受可选 checkToken 字符串或异步 provider，读取和取消也会处理显式配置。provider 按 API 请求分别取值；带 token 调用不缓存、不合并、不自动重试，固定字符串在同一次模块调用中只允许一次 API 请求，多请求请使用 provider。未配置时不取值、不附加；HTTP 通用执行配置仍拒绝 checkToken。

专辑和歌手收藏/取消固定采用 web 身份：weapi、music.163.com、浏览器 UA、os=web，移除桌面 Cookie 字段并保留会话。旧默认 PC 身份字段及普通覆盖行为因此改变。保留业务输入、Promise 响应和原有业务错误；真实上游兼容需另行验证，不以旧响应录制或离线测试代替。
