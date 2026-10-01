# 执行配置参考

业务参数决定要查什么，执行配置决定用哪个身份、等多久、怎样联网。下面这些设置用于 SDK 或底层请求，不是 HTTP query 参数。

## 配置放在哪里

| 入口                                                  | 配置位置                                                 |
| ----------------------------------------------------- | -------------------------------------------------------- |
| `createHanaMusicApi(config)`                          | client 默认配置，可额外设置 `cache` 和 `identityPool`    |
| `hana.search(query, config)`、`search(query, config)` | 第二个参数，类型为 `ModuleCallConfig`                    |
| `invokeModule(identifier, query, config)`             | 第三个参数，类型为 `ModuleCallConfig`                    |
| `createRequest(uri, data, options)`                   | 第三个参数，与 `ModuleCallConfig` 使用相同的请求配置字段 |

client 的默认配置与单次配置按顶层字段合并，单次配置优先。嵌套对象不会递归合并。HTTP 只接受业务参数及 `cookie`、`noCookie`，见 [调用约定](/guide/request-convention)。

## 身份与请求头

| 字段      | 类型                     | 未设置时                         | 作用                                             |
| --------- | ------------------------ | -------------------------------- | ------------------------------------------------ |
| `cookie`  | `string \| CookieRecord` | 从 Cookie 请求头或运行时身份解析 | 传递账号或游客身份                               |
| `headers` | `Record<string, string>` | 无额外请求头                     | 与协议生成的头合并；协议所需字段可能覆盖自定义值 |
| `state`   | `Partial<RuntimeState>`  | 使用进程状态                     | 按次覆盖匿名令牌、设备号和默认来源 IP            |
| `ip`      | `string`                 | 使用运行时 `cnIp`                | 设置来源 IP 请求头                               |
| `realIP`  | `string`                 | 使用 `ip` 或 `cnIp`              | 比 `ip` 优先，仍只影响请求头                     |
| `ua`      | `string`                 | 按协议选择                       | 覆盖 `User-Agent`                                |

显式 `cookie` 优先于 `headers` 中的 Cookie，头名不区分大小写。`ip` 和 `realIP` 不会改变实际网络出口。细节见 [运行时状态与身份](/guide/runtime-identity)。

## 网络、期限和观测

| 字段                 | 类型                                       | 默认值               | 作用                                                 |
| -------------------- | ------------------------------------------ | -------------------- | ---------------------------------------------------- |
| `proxy`              | `string`                                   | 无代理               | HTTP 代理地址，不支持 PAC                            |
| `fetcher`            | `FetchLike`                                | 运行时 `fetch`       | 替换发送请求的实现，必须配合取消信号                 |
| `timeoutMs`          | `number`                                   | 普通调用 `8000`      | 整次调用的总期限，包含准备身份、等待、重试和读取正文 |
| `signal`             | `AbortSignal`                              | 无外部取消信号       | 取消本次调用                                         |
| `retry`              | `RequestRetryOptions`                      | 按操作和失败类型判断 | 调整允许重试时的次数、退避和状态码                   |
| `connectionStrategy` | `'default' \| 'close' \| 'fresh-on-retry'` | `'default'`          | 控制 `Connection: close` 的使用                      |
| `onRequestEvent`     | `(event: RequestDebugEvent) => void`       | 无回调               | 观察尝试、重试和请求失败事件                         |

`proxy` 和自定义 `fetcher` 不能同时传。`timeoutMs` 为 `0` 或负数时关闭普通调用的总超时；上传仍受阶段 60 秒、总计 5 分钟的上限约束，正数配置只能进一步缩短上传总期限。

`createRequest` 不执行 SDK 游客身份初始化，其默认 8 秒用于这次底层请求。HTTP 读取客户端请求体另有超时，见 [部署 HTTP 服务](/guide/server-deployment)。

详细行为见 [自定义 fetcher](/guide/custom-fetcher)、[重试与超时](/guide/retry-timeout-resilience)、[调试与可观测性](/guide/observability)。

## 协议设置

| 字段         | 类型                                             | 未设置时                          | 作用                                      |
| ------------ | ------------------------------------------------ | --------------------------------- | ----------------------------------------- |
| `crypto`     | `'' \| 'api' \| 'eapi' \| 'weapi' \| 'linuxapi'` | 模块选择协议；底层请求默认 `eapi` | 指定 API 协议，空字符串按未指定处理       |
| `domain`     | `string`                                         | 协议对应的内置域名                | 覆盖目标域名，仍受目标策略检查            |
| `e_r`        | `boolean \| number \| string`                    | 默认 `false`，也可来自请求数据    | 请求加密响应，`eapi` 和 `weapi` 支持解密  |
| `acceptGzip` | `boolean`                                        | `false`                           | 声明接受 gzip 压缩的 `eapi` 响应          |
| `checkToken` | `boolean \| number \| string`                    | `false`                           | 启用 `api` 或 `eapi` 协议中的反作弊 token |

日常调用沿用模块默认协议即可。带账号或游客身份的 API 请求只允许已知 HTTPS 网易云 API 域名，`domain` 不能用来任意转发凭据。`e_r`、`acceptGzip`、`checkToken` 建议使用明确的布尔值，细节见 [加密模式](/guide/crypto-modes)。

## 仅 client 支持的配置

| 字段           | 类型                                    | 默认值 | 作用                                                                     |
| -------------- | --------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `cache`        | `{ enabled?: boolean; ttlMs?: number }` | 关闭   | 保存明确读接口的成功结果；传对象后默认保存 120 秒，`enabled: false` 关闭 |
| `identityPool` | `{ size: number }`                      | 关闭   | 首次需要时注册多套游客身份，再按调用轮换                                 |

关闭缓存不会关闭正在执行的相同读取的合并。身份池也不会改变真实出口 IP。详见 [缓存与身份池](/guide/sdk-cache-and-identity-pool)。
