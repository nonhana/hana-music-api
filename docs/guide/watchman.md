# 浏览器 Watchman

`hana-music-api/watchman` 是浏览器专用子路径，薄封装官方易盾 Watchman 脚本，用来给需要 `checkToken` 的写接口现取令牌。它不会被打进根入口，也不会在 Node/SSR 里加载混淆脚本。

## 安装与导入

```ts
import { createWatchman } from 'hana-music-api/watchman';
```

这个子路径只应在浏览器代码里导入。Node、Bun 服务端、Serverless 和 SSR 中调用 `createWatchman` 会抛出 `WatchmanUnavailableError`。

## 初始化

```ts
import { createWatchman } from 'hana-music-api/watchman';

const watchman = await createWatchman({
  productNumber: 'YD00000558929251', // 官方现代 web player 的默认产品号
  protocol: 'https',
});

const token = await watchman.getToken(); // 170 字符
```

默认行为：

- 运行时从 `https://acstatic-dun.126.net/tool.min.js` 加载官方加载器，不把混淆脚本打进 npm 包；
- 同一个 `productNumber` + 协议 + 脚本地址 + 超时只初始化一次；页面已有 `window.WM` 时直接复用，否则复用官方 `window.initWatchman` 实例；
- `getToken` 每次向当前实例现取，不缓存、不重放；
- 默认 10 秒超时；可通过 `timeoutMs` 调整；
- 支持 `nonce`，注入 `<script>` 时会写入 CSP nonce；
- `getToken(businessKey)` 可覆盖默认业务 key；不传时使用官方歌单写操作抓到的 `bd5d2f973ef74cd2a61325a412ae54d9`。

```ts
const watchman = await createWatchman({ nonce: window.__CSP_NONCE__ });
const token = await watchman.getToken();
```

## 接入写接口

把 `getToken` 作为 provider 传给支持 `checkToken` 的模块：

```ts
import { playlistCreate, playlistSubscribe } from 'hana-music-api';
import { createWatchman } from 'hana-music-api/watchman';

const watchman = await createWatchman();
const checkToken = () => watchman.getToken();

await playlistSubscribe({ t: '1', id: '106697785' }, { checkToken });
await playlistCreate({ name: '新歌单' }, { checkToken });
```

provider 会在每次需要 token 的请求前调用一次。取消收藏等不请求 token 的路径不会调用 provider。

## 设备元数据

`watchman.getDeviceMetadata()` 读取 Watchman 自己维护的 `WM_TID`、`WM_DID`、`WM_NI`、`WM_NIKE` Cookie。它们只是 Watchman 设备状态，不是 `clientSign`，也不是网易云请求里的 `deviceId`；不要把它们塞进这些字段。

```ts
const { WM_TID, WM_DID, WM_NI, WM_NIKE } = watchman.getDeviceMetadata();
```

## 稳定性与边界

- 令牌必须来自**稳定的设备/会话**。每次新建无头浏览器或新设备取到的第一枚令牌可能被上游拒绝。
- 官方现代 web player 的做法是：启动时 `initWatchman`，每次收藏前调用 `WM.getToken`，把令牌放进正文 `checkToken` 和 HTTP 头 `X-antiCheatToken`。
- SDK 不生成、不缓存、不重放令牌；`retryAfter` 只是退避建议，不是上游承诺的恢复时间。
- 该适配层涉及上游反作弊机制和第三方条款。使用前请确认你的场景、频率和合规边界；不要用它绕过访问限制。
- 没有稳定 provider 时，网页回退路径只适合低频调用。高频收藏/新建歌单需要稳定的浏览器设备。

相关实现：`src/watchman/index.ts`、`watchman.ts`、`src/core/request.ts`。
