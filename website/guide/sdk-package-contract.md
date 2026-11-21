# SDK 使用边界

从 6.x 升级请先看[7.x 迁移说明](/guide/migrating-to-v7)，确认根入口 `*Body` 运行时校验器迁移、按需子路径与可选依赖安装规则；从 3.x 升级可同时查阅[4.x 迁移说明](/guide/migrating-to-v4)。

在自己的 Node.js 服务或脚本里调用接口时，使用 SDK。需要向浏览器或其他语言提供统一 HTTP 接口时，从仓库启动 Bun 服务。

## 运行环境与依赖

SDK 面向 Node.js 24 或更高版本，仅支持 ESM。仓库的安装、测试和 HTTP 服务使用 Bun，版本以 `package.json` 的 `packageManager` 为准。

安装 `hana-music-api` 默认只引入 `effect` 一个运行时依赖，不携带 HTTP 服务器或音视频/二维码重型包。以下三项为可选 `peerDependencies`，仅在用到对应能力时按需安装：

| 可选包           | 使用场景                                                         | 未安装时的行为                                                                                                     |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `undici`         | Node.js 中传入 `config.proxy`（Bun 原生 `fetch` 无需安装）       | 拒绝为 `status: 400`（`failure.kind === 'invalidRequest'`），提示安装 `undici`                                     |
| `qrcode`         | `loginQrCreate({ qrimg: true })` 或 `verifyGetQr` 生成二维码 PNG | `loginQrCreate({ key })` 不开 `qrimg` 仍正常成功；需要图片时拒绝为 `failure.kind === 'unknown'`，提示安装 `qrcode` |
| `music-metadata` | `cloud` 上传时自动解析音频标签                                   | 自动回退至上传文件名与默认专辑/歌手，不中断流程                                                                    |

SDK 包含服务端网络和加密能力。浏览器页面应调用已部署的 HTTP 服务，不要把 SDK 和账号 Cookie 打包进浏览器代码。

SDK 可以在 Vercel 等 Serverless 函数里直接调用：加载和调用时不读写本地文件，版本号在构建时写进产物，匿名令牌只放在当前进程的内存里。函数实例被回收后，新实例会在第一次需要时重新注册匿名身份。搭配 `hana-music-api/api/*` 与 `createClient` 按需导入，可避免打包无关模块。

## TypeScript 类型检查

SDK 的公开声明支持 `strict: true` 和 `skipLibCheck: false`。下游项目需要安装与 Node.js 运行环境匹配的 `@types/node`；例如面向 Node.js 24 的项目：

```bash
npm install -D typescript @types/node@24
```

如果 `tsconfig.json` 显式设置了 `compilerOptions.types`，需要在其中包含 `"node"`。

公开上传参数 `LegacyUploadedFile.data` 保留了 `Buffer` 类型。因此，即使浏览器项目只用 `import type` 导入响应正文类型，在关闭 `skipLibCheck` 时也仍需加载 Node 类型。类型导入不会引入 SDK 的运行时代码。

## 公开导入入口

发布包通过 `exports` 开放 7 组公开入口。不要依赖 `hana-music-api/src/...` 或 `hana-music-api/dist/...` 等内部路径，即使本地文件系统里能找到它们。

| 导入入口                          | 公开内容                                                                                                                                                                                                                              | 适用场景                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `hana-music-api`                  | `createHanaMusicApi`、`createClient`、352 个具名函数、`invokeModule`、`createRequest`、`createOption`、`generateDeviceId`、`isNcmApiResponse`、`getNcmFailureInfo` 及全部公开类型（`*Body` 与 `LoginCellphoneRiskBody` 为纯类型导出） | 通用脚本、快速原型、全量 client 或动态模块调用                                 |
| `hana-music-api/api/<module>`     | 单个模块的具名函数、`<Name>Input` 类型以及该模块的 `<Name>Body` 运行时校验器与类型（如 `hana-music-api/api/song_detail`）                                                                                                             | Serverless 或生产服务按需调用单个或少量接口                                    |
| `hana-music-api/schemas`          | 全部 315 个已收窄返回体的运行时 Standard Schema v1 校验器与 `LoginCellphoneRiskBody`                                                                                                                                                  | 批量引入多个返回体运行时校验器                                                 |
| `hana-music-api/schemas/<module>` | 单个模块的返回体运行时校验器（不加载请求与传输链）                                                                                                                                                                                    | 仅需独立校验响应正文，不发网络请求                                             |
| `hana-music-api/core`             | `createClient`、`createRequest`、`createOption`、`generateDeviceId`、`isNcmApiResponse`、`getNcmFailureInfo` 及核心类型                                                                                                               | 与 `hana-music-api/api/*` 组合创建按需 client，或仅用底层请求                  |
| `hana-music-api/utils`            | `generateDeviceId`、`createOption`、`isNcmApiResponse`、`getNcmFailureInfo` 及纯类型（零 `effect` 依赖）                                                                                                                              | 仅需设备号生成、失败识别等轻量纯工具                                           |
| `hana-music-api/watchman`         | `initializeWatchman`、`WatchmanError` 及配套类型（浏览器专用，不从根入口转导出）                                                                                                                                                      | 浏览器加载官方 Watchman 并按次获取 token，见[浏览器 Watchman](/guide/watchman) |

```ts
// 按需组合客户端（推荐用于 Serverless 与线上服务）
import { songDetail } from 'hana-music-api/api/song_detail';
import { createClient } from 'hana-music-api/core';

const hana = createClient({ songDetail }, { cookie: 'MUSIC_U=your-cookie' });
```

`startServer`、`createServer`、模块加载器和运行时状态读写函数都属于仓库内部能力，不是 npm 包的公开导出。源码部署的用法见 [部署 HTTP 服务](/guide/server-deployment)。

## Effect 留在内部

接口调用继续返回 Promise；`generateDeviceId()`、`isNcmApiResponse()`、`getNcmFailureInfo()` 与 `createOption()` 同步返回。调用 SDK 不需要自行创建 Effect 运行时或提供内部服务。返回体校验器对外仅承诺 Standard Schema v1 契约（`BodySchema<T>`）和推导出的 TypeScript 类型，不暴露内部校验引擎类型。

参数类型由模块本地输入声明生成，未收窄模块的响应正文保留未知 JSON。需要了解这条边界时，阅读 [返回值与错误](/guide/programmatic-api#返回值与错误)。
