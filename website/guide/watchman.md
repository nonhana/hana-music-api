# 浏览器获取反作弊令牌

收藏歌单前，浏览器可以通过 `hana-music-api/watchman` 加载网易云官方 Watchman，再把当次取到的令牌交给自己的服务端。服务端调用 SDK 时把它放在 `config.checkToken`，不要放进业务参数或 URL。

## 浏览器与服务端如何配合

页面按需初始化一次，每次收藏前调用 `getToken()` 取新值：

```ts
// 浏览器
import { initializeWatchman } from 'hana-music-api/watchman';

const watchman = await initializeWatchman({ timeoutMs: 10_000 });

async function collectPlaylist(id: number) {
  const checkToken = await watchman.getToken();
  await fetch(`/api/playlists/${id}/collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkToken }),
  });
}
```

上面的 `/api/playlists/:id/collect` 是你的应用自行提供的路由。它接收这次令牌后，在服务端调用 SDK：

```ts
// 服务端
import { playlistSubscribe } from 'hana-music-api';

await playlistSubscribe({ id, t: 1 }, { cookie, checkToken });
```

令牌只随这一次操作转交，不记录日志、不存入数据库、Cookie 或本地存储。下次收藏重新取值；取消收藏 `t: 0` 不调用 `getToken()`，也不传令牌。SDK 的通用 HTTP 路由拒绝 `checkToken` 执行配置，因此不能直接用它替代应用自己的转交路由。

脚本、初始化结果和官方实例在同一页面复用，并发初始化只加载一次脚本。每次 `getToken()` 都独立调用官方实例，结果不会缓存或合并。初始化失败后，可以在用户下次主动操作时重新调用 `initializeWatchman()`；它不会在后台自动重试。取令牌失败也不会自动重放你的收藏请求。

## 初始化选项

```ts
const watchman = await initializeWatchman({
  productNumber: 'YD00000558929251',
  protocol: 'https',
  nonce: pageNonce,
  timeoutMs: 10_000,
});

const checkToken = await watchman.getToken({
  business: 'bd5d2f973ef74cd2a61325a412ae54d9',
  timeoutMs: 10_000,
});
```

| 参数               | 默认值与作用                                                                           |
| ------------------ | -------------------------------------------------------------------------------------- |
| `productNumber`    | 默认 `YD00000558929251`，传给官方初始化器；只有获得对应授权时才覆盖                    |
| `protocol`         | 默认 `https`，可用 `https` 或 `http`，传给官方初始化器；脚本始终从官方 HTTPS CDN 加载  |
| `nonce`            | 可选，写入实际加载脚本的 `nonce` 属性，用于站点的 CSP                                  |
| 初始化 `timeoutMs` | 默认 10 秒，覆盖脚本加载和初始化的总等待时间；也作为该返回对象取令牌时的默认期限       |
| `business`         | 默认 `bd5d2f973ef74cd2a61325a412ae54d9`，每次传给官方 `getToken` 的业务编号            |
| 取值 `timeoutMs`   | 可单独设置这次 `getToken()` 的等待时间；须为大于零、且不超过 `2147483647` 的有限毫秒数 |

同一页面的产品号、协议和脚本 nonce 由首次初始化确定，之后传入冲突配置会明确报错。页面已有官方 `window.WM` 时会复用它，原实例的产品配置仍由创建它的代码决定；应用应统一初始化入口。无需声明或读取 Watchman 的设备元数据。

## 错误与运行环境

可以按 `WatchmanError.code` 显示提示，让用户稍后主动再试。错误消息不包含官方回调的原始内容或令牌。

| `code`                                             | 含义                               |
| -------------------------------------------------- | ---------------------------------- |
| `BROWSER_REQUIRED`                                 | 在 Node 或 SSR 环境调用了初始化器  |
| `INVALID_OPTIONS`                                  | 等待时间或业务配置不合法           |
| `CONFIGURATION_CONFLICT`                           | 同一页面再次初始化时使用了冲突配置 |
| `SCRIPT_FAILED` / `SCRIPT_TIMEOUT`                 | 官方脚本加载失败或超时             |
| `INITIALIZATION_FAILED` / `INITIALIZATION_TIMEOUT` | 官方初始化失败、没有返回实例或超时 |
| `TOKEN_FAILED` / `TOKEN_TIMEOUT`                   | 官方取值调用失败或超时             |
| `EMPTY_TOKEN`                                      | 官方返回了空令牌                   |

子路径可以在 Node 或 SSR 中安全导入，导入时不访问 DOM；实际初始化必须放在浏览器。根 SDK 仍用于 Node/Bun 服务端，不能把账号 Cookie 或请求内核打进页面。

## 官方服务与站点限制

运行时会加载 `https://acstatic-dun.126.net/tool.min.js`。站点的 CSP、网络、真实 origin 和网易云的上游策略都可能影响初始化或令牌是否可用，请遵守官方服务条款及对应产品的授权要求。取得令牌不保证上游接受收藏，也不解除请求频率限制。

上述默认参数来自既有官方网页调查与 Campanula 的历史验证；170 字符是当时观察到的令牌长度，本适配器只拒绝空值，不把该长度写成固定协议。接收令牌的应用应保留自己的输入校验，不能据此把现有 HTTP 长度合同收紧到 170。

当前新增适配器仍需在接入应用授权的真实 origin 验证。离线测试或成功导入 npm 包不能代替该站点上的官方初始化与真实页面验收。
