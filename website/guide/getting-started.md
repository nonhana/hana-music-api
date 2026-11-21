# 快速开始

在 Node.js 项目里调用，安装 SDK 即可。需要向浏览器或其他服务提供 HTTP 接口时，用 Bun 启动仓库里的服务。

## 在项目里调用 SDK

SDK 要求 Node.js 24 或更高版本，仅支持 ESM。在已有 ESM 项目中安装：

```bash
npm install hana-music-api
```

创建一个 client，再调用搜索：

```ts
import { createHanaMusicApi } from 'hana-music-api';

const hana = createHanaMusicApi();
const result = await hana.search({ keywords: '海阔天空', limit: 5 });

console.log(result.body);
```

未提供身份时，SDK 会尝试获取并复用游客身份。需要登录的接口则要提供有效 Cookie：

```ts
import { createHanaMusicApi } from 'hana-music-api';

const hana = createHanaMusicApi({ cookie: 'MUSIC_U=your-cookie' });
const result = await hana.userAccount({});

console.log(result.body);
```

同一套默认配置可以复用一个 client。多账号场景也可以创建多个 client，或按次覆盖配置，不要求整个应用只用一个单例。

## 参数分开放

接口自己的参数放在第一个对象里，Cookie、代理、超时等执行配置放在第二个对象里：

```ts
await hana.search({ keywords: '海阔天空', limit: 5 }, { timeoutMs: 5000 });
```

也可以通过 `hana-music-api/api/*` 与 `createClient` 按需只引入需要的接口，减小打包体积并加快 Serverless 冷启动：

```ts
import { search } from 'hana-music-api/api/search';
import { createClient } from 'hana-music-api/core';

const hana = createClient({ search }, { timeoutMs: 5000 });
const result = await hana.search({ keywords: '海阔天空', limit: 5 });
```

若需要 Node.js 代理（`proxy`）、二维码图片生成（`qrimg: true` / `verifyGetQr`）或云盘音频标签解析，分别按需安装可选依赖 `undici`、`qrcode` 或 `music-metadata`。完整示例、公开子路径与错误处理见[编程式调用](/guide/programmatic-api)和[SDK 使用边界](/guide/sdk-package-contract)。

## 启动 HTTP 服务

安装 Bun 后，获取仓库并在仓库目录运行：

```bash
git clone https://github.com/nonhana/hana-music-api.git
cd hana-music-api
bun install --frozen-lockfile
bun run docs:build
bun start
```

默认监听 `0.0.0.0:3021`。在本机打开：

- 服务首页：`http://127.0.0.1:3021/`
- 接口文档：`http://127.0.0.1:3021/docs`
- 健康检查：`http://127.0.0.1:3021/health`

试一次搜索：

```bash
curl --get 'http://127.0.0.1:3021/search' \
  --data-urlencode 'keywords=海阔天空' \
  --data-urlencode 'limit=5'
```

HTTP 返回的是接口的 JSON 正文；SDK 则把正文放在 `result.body` 中。

PM2、环境变量和反向代理配置见 [部署 HTTP 服务](/guide/server-deployment)。登录与 Cookie 用法见 [认证机制](/guide/authentication)。
