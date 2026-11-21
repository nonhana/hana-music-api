# 从 6.x 升级到 7.x

> [!NOTE]
> 若准备进一步升级至 8.x，请参阅 [从 7.x 升级到 8.x](/guide/migrating-to-v8)。

7.x 重构了 SDK 的发布产物、导出子路径与依赖树，默认安装仅引入必需的 `effect` 运行时。通过 `./api/*` 按需导入可显著降低打包体积与冷启动耗时，并新增 `./schemas`、`./schemas/*`、`./core`、`./utils` 入口及 `createClient` 组合式客户端。

如果你的代码从根入口导入了运行时 `*Body` 校验器，或在 Node.js 代理、二维码生成、音频标签解析中依赖了可选包，请按本指南完成迁移。

## 变更总览

| 变更项                                         | 6.x 行为                                 | 7.x 行为                                                                          | 迁移方式                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **根入口 `*Body` 与 `LoginCellphoneRiskBody`** | 同时导出 TypeScript 类型与运行时校验器值 | 根入口仅导出 TypeScript 纯类型（`export type`）                                   | 类型导入保持不变，运行时校验器改从 `hana-music-api/schemas`、`hana-music-api/schemas/<module>` 或 `hana-music-api/api/<module>` 导入 |
| **`hono` 依赖**                                | 随 SDK 安装进入下游 `node_modules`       | 不再随 SDK 安装，仅自建 HTTP 服务使用                                             | 普通 SDK 用户无需处理                                                                                                                |
| **Node.js 代理（`undici`）**                   | 随 SDK 自动安装                          | 调整为可选 `peerDependencies`                                                     | 仅在 Node.js 传入 `proxy` 时按需安装 `undici`，Bun 原生 `fetch` 无需安装                                                             |
| **二维码图片（`qrcode`）**                     | 随 SDK 自动安装                          | 调整为可选 `peerDependencies`                                                     | 仅在调用 `loginQrCreate({ qrimg: true })` 或 `verifyGetQr` 时按需安装 `qrcode`                                                       |
| **云盘音频标签解析（`music-metadata`）**       | 随 SDK 自动安装                          | 调整为可选 `peerDependencies`                                                     | 需要自动解析音频标签时安装 `music-metadata`，未安装时 `cloud` 自动回退至文件名与默认标签                                             |
| **公开子路径与组合式客户端**                   | 仅开放 `.` 与 `./watchman`               | 新增 `./api/*`、`./schemas`、`./schemas/*`、`./core`、`./utils` 与 `createClient` | 按需切换，显著减小打包体积与冷启动耗时                                                                                               |

## 迁移运行时校验器导入

仅将 `*Body` 用作 TypeScript 类型标注时，现有代码无需修改：

```ts
// 7.x 继续有效（纯类型导入）
import type { LoginCellphoneRiskBody, SongDetailBody } from 'hana-music-api';
```

如果在运行时调用了 `SongDetailBody['~standard'].validate(...)` 等校验器方法，请改从以下三个入口之一导入：

```ts
// 方式 1：按单接口连同调用函数一起导入
import { songDetail, SongDetailBody } from 'hana-music-api/api/song_detail';

// 方式 2：仅导入单个返回体校验器（不加载请求与传输链）
import { SongDetailBody } from 'hana-music-api/schemas/song_detail';

// 方式 3：批量导入多个运行时校验器
import {
  AlbumBody,
  LoginCellphoneRiskBody,
  SongDetailBody,
} from 'hana-music-api/schemas';
```

## 按需安装可选依赖

7.x 将 `undici`、`qrcode` 与 `music-metadata` 调整为可选 `peerDependencies`。请根据实际使用的能力按需安装：

```bash
# 在 Node.js 中使用 config.proxy
npm install undici

# 使用 loginQrCreate({ qrimg: true }) 或 verifyGetQr 生成二维码图片
npm install qrcode

# 使用 cloud 上传并希望自动解析音频 ID3/FLAC 标签
npm install music-metadata
```

- **未安装 `undici`**：在 Node.js 中传入 `proxy` 会立即拒绝（`status: 400`、`failure.kind === 'invalidRequest'`）并提示安装 `undici`，而在 Bun 环境下原生 `fetch` 可直接使用 `proxy`。
- **未安装 `qrcode`**：`loginQrCreate({ key })` 未开启 `qrimg` 时正常返回（`qrurl` 与空字符串 `qrimg: ''`），开启 `qrimg: true` 或调用 `verifyGetQr` 时会拒绝并返回 `failure.kind === 'unknown'`。
- **未安装 `music-metadata`**：`cloud` 上传不会失败，会自动回退使用上传文件名作为歌名，并将专辑与歌手填充为默认值。

## 迁移至按需子路径与 `createClient`

在 Serverless 函数或仅调用少量接口的服务中，建议从全量 `createHanaMusicApi` 迁移至 `createClient` 搭配 `hana-music-api/api/*`：

```ts
// 6.x：导入全量 352 个接口模块
import { createHanaMusicApi } from 'hana-music-api';

const legacyApi = createHanaMusicApi({ cookie: 'MUSIC_U=your-cookie' });
await legacyApi.songDetail({ ids: [347230] });

// 7.x：仅打包实际用到的接口，同时共享缓存、身份池与默认配置
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

仅需使用生成设备 ID 或识别失败响应等工具函数时，可导入零运行时负担的 `hana-music-api/utils`：

```ts
import {
  generateDeviceId,
  getNcmFailureInfo,
  isNcmApiResponse,
} from 'hana-music-api/utils';
```

根入口的 `createHanaMusicApi`、`invokeModule` 与全部 352 个具名函数继续保留，适合脚本或需按字符串动态调度接口的场景。详见 [SDK 调用方式](/guide/sdk-usage)、[包导出与子路径](/guide/package-exports) 与 [错误处理](/guide/error-handling)。
