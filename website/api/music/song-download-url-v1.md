---
title: '获取客户端歌曲下载链接 - 新版'
description: '使用 `/song/url/v1` 接口获取的是歌曲试听 url，非 VIP 账号最高只能获取 `极高` 音质，但免费类型的歌曲(`fee == 0`)使用本接口可最高获取`Hi-Res`音质的url。'
---

# 获取客户端歌曲下载链接 - 新版

使用 `/song/url/v1` 接口获取的是歌曲试听 url，非 VIP 账号最高只能获取 `极高` 音质，但免费类型的歌曲(`fee == 0`)使用本接口可最高获取`Hi-Res`音质的url。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                               |
| ---------- | ---------------------------------------------------------------- |
| 接口地址   | `/song/download/url/v1`                                          |
| 请求方式   | `GET` / `POST`                                                   |
| 需要登录   | 否                                                               |
| 对应模块   | `song_download_url_v1`                                           |
| SDK 函数   | `songDownloadUrlV1`（`hana-music-api/api/song_download_url_v1`） |
| 返回体类型 | `SongDownloadUrlV1Body`（已建模返回体）                          |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { songDownloadUrlV1 } from 'hana-music-api';

const result = await songDownloadUrlV1({
  id: '2155423468',
  level: 'hires',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/song/download/url/v1' \
  --data-urlencode 'id=2155423468' \
  --data-urlencode 'level=hires'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数    | 类型               | 必填 | 默认值 | 说明                       |
| ------- | ------------------ | ---- | ------ | -------------------------- |
| `id`    | `number \| string` | 是   | -      | 音乐 id                    |
| `level` | `string`           | 是   | -      | 目标音质等级，见下方枚举表 |

| `level`    | 音质等级   |
| ---------- | ---------- |
| `standard` | 标准       |
| `higher`   | 较高       |
| `exhigh`   | 极高       |
| `lossless` | 无损       |
| `hires`    | Hi-Res     |
| `jyeffect` | 高清环绕声 |
| `sky`      | 沉浸环绕声 |
| `jymaster` | 超清母带   |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`SongDownloadUrlV1Body`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/song_download_url_v1`、`hana-music-api/schemas/song_download_url_v1` 导入运行时校验器）。

```ts
type SongDownloadUrlV1Body = {
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

- **响应形态**：与 `/song/url/v1` 不同，本接口 `data` 为单个对象（而非数组）；传入无权限或无版权歌曲时 `data.url` 为 `null`。
