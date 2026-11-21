---
title: '云盘导入歌曲'
description: '登录后调用此接口，使用此接口，可云盘导入歌曲而无需上传文件'
---

# 云盘导入歌曲

登录后调用此接口，使用此接口，可云盘导入歌曲而无需上传文件

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/cloud/import`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 是                                                 |
| 对应模块   | `cloud_import`                                     |
| SDK 函数   | `cloudImport`（`hana-music-api/api/cloud_import`） |
| 返回体类型 | `UnknownJson`（未建模接口）                        |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { cloudImport } from 'hana-music-api';

const result = await cloudImport(
  {
    song: '最伟大的作品',
    artist: '周杰伦',
    album: '最伟大的作品',
    fileType: 'flac',
    fileSize: 50412168,
    bitrate: 1652,
    md5: 'd02b8ab79d91c01167ba31e349fe5275',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/cloud/import' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'song=最伟大的作品' \
  --data-urlencode 'artist=周杰伦' \
  --data-urlencode 'album=最伟大的作品' \
  --data-urlencode 'fileType=flac' \
  --data-urlencode 'fileSize=50412168' \
  --data-urlencode 'bitrate=1652' \
  --data-urlencode 'md5=d02b8ab79d91c01167ba31e349fe5275'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数       | 类型               | 必填 | 默认值 | 说明                        |
| ---------- | ------------------ | ---- | ------ | --------------------------- |
| `album`    | `string`           | 否   | `未知` | 专辑 默认为未知             |
| `artist`   | `string`           | 否   | `未知` | 歌手 默认为未知             |
| `bitrate`  | `number`           | 否   | -      | 文件比特率                  |
| `fileSize` | `number`           | 否   | -      | 文件大小                    |
| `fileType` | `string`           | 否   | -      | 文件后缀                    |
| `id`       | `number \| string` | 否   | `-2`   | 歌曲ID，情况2时必须正确填写 |
| `md5`      | `string`           | 否   | -      | 文件MD5                     |
| `song`     | `string`           | 否   | -      | 歌名/文件名                 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

该接口未建模固定返回体，SDK 返回的 `body` 类型为 `UnknownJson`，实际字段以网易云上游响应为准。

<!-- api-doc:response:end -->

## 注意事项

- **导入前提**：仅当音频文件已有其他用户上传至云盘，或文件属于网易云曲库音源（此时必须提供正确的歌曲 `id`）时可导入成功。
- **码率换算**：使用歌曲链接接口获取的 `br` 时需换算为 kb/s：`bitrate = Math.floor(br / 1000)`。
- **文件后缀**：导入后的云盘条目文件名后缀统一显示为 `.mp3`，实际播放文件格式不受影响。
