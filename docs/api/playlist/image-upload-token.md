---
title: '申请图片上传凭证'
description: '申请网易云图片存储的上传地址和凭证，让浏览器直接上传 JPEG，再用图片编号设置歌单封面。'
---

# 申请图片上传凭证

向网易云申请一张图片的上传位置，返回上传地址、凭证和图片编号。图片本身不经过本服务：拿到凭证的一方（通常是浏览器）直接把 JPEG 上传到网易云图片存储，上传完成后把图片编号交给 [更新歌单封面](/api/playlist/playlist-cover-update) 的 `imgId`。

## 接口信息

| 项目     | 值                    |
| -------- | --------------------- |
| 接口地址 | `/image/upload/token` |
| 需要登录 | 是                    |
| 对应模块 | `image_upload_token`  |

## 请求参数

无业务参数。

## 返回内容

```json
{
  "code": 200,
  "data": {
    "imgId": "your-img-id",
    "token": "your-nos-token",
    "uploadUrl": "https://nosup-hz1.127.net/yyimgs/your-object-key?offset=0&complete=true&version=1.0",
    "url_pre": "https://p1.music.126.net/your-object-key"
  }
}
```

| 字段        | 含义                                                           |
| ----------- | -------------------------------------------------------------- |
| `imgId`     | 图片编号（字符串或数字），上传完成后传给更新歌单封面的 `imgId` |
| `token`     | 上传凭证，放在上传请求的 `x-nos-token` 请求头里                |
| `uploadUrl` | 上传地址                                                       |
| `url_pre`   | 上传完成后图片的访问地址，可用来在本地先显示新封面             |

## 直传图片

用 `POST` 把 JPEG 的原始字节发到 `uploadUrl`，带上两个请求头：

```ts
await fetch(uploadUrl, {
  method: 'POST',
  headers: { 'x-nos-token': token, 'Content-Type': 'image/jpeg' },
  body: jpegBlob,
});
```

## 完整流程

```ts
import { imageUploadToken, playlistCoverUpdate } from 'hana-music-api';

const config = { cookie: 'MUSIC_U=your-cookie' };

// 1. 服务端申请凭证，把 uploadUrl、token 交给浏览器
const ticket = await imageUploadToken({}, config);

// 2. 浏览器按上面的方式直传图片

// 3. 服务端把已上传的图片设为封面；这一步失败后重试不需要重新上传
const result = await playlistCoverUpdate(
  { id: 'your-playlist-id', imgId: ticket.body.data.imgId },
  config,
);
console.log(result.status, result.body);
```

每次调用都会申请一个新的上传位置和图片编号，一张图片对应一次申请。
