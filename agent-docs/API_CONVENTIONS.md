# 接口与模块约定

在新增模块、调整路由、修改输入解码、Cookie 合并、响应形状或 HTTP 安全行为前阅读本文件。

## 模块合同

`src/modules/` 中的每个端点必须在本地声明并导出 `ModuleInput`，导出 `decodeModuleInput`，并将默认导出显式标注为 `ModuleEffect<ModuleInput>`。模块通过传入的 `RequestCapability` 发请求，不直接使用 `fetch`。

输入先经过 `src/core/module-input.ts` 的普通对象校验，再进入模块自己的 Schema。需要精确字段的模块声明本地字段、可选性和字面量；证据不足的旧式输入使用受控的 legacy 对象，不伪造完整接口模型。模块生成器会检查这三个导出合同，动态 loader 也会拒绝缺少 decoder 或不是 Effect 函数的模块。

模块只为确实要读取的上游字段做局部检查。普通响应体保持 `UnknownJson`，未知字段继续保留；字段缺失或类型错误时返回带模块名和路径的 `UnexpectedUpstreamShape`。公开边界把它映射为 `status: 502`，`body.upstreamShape` 带上 `{ module, path, expected, actual }`。

## 收窄返回体

按 ADR（campanula-music `docs/adr/0005`），被下游依赖的模块在 SDK 里收窄返回体：导出 `ModuleBody` 结构定义（`Schema.toStandardSchemaV1` 包装）和同名类型，默认导出标注为 `ModuleEffect<ModuleInput, ModuleBody>`。生成器把它们以 `<模块名 PascalCase>Body` 从根入口公开；只导出类型的模块（如 `image_upload_token`）只公开类型。

- 用 `src/core/upstream-body.ts` 的 `UpstreamObject` 声明对象：只写脱敏后真实录制里确认过、且下游要用的字段，其余字段原样保留为 JSON。区分返回码时每个联合成员只认一个 `code` 字面量。
- 用 `decodeUpstreamBody` 校验 SDK 将要返回的 body：`code` 不在已知返回码里时作为 `UpstreamBusinessFailed` 原样转交网易云的正文（`status` 取返回码），已知返回码但结构不符时报 `UnexpectedUpstreamShape`。
- 失败正文有录制时可另外导出结构定义（如 `LoginCellphoneRiskBody`），不在运行时校验；没有录制的返回码不猜字段。
- 录制放在 `tests/fixtures/netease/<领域>/`，契约测试用自定义 fetcher 回放，覆盖原样返回、多余字段保留和结构不符三种情况，见 `tests/contract/login-bodies.test.ts`。

响应体完全由模块自己组装、每个字段都已校验时也可以导出 `ModuleBody`，例如 `image_upload_token`、`login_qr_create`。

## SDK 与 HTTP 输入

SDK 调用把接口业务参数放在 query，把 `cookie`、`proxy`、`fetcher`、`retry`、`timeoutMs` 和 `signal` 等执行配置放在 config。HTTP 只接受业务参数以及传统的 `cookie`、`noCookie`；执行配置在发送前返回 400。

HTTP 路由按请求头 Cookie → query → body 的顺序合并，后者覆盖前者；HTTPS 响应写回 Cookie 时保留 `SameSite=None; Secure`。调试请求入口默认关闭，只有 loopback 的 `startServer` 配置可以开启。

## 路由与准入

模块名由 `src/server/module-discovery.ts` 转换为 URL 路由；模块 registry、类型表和具名 SDK 文件由 `scripts/gen-module-types.mts` 生成，不手工维护平行表。

服务准入在读取请求 body 前取得许可。默认每个连接 IP 每秒 2 次、突发 10 次，最多同时执行 32 个模块和 2 个上传；速率拒绝返回 429，容量拒绝返回 503，并附带 `Retry-After`。只有显式配置在 `traffic.trustedProxyIps` 中的连接地址才可转发客户端 IP。

携带身份的 API 只能访问已知 HTTPS 网易云 API 目标；网页和 NOS 请求也必须通过目标策略。登录、写入、批量、轮询和上传不因普通读取规则而自动重放。

## 错误与公开形状

请求层负责目标拒绝、上游限流、期限、传输和协议失败；HTTP 服务层负责入口准入拒绝；模块层负责输入错误、上游结构错误、业务失败和上传部分完成。内部错误只在公开边界映射为既有的 `{ status, body, cookie }` Promise 响应。

相关实现：`src/modules/`、`src/server/routes.ts`、`src/server/execution-input.ts`、`src/server/admission.ts`、`src/server/module-loader.ts`、`scripts/gen-module-types.mts`。
