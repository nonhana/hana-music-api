---
title: '云盘上传'
description: '提供音频文件和登录 Cookie，将歌曲上传到账号云盘。'
---

# 云盘上传

提供音频文件和有效登录 Cookie，将歌曲上传到云盘。只调用 `/cloud` 或 `cloud()` 而不提供文件，无法完成上传。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                    |
| ---------- | ------------------------------------- |
| 接口地址   | `/cloud`                              |
| 请求方式   | `POST`（`multipart/form-data`）       |
| 需要登录   | 是                                    |
| 对应模块   | `cloud`                               |
| SDK 函数   | `cloud`（`hana-music-api/api/cloud`） |
| 返回体类型 | `UnknownJson`（未建模接口）           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { readFile } from 'node:fs/promises';

import { cloud } from 'hana-music-api';

const data = await readFile('./song.mp3');
const result = await cloud(
  {
    songFile: {
      data,
      name: 'song.mp3',
      mimetype: 'audio/mpeg',
      size: data.byteLength,
    },
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/cloud' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'songFile=@./song.mp3;type=audio/mpeg'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型         | 必填 | 默认值 | 说明                                              |
| ---------- | ------------ | ---- | ------ | ------------------------------------------------- |
| `songFile` | 上传文件对象 | 否   | -      | 音频文件（HTTP 使用 multipart，SDK 传入文件对象） |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **HTTP 体积限制**：HTTP 服务默认请求体上限为 `10 MiB`，上传更大文件需调整服务配置 `maxBodyBytes`，详见 [HTTP 服务部署](/guide/http-deployment)；SDK 直接调用不受此限制。
- **阶段超时与部分完成**：上传按阶段分别计时（单阶段最多 `60s`，整体最多 `5min`），可通过 `timeoutMs` 缩短总超时时间；失败若返回 `partialCompletion: true`，`completedStages` 表示已完成阶段数（非百分比），且已完成的阶段不会自动回滚，详见 [弹性与超时](/guide/resilience) 与 [错误处理](/guide/error-handling)。
- **可选依赖**：SDK 在本地解析音频元数据时尝试加载可选依赖 `music-metadata`；未安装时自动回退至文件名与默认标签完成上传。
