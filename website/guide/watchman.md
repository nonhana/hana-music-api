# 浏览器获取 Watchman token

页面需要收藏歌单时，可以从 `hana-music-api/watchman` 获取当次 token，再交给自己的服务端。这个入口只加载官方 Watchman，不包含网易云业务 SDK、账号会话或设备模拟逻辑。

```ts
import { initializeWatchman, WatchmanError } from 'hana-music-api/watchman';

// 放在客户端生命周期中，例如 Svelte 的 onMount 或按钮事件中。
const watchman = await initializeWatchman();

async function collectPlaylist(id: number) {
  try {
    const checkToken = await watchman.getToken();
    // 把 id 和当次 checkToken 交给应用自己的服务端收藏路由。
    await submitCollection({ id, checkToken });
  } catch (error) {
    if (error instanceof WatchmanError) {
      showFailure(error.code);
      return;
    }
    throw error;
  }
}
```

`submitCollection` 和 `showFailure` 由应用提供。服务端将当次字符串交给 `playlistSubscribe({ id, t: 1 }, { cookie, checkToken })`；账号 Cookie 留在服务端，token 不记日志、不存储。SDK 的通用 HTTP execution config 继续拒绝 `checkToken`，应用需要使用自己的明确业务路由。

页面内相同配置的初始化共享 Promise 和实例，包括分开的模块副本；每次 `getToken()` 都单独调用官方接口，不缓存或合并 token。并发取值各自等待自己的回调。读取、收藏与取消都由调用者选择是否提供 token，SDK 不因动作类别强制取值或丢弃显式值；初始化失败后，下一次用户主动操作可以重新调用 initializer，封装不会后台重试。

## 配置

```ts
const watchman = await initializeWatchman({
  nonce: pageNonce,
  timeoutMs: 10_000,
  tokenTimeoutMs: 10_000,
});
```

| 参数             | 默认值与作用                                                |
| ---------------- | ----------------------------------------------------------- |
| `productNumber`  | `YD00000558929251`，传给官方初始化接口                      |
| `protocol`       | `https`，允许 `http` 或 `https`，传给官方初始化接口         |
| `businessKey`    | `bd5d2f973ef74cd2a61325a412ae54d9`，每次传给官方 `getToken` |
| `nonce`          | 未提供，提供时设置到实际加载脚本的 nonce 属性               |
| `timeoutMs`      | 10000 毫秒，覆盖脚本加载和官方初始化等待                    |
| `tokenTimeoutMs` | 10000 毫秒，每次取值各自的等待期限                          |

默认业务参数来自 [Campanula #30 的既有记录](https://github.com/nonhana/campanula-music/issues/30#issuecomment-6238568996)。应用可以覆盖自己获准使用的产品和业务参数；封装不核发使用权限。两个超时必须为有限正数且不超过 2147483647 毫秒；产品编号和业务 key 不能为空白。

同一页面在初始化进行中或成功后不能换另一套配置，冲突会返回 `configuration`，避免悄悄复用错误的产品或业务参数。配置会在调用时复制，之后修改原对象不会改变已开始的初始化或后续取值。初始化失败会清除本次状态和资源，之后可以用新的配置主动重试。

脚本地址固定为 `https://acstatic-dun.126.net/tool.min.js`，`protocol` 不会将下载地址改成 HTTP。CSP 需要允许带 nonce 的脚本及官方 Watchman 实际需要的资源和连接；nonce 本身不授予网络连接权限。origin、产品配置和上游策略仍可能拒绝初始化或取值，应按应用获准的域名及上游使用条款接入。

页面要求 Trusted Types 时，还需由应用自己的策略允许官方脚本地址。nonce 不会绕过这个限制；浏览器拒绝脚本赋值时，封装返回 `script-load` 并清理本次状态，不自行创建放宽策略。

## SSR 和错误

SSR/Node 可以安全导入这个子路径，只有调用 `initializeWatchman()` 时才会检查浏览器环境。请在客户端生命周期调用它。根入口继续提供 Node/Bun SDK，不加载浏览器代码；浏览器也不应从根入口导入业务 SDK。子路径的声明不要求 DOM 或 Node 类型。

错误通过 Promise 拒绝，类型为 `WatchmanError`，`code` 可用于选择提示：

| code                     | 含义与后续动作                                         |
| ------------------------ | ------------------------------------------------------ |
| `environment`            | 当前没有浏览器 window/document，移到客户端调用         |
| `configuration`          | 配置无效或与本页已有初始化冲突，检查调用参数           |
| `script-load`            | 官方脚本加载失败，检查网络与 CSP，允许用户之后主动重试 |
| `initialization`         | 官方初始化报错、接口缺失或没有返回可用实例             |
| `initialization-timeout` | 脚本或初始化超过期限，清理本次状态后失败               |
| `token`                  | 官方取值抛错、返回空白或非字符串                       |
| `token-timeout`          | 本次取值超过期限，迟到回调不会改写其他调用             |

错误不包含官方原始异常或 token。取值失败不会清除已经成功的实例，也不会自动重新取值或重放收藏请求。170 字符是当前真实 Watchman 样本的验收要求，封装只校验非空字符串，不把这个长度写成所有请求的固定合同。

## 验证边界

仓库的 `bun run test:watchman` 在离线真实浏览器中用受控官方回调验证生命周期；`bun run test:sdk-contract` 安装当前候选 tarball，验证 Node/Bun 导入、类型、浏览器执行和 CSP。首次运行前安装浏览器：`bunx playwright install chromium`。

这些测试不能证明官方服务在某个 origin 当前可用。真实验证需要当次批准的 origin 和执行授权，用安装后的同一候选包在真实页面初始化，同页连续取两次 token，只记录长度、结果及脱敏错误。运行记录还需包含授权依据、时间、地区、浏览器、参数、候选指纹与包 SHA-256。本票不做真实账号写入；历史样本不能替代当次结果。
