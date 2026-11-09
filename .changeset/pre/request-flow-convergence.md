---
'hana-music-api': major
---

内部自定义模块改用 `request(actionName, args)`，并将 `ModuleEffect` 绑定到本地 `moduleActions`。API 传入 `data` 和可选业务 `headers`，动态 API 另传 `path`；固定 plain 传原始 `query`，动态 plain 传受限 `target` 和原始 `body`。删除 `RequestIntent` 和两个 intent builder，不自动兼容旧签名。

服务与动态程序装配删除 `requestHandler`。测试完整调用链时改为注入 `fetcher`，模块组合测试仍可直接提供 fake capability。旧 JavaScript 装配对象只要带有 `requestHandler`，包括继承字段、值为 undefined 或不可枚举的情况，都会明确拒绝，且不读取 getter。

公开根 SDK 的调用形状、Promise 和 status/body/cookie 保持；普通配置仍在复制前拒绝旧键与未知键。API 业务数据在等待 token 前取得自有快照，上传保持原字节、阶段顺序及部分完成结果。
