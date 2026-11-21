---
title: '更新头像'
description: '提供 JPEG 图片文件和登录 Cookie，更新账号头像。'
---

# 更新头像

上传图片后更新当前账号头像。当前上传实现按 JPEG 发送文件，示例使用提前准备好的 JPEG 图片。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                   |
| ---------- | ---------------------------------------------------- |
| 接口地址   | `/avatar/upload`                                     |
| 请求方式   | `POST`（`multipart/form-data`）                      |
| 需要登录   | 是                                                   |
| 对应模块   | `avatar_upload`                                      |
| SDK 函数   | `avatarUpload`（`hana-music-api/api/avatar_upload`） |
| 返回体类型 | `UnknownJson`（未建模接口）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { readFile } from 'node:fs/promises';

import { avatarUpload } from 'hana-music-api';

const data = await readFile('./avatar.jpg');
const result = await avatarUpload(
  {
    imgFile: {
      data,
      name: 'avatar.jpg',
      mimetype: 'image/jpeg',
      size: data.byteLength,
    },
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/avatar/upload' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'imgFile=@./avatar.jpg;type=image/jpeg'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型         | 必填 | 默认值 | 说明                                                   |
| --------- | ------------ | ---- | ------ | ------------------------------------------------------ |
| `imgFile` | 上传文件对象 | 否   | -      | JPEG 图片文件（HTTP 使用 multipart，SDK 传入文件对象） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **HTTP 体积限制**：HTTP 服务默认请求体上限为 `10 MiB`，上传更大文件需调整服务配置 `maxBodyBytes`，详见 [HTTP 服务部署](/guide/http-deployment)；SDK 直接调用不受此限制。
- **阶段超时与部分完成**：上传按阶段分别计时（单阶段最多 `60s`，整体最多 `5min`），可通过 `timeoutMs` 缩短总超时时间；失败若返回 `partialCompletion: true`，`completedStages` 表示已完成阶段数（非百分比），且已完成的阶段不会自动回滚，详见 [弹性与超时](/guide/resilience) 与 [错误处理](/guide/error-handling)。
- **图片格式**：当前上传流程按 JPEG 处理且不再支持裁剪参数（`imgSize`/`imgX`/`imgY`），请在上传前完成图片裁剪。
