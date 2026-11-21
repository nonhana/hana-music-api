---
title: '歌手简要百科信息'
description: '登录后调用此接口，使用此接口，传入歌手id，可获取对应的歌手简要百科信息'
---

# 歌手简要百科信息

登录后调用此接口，使用此接口，传入歌手id，可获取对应的歌手简要百科信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                    |
| ---------- | ----------------------------------------------------- |
| 接口地址   | `/ugc/artist/get`                                     |
| 请求方式   | `GET` / `POST`                                        |
| 需要登录   | 是                                                    |
| 对应模块   | `ugc_artist_get`                                      |
| SDK 函数   | `ugcArtistGet`（`hana-music-api/api/ugc_artist_get`） |
| 返回体类型 | `UgcArtistGetBody`（已建模返回体）                    |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { ugcArtistGet } from 'hana-music-api';

const result = await ugcArtistGet(
  {
    id: '15396',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/ugc/artist/get' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=15396'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 歌手id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UgcArtistGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/ugc_artist_get`、`hana-music-api/schemas/ugc_artist_get` 导入运行时校验器）。

```ts
type UgcArtistGetBody = {
  code: 200;
  data?: {
    alias?: string | null;
    area?: number | null;
    artistId: number;
    artistName?: string | null;
    avatarPicUrl?: string | null;
    desc?: string | null;
    headPicUrl?: string | null;
    production?: string | null;
    type?: number | null;
  } | null;
  message?: string | null;
};
```

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                | 类型     | 必填 | 说明                         |
| ------------------- | -------- | ---- | ---------------------------- |
| `code`              | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`              | `object` | 可空 | 接口返回的数据主体           |
| `data.alias`        | `string` | 否   | -                            |
| `data.area`         | `number` | 否   | -                            |
| `data.artistId`     | `number` | 是   | 歌手 ID                      |
| `data.artistName`   | `string` | 否   | 歌手名称                     |
| `data.avatarPicUrl` | `string` | 否   | 资源访问链接                 |
| `data.desc`         | `string` | 否   | 简介信息                     |
| `data.headPicUrl`   | `string` | 否   | 资源访问链接                 |
| `data.production`   | `string` | 否   | -                            |
| `data.type`         | `number` | 否   | -                            |
| `message`           | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
