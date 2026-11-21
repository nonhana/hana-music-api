---
title: 'mv简要百科信息'
description: '登录后调用此接口，使用此接口，传入mv id，可获取对应的mv简要百科信息'
---

# mv简要百科信息

登录后调用此接口，使用此接口，传入mv id，可获取对应的mv简要百科信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                            |
| ---------- | --------------------------------------------- |
| 接口地址   | `/ugc/mv/get`                                 |
| 请求方式   | `GET` / `POST`                                |
| 需要登录   | 是                                            |
| 对应模块   | `ugc_mv_get`                                  |
| SDK 函数   | `ugcMvGet`（`hana-music-api/api/ugc_mv_get`） |
| 返回体类型 | `UgcMvGetBody`（已建模返回体）                |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { ugcMvGet } from 'hana-music-api';

const result = await ugcMvGet(
  {
    id: '14572641',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/ugc/mv/get' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=14572641'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明  |
| ---- | ------------------ | ---- | ------ | ----- |
| `id` | `number \| string` | 是   | -      | mv id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UgcMvGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/ugc_mv_get`、`hana-music-api/schemas/ugc_mv_get` 导入运行时校验器）。

```ts
type AlbumRef = {
  albumId?: number | null;
  albumName?: string | null;
};

type MvSongRep = {
  songId?: number | null;
  songName?: string | null;
  albumRepVo?: AlbumRef | null;
  artistRepVos?: Array<UgcArtistRef> | null;
};

type UgcMvGetBody = {
  code: 200;
  data: {
    mvId: number;
    mvName?: string | null;
    artistRepVos?: Array<UgcArtistRef> | null;
    desc?: string | null;
    mvSongVos?: Array<MvSongRep> | null;
    pic16v9Url?: string | null;
    pic4v3Url?: string | null;
    publishTime?: number | null;
  };
  message?: string | null;
};
```

- **公共类型**：[UgcArtistRef](/api/shared-types#ugcartistref)

| 字段                            | 类型                                                    | 必填 | 说明                         |
| ------------------------------- | ------------------------------------------------------- | ---- | ---------------------------- |
| `code`                          | `200`                                                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                          | `object`                                                | 是   | 接口返回的数据主体           |
| `data.mvId`                     | `number`                                                | 是   | MV ID                        |
| `data.mvName`                   | `string`                                                | 否   | -                            |
| `data.artistRepVos`             | Array\<[UgcArtistRef](/api/shared-types#ugcartistref)\> | 否   | UgcArtistRef 列表            |
| `data.desc`                     | `string`                                                | 否   | 简介信息                     |
| `data.mvSongVos`                | `Array<MvSongRep>`                                      | 否   | -                            |
| `data.mvSongVos[].songId`       | `number`                                                | 否   | 歌曲 ID                      |
| `data.mvSongVos[].songName`     | `string`                                                | 否   | -                            |
| `data.mvSongVos[].albumRepVo`   | `AlbumRef`                                              | 否   | -                            |
| `data.mvSongVos[].artistRepVos` | Array\<[UgcArtistRef](/api/shared-types#ugcartistref)\> | 否   | UgcArtistRef 列表            |
| `data.pic16v9Url`               | `string`                                                | 否   | 资源访问链接                 |
| `data.pic4v3Url`                | `string`                                                | 否   | 资源访问链接                 |
| `data.publishTime`              | `number`                                                | 否   | 时间戳                       |
| `message`                       | `string`                                                | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
