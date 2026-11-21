---
title: '歌曲相关视频'
description: '： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。'
---

# 歌曲相关视频

： 可以调用此接口获取歌曲相关视频 (区别于 MV)， 有些歌曲没有 MV 但是有用户上传的与此歌曲相关的 Mlog。 此功能仅在 网易云音乐 APP 上存在。

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                      |
| ---------- | ------------------------------------------------------- |
| 接口地址   | `/mlog/music/rcmd`                                      |
| 请求方式   | `GET` / `POST`                                          |
| 需要登录   | 否                                                      |
| 对应模块   | `mlog_music_rcmd`                                       |
| SDK 函数   | `mlogMusicRcmd`（`hana-music-api/api/mlog_music_rcmd`） |
| 返回体类型 | `MlogMusicRcmdBody`（已建模返回体）                     |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mlogMusicRcmd } from 'hana-music-api';

const result = await mlogMusicRcmd({
  songid: 347230,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mlog/music/rcmd' \
  --data-urlencode 'songid=347230'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型               | 必填 | 默认值 | 说明                                             |
| -------- | ------------------ | ---- | ------ | ------------------------------------------------ |
| `songid` | `number \| string` | 是   | -      | 歌曲 ID                                          |
| `mvid`   | `number \| string` | 否   | -      | 如果定义，此 mvid 对应的 MV 将会作为第一个返回。 |
| `limit`  | `number`           | 否   | `10`   | 取出的 Mlog 数量，不包含第一个 mvid              |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MlogMusicRcmdBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mlog_music_rcmd`、`hana-music-api/schemas/mlog_music_rcmd` 导入运行时校验器）。

```ts
type MlogImage = {
  height?: number | null;
  imageUrl?: string | null;
  picKey?: string | null;
  width?: number | null;
};

type MlogCoverDetail = {
  horizontalCoverImage?: MlogImage | null;
  verticalCoverImage?: MlogImage | null;
};

type MlogMixInfo = {
  status?: number | null;
};

type MlogUrlInfo = {
  id?: string | null;
  r?: number | null;
  resolution?: number | null;
  size?: number | null;
  validityTime?: number | null;
};

type MlogVideo = {
  coverDetail?: MlogCoverDetail | null;
  coverUrl?: string | null;
  duration?: number | null;
  frameImage?: MlogImage | null;
  frameUrl?: string | null;
  height?: number | null;
  rcmdUrlInfo?: MlogUrlInfo | null;
  urlInfo?: MlogUrlInfo | null;
  urlInfos?: Array<MlogUrlInfo> | null;
  videoKey?: string | null;
  width?: number | null;
};

type MlogBaseData = {
  coverColor?: number | null;
  coverDetail?: MlogCoverDetail | null;
  coverHeight?: number | null;
  coverPicKey?: string | null;
  coverUrl?: string | null;
  coverWidth?: number | null;
  desc?: string | null;
  duration?: number | null;
  greatCover?: boolean | null;
  id?: string | null;
  mixInfo?: MlogMixInfo | null;
  originalTitle?: string | null;
  pubTime?: number | null;
  text?: string | null;
  threadId?: string | null;
  type?: number | null;
  userId?: number | null;
  video?: MlogVideo | null;
};

type MlogExtVo = {
  canCollect?: boolean | null;
  commentCount?: number | null;
  liked?: boolean | null;
  likedCount?: number | null;
  playCount?: number | null;
  shareCount?: number | null;
  song?: MlogSong | null;
};

type MlogUserProfile = {
  avatarDetail?: AvatarDetail | null;
  avatarUrl?: string | null;
  followed?: boolean | null;
  isAnchor?: boolean | null;
  nickname?: string | null;
  userId?: number | null;
  userType?: number | null;
};

type MlogResource = {
  mlogBaseData?: MlogBaseData | null;
  mlogExtVO?: MlogExtVo | null;
  shareUrl?: string | null;
  source?: number | null;
  status?: number | null;
  userProfile?: MlogUserProfile | null;
};

type MlogFeed = {
  id: string;
  matchField?: number | null;
  resource?: MlogResource | null;
  sameCity?: boolean | null;
  type?: number | null;
};

type MlogMusicRcmdBody = {
  code: 200;
  data: {
    feeds: Array<MlogFeed>;
    more?: boolean | null;
  };
  message?: string | null;
};
```

- **公共类型**：[AvatarDetail](/api/shared-types#avatardetail)、[MlogSong](/api/shared-types#mlogsong)

| 字段                      | 类型              | 必填 | 说明                         |
| ------------------------- | ----------------- | ---- | ---------------------------- |
| `code`                    | `200`             | 是   | 业务状态码（`200` 表示成功） |
| `data`                    | `object`          | 是   | 接口返回的数据主体           |
| `data.feeds`              | `Array<MlogFeed>` | 是   | -                            |
| `data.feeds[].id`         | `string`          | 是   | 记录 ID                      |
| `data.feeds[].matchField` | `number`          | 否   | -                            |
| `data.feeds[].resource`   | `MlogResource`    | 否   | -                            |
| `data.feeds[].sameCity`   | `boolean`         | 否   | -                            |
| `data.feeds[].type`       | `number`          | 否   | -                            |
| `data.more`               | `boolean`         | 否   | 是否还有更多数据             |
| `message`                 | `string`          | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->

## 注意事项

- **结果相关性**：在关联 Mlog 之后，接口偶尔会附带不相关的推荐视频，建议按需截断处理。
