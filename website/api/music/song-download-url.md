---
title: '获取客户端歌曲下载 url'
description: '使用 `/song/url` 接口获取的是歌曲试听 url，但存在部分歌曲在非 VIP 账号上可以下载无损音质而不能试听无损音质，使用此接口可使非 VIP 账号获取这些歌曲的无损音频'
---

# 获取客户端歌曲下载 url

使用 `/song/url` 接口获取的是歌曲试听 url，但存在部分歌曲在非 VIP 账号上可以下载无损音质而不能试听无损音质，使用此接口可使非 VIP 账号获取这些歌曲的无损音频

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                          |
| ---------- | ----------------------------------------------------------- |
| 接口地址   | `/song/download/url`                                        |
| 请求方式   | `GET` / `POST`                                              |
| 需要登录   | 否                                                          |
| 对应模块   | `song_download_url`                                         |
| SDK 函数   | `songDownloadUrl`（`hana-music-api/api/song_download_url`） |
| 返回体类型 | `SongDownloadUrlBody`（已建模返回体）                       |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songDownloadUrl } from 'hana-music-api';

const result = await songDownloadUrl({
  id: '123456',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/download/url' \
  --data-urlencode 'id=123456'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值   | 说明                                                                        |
| ---- | ------------------ | ---- | -------- | --------------------------------------------------------------------------- |
| `br` | `number`           | 否   | `999000` | 码率，默认设置了 999000 即最大码率，如果要 320k 则可设置为 320000，其他类推 |
| `id` | `number \| string` | 是   | -        | 音乐 id (仅支持单首歌曲)                                                    |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongDownloadUrlBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_download_url`、`hana-music-api/schemas/song_download_url` 导入运行时校验器）。

```ts
type SongDownloadUrlBody = {
  code: 200;
  data: SongUrlData;
};
```

- **公共类型**：[SongUrlData](/api/shared-types#songurldata)

| 字段   | 类型                                         | 必填 | 说明                         |
| ------ | -------------------------------------------- | ---- | ---------------------------- |
| `code` | `200`                                        | 是   | 业务状态码（`200` 表示成功） |
| `data` | [SongUrlData](/api/shared-types#songurldata) | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->

## 注意事项

- **响应形态**：与 `/song/url` 不同，本接口 `data` 为单个对象（而非数组）。
