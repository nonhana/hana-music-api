---
title: '专辑简要百科信息'
description: '登录后调用此接口，使用此接口，传入专辑id，可获取对应的专辑简要百科信息'
---

# 专辑简要百科信息

登录后调用此接口，使用此接口，传入专辑id，可获取对应的专辑简要百科信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                  |
| ---------- | --------------------------------------------------- |
| 接口地址   | `/ugc/album/get`                                    |
| 请求方式   | `GET` / `POST`                                      |
| 需要登录   | 是                                                  |
| 对应模块   | `ugc_album_get`                                     |
| SDK 函数   | `ugcAlbumGet`（`hana-music-api/api/ugc_album_get`） |
| 返回体类型 | `UgcAlbumGetBody`（已建模返回体）                   |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { ugcAlbumGet } from 'hana-music-api';

const result = await ugcAlbumGet(
  {
    id: '168223858',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/ugc/album/get' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=168223858'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 专辑id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UgcAlbumGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/ugc_album_get`、`hana-music-api/schemas/ugc_album_get` 导入运行时校验器）。

```ts
type SongTag = {
  id?: number | null;
  name?: string | null;
};

type AlbumSongRep = {
  songId?: number | null;
  songName?: string | null;
  artistRepVos?: Array<UgcArtistRef> | null;
  songSubTitle?: string | null;
  publishTime?: number | null;
  language?: string | null;
  no?: number | null;
  disc?: string | null;
  songTags?: Array<SongTag> | null;
  transName?: string | null;
};

type UgcAlbumGetBody = {
  code: 200;
  data?: {
    albumId: number;
    albumName?: string | null;
    albumPicUrl?: string | null;
    albumSubTitle?: string | null;
    artistRepVos?: Array<UgcArtistRef> | null;
    company?: string | null;
    language?: string | null;
    production?: string | null;
    publishTime?: number | null;
    songRepVos?: Array<AlbumSongRep> | null;
    songTags?: Array<SongTag> | null;
    type?: string | null;
  } | null;
  message?: string | null;
};
```

- **公共类型**：[UgcArtistRef](/api/shared-types#ugcartistref)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段                             | 类型                                                    | 必填 | 说明                         |
| -------------------------------- | ------------------------------------------------------- | ---- | ---------------------------- |
| `code`                           | `200`                                                   | 是   | 业务状态码（`200` 表示成功） |
| `data`                           | `object`                                                | 可空 | 接口返回的数据主体           |
| `data.albumId`                   | `number`                                                | 是   | 专辑 ID                      |
| `data.albumName`                 | `string`                                                | 否   | 专辑名称                     |
| `data.albumPicUrl`               | `string`                                                | 否   | 资源访问链接                 |
| `data.albumSubTitle`             | `string`                                                | 否   | -                            |
| `data.artistRepVos`              | Array\<[UgcArtistRef](/api/shared-types#ugcartistref)\> | 否   | UgcArtistRef 列表            |
| `data.company`                   | `string`                                                | 否   | -                            |
| `data.language`                  | `string`                                                | 否   | -                            |
| `data.production`                | `string`                                                | 否   | -                            |
| `data.publishTime`               | `number`                                                | 否   | 时间戳                       |
| `data.songRepVos`                | `Array<AlbumSongRep>`                                   | 否   | -                            |
| `data.songRepVos[].songId`       | `number`                                                | 否   | 歌曲 ID                      |
| `data.songRepVos[].songName`     | `string`                                                | 否   | -                            |
| `data.songRepVos[].artistRepVos` | Array\<[UgcArtistRef](/api/shared-types#ugcartistref)\> | 否   | UgcArtistRef 列表            |
| `data.songRepVos[].songSubTitle` | `string`                                                | 否   | -                            |
| `data.songRepVos[].publishTime`  | `number`                                                | 否   | 时间戳                       |
| `data.songRepVos[].language`     | `string`                                                | 否   | -                            |
| `data.songRepVos[].no`           | `number`                                                | 否   | -                            |
| `data.songRepVos[].disc`         | `string`                                                | 否   | -                            |
| `data.songRepVos[].songTags`     | `Array<SongTag>`                                        | 否   | -                            |
| `data.songRepVos[].transName`    | `string`                                                | 否   | -                            |
| `data.songTags`                  | `Array<SongTag>`                                        | 否   | -                            |
| `data.songTags[].id`             | `number`                                                | 否   | 记录 ID                      |
| `data.songTags[].name`           | `string`                                                | 否   | 名称                         |
| `data.type`                      | `string`                                                | 否   | -                            |
| `message`                        | `string`                                                | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
