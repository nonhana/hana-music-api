# 包导出与边界

`hana-music-api` 同时提供 npm 包形态的 SDK 导出与源码仓库内置的 HTTP 服务。从 6.x 升级前请先查阅 [从 6.x 升级到 7.x](/guide/migrating-to-v7)。

## 运行环境与依赖边界

- **SDK 运行环境**：面向 Node.js 24 及以上版本，仅发布 ESM 产物。
- **HTTP 服务端要求**：从源码仓库运行 HTTP 服务、测试与构建任务需要 Bun。
- **最小运行时依赖**：默认安装仅依赖 `effect`，不包含 Hono 服务端框架与重型多媒体处理包。

以下三个包为可选 `peerDependencies`，仅在调用对应功能时按需安装：

| 可选包           | 适用场景                                                          | 未安装时的行为                                                                     |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `undici`         | 在 Node.js 环境中传入 `config.proxy`（Bun 原生 `fetch` 无需安装） | 请求拒绝为 `status: 400`（`failure.kind === 'invalidRequest'`），提示安装 `undici` |
| `qrcode`         | 调用 `loginQrCreate({ qrimg: true })` 或 `verifyGetQr` 生成 PNG   | 未开启 `qrimg` 时正常返回，需要生成图片时拒绝并提示安装 `qrcode`                   |
| `music-metadata` | 使用 `cloud` 上传音频时自动解析音频标签                           | 自动回退至上传文件名与默认专辑/歌手，不中断上传流程                                |

## 公开导出入口

发布包通过 `package.json` 的 `exports` 开放 7 组公开入口。请勿直接导入未在 `exports` 中声明的内部路径。

| 导入路径                          | 导出内容                                                                                                                                                                          | 适用场景                                                       |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `hana-music-api`                  | `createHanaMusicApi`、`createClient`、352 个具名函数、`invokeModule`、`createRequest`、`createOption`、`generateDeviceId`、`isNcmApiResponse`、`getNcmFailureInfo` 及全部公开类型 | 快速原型、全量客户端、按模块名动态调用或纯 `import type` 导入  |
| `hana-music-api/api/<module>`     | 单个模块的具名函数、`<Name>Input` 类型，已建模接口另导出 `<Name>Body` 校验器与类型（`login_cellphone` 另导出 `LoginCellphoneRiskBody`）                                           | Serverless 函数或生产服务按需加载单个或少量接口                |
| `hana-music-api/schemas`          | 全部 315 个已建模返回体的 Standard Schema v1 校验器与 `LoginCellphoneRiskBody`，以及相关类型                                                                                      | 服务端或测试中批量引入多个返回体运行时校验器                   |
| `hana-music-api/schemas/<module>` | 单个模块的返回体运行时校验器（不加载网络请求与传输链）                                                                                                                            | 仅需独立校验响应正文，不发起网络请求                           |
| `hana-music-api/core`             | `createClient`、`createRequest`、`createOption`、`generateDeviceId`、`isNcmApiResponse`、`getNcmFailureInfo` 及核心类型                                                           | 与 `hana-music-api/api/*` 组合创建按需客户端，或仅使用底层请求 |
| `hana-music-api/utils`            | `generateDeviceId`、`createOption`、`isNcmApiResponse`、`getNcmFailureInfo` 及纯类型（零 `effect` 运行时依赖）                                                                    | 仅需设备 ID 生成、失败结构识别等轻量纯工具                     |
| `hana-music-api/watchman`         | `initializeWatchman`、`WatchmanError` 及配套类型（浏览器专用，不从根入口导出）                                                                                                    | 在浏览器中加载官方 Watchman 脚本并获取 `checkToken`            |

推荐在 Serverless 与生产服务中采用按需组合方式：

```ts
import { songDetail } from 'hana-music-api/api/song_detail';
import { createClient } from 'hana-music-api/core';

const hana = createClient({ songDetail }, { cookie: 'MUSIC_U=your-cookie' });
const result = await hana.songDetail({ ids: [347230] });

console.log(result.body);
```

HTTP 服务启动与服务器工厂函数属于仓库内部能力，不从 npm 包导出。源码部署方式见 [HTTP 部署指南](/guide/http-deployment)。

## TypeScript 编译配置

SDK 的类型声明完整兼容 `strict: true` 与 `skipLibCheck: false`。接入项目需安装与运行环境版本对应的 `@types/node`：

```bash
npm install -D typescript @types/node@24
```

- **显式 `types` 配置**：若 `tsconfig.json` 中显式设置了 `compilerOptions.types`，须在数组中包含 `"node"`。
- **上传类型与浏览器项目**：公开上传接口类型 `LegacyUploadedFile.data` 引用了 `Buffer` 类型。因此关闭 `skipLibCheck` 时，即使仅使用 `import type` 导入响应类型，仍需安装 Node 类型声明。纯 `import type` 不会打包任何运行时代码。

## Serverless 与浏览器边界

- **浏览器端限制**：根入口及 `./api/*` 包含服务端网络与协议加密逻辑，切勿打包到前端页面中，也不应在浏览器代码里暴露账号 Cookie。浏览器前端应请求自托管的 HTTP 服务，需要行为凭证时单独引入 `hana-music-api/watchman`，详见 [浏览器 Watchman](/guide/watchman)。
- **Serverless 无状态运行**：SDK 加载和调用时不读写本地文件，版本号在构建阶段内联，匿名游客身份仅保存在当前进程内存中。实例回收重启后，新实例会在首次需要时自动重新注册匿名身份。
- **内部运行时封装**：Effect 仅用于管理内部请求与调度流程，对外始终返回标准 Promise 或同步值。返回体校验器仅承诺 Standard Schema v1 契约（`BodySchema<T>`）与 TypeScript 类型推导，不暴露内部校验引擎实现，详见 [返回值与错误处理](/guide/error-handling)。
