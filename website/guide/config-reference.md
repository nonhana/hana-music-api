# 执行配置参考

业务参数决定要查什么，执行配置决定用哪个身份、等多久、怎样联网。下面这些设置用于 SDK 或底层请求，不是 HTTP query 参数。

## 配置放在哪里

| 入口                                                  | 配置位置                                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| `createHanaMusicApi(config)`                          | client 默认配置，可额外设置 `cache` 和 `identityPool`                |
| `hana.search(query, config)`、`search(query, config)` | 第二个参数，类型为 `ModuleCallConfig`                                |
| `invokeModule(identifier, query, config)`             | 第三个参数，类型为 `ModuleCallConfig`                                |
| `createRequest(uri, data, options)`                   | 第三个参数，使用独立的 `CreateRequestOptions`，不含模块 `checkToken` |

client 的默认配置与单次配置按顶层字段合并，单次配置优先。嵌套对象不会递归合并。HTTP 只接受业务参数及 `cookie`、`noCookie`，见 [调用约定](/guide/request-convention)。

## 模块身份与执行配置

| 字段         | 类型                                | 未设置时            | 作用                                                      |
| ------------ | ----------------------------------- | ------------------- | --------------------------------------------------------- |
| `cookie`     | `string \| CookieRecord`            | 从运行时身份解析    | 传递账号或游客身份                                        |
| `checkToken` | `string \| (() => Promise<string>)` | 未设置              | 所有 SDK 模块可选传递的易盾令牌；provider 按 API 请求取值 |
| `state`      | `Partial<RuntimeState>`             | 使用进程状态        | 按次覆盖匿名令牌、设备号和默认来源 IP                     |
| `ip`         | `string`                            | 使用运行时 `cnIp`   | 设置来源 IP 请求头                                        |
| `realIP`     | `string`                            | 使用 `ip` 或 `cnIp` | 比 `ip` 优先，仍只影响请求头                              |

普通模块只接受上表及下面的网络配置。客户端平台和协议来自动作声明，账号 `MUSIC_U`、游客 `MUSIC_A`、`__csrf` 等会话 Cookie 仍随本次调用传递。`ip` 和 `realIP` 只设置来源请求头，不会改变实际网络出口。

有效的 `state.deviceId` 优先于旧 Cookie 的设备，再使用已有匿名或运行时设备。空白和控制字符无效；调用方负责设备创建与跨调用保存。顶层 `deviceId` 已移除，纯 JavaScript 调用也会拒绝它。示例见[运行时状态与身份](/guide/runtime-identity)。

所有 SDK 模块都可选择传入 `checkToken`，读取、收藏和取消使用同一规则。未配置时不取令牌、不附加；配置了空串、空白值或失败的 provider 时，在业务请求发送前以 400 拒绝。token 值必须能原样写入 HTTP 头，首尾空白或非法头字符在发送前以 400 拒绝，避免正文与头不一致。等待 provider 计入总期限，超时或取消后不会继续发送。

传字符串适合一次 API 请求；同一模块调用需要第二次 API 请求时会明确拒绝，使用 provider 才能逐次取新值。带 token 调用不使用缓存、请求合并或自动重试；未配置时保留原有读取策略。纯本地模块不取值，外部上传不会收到 token。SDK 不生成或保存令牌，也不保证任意上游接口接受它。

weapi 把同一值放进加密正文 `checkToken` 和 HTTP 头 `X-antiCheatToken`；eapi 还写入加密头。api 使用表单、linuxapi 使用加密转发正文。网易云的原始 plain 请求只通过 HTTP 头传值，不改 URL 或原始正文；外部上传不接收。token 本身也受 HTTPS 安全目标约束，即使没有账号 Cookie 也不能发往自定义外部域名。令牌不会进入 Cookie、URL 或请求事件。该配置只用于程序化模块调用，普通 HTTP 路由继续拒绝它；底层 `createRequest` 不接受这个模块配置。浏览器取值见 [Watchman](/guide/watchman)。

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

`createRequest` 不执行 SDK 游客身份初始化，其默认 8 秒用于这次底层请求。它没有动作声明，因此不猜测 URI 的读写含义，也不自动重试；`retry` 不会授予原始请求重放资格。HTTP 读取客户端请求体另有超时，见 [部署 HTTP 服务](/guide/server-deployment)。

详细行为见 [自定义 fetcher](/guide/custom-fetcher)、[重试与超时](/guide/retry-timeout-resilience)、[调试与可观测性](/guide/observability)。

## 仅低层 createRequest 支持的选项

| 字段         | 类型                                             | 未设置时                       | 作用                                         |
| ------------ | ------------------------------------------------ | ------------------------------ | -------------------------------------------- |
| `crypto`     | `'' \| 'api' \| 'eapi' \| 'weapi' \| 'linuxapi'` | 底层请求默认 `eapi`            | 指定 API 协议，空字符串按未指定处理          |
| `domain`     | `string`                                         | 协议对应的内置域名             | 覆盖目标域名，仍受目标策略检查               |
| `e_r`        | `boolean \| number \| string`                    | 默认 `false`，也可来自请求数据 | 请求加密响应，`eapi` 和 `weapi` 支持解密     |
| `acceptGzip` | `boolean`                                        | `false`                        | 声明接受 gzip 压缩的 `eapi` 响应             |
| `ua`         | `string`                                         | 按协议或原始 Cookie 平台准备   | 显式设置 User-Agent                          |
| `headers`    | `Record<string, string>`                         | 无                             | 额外原始请求头；协议字段仍按请求准备规则处理 |

上表的覆盖能力用于显式低层 `createRequest`；普通模块均按各自动作声明执行，不接受这些自由覆盖。有官方网页依据的 61 个原 EAPI 动作已改用 WEAPI、网页 UA 和干净的 `os=web` 身份。Banner 默认/`type=0` 的 PC 业务使用 web，移动类型保持 EAPI；普通 `songUrlV1` 使用 web，显式 `level=sky` 保持原 EAPI 与沉浸声参数。通用 batch、歌曲排序和云盘原生阶段等保留 EAPI，专用 clientlog 保持 macOS 身份。需要直接控制协议和目标时改用 `createRequest`，并按上游格式传业务参数。

日常调用沿用模块默认协议即可。带账号或游客身份的 API 请求只允许已知 HTTPS 网易云 API 域名，`domain` 不能用来任意转发凭据。`e_r`、`acceptGzip` 建议使用明确的布尔值，细节见 [加密模式](/guide/crypto-modes)。

## 仅 client 支持的配置

| 字段           | 类型                                    | 默认值 | 作用                                                                     |
| -------------- | --------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `cache`        | `{ enabled?: boolean; ttlMs?: number }` | 关闭   | 保存明确读接口的成功结果；传对象后默认保存 120 秒，`enabled: false` 关闭 |
| `identityPool` | `{ size: number }`                      | 关闭   | 首次需要时注册多套游客身份，再按调用轮换                                 |

关闭缓存不会关闭正在执行的相同读取的合并。调用已提供有效的 state 或 Cookie 设备时，会保留该设备并绕过身份池；纯本地和外部 plain 请求不初始化池。身份池也不会改变真实出口 IP。详见 [缓存与身份池](/guide/sdk-cache-and-identity-pool)。

## 从旧配置迁移（major）

普通模块的配置已经与低层选项分开。以下旧字段即使传入 `undefined` 也会在发送前拒绝；单次模块调用以 `status: 400` 拒绝，client 构造时无效默认配置抛出 `TypeError`。未知配置键也会被拒绝，执行配置不能混入业务 query。

| 旧写法                                                       | 新写法                                                               |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `createHanaMusicApi({ deviceId })`                           | `createHanaMusicApi({ state: { deviceId } })`                        |
| 普通 config 的 `crypto`、`domain`、`ua`、`e_r`、`acceptGzip` | 使用模块声明；确需原始控制时改用 `createRequest(uri, data, options)` |
| 普通 config 的 `headers.Cookie`                              | 用 `config.cookie` 传会话 Cookie                                     |
| 普通 config 的其他 `headers`                                 | 需要手工请求头时用显式低层 `createRequest`                           |
| 把 `createOption(...)` 传给模块方法                          | 直接提供 `ModuleCallConfig`；`createOption` 的结果只给低层请求       |

Cookie 中的旧平台字段仍由动作统一清理和投影；会话与设备优先级保持。低层请求要求上游原始业务参数，比如搜索用 `s`，不会替你把 `keywords` 转换过去。移除字段没有废弃别名或兼容分支。

本次默认协议与身份变化按 major 处理。红心、评论回复和歌单曲目操作同时更新逻辑地址，具名歌单编辑仍为一次 batch，三个子操作改传对象；函数名、业务输入和返回体合同保持。SDK 不按远端名单自动改请求，也不在失败后换协议重放。`checkToken` 继续可选，未配置不会本地强制拒绝；多请求模块使用 provider 逐次取新值。网页源码和离线测试不能保证真实账号的权益或反作弊结果，应用升级后仍需单独验证实际业务。完整迁移与保留清单见 [#137](https://github.com/nonhana/hana-music-api/issues/137)。
