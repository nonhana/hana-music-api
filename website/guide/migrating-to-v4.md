# 从 3.x 升级到 4.x

如果你的服务以前把 `crypto`、`ua` 或 `deviceId` 放在模块配置里，升级后这些调用会在发送前失败。4.x 让普通模块自己决定请求协议和客户端平台，应用只提供业务输入、会话、设备与网络配置。

本页对应候选版本 `4.0.0-next.0`，预发布 tag 为 `next`。以下是候选发布后的安装方式，是否已发布请以 npm registry 的指定版本信息为准；下游应固定明确版本：

```bash
npm install hana-music-api@4.0.0-next.0
# Bun 工程
bun add hana-music-api@4.0.0-next.0
```

运行环境是 Node.js >=24 或 Bun，使用 ESM。`next` 会随候选更新；稳定版 `latest` 不随本次候选发布变化。

## 先拆开业务参数与配置

```ts
import { createHanaMusicApi, generateDeviceId } from 'hana-music-api';

// 应用创建后保存，后续调用继续使用同一设备。
const deviceId = generateDeviceId();
const api = createHanaMusicApi({
  cookie: savedCookie,
  state: { deviceId },
});
const result = await api.search({ keywords: '海阔天空' }, { timeoutMs: 5000 });
```

`savedCookie` 由应用读取。client 默认配置与单次配置按顶层字段合并，嵌套对象不递归合并。SDK 不替应用保存登录 Cookie jar；登录或刷新返回的 Cookie 仍由应用决定怎样保存与传给后续调用。

| 3.x 写法                                                     | 4.x 改法                                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 模块 config 的 `crypto`、`ua`、`domain`、`e_r`、`acceptGzip` | 删除覆盖，使用模块声明的协议；确实要自行构造上游请求时使用 `createRequest` |
| 模块 config 的 `headers.Cookie`                              | 改用 `cookie`                                                              |
| 模块 config 的任意 `headers`                                 | 普通模块不开放任意头覆盖；自行构造请求时用低层 `CreateRequestOptions`      |
| 顶层 `deviceId`                                              | 改为 `state.deviceId`，由应用保存                                          |
| 把执行配置混入业务 query                                     | 业务参数留在 query，网络和身份配置放到独立 config                          |
| 用 `createOption` 生成模块配置                               | `createOption` 仅用于低层 `createRequest`                                  |

这些旧键和未知键在 JavaScript 中也会被拒绝，值为 `undefined` 或不可枚举仍然如此。无效 client 默认配置会抛 `TypeError`；调用时的无效配置会拒绝为 `status: 400`。请真正移除字段，不能只把值清空。

有效的 `state.deviceId` 优先于旧 Cookie 的 `deviceId`，其次才用匿名或运行时设备。设备值不能含空白或控制字符，SDK 不要求它一定是 `generateDeviceId()` 的格式。账号会话与设备是两件事，切换账号时请明确选择要使用的 Cookie 和设备。

## 协议保持，平台身份统一

本次没有把所有接口切成 web。搜索、歌词、歌单详情仍使用 eapi，歌曲详情及歌单/专辑/歌手收藏使用 weapi；特殊域名、原始 plain 请求和上传阶段也保持原协议。

平台身份有明确变化：eapi 统一使用已有的 iPhone 字段；过去混合浏览器 UA 与 PC Cookie 的 weapi 动作改用干净的 web 身份；clientlog 的 macOS UA 与 Cookie 版本对齐。受控平台字段由内核生成，应用传入的冲突大小写 Cookie 字段会被清理，会话 Cookie 保留。缺少依据的机型、分辨率、buildver 和 versioncode 不再拼入这些受控身份。

这些规则说明候选如何发请求，不保证网易云当前接受每个接口或每次身份组合。业务参数、已验证返回体和 `{ status, body, cookie }` Promise 外壳保持；`createRequest` 仍提供显式低层控制，并执行 HTTPS、目标与凭据外送检查，不自动猜业务重试资格。

## token 由每次调用决定

所有程序化 SDK 模块都接受可选 `checkToken`，读取、收藏和取消使用同一规则。未配置时不取值、不附加，也不因缺值在本地拒绝业务请求；是否需要令牌由上游响应决定。SDK 不生成、缓存或重放 token，也不保证上游接受任意值。

浏览器可通过独立的 `hana-music-api/watchman` 取当次字符串，再交给自己的服务端业务路由。服务端把它传给模块，账号 Cookie 留在服务端：

```ts
await api.playlistSubscribe({ id: playlistId, t: 1 }, { checkToken });
```

`playlistId` 和 `checkToken` 来自应用自己的业务请求。SDK 通用 HTTP 入口仍拒绝 `checkToken` 执行配置，不新增公共 token 通道。

需要独立取值，或一次模块调用含多个 API 请求时，传异步 provider：

```ts
await api.cloudImport(
  { id: songId, song: songName, fileType: 'flac' },
  { checkToken: async () => getFreshToken() },
);
```

`getFreshToken` 由应用提供，每次获准的 API 请求调用一次。同一模块调用的固定字符串只允许发送一次 API 请求，第二次发送前以 400 拒绝；已经完成的第一步不会撤销。provider 失败、空白值、首尾空白或非法 HTTP 头字符也会在发送前拒绝。等待 provider 计入总期限，取消或超时后不续发。

weapi 的加密正文和 HTTP `X-antiCheatToken` 使用同一值；eapi 还写入加密 header，api/linuxapi 使用各自正文容器，获准的网易云 plain 请求只加 HTTP 头。token 不写 Cookie、URL 或日志，外部上传不取值、不接收 token。

带 token 的调用不缓存、不合并、不自动重试。未配置时，只有搜索、歌词、歌曲详情、歌单详情保留既有共享读取；每个等待者有自己的取消和期限，最后一个等待者离开才中断实际请求。其他模块不会因为“看起来是读取”就新增缓存或重放；写入、登录、轮询、连续推荐等仍按动作限制执行。

## 多请求和上传仍按阶段执行

上传的 API 阶段逐次使用 provider，plain 阶段发送原字节，不携带网易云账号 Cookie 或业务 token。失败后停止后续业务，已经完成的上传阶段仍通过原有部分完成结果报告；期限覆盖整个调用和各阶段。

`playlistTracks` 只在原数值业务码 `512` 时发送既有第二请求，不把其他失败改成自动重试。业务分支里的第二请求与 transport 重试不同，不能把固定 token 的一次限制当作“同一操作可无限重用”。

## 浏览器与自定义模块分别迁移

浏览器只导入 `hana-music-api/watchman`。根 SDK 包含服务端网络和加密能力，不应打包到页面；子路径不会引入 Hono、请求内核或 Node 核心依赖。SSR/Node 导入安全，调用 initializer 时才拒绝非浏览器环境。初始化按页面复用，每次 `getToken()` 单独取值，真实 origin、CSP 和产品权限仍由应用核对。见[浏览器指南](/guide/watchman)。

只有维护源码自定义模块的用户需要改内部合同：用绑定本地 `moduleActions` 的 `request(actionName, args)` 替代旧 intent 对象。API 提供 `data`/业务 `headers`，动态 API 另传 `path`；固定 plain 提供 `query`，动态 plain 提供受限 `target`/原始 `body`。旧 `RequestIntent` 和两个 builder 已移除，不提供兼容 shim。

服务和动态装配的 `requestHandler` 也已删除。旧对象只要带这个自有或继承键，即使不可枚举或值为 `undefined`，都会拒绝且不读取 getter。完整调用链测试改在 `fetcher` 替换网络；模块组合测试继续提供二元 fake capability。API 数据会在等待 token 前取得自有快照；raw/内部注册共用请求内核，不再构造模块 Call。内部装配仍不是 npm 根导出，更多细节见[架构说明](/guide/request-layer-overview)。

公开安装入口仅为 `hana-music-api` 和 `hana-music-api/watchman`。不要改为导入包内 `src`、`dist` 或生成路径来绕过边界；底层调用参见[直接使用底层请求](/guide/create-request-and-create-option)。
