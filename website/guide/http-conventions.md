# HTTP 调用约定

HTTP 路由与 SDK 共享同一套业务模块，仅在参数接收形式与响应封装方式上存在差异。SDK 用法详见 [SDK 调用方式](/guide/sdk-usage)。

## 请求参数传递

普通接口支持通过 `GET` URL Query 或 `POST` 请求体传递业务参数。服务会自动解析 JSON、URL 编码表单与 `multipart/form-data` 请求体。

```bash
curl 'http://127.0.0.1:3021/search' \
  -H 'Content-Type: application/json' \
  --data '{"keywords":"海阔天空","limit":5}'
```

- **GET Query 传参**：适合标量参数请求，Query 中的数字和布尔字符串会由模块输入校验器自动转换为对应类型。
- **POST JSON 传参**：`application/json` 请求体顶层必须为 JSON 对象，数组或嵌套对象字段（如 `ids`、`tracks`、`tags`）应通过 JSON 传入。
- **文件上传请求**：上传音频、封面或头像时须使用 `POST` multipart 表单，具体文件字段名以对应接口参考页为准。
- **严格字段校验**：所有接口仅接受已声明的业务字段，传入未声明字段会在发送上游请求前直接返回 `400`。
- **控制字段保留**：HTTP 入口额外保留 `cookie` 与 `noCookie` 控制字段，分别用于覆盖请求身份和抑制响应 Cookie 写回。

### 禁止通过 HTTP 传入的配置项

执行控制与底层协议配置不能通过 HTTP 请求参数传递。传入以下任意字段时，服务会在发送上游请求前返回 `400`。

- **网络与执行配置**：`proxy`、`fetcher`、`timeoutMs`、`retry`、`connectionStrategy`、`signal`、`ip`、`realIP`、`state`、`checkToken`、`onRequestEvent`、`cache`、`identityPool`。
- **底层协议配置**：`crypto`、`domain`、`ua`、`headers`、`e_r`、`acceptGzip`、`deviceId`。
- **正确配置方式**：超时时间、代理与重试策略应在服务端通过 SDK 配置设置，显式构造底层协议请求详见 [底层请求](/guide/low-level-request)。

## Cookie 传递与写回

HTTP 入口会依次合并请求头、URL Query 与请求体中的参数，并按以下顺序确定最终生效的 `cookie` 字段。

```mermaid
flowchart LR
  HEADER["请求头 Cookie<br/>作为默认 cookie 字段"] --> QUERY["合并 URL Query<br/>同名字段与 cookie 整体覆盖"]
  QUERY --> BODY["合并请求体参数<br/>同名字段与 cookie 整体覆盖"]
  BODY --> MODULE["交由业务模块校验并执行"]
```

- **整体覆盖规则**：`cookie` 字段采用整项替换而非键值对逐项合并，请求体中传入 `cookie` 时会完全覆盖 Query 与请求头中的值。
- **多种传参格式**：参数中的 `cookie` 既可以是分号分隔的 Cookie 字符串，也可以在 JSON 请求体中直接传入键值对象。
- **响应头写回**：上游返回的 Cookie 会通过 HTTP 响应头 `Set-Cookie` 写回客户端。
- **HTTPS 安全属性**：当请求协议为 `https:` 或携带 `X-Forwarded-Proto: https` 时，写回的 `Set-Cookie` 会自动附加 `SameSite=None; Secure`。
- **禁用写回选项**：传入 `noCookie=true` 或 `noCookie=1` 会阻止服务写入 `Set-Cookie` 响应头，但不会清空请求身份或跳过模块处理。

## 响应格式与状态码

SDK 返回包含 `status`、`body` 与 `cookie` 的响应对象。HTTP 服务则直接将 `body` 序列化为 JSON 正文，将 `status` 映射为 HTTP 状态码，并通过 `Set-Cookie` 返回 Cookie。

部分业务状态（如扫码登录状态码 `800`–`803`）会保留在 JSON 正文的 `code` 字段中且 HTTP 状态为 `200`。调用方应同时检查 HTTP 状态码与业务字段 `code`。

| HTTP 状态码 | 含义与触发条件                                                                     |
| ----------- | ---------------------------------------------------------------------------------- |
| `200`       | 请求成功，部分轮询类业务状态（如 `800`–`803`）也在正文 `code` 中返回               |
| `301`       | 上游返回需要登录状态码，响应正文自动补充 `msg: '需要登录'`                         |
| `400`       | 输入参数校验失败、JSON 格式非法，或传入了禁止经 HTTP 传递的配置项                  |
| `404`       | 请求路径未匹配任何接口，或模块返回空响应体                                         |
| `408`       | 读取客户端请求体超过 `bodyTimeoutMs` 超时时间                                      |
| `413`       | 客户端请求体或上传文件体积超过 `maxBodyBytes` 上限                                 |
| `429`       | 触发入口 IP 频率限制或上游网易云限流，响应头附带 `Retry-After`                     |
| `499`       | 请求已取消或客户端提前断开连接                                                     |
| `502`       | 上游网络传输失败、响应解密失败或返回数据结构异常                                   |
| `503`       | 服务端并发模块容量或上传容量已满（附带 `Retry-After`），或文档未构建时访问 `/docs` |
| `504`       | 模块调用超过总超时时间（普通接口默认 `8000` ms，上传接口上限 `300000` ms）         |

触发 `429` 或容量拒绝 `503` 时，响应头会附带建议等待秒数 `Retry-After`。请求体限制、可信代理与入口限流配置见 [部署 HTTP 服务](/guide/http-deployment)。

## 默认读缓存

HTTP 服务默认在同一服务实例内启用响应读缓存，对部分高频只读接口缓存成功结果并执行并发请求去重。

- **缓存适用接口**：仅对 `/search`（`search`）、`/lyric`（`lyric`）、`/song/detail`（`song_detail`）、`/playlist/detail`（`playlist_detail`）生效。
- **默认缓存时长**：成功响应默认缓存 `120` 秒，缓存键会同时校验业务参数、请求身份与执行配置，避免不同账号数据串用。
- **不缓存的接口**：登录、二维码轮询、批量查询、写入、上传及其他未列入清单的接口均不使用该本地缓存，轮询场景无需额外传参。
- **不支持 `timestamp` 绕过缓存**：所有接口均严格校验已声明的输入字段，向上述只读接口传递未声明的 `timestamp` 会直接返回 `400`。
- **关闭缓存方式**：如需关闭 HTTP 服务本地缓存，须在服务端自定义启动配置中设置 `cacheEnabled: false`。
