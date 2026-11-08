---
'hana-music-api': major
---

账号、登录与社交的83个模块使用显式请求动作，保留46个weapi和37个eapi的原协议；最终身份统一为web与iPhone组合，业务输入、响应Schema和Cookie外壳保持。

普通config的crypto、domain、ua、e_r、acceptGzip、冲突headers与受控身份Cookie不再覆盖这批声明；需要原始协议控制时使用显式低层createRequest，旧公开配置类型与运行时覆盖已统一移除。消息/会话/刷新类读取不再自动重试连接前失败；写入、登录、风控与一起听轮询/心跳不自动重放，不新增共享缓存或合并。SDK仍由调用者显式传递后续会话Cookie，不自动维护登录Cookie jar。
