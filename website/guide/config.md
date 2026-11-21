# 执行配置

业务参数（`query`）决定调用哪个接口的哪份数据，执行配置（`config`）控制身份、超时、传输、重试与观测行为。执行配置仅用于 SDK 编程式调用与底层请求，不能通过 HTTP 参数传入。

## 配置入口与合并优先级

| 调用入口                                               | 配置传参位置                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `createHanaMusicApi(config)`                           | 客户端默认配置，支持 `ModuleCallConfig` 与 `cache`、`identityPool` |
| `createClient(modules, config)`                        | 客户端默认配置，支持 `ModuleCallConfig` 与 `cache`、`identityPool` |
| `hana.search(query, config)` / `search(query, config)` | 第二个参数，类型为 `ModuleCallConfig`                              |
| `invokeModule(identifier, query, config)`              | 第三个参数，类型为 `ModuleCallConfig`                              |
| `createRequest(uri, data, options)`                    | 第三个参数，类型为 `CreateRequestOptions`（不支持 `checkToken`）   |

- **合并优先级**：单次调用的 `config` 优先于客户端默认配置。合并仅在顶层字段进行浅合并，传入新对象（如 `state` 或 `retry`）会整体替换默认配置中的同名对象。
- **严格键检查**：在 `query` 中混入配置字段或在 `config` 中传入未知字段均会被拒绝（单次调用返回 `status: 400`，创建客户端时同步抛出 `TypeError`）。

## 身份与请求选项

| 字段         | 类型                                | 默认值              | 说明                                                  |
| ------------ | ----------------------------------- | ------------------- | ----------------------------------------------------- |
| `cookie`     | `string \| CookieRecord`            | 从运行时身份解析    | 传递账号或游客会话 Cookie                             |
| `checkToken` | `string \| (() => Promise<string>)` | 未设置              | 易盾行为校验令牌，异步函数会在每次 API 请求前调用取值 |
| `state`      | `Partial<RuntimeState>`             | 使用当前进程状态    | 按次覆盖 `anonymousToken`、`deviceId` 与 `cnIp`       |
| `ip`         | `string`                            | 使用运行时 `cnIp`   | 设置来源 IP 请求头（`X-Forwarded-For` / `X-Real-IP`） |
| `realIP`     | `string`                            | 使用 `ip` 或 `cnIp` | 优先级高于 `ip`，同样仅修改请求头                     |

- **设备 ID 选择顺序**：优先使用有效 `state.deviceId`，其次读取 `cookie.deviceId`，最后回退到进程运行时默认设备 ID。关于设备 ID 生成与身份池交互见 [运行时身份与状态](/guide/runtime-identity)。
- **IP 请求头规则**：来源 IP 按 `realIP > ip > state.cnIp` 选取，仅用于构造请求头，不改变实际网络出口。
- **`checkToken` 行为**：传入 `checkToken` 会关闭该次调用的读缓存、并发去重与自动重试，等待取值计入总超时时间。
- **`checkToken` 格式与取值**：空白字符或无法写入 HTTP 头的非法字符串会在发送前以 `400` 拒绝，多请求模块应传入异步取值函数而非固定字符串。浏览器采集用法见 [浏览器 Watchman](/guide/watchman)。

## 网络、超时与观测选项

| 字段                 | 类型                                       | 默认值             | 说明                                                               |
| -------------------- | ------------------------------------------ | ------------------ | ------------------------------------------------------------------ |
| `fetcher`            | `FetchLike`                                | 运行时全局 `fetch` | 自定义请求发送函数（可用于代理与日志），须尊重传入的 `AbortSignal` |
| `timeoutMs`          | `number`                                   | `8000`             | 整次调用总超时时间（毫秒），含身份准备、等待、重试与读正文         |
| `signal`             | `AbortSignal`                              | 无                 | 外部取消信号，触发时以 `status: 499`（`cancelled`）拒绝            |
| `retry`              | `RequestRetryOptions`                      | 按模块策略决定     | 配置允许重试的次数、退避间隔、抖动与状态码                         |
| `connectionStrategy` | `'default' \| 'close' \| 'fresh-on-retry'` | `'default'`        | 控制是否在请求中附带 `Connection: close`                           |
| `onRequestEvent`     | `(event: RequestDebugEvent) => void`       | 无                 | 订阅请求尝试、重试与失败观测事件                                   |

- **超时关闭与上传上限**：普通调用将 `timeoutMs` 设为 `0` 或负数会关闭总超时控制。上传类模块固定受单阶段 60 秒、总计 5 分钟（`300000` 毫秒）上限约束，正数 `timeoutMs` 仅能进一步缩短上传总超时时间。

各选项的完整行为详见 [自定义 fetcher 与网络代理](/guide/proxy-and-fetcher)、[超时、重试与连接策略](/guide/resilience) 与 [调试与可观测性](/guide/observability)。

## 客户端级选项

仅 `createHanaMusicApi(config)` 与 `createClient(modules, config)` 接收以下两个全局协同选项：

| 字段           | 类型                                    | 默认值 | 说明                                                          |
| -------------- | --------------------------------------- | ------ | ------------------------------------------------------------- |
| `cache`        | `{ enabled?: boolean; ttlMs?: number }` | 关闭   | 缓存可共享读接口的成功结果，传入对象默认 TTL 为 `120000` 毫秒 |
| `identityPool` | `{ size: number }`                      | 关闭   | 首次需要会话时预注册多套游客身份并在未显式指定身份时轮换使用  |

即使关闭 `cache`，同一客户端实例内相同参数与身份的并发读请求仍会自动去重。详细机制见 [缓存与身份池](/guide/cache-and-identity-pool)。

## 底层请求选项

部分协议控制参数仅支持在底层 `createRequest(uri, data, options)` 中传入，包括 `crypto`、`domain`、`ua`、`e_r`、`acceptGzip` 与 `headers`。用法见 [底层请求](/guide/low-level-request)。

## 已移除的旧配置键

以下配置键已从模块执行配置或请求选项中移除，传入（即使值为 `undefined`）会在发送前被直接拒绝：

| 已移除配置键                                                  | 替代方案                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `proxy`                                                       | 改用自定义 `fetcher` 注入代理客户端（见 [自定义 fetcher](/guide/proxy-and-fetcher)） |
| 顶层 `deviceId`                                               | 改用 `state: { deviceId }`                                                           |
| `headers.Cookie`                                              | 改用 `cookie` 字段传递会话字符串或键值对象                                           |
| `crypto`、`domain`、`ua`、`e_r`、`acceptGzip`、其他 `headers` | 普通接口按内置协议执行。确需手动控制协议或请求头时改用 `createRequest`               |
