---
title: '更新歌单封面'
description: '提供歌单 ID、JPEG 图片文件和登录 Cookie，更新歌单封面。'
---

# 更新歌单封面

上传封面图片，再把返回的图片 ID 设置到歌单。当前上传实现按 JPEG 发送文件，示例使用 JPEG 图片。

## 接口信息

| 项目     | 值                       |
| -------- | ------------------------ |
| 接口地址 | `/playlist/cover/update` |
| 上传方式 | POST multipart           |
| 需要登录 | 是，且需要有权修改该歌单 |
| 对应模块 | `playlist_cover_update`  |

## 请求参数

| 参数      | 类型                     | 说明            |
| --------- | ------------------------ | --------------- |
| `id`      | number 或 string         | 要修改的歌单 ID |
| `imgFile` | HTTP 文件或 SDK 文件对象 | 上传的封面图片  |

一次有效更新需要歌单 ID 和文件。当前模块不处理旧文档中的 `imgSize`、`imgX`、`imgY` 裁剪参数，上传前自行处理图片。

## HTTP 示例

```bash
curl 'http://127.0.0.1:3021/playlist/cover/update' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'id=your-playlist-id' \
  -F 'imgFile=@./cover.jpg;type=image/jpeg'
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

没有传文件时，本模块会正常返回 `status: 400`，所以即使 `await` 没有抛出，也需要检查状态。

上传开始后如果出现部分完成的错误，`partialCompletion: true` 表示某些请求阶段已经完成，`completedStages` 给出阶段数。文件上传成功不等于歌单封面一定更新成功。期限与取消见 [重试、超时与连接策略](/guide/retry-timeout-resilience)，文件大小限制见 [部署 HTTP 服务](/guide/server-deployment)。
