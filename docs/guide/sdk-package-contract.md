# SDK 使用边界

在自己的 Node.js 服务或脚本里调用接口时，使用 SDK。需要向浏览器或其他语言提供统一 HTTP 接口时，从仓库启动 Bun 服务。

## 运行环境

SDK 面向 Node.js 24 或更高版本，仅支持 ESM。仓库的安装、测试和 HTTP 服务使用 Bun，版本以 `package.json` 的 `packageManager` 为准。

SDK 包含服务端网络和加密能力。浏览器页面应调用已部署的 HTTP 服务，不要把 SDK 和账号 Cookie 打包进浏览器代码。

## 从根入口导入

```ts
import { createHanaMusicApi, search, invokeModule } from 'hana-music-api';
```

发布包只开放 `hana-music-api` 根入口。不要依赖 `hana-music-api/src/...` 或 `hana-music-api/dist/...` 这样的内部路径，即使本地文件系统里能找到它们。

| 公开能力                        | 用途                               |
| ------------------------------- | ---------------------------------- |
| `createHanaMusicApi`            | 创建带默认配置的 client            |
| `search`、`songUrl` 等具名函数  | 按需调用模块                       |
| `invokeModule`                  | 按模块标识调用                     |
| `createRequest`、`createOption` | 底层请求与旧式配置提取             |
| 配套公开类型                    | 声明配置、模块标识、输入和响应外壳 |

`startServer`、`createServer`、模块加载器和运行时状态读写函数都属于仓库内部能力，不是 npm 包的公开导出。源码部署的用法见 [部署 HTTP 服务](/guide/server-deployment)。

## Effect 留在内部

公开函数继续返回 Promise。调用 SDK 不需要自行创建 Effect 运行时或提供内部服务。

参数类型由模块本地输入声明生成，普通响应正文保留未知 JSON。需要了解这条边界时，阅读 [返回值与错误](/guide/programmatic-api#返回值与错误)；维护内部模块时，阅读 [架构详解](/guide/request-layer-overview)。
