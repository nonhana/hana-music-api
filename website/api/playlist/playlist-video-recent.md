---
title: '最近播放的视频'
description: '调用此接口，可获取最近播放的视频 ( 需要登录 )'
---

# 最近播放的视频

调用此接口，可获取最近播放的视频 ( 需要登录 )

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                  |
| ---------- | ------------------------------------------------------------------- |
| 接口地址   | `/playlist/video/recent`                                            |
| 请求方式   | `GET` / `POST`                                                      |
| 需要登录   | 是                                                                  |
| 对应模块   | `playlist_video_recent`                                             |
| SDK 函数   | `playlistVideoRecent`（`hana-music-api/api/playlist_video_recent`） |
| 返回体类型 | `PlaylistVideoRecentBody`（已建模返回体）                           |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { playlistVideoRecent } from 'hana-music-api';

const result = await playlistVideoRecent({}, { cookie: 'MUSIC_U=your-cookie' });
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/playlist/video/recent' \
  -H 'Cookie: MUSIC_U=your-cookie'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`PlaylistVideoRecentBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/playlist_video_recent`、`hana-music-api/schemas/playlist_video_recent` 导入运行时校验器）。

```ts
type VideoStream = {
  tag?: string | null;
  url?: string | null;
  duration?: number | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  container?: string | null;
  md5?: string | null;
  check?: boolean | null;
  tagSign?: {
    br?: number | null;
    type?: string | null;
    tagSign?: string | null;
  } | null;
};

type MlogBaseData = {
  id: string;
  threadId?: string | null;
  type?: number | null;
  text?: string | null;
  desc?: string | null;
  pubTime?: number | null;
  coverUrl?: string | null;
  coverPicKey?: string | null;
  coverColor?: number | null;
  coverHeight?: number | null;
  coverWidth?: number | null;
  duration?: number | null;
  greatCover?: boolean | null;
  videos?: Array<VideoStream> | null;
};

type MlogArtist = {
  id?: number | null;
  name?: string | null;
  img1v1Url?: string | null;
};

type MlogExtVO = {
  artistName?: string | null;
  artists?: Array<MlogArtist> | null;
  canCollect?: boolean | null;
  commentCount?: number | null;
  likedCount?: number | null;
  playCount?: number | null;
  song?: MlogSong | null;
};

type RecentVideo = {
  mlogBaseData: MlogBaseData;
  mlogExtVO?: MlogExtVO | null;
  status?: number | null;
  shareUrl?: string | null;
};

type PlaylistVideoRecentBody = {
  code: 200;
  message?: string | null;
  data: {
    videos: Array<RecentVideo>;
  };
};
```

- **公共类型**：[MlogSong](/api/shared-types#mlogsong)

| 字段                         | 类型                 | 必填 | 说明                         |
| ---------------------------- | -------------------- | ---- | ---------------------------- |
| `code`                       | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `message`                    | `string`             | 否   | 返回说明信息                 |
| `data`                       | `object`             | 是   | 接口返回的数据主体           |
| `data.videos`                | `Array<RecentVideo>` | 是   | -                            |
| `data.videos[].mlogBaseData` | `MlogBaseData`       | 是   | -                            |
| `data.videos[].mlogExtVO`    | `MlogExtVO`          | 否   | -                            |
| `data.videos[].status`       | `number`             | 否   | -                            |
| `data.videos[].shareUrl`     | `string`             | 否   | 资源访问链接                 |

<!-- api-doc:response:end -->
