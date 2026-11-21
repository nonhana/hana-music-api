---
title: '歌曲简要百科信息'
description: '登录后调用此接口，使用此接口，传入歌曲id，可获取对应的歌曲简要百科信息'
---

# 歌曲简要百科信息

登录后调用此接口，使用此接口，传入歌曲id，可获取对应的歌曲简要百科信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                |
| ---------- | ------------------------------------------------- |
| 接口地址   | `/ugc/song/get`                                   |
| 请求方式   | `GET` / `POST`                                    |
| 需要登录   | 是                                                |
| 对应模块   | `ugc_song_get`                                    |
| SDK 函数   | `ugcSongGet`（`hana-music-api/api/ugc_song_get`） |
| 返回体类型 | `UgcSongGetBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { ugcSongGet } from 'hana-music-api';

const result = await ugcSongGet(
  {
    id: '2058263032',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/ugc/song/get' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'id=2058263032'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数 | 类型               | 必填 | 默认值 | 说明   |
| ---- | ------------------ | ---- | ------ | ------ |
| `id` | `number \| string` | 是   | -      | 歌曲id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`UgcSongGetBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/ugc_song_get`、`hana-music-api/schemas/ugc_song_get` 导入运行时校验器）。

```ts
type AlbumRef = {
  albumId?: number | null;
  albumName?: string | null;
};

type UgcSongGetBody = {
  code: 200;
  data?: {
    songId: number;
    songName?: string | null;
    artistRepVos?: Array<UgcArtistRef> | null;
    songSubTitle?: string | null;
    publishTime?: number | null;
    language?: string | null;
    originalCover?: number | null;
    disc?: string | null;
    lyricArtists?: Array<UgcArtistRef> | null;
    composeArtists?: Array<UgcArtistRef> | null;
    albumRepVo?: AlbumRef | null;
    transName?: string | null;
    lyricContent?: string | null;
    transLyricContent?: string | null;
    playUrl?: string | null;
    forTransLyric?: number | null;
    noNeedLyric?: number | null;
    lyricLock?: number | null;
    transLyricLock?: number | null;
    lyricIsEdited?: number | null;
    duration?: number | null;
  } | null;
  message?: string | null;
};
```

- **公共类型**：[UgcArtistRef](/api/shared-types#ugcartistref)

> 标为`可空`的路径在缺失或为 `null` 时正常返回，存在时按内部结构校验。

| 字段      | 类型     | 必填 | 说明                         |
| --------- | -------- | ---- | ---------------------------- |
| `code`    | `200`    | 是   | 业务状态码（`200` 表示成功） |
| `data`    | `object` | 可空 | 接口返回的数据主体           |
| `message` | `string` | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
