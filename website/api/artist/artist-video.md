---
title: '获取歌手视频'
description: '调用此接口，传入歌手 id，可获得歌手视频'
---

# 获取歌手视频

调用此接口，传入歌手 id，可获得歌手视频

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                 |
| ---------- | -------------------------------------------------- |
| 接口地址   | `/artist/video`                                    |
| 请求方式   | `GET` / `POST`                                     |
| 需要登录   | 否                                                 |
| 对应模块   | `artist_video`                                     |
| SDK 函数   | `artistVideo`（`hana-music-api/api/artist_video`） |
| 返回体类型 | `ArtistVideoBody`（已建模返回体）                  |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { artistVideo } from 'hana-music-api';

const result = await artistVideo({
  id: '2116',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/artist/video' \
  --data-urlencode 'id=2116'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                                                           |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------------ |
| `cursor` | `number`           | 否   | `0`    | 返回数据的 cursor，默认为 0，传入上一次返回结果的 cursor，将会返回下一页的数据 |
| `id`     | `number \| string` | 是   | -      | 歌手 id                                                                        |
| `order`  | `number`           | 否   | `0`    | 排序方法，0 表示按时间排序，1 表示按热度排序，默认为 0                         |
| `size`   | `number`           | 否   | `10`   | 返回数量，默认为 10                                                            |

| `order` | 排序方式           |
| ------- | ------------------ |
| `0`     | 按时间排序（默认） |
| `1`     | 按热度排序         |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`ArtistVideoBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/artist_video`、`hana-music-api/schemas/artist_video` 导入运行时校验器）。

```ts
type VideoPage = {
  cursor?: string | null;
  more?: boolean | null;
  size?: number | null;
};

type MlogTagSign = {
  br?: number | null;
  tagSign?: string | null;
  type?: string | null;
};

type MlogVideo = {
  check?: boolean | null;
  container?: string | null;
  duration?: number | null;
  height?: number | null;
  md5?: string | null;
  size?: number | null;
  tag?: string | null;
  tagSign?: MlogTagSign | null;
  url?: string | null;
  width?: number | null;
};

type MlogBaseData = {
  coverColor?: number | null;
  coverHeight?: number | null;
  coverPicKey?: string | null;
  coverUrl?: string | null;
  coverWidth?: number | null;
  desc?: string | null;
  duration?: number | null;
  greatCover?: boolean | null;
  id?: string | null;
  pubTime?: number | null;
  text?: string | null;
  threadId?: string | null;
  type?: number | null;
  videos?: Array<MlogVideo> | null;
};

type MlogUser = {
  avatarDetail?: AvatarDetail | null;
  avatarUrl?: string | null;
  followed?: boolean | null;
  nickname?: string | null;
  userId?: number | null;
  userType?: number | null;
};

type MlogArtist = {
  followed?: boolean | null;
  id?: number | null;
  img1v1Url?: string | null;
  mlogUser?: MlogUser | null;
  name?: string | null;
};

type MlogExtVo = {
  artistName?: string | null;
  artists?: Array<MlogArtist> | null;
  canCollect?: boolean | null;
  collectReason?: string | null;
  commentCount?: number | null;
  liked?: boolean | null;
  likedCount?: number | null;
  playCount?: number | null;
  shareCount?: number | null;
  song?: MlogSong | null;
};

type MlogResource = {
  mlogBaseData?: MlogBaseData | null;
  mlogExtVO?: MlogExtVo | null;
  shareUrl?: string | null;
  status?: number | null;
};

type VideoRecord = {
  id: string;
  matchField?: number | null;
  resource?: MlogResource | null;
  sameCity?: boolean | null;
  type?: number | null;
};

type ArtistVideoBody = {
  code: 200;
  message?: string | null;
  data: {
    page?: VideoPage | null;
    records: Array<VideoRecord>;
  };
};
```

- **公共类型**：[AvatarDetail](/api/shared-types#avatardetail)、[MlogSong](/api/shared-types#mlogsong)

| 字段                        | 类型                 | 必填 | 说明                         |
| --------------------------- | -------------------- | ---- | ---------------------------- |
| `code`                      | `200`                | 是   | 业务状态码（`200` 表示成功） |
| `message`                   | `string`             | 否   | 返回说明信息                 |
| `data`                      | `object`             | 是   | 接口返回的数据主体           |
| `data.page`                 | `VideoPage`          | 否   | -                            |
| `data.page.cursor`          | `string`             | 否   | 下一页分页游标               |
| `data.page.more`            | `boolean`            | 否   | 是否还有更多数据             |
| `data.page.size`            | `number`             | 否   | -                            |
| `data.records`              | `Array<VideoRecord>` | 是   | 记录列表                     |
| `data.records[].id`         | `string`             | 是   | 记录 ID                      |
| `data.records[].matchField` | `number`             | 否   | -                            |
| `data.records[].resource`   | `MlogResource`       | 否   | -                            |
| `data.records[].sameCity`   | `boolean`            | 否   | -                            |
| `data.records[].type`       | `number`             | 否   | -                            |

<!-- api-doc:response:end -->
