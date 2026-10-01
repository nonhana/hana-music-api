---
title: '更新头像'
description: '提供 JPEG 图片文件和登录 Cookie，更新账号头像。'
---

# 更新头像

上传图片后更新当前账号头像。当前上传实现按 JPEG 发送文件，示例使用提前准备好的 JPEG 图片。

## 接口信息

| 项目     | 值               |
| -------- | ---------------- |
| 接口地址 | `/avatar/upload` |
| 上传方式 | POST multipart   |
| 需要登录 | 是               |
| 对应模块 | `avatar_upload`  |

## 请求参数

| 参数      | HTTP                               | SDK                                              |
| --------- | ---------------------------------- | ------------------------------------------------ |
| `imgFile` | multipart 图片文件字段，上传时必需 | 含 `data`、`name`、`mimetype`、`size` 的文件对象 |

当前模块不处理旧文档中的 `imgSize`、`imgX`、`imgY` 裁剪参数。需要裁剪时，在上传前处理图片。

## HTTP 示例

```bash
curl 'http://127.0.0.1:3021/avatar/upload' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'imgFile=@./avatar.jpg;type=image/jpeg'
```

## 编程式调用

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

文件上传和头像更新是不同阶段，后续失败不代表前面的文件没有传出。错误体中的 `partialCompletion` 和 `completedStages` 用于报告部分完成，详见 [架构中的上传流程](/guide/request-layer-overview#网页与上传也使用同一个请求能力)。HTTP 文件限制见 [部署 HTTP 服务](/guide/server-deployment)。
