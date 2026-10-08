# hana-music-api 发布日志

## 1.3.0

### Minor Changes

- 4c153e0: SDK 不再在本地限制发往网易云的请求频率，调用方需要自己控制请求频率。

  - 删掉进程级出口配额：以前每个身份每秒 2 次、每个上游域名每秒 4 次、同时最多 8 个请求在路上，超出的排队，排队超过 2 秒就返回 503。现在每次调用都立刻发给网易云，不排队、不延迟，也不会因为本地额度不足返回 503。
  - 删掉收到限频后的冷却：以前网易云对一个身份返回 429，会同时冷却这个身份和整个上游域名，同一进程里其他身份的调用也直接返回 429。现在这次调用照常以 429 失败、带上 `retryAfter`，SDK 不重试，也不影响其他调用。
  - 调用方（例如批量同步曲库的程序、音乐爬虫）要自己限制并发和频率，收到 429 后按 `retryAfter` 退避。
  - HTTP 服务按来访 IP 的入口限流不变（默认每个 IP 每秒 2 次、突发 10 次，最多同时执行 32 个模块），它仍然保护对外开放的 HTTP 服务。
  - 相同读请求合并、可选的结果暂存、8 秒总期限、eapi 加密和 Cookie 处理都不变。

## 1.2.1

### Patch Changes

- e59319b: SDK 现在可以在 Vercel 等 Serverless 函数里正常加载和调用：加载和首次调用都不再读写本地文件。

  - 版本号（`innerVersion` 接口和 HTTP 服务的 `/health`）改为构建时写进产物，运行时不再查找和读取 `package.json`。以前 SDK 被打包进云函数后，周围找不到 `package.json`，加载时就会报错 `Unable to locate package.json`。
  - SDK 启动时不再读取系统临时目录里的 `anonymous_token` 文件，匿名令牌只放在进程内存里：第一次不带 Cookie 的调用会注册匿名身份，函数实例被回收后，新实例会重新注册。
  - HTTP 服务和 CLI 的行为不变：启动时仍从 `ANONYMOUS_TOKEN_FILE`（缺省为系统临时目录的 `anonymous_token`）读取匿名令牌，缺少时注册并写回这个文件。

## 1.2.0

### Minor Changes

- b57dd49: 重写请求内核与模块执行架构：统一处理请求意图、身份快照、加密、限流、并发、缓存、重试、超时、取消、响应解释和资源释放。Effect 只用于内部编排，`createHanaMusicApi`、具名模块函数、`invokeModule` 与 `createRequest` 继续返回 Promise，响应继续保持 `{ status, body, cookie }` 外壳。

  所有 351 个模块现在都声明本地 `ModuleInput` 和输入解码器，并使用 `ModuleEffect` 执行；生成的 SDK 类型表与模块注册表同步更新。已确认输入会在发起请求前进行更严格的校验，依赖旧式宽松输入的调用需要按模块定义修正。

  自定义模块和动态模块作者需要采用 `ModuleDefinition`、`decodeInput`、`ModuleEffect` 与 `RequestCapability` 的新内部扩展约定；普通 SDK 使用者无需引入 Effect 或改变公开调用方式。

## 1.1.1

### Patch Changes

- 2198d3b: - 声明 MIT 开源协议。
  - 新增 LICENSE 文件，并在 package.json 中补齐 license: MIT 字段（npm 会随包发布，消费者可见）
  - 同步完善文档站：汉化 CHANGELOG、重写上手指南并新增「请求层进阶」系列文档（不影响运行时行为）

## 1.1.0

### 次要变更

- 786e9b6: 强化高频调用场景下的请求层能力与流量伪装策略。

  重点摘要：

  - 修复 weapi (`e_r`) 加密响应的解密逻辑，使其与旧实现保持一致；现在 eapi 与 weapi 的加密响应都会正确解密
  - SDK 调用路径下，当未显式提供 `ip` 或 `realIP` 时，默认注入运行时中国 IP（`cnIp`）；显式配置仍然优先，HTTP 服务路径不受影响
  - 为单次请求尝试引入保守的默认超时 8 秒；可通过 `timeoutMs: 0` 关闭
  - 默认重试“连接尚未建立”类传输错误；这类错误没有重复提交风险，而歧义性 socket 错误与业务状态码仍需显式开启重试
  - 支持通过 `acceptGzip` 显式开启 gzip eapi 响应
  - SDK 调用路径会懒加载匿名 token，并通过 single-flight 去重
  - 新增可选的 SDK 响应缓存（`cache`），同时支持 single-flight 请求去重
  - 新增可选的匿名身份池（`identityPool`），可在多次调用之间轮换 `deviceId`、`cnIp` 与 token

## 1.0.0

### 重大变更

- 9b71f47: 以 `1.0.0` 正式发布首个以 SDK 为中心的 npm 包契约。

  重点摘要：

  - 将根包导出面收敛为以 `createHanaMusicApi` 为核心的冻结 SDK 契约
  - 在根 SDK 导出面补齐 camelCase 形式的原始模块导出
  - 提供基于 tsdown 的纯 ESM 构建产物，并声明明确的 package exports
  - 补齐面向包消费者的契约校验、changesets 发版流程与 GitHub Release 自动化
