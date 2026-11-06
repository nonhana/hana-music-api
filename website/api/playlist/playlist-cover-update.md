---
title: '更新歌单封面'
description: '提供歌单 ID 和登录 Cookie，用 JPEG 图片文件或已上传图片的编号更新歌单封面。'
---

# 更新歌单封面

把图片设为歌单封面。有两种用法：

- 传 `imgFile`：本模块先上传整张图片，再把返回的图片编号设为封面。当前上传实现按 JPEG 发送文件，示例使用 JPEG 图片。
- 传 `imgId`：图片已经通过 [申请图片上传凭证](/api/playlist/image-upload-token) 直传完成，本模块只发一次“设为封面”的请求，不再经手图片数据。这一步失败后可以用同一个 `imgId` 重试，不必重新上传。

## 接口信息

| 项目     | 值                                              |
| -------- | ----------------------------------------------- |
| 接口地址 | `/playlist/cover/update`                        |
| 上传方式 | `imgFile` 用 POST multipart；`imgId` 用普通参数 |
| 需要登录 | 是，且需要有权修改该歌单                        |
| 对应模块 | `playlist_cover_update`                         |

## 请求参数

| 参数      | 类型                     | 说明                                   |
| --------- | ------------------------ | -------------------------------------- |
| `id`      | number 或 string         | 要修改的歌单 ID                        |
| `imgFile` | HTTP 文件或 SDK 文件对象 | 上传的封面图片                         |
| `imgId`   | number 或 string         | 已上传图片的编号，来自申请图片上传凭证 |

一次有效更新需要歌单 ID，以及 `imgFile`、`imgId` 二者之一；两个都传或都不传时返回 `status: 400`，不会发出任何请求。当前模块不处理旧文档中的 `imgSize`、`imgX`、`imgY` 裁剪参数，上传前自行处理图片。

## HTTP 示例

```bash
curl 'http://127.0.0.1:3021/playlist/cover/update' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'id=your-playlist-id' \
  -F 'imgFile=@./cover.jpg;type=image/jpeg'
```

已上传图片的编号：

```bash
curl 'http://127.0.0.1:3021/playlist/cover/update?id=your-playlist-id&imgId=your-img-id' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

仓库服务的演示地址为 `/demo/upload/playlist-cover`。

## 编程式调用

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

没有可用的图片参数时，本模块会正常返回 `status: 400`，所以即使 `await` 没有抛出，也需要检查状态。

传 `imgId` 时，成功响应的 `data` 是网易云对“设为封面”的原始返回。传 `imgFile` 时，`data` 还带上 `imgId` 和 `url_pre`；上传开始后如果出现部分完成的错误，`partialCompletion: true` 表示某些请求阶段已经完成，`completedStages` 给出阶段数。文件上传成功不等于歌单封面一定更新成功。

本模块按上传模块计时：单个请求最多 60 秒，整次调用最多 5 分钟，只传 `imgId` 时也一样；想更快得到失败结果就传 `timeoutMs`。在 HTTP 服务上，它也占用上传并发名额。期限与取消见 [重试、超时与连接策略](/guide/retry-timeout-resilience)，文件大小限制见 [部署 HTTP 服务](/guide/server-deployment)。
