---
title: '播客上传声音'
description: '上传音频文件，并提交对应的播客声音信息。'
---

# 播客上传声音

先上传音频文件，再提交声音所属播客、封面和分类等信息。使用具有发布权限的登录 Cookie，不能只调用一个空的 `voiceUpload()`。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/voice/upload`                                    |
| 请求方式   | `POST`（`multipart/form-data`）                    |
| 需要登录   | 是（需具备播客发布权限）                           |
| 对应模块   | `voice_upload`                                     |
| SDK 函数   | `voiceUpload`（`hana-music-api/api/voice_upload`） |
| 返回体类型 | `UnknownJson`（未建模接口）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { readFile } from 'node:fs/promises';

import { voiceUpload } from 'hana-music-api';

const data = await readFile('./episode.mp3');
const result = await voiceUpload(
  {
    songFile: {
      data,
      name: 'episode.mp3',
      mimetype: 'audio/mpeg',
      size: data.byteLength,
    },
    voiceListId: 'your-voice-list-id',
    coverImgId: 'your-cover-id',
    categoryId: 'your-category-id',
    secondCategoryId: 'your-subcategory-id',
    description: '本期声音介绍',
    songName: '第一期',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/voice/upload' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'songFile=@./episode.mp3;type=audio/mpeg' \
  -F 'voiceListId=your-voice-list-id' \
  -F 'coverImgId=your-cover-id' \
  -F 'categoryId=your-category-id' \
  -F 'secondCategoryId=your-subcategory-id' \
  -F 'description=本期声音介绍'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数               | 类型                                | 必填 | 默认值 | 说明                                              |
| ------------------ | ----------------------------------- | ---- | ------ | ------------------------------------------------- |
| `autoPublish`      | `boolean`                           | 否   | -      | 发布后是否同步发送动态                            |
| `autoPublishText`  | `string`                            | 否   | ``     | 同步动态文案，默认空字符串                        |
| `categoryId`       | `number \| string`                  | 否   | -      | 一级分类 ID                                       |
| `composedSongs`    | `Array<number \| string> \| string` | 否   | -      | 关联歌曲 ID 列表或逗号分隔字符串                  |
| `coverImgId`       | `number \| string`                  | 否   | -      | 声音封面图片 ID                                   |
| `description`      | `string`                            | 否   | -      | 声音简介                                          |
| `orderNo`          | `number`                            | 否   | `1`    | 播客内排序序号，默认 `1`                          |
| `privacy`          | `boolean`                           | 否   | -      | 是否设为仅自己可见                                |
| `publishTime`      | `number`                            | 否   | `0`    | 定时发布时间戳（毫秒），立即发布可传 `0`          |
| `secondCategoryId` | `number \| string`                  | 否   | -      | 二级分类 ID                                       |
| `songFile`         | 上传文件对象                        | 否   | -      | 音频文件（HTTP 使用 multipart，SDK 传入文件对象） |
| `songName`         | `string`                            | 否   | -      | 声音名称（未传时从文件名整理）                    |
| `voiceListId`      | `number \| string`                  | 否   | -      | 所属播客 ID                                       |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **HTTP 体积限制**：HTTP 服务默认请求体上限为 `10 MiB`，上传更大文件需调整服务配置 `maxBodyBytes`，详见 [HTTP 服务部署](/guide/http-deployment)；SDK 直接调用不受此限制。
- **阶段超时与部分完成**：上传按阶段分别计时（单阶段最多 `60s`，整体最多 `5min`），可通过 `timeoutMs` 缩短总超时时间；失败若返回 `partialCompletion: true`，`completedStages` 表示已完成阶段数（非百分比），且已完成的阶段不会自动回滚，详见 [弹性与超时](/guide/resilience) 与 [错误处理](/guide/error-handling)。
- **分块流程**：内部自动按最多 10 MiB 分块完成凭证申请、初始化、逐块上传、合并、预检与发布提交（可通过 `composedSongs` 传入关联歌曲 ID 数组）。
