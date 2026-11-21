---
'hana-music-api': major
---

移除全部可选 `peerDependencies`（`undici`、`music-metadata`、`qrcode`），剥离 SDK 内核中的非协议能力并收敛依赖边界：

1. **移除 `proxy` 配置与 `undici` 可选依赖**：从 `ModuleCallConfig`、`CreateRequestOptions`、`createOption` 与传输内核彻底移除 `proxy`。传入 `proxy` 会在发送请求前明确拒绝（客户端构造抛出 `TypeError`，单次调用或 `createRequest` 拒绝 `status: 400`、`failure.kind === 'invalidRequest'`）。代理场景请改用自定义 `config.fetcher` 注入（如 Node.js 中搭配 `undici.ProxyAgent`，Bun 中传入 `fetch(input, { ...init, proxy })`）。
2. **`loginQrCreate` 与 `verifyGetQr` 移除 `qrimg` 与 `qrcode` 可选依赖**：`loginQrCreate` 不再接受 `qrimg` 参数（传入将以 `400` 拒绝）且不再返回 `data.qrimg`；`verifyGetQr` 不再返回 `data.qrimg`。两者仅返回协议链接 `data.qrurl`（及 `data.qrCode`），二维码图片由应用层自行按 `qrurl` 渲染。
3. **`cloud` 移除 `music-metadata` 可选依赖并新增显式元数据输入**：`cloud` 不再在运行时解析音频二进制标签，新增可选字段 `song?: string`、`artist?: string` 与 `album?: string`；省略时自动回退至文件名与默认专辑/歌手。
