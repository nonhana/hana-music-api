# 从 6.x 升级到 7.x

7.x 重构了 SDK 的发布产物、导出子路径和依赖树：安装 `hana-music-api` 默认只引入 `effect`，单接口按需导入体积与冷启动耗时显著下降，且开放了 `./api/*`、`./schemas`、`./schemas/*`、`./core`、`./utils` 与组合式客户端 `createClient`。

如果你的代码从根入口导入了运行时 `*Body` 校验器，或使用了 Node 代理、二维码图片生成、云盘音频标签解析，升级前请按本页调整。

## 变更总览

| 变更项                                     | 6.x 行为                                 | 7.x 行为                                                                          | 迁移方式                                                                                                                           |
| ------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 根入口 `*Body` 与 `LoginCellphoneRiskBody` | 同时导出 TypeScript 类型和运行时校验器值 | 根入口仅导出 TypeScript **类型**（`export type`）                                 | 类型导入不变；运行时校验器改为从 `hana-music-api/schemas`、`hana-music-api/schemas/<module>` 或 `hana-music-api/api/<module>` 导入 |
| `hono` 依赖                                | 随 SDK 安装进入下游 `node_modules`       | 不再随 SDK 安装（仅自建 HTTP 服务使用）                                           | 普通 SDK 用户无需处理                                                                                                              |
| Node 代理（`undici`）                      | 随 SDK 自动安装                          | 可选 `peerDependencies`                                                           | 仅在 Node.js 传入 `proxy` 时按需安装 `undici`；Bun 原生 `fetch` 无需安装                                                           |
| 二维码图片（`qrcode`）                     | 随 SDK 自动安装                          | 可选 `peerDependencies`                                                           | 仅在调用 `loginQrCreate({ qrimg: true })` 或 `verifyGetQr` 时按需安装 `qrcode`                                                     |
| 云盘音频标签解析（`music-metadata`）       | 随 SDK 自动安装                          | 可选 `peerDependencies`                                                           | 需要自动解析音频标签时安装 `music-metadata`；未安装时 `cloud` 自动回退文件名和默认标签                                             |
| 公开子路径与组合式客户端                   | 仅开放 `.` 与 `./watchman`               | 新增 `./api/*`、`./schemas`、`./schemas/*`、`./core`、`./utils` 与 `createClient` | 按需切换，显著减小打包体量与冷启动耗时                                                                                             |

## 1. 迁移运行时 `*Body` 校验器导入

如果你只把 `*Body` 当作 TypeScript 类型使用，**不需要修改代码**：

```ts
// 7.x 继续有效（纯类型导入）
import type { LoginCellphoneRiskBody, SongDetailBody } from 'hana-music-api';
```

如果你在运行时调用了 `SongDetailBody['~standard'].validate(...)` 等校验器值，改从以下三个入口之一导入：

```ts
// 推荐 1：按单接口连同函数一起导入
import { songDetail, SongDetailBody } from 'hana-music-api/api/song_detail';

// 推荐 2：仅需单个返回体校验器（不加载请求与传输链）
import { SongDetailBody } from 'hana-music-api/schemas/song_detail';

// 推荐 3：批量导入多个运行时校验器
import {
  AlbumBody,
  LoginCellphoneRiskBody,
  SongDetailBody,
} from 'hana-music-api/schemas';
```

## 2. 按需安装可选依赖

7.x 将 `undici`、`qrcode` 和 `music-metadata` 调整为可选 `peerDependencies`，默认安装不再下载它们。只安装你实际用到的包即可：

```bash
# Node.js 中使用 config.proxy
npm install undici

# 使用 loginQrCreate({ qrimg: true }) 或 verifyGetQr 生成二维码图片
npm install qrcode

# 使用 cloud 上传并希望自动解析音频 ID3/FLAC 标签
npm install music-metadata
```

未安装时的明确行为：

- **未装 `undici`**：在 Node.js 中传入 `proxy` 会立即拒绝（`status: 400`，`failure.kind === 'invalidRequest'`），`body.msg` 提示安装 `undici`。Bun 环境下原生 `fetch` 直接支持 `proxy`，无需安装 `undici`。
- **未装 `qrcode`**：`loginQrCreate({ key })` 不开启 `qrimg` 时正常成功（返回 `qrurl` 与空字符串 `qrimg: ''`）；开启 `qrimg: true` 或调用 `verifyGetQr` 时拒绝（`failure.kind === 'unknown'`），`body.msg` 提示安装 `qrcode`。
- **未装 `music-metadata`**：`cloud` 不会失败，自动回退使用上传文件名作为歌名，并将专辑和歌手填充为默认值。

## 3. 推荐迁移到按需子路径与 `createClient`

在 Serverless 函数（如 Vercel、AWS Lambda）或只调用少量接口的服务中，建议从 `createHanaMusicApi` 迁移到 `createClient` 搭配 `hana-music-api/api/*`：

```ts
// 6.x：导入全量 352 个模块
import { createHanaMusicApi } from 'hana-music-api';
const api = createHanaMusicApi({ cookie: 'MUSIC_U=your-cookie' });
await api.songDetail({ ids: [347230] });

// 7.x：只打包实际用到的模块，同时共享缓存、身份池和默认配置
import { songDetail } from 'hana-music-api/api/song_detail';
import { songUrlV1 } from 'hana-music-api/api/song_url_v1';
import { createClient } from 'hana-music-api/core';

const api = createClient(
  { songDetail, songUrlV1 },
  {
    cookie: 'MUSIC_U=your-cookie',
    cache: { enabled: true },
  },
);

const detail = await api.songDetail({ ids: [347230] });
const stream = await api.songUrlV1({ ids: [347230], level: 'standard' });
```

只使用工具函数（如生成设备号、识别失败响应）时，导入 `hana-music-api/utils`，不会引入任何业务模块或请求运行时：

```ts
import {
  generateDeviceId,
  getNcmFailureInfo,
  isNcmApiResponse,
} from 'hana-music-api/utils';
```

根入口的 `createHanaMusicApi`、`invokeModule` 与全部 352 个具名函数继续保留，适合脚本或需要动态选择全部模块的场景。详见[编程式调用](/guide/programmatic-api)和[SDK 使用边界](/guide/sdk-package-contract)。
