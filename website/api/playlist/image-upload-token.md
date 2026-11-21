---
title: '申请图片上传凭证'
description: '申请网易云图片存储的上传地址和凭证，让浏览器直接上传 JPEG，再用图片ID设置歌单封面。'
---

# 申请图片上传凭证

向网易云申请一张图片的上传位置，返回上传地址、凭证和图片ID。图片本身不经过本服务：获取凭证的一方（通常是浏览器）直接把 JPEG 上传到网易云图片存储，上传完成后把图片ID交给 [更新歌单封面](/api/playlist/playlist-cover-update) 的 `imgId`。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                            |
| ---------- | ------------------------------------------------------------- |
| 接口地址   | `/image/upload/token`                                         |
| 请求方式   | `POST`（`multipart/form-data`）                               |
| 需要登录   | 是                                                            |
| 对应模块   | `image_upload_token`                                          |
| SDK 函数   | `imageUploadToken`（`hana-music-api/api/image_upload_token`） |
| 返回体类型 | `ImageUploadTokenBody`（已建模返回体）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { imageUploadToken } from 'hana-music-api';

const result = await imageUploadToken({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/image/upload/token' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ImageUploadTokenBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/image_upload_token`、`hana-music-api/schemas/image_upload_token` 导入运行时校验器）。

```ts
type ImageUploadTokenBody = {
  code: 200;
  data: {
    imgId: string | number;
    token: string;
    uploadUrl: string;
    url_pre: string;
  };
};
```

| 字段             | 类型               | 必填 | 说明                         |
| ---------------- | ------------------ | ---- | ---------------------------- |
| `code`           | `200`              | 是   | 业务状态码（`200` 表示成功） |
| `data`           | `object`           | 是   | 接口返回的数据主体           |
| `data.imgId`     | `string \| number` | 是   | img ID                       |
| `data.token`     | `string`           | 是   | 认证令牌                     |
| `data.uploadUrl` | `string`           | 是   | 资源访问链接                 |
| `data.url_pre`   | `string`           | 是   | -                            |

<!-- api-doc:response:end -->

## 注意事项

- **HTTP 体积限制**：HTTP 服务默认请求体上限为 `10 MiB`，上传更大文件需调整服务配置 `maxBodyBytes`，详见 [HTTP 服务部署](/guide/http-deployment)；SDK 直接调用不受此限制。
- **阶段超时与部分完成**：上传按阶段分别计时（单阶段最多 `60s`，整体最多 `5min`），可通过 `timeoutMs` 缩短总超时时间；失败若返回 `partialCompletion: true`，`completedStages` 表示已完成阶段数（非百分比），且已完成的阶段不会自动回滚，详见 [弹性与超时](/guide/resilience) 与 [错误处理](/guide/error-handling)。
- **工作流程**：调用本接口获取 `uploadUrl`、`token` 和 `imgId` 后，由客户端直接向 `uploadUrl` 发送 `POST`（携带请求头 `x-nos-token` 和 `Content-Type: image/jpeg` 与图片原始字节）。
- **设为封面**：直传完成后，将 `imgId` 传给 [更新歌单封面](/api/playlist/playlist-cover-update)；即使封面更新失败也可复用同一 `imgId` 重试，无需重复上传。
