---
title: '更新歌单封面'
description: '提供歌单 ID 和登录 Cookie，用 JPEG 图片文件或已上传图片的ID更新歌单封面。'
---

# 更新歌单封面

把图片设为歌单封面。有两种用法：

- 传 `imgFile`：本模块先上传整张图片，再把返回的图片ID设为封面。当前上传实现按 JPEG 发送文件，示例使用 JPEG 图片。
- 传 `imgId`：图片已经通过 [申请图片上传凭证](/api/playlist/image-upload-token) 直传完成，本模块只发一次“设为封面”的请求，不再经手图片数据。这一步失败后可以用同一个 `imgId` 重试，不必重新上传。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| 接口地址   | `/playlist/cover/update`                                                   |
| 请求方式   | `POST`（上传文件用 `multipart/form-data`，传 `imgId` 可用 `GET` / `POST`） |
| 需要登录   | 是（需有权修改目标歌单）                                                   |
| 对应模块   | `playlist_cover_update`                                                    |
| SDK 函数   | `playlistCoverUpdate`（`hana-music-api/api/playlist_cover_update`）        |
| 返回体类型 | `PlaylistCoverUpdateBody`（已建模返回体）                                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { readFile } from 'node:fs/promises';

import { playlistCoverUpdate } from 'hana-music-api';

const data = await readFile('./cover.jpg');
const result = await playlistCoverUpdate(
  {
    id: 'your-playlist-id',
    imgFile: {
      data,
      name: 'cover.jpg',
      mimetype: 'image/jpeg',
      size: data.byteLength,
    },
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.status, result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/cover/update' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'id=your-playlist-id' \
  -F 'imgFile=@./cover.jpg;type=image/jpeg'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型               | 必填   | 默认值 | 说明                                                                  |
| --------- | ------------------ | ------ | ------ | --------------------------------------------------------------------- |
| `id`      | `number \| string` | 是     | -      | 目标歌单 ID                                                           |
| `imgFile` | 上传文件对象       | 二选一 | -      | JPEG 封面图片文件（与 `imgId` 二选一）                                |
| `imgId`   | `string \| number` | 二选一 | -      | 通过 `/image/upload/token` 上传后得到的图片 ID（与 `imgFile` 二选一） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistCoverUpdateBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_cover_update`、`hana-music-api/schemas/playlist_cover_update` 导入运行时校验器）。

```ts
type UpstreamBody = {
  code: 200;
  url?: string | null;
};

type InvalidInputBody = {
  code: 400;
  msg?: string | null;
};

type PlaylistCoverUpdateBody =
  | {
      code: 200;
      data: UpstreamBody;
    }
  | InvalidInputBody;
```

| 字段        | 类型           | 必填 | 说明                         |
| ----------- | -------------- | ---- | ---------------------------- |
| `code`      | `200 \| 400`   | 是   | 业务状态码                   |
| `data`      | `UpstreamBody` | 否   | 接口返回的数据主体           |
| `data.code` | `200`          | 否   | 业务状态码（`200` 表示成功） |
| `data.url`  | `string`       | 否   | 资源访问地址                 |
| `msg`       | `string`       | 否   | 提示信息                     |

<!-- api-doc:response:end -->

## 注意事项

- **HTTP 体积限制**：HTTP 服务默认请求体上限为 `10 MiB`，上传更大文件需调整服务配置 `maxBodyBytes`，详见 [HTTP 服务部署](/guide/http-deployment)；SDK 直接调用不受此限制。
- **阶段超时与部分完成**：上传按阶段分别计时（单阶段最多 `60s`，整体最多 `5min`），可通过 `timeoutMs` 缩短总超时时间；失败若返回 `partialCompletion: true`，`completedStages` 表示已完成阶段数（非百分比），且已完成的阶段不会自动回滚，详见 [弹性与超时](/guide/resilience) 与 [错误处理](/guide/error-handling)。
- **两种传参方式**：必须传入 `imgFile` 或 `imgId` 二者之一；同时传入或同时缺失时均会返回 `status: 400`。
- **图片要求**：当前按 JPEG 处理且不再支持裁剪参数（`imgSize`/`imgX`/`imgY`），请在上传前完成裁剪。
