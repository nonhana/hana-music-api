# 从 7.x 升级到 8.x

8.x 彻底清零了可选 `peerDependencies`，并将网络代理转发、二维码图片渲染与音频二进制标签解析三项非协议职责从 SDK 内核剥离至应用层。

默认安装继续仅包含唯一的运行时依赖 `effect`，打包产物中不再存在动态按需加载钩子，Serverless 与构建工具追踪行为更加确定。

## 变更总览

| 变更项                               | 7.x 行为                                                                          | 8.x 行为                                                                                 | 迁移方式                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **可选 `peerDependencies`**          | 声明 `undici`、`qrcode`、`music-metadata` 三个可选依赖                            | 彻底移除全部 `peerDependencies`                                                          | 若仅使用协议接口无需安装，按需自行在应用层引入对应库       |
| **`proxy` 配置项**                   | 支持 `proxy` 字符串配置（Node 依赖 `undici`）                                     | 从 `ModuleCallConfig` 与 `CreateRequestOptions` 移除，传入拒绝为 `400`                   | 改用自定义 `config.fetcher` 注入代理传输                   |
| **`loginQrCreate` 与 `verifyGetQr`** | `loginQrCreate` 接受 `qrimg` 并返回 `data.qrimg`，`verifyGetQr` 返回 `data.qrimg` | 均仅返回 `data.qrurl`（`verifyGetQr` 同时返回 `data.qrCode`），传入 `qrimg` 拒绝为 `400` | 在应用层使用 `qrcode` 等库按 `data.qrurl` 渲染图片         |
| **`cloud` 音频元信息**               | 上传时尝试动态加载 `music-metadata` 解析音频标签                                  | 移除本地二进制解析，新增可选字段 `song`、`artist`、`album`                               | 需要指定元信息时在入参传入，省略时自动回退至文件名与默认值 |

## 迁移网络代理配置

`proxy` 已移入已移除配置清单。无论从模块配置还是底层 `createRequest` 传入，调用都会在发送前被拒绝（单次调用返回 `status: 400`、`failure.kind === 'invalidRequest'`，客户端构造抛出 `TypeError`）。

请改用自定义 `fetcher` 传入代理实例，详见 [自定义 fetcher 与网络代理](/guide/proxy-and-fetcher)：

```ts
import { search } from 'hana-music-api/api/search';
import { createClient } from 'hana-music-api/core';
import { fetch as undiciFetch, ProxyAgent } from 'undici';

const agent = new ProxyAgent('http://127.0.0.1:7890');

const api = createClient(
  { search },
  {
    fetcher: (input, init) =>
      undiciFetch(input, {
        ...init,
        dispatcher: agent,
      } as Parameters<typeof undiciFetch>[1]) as unknown as Promise<Response>,
  },
);

const result = await api.search({ keywords: '海阔天空' });
console.log(result.body);
```

## 迁移二维码生成

`loginQrCreate` 与 `verifyGetQr` 不再在 SDK 内部调用 `qrcode` 生成 Base64 Data URL，返回体仅包含扫码或验证目标链接 `data.qrurl`：

```ts
import { loginQrCreate } from 'hana-music-api/api/login_qr_create';
import QRCode from 'qrcode';

const { body } = await loginQrCreate({ key: 'your-unikey', platform: 'web' });
const qrDataUrl = await QRCode.toDataURL(body.data.qrurl);
```

- **废弃参数处理**：继续向 `loginQrCreate` 传入 `qrimg` 会触发参数校验失败（`status: 400`、`failure.kind === 'invalidRequest'`）。
- **渲染方式自由**：应用层可按场景自行选择 Data URL、SVG 或 Canvas 渲染。

## 迁移云盘上传元信息

`cloud` 模块不再依赖 `music-metadata` 解析上传音频缓冲区，新增三个可选字符串参数用于直接声明元信息：

```ts
import { cloud } from 'hana-music-api/api/cloud';

await cloud(
  {
    songFile,
    song: '歌曲名称',
    artist: '歌手名称',
    album: '专辑名称',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
```

- **缺省回退行为**：省略 `song`、`artist` 或 `album` 时，SDK 自动分别回退为处理后的上传文件名、`"未知艺术家"` 与 `"未知专辑"`。
- **服务端预解析**：如需从音频文件头读取 ID3 或 FLAC 标签，可在调用 `cloud` 前先在应用层解析标签并作为上述字段传入。
