---
title: '云盘上传'
description: '提供音频文件和登录 Cookie，将歌曲上传到账号云盘。'
---

# 云盘上传

提供音频文件和有效登录 Cookie，将歌曲上传到云盘。只调用 `/cloud` 或 `cloud()` 而不提供文件，无法完成上传。

## 接口信息

| 项目     | 值             |
| -------- | -------------- |
| 接口地址 | `/cloud`       |
| 上传方式 | POST multipart |
| 需要登录 | 是             |
| 对应模块 | `cloud`        |

## 文件参数

| 参数       | HTTP               | SDK                        |
| ---------- | ------------------ | -------------------------- |
| `songFile` | multipart 文件字段 | 包含文件字节和元信息的对象 |

SDK 文件对象包含 `data`、`name`、`mimetype`、`size`。`data` 支持 `ArrayBuffer`、`Uint8Array` 或 Node.js Buffer，`size` 使用字节数。可以额外传 `md5`，未提供时模块根据文件计算。

## HTTP 示例

先准备本地音频文件，再上传：

```bash
curl 'http://127.0.0.1:3021/cloud' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  -F 'songFile=@./song.mp3;type=audio/mpeg'
```

让 curl 自动生成 multipart 的 `Content-Type` 和 boundary，不要手动把请求头固定成没有 boundary 的 `multipart/form-data`。

## 编程式调用

下面使用 Node.js 文件 API 读取当前目录的音频文件：

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

## 大文件和部分完成

HTTP 服务默认文件总量上限为 10 MiB，较大音频需要调整服务的 `maxBodyBytes`，见 [部署 HTTP 服务](/guide/server-deployment)。SDK 直接调用不经过这层 HTTP 请求体限制。

上传包含检查、文件传输和发布等阶段。已经完成的上游操作不会因后续失败而回滚。若错误体包含 `partialCompletion: true`，`completedStages` 是已完成的请求阶段数，不是上传百分比。重试前先确认账号云盘中是否已有结果。

上传的阶段期限、总期限和取消规则见 [重试、超时与连接策略](/guide/retry-timeout-resilience)。
