# 快速开始

在 Node.js 或 Bun 项目中可直接安装 SDK 编程式调用。需要向浏览器或其他语言服务提供 REST 接口时，可从源码仓库启动内置 HTTP 服务。

## 环境要求

- **SDK 运行时**：Node.js 24 或更高版本（仅支持 ESM），或 Bun。
- **HTTP 服务端**：依赖 Bun 运行时环境与包管理器。

## 安装与最小调用

在已有 ESM 项目中安装 `hana-music-api`：

```bash
npm install hana-music-api
```

### 游客身份调用

创建默认客户端即可直接发起公开接口请求。未提供 Cookie 时，SDK 会在首次需要会话的请求时自动获取并复用内存中的游客身份。

```ts
import { createHanaMusicApi } from 'hana-music-api';

const hana = createHanaMusicApi();
const result = await hana.search({ keywords: '海阔天空', limit: 5 });

console.log(result.body);
```

### 携带账号 Cookie 调用

需要账号权限的接口可在初始化客户端或单次调用时传入 `cookie`：

```ts
import { createHanaMusicApi } from 'hana-music-api';

const hana = createHanaMusicApi({ cookie: 'MUSIC_U=your-cookie' });
const result = await hana.userAccount({});

console.log(result.body);
```

多账号场景可创建多个相互独立的客户端实例，也可在单次调用时覆盖配置，无需全局单例。

## 按需组合导入

在 Serverless 函数或仅使用少数接口的服务中，建议从 `hana-music-api/api/*` 按需导入单个接口，并配合 `createClient` 组合客户端以减小打包体积。

```ts
import { search } from 'hana-music-api/api/search';
import { createClient } from 'hana-music-api/core';

const hana = createClient({ search }, { timeoutMs: 5000 });
const result = await hana.search({ keywords: '海阔天空', limit: 5 });

console.log(result.body);
```

## 业务参数与执行配置

所有 SDK 调用均将业务输入与执行配置分为两个对象传入：

- **第一参数 `query`**：接口自身的业务参数，例如 `keywords`、`ids`、`limit`。
- **第二参数 `config`**：本次调用的执行配置，例如 `cookie`、`timeoutMs`、`proxy`、`signal`。

```ts
await hana.search({ keywords: '海阔天空', limit: 5 }, { timeoutMs: 5000 });
```

完整调用形态见 [SDK 调用方式](/guide/sdk-usage)，全部配置字段见 [执行配置](/guide/config)。

## 可选依赖速查

默认安装仅引入 `effect` 一个运行时依赖。以下三项能力仅在用到时按需安装对应的可选依赖：

| 可选包           | 适用场景                                                        | 未安装时的行为                                                                   |
| ---------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `undici`         | 在 Node.js 中配置 `proxy`（Bun 无需安装）                       | 立即拒绝为 `status: 400`（`invalidRequest`），提示安装 `undici`                  |
| `qrcode`         | 调用 `loginQrCreate({ qrimg: true })` 或 `verifyGetQr` 生成 PNG | `loginQrCreate({ key })` 不开启 `qrimg` 时正常返回，开启图片生成时拒绝并提示安装 |
| `music-metadata` | 调用 `cloud` 上传音频时自动解析 ID3 / FLAC 标签                 | 不中断上传，自动回退为文件名与默认专辑、歌手信息                                 |

## 启动 HTTP 服务

安装 Bun 后，克隆源码仓库并依次安装依赖、构建文档资源与启动服务：

```bash
git clone https://github.com/nonhana/hana-music-api.git
cd hana-music-api
bun install --frozen-lockfile
bun run docs:build
bun start
```

服务默认监听 `0.0.0.0:3021`，启动后可访问以下本地端点：

- **服务首页**：`http://127.0.0.1:3021/`
- **内置文档**：`http://127.0.0.1:3021/docs`
- **健康检查**：`http://127.0.0.1:3021/health`

使用 `curl` 验证搜索接口：

```bash
curl --get 'http://127.0.0.1:3021/search' \
  --data-urlencode 'keywords=海阔天空' \
  --data-urlencode 'limit=5'
```

- **HTTP 响应**：直接以响应正文返回接口 JSON，并将业务状态映射为 HTTP 状态码。
- **SDK 响应**：返回包含 `{ status, body, cookie }` 的响应对象。

## 延伸阅读

- 查看 [包导出与边界](/guide/package-exports) 了解导出子路径、TypeScript 配置与部署限制。
- 查看 [认证机制](/guide/authentication) 了解扫码登录与 Cookie 传递方式。
- 查看 [HTTP 部署指南](/guide/http-deployment) 配置环境变量、反向代理与限流参数。
