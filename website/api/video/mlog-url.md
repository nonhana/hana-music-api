---
title: '获取 mlog 播放地址'
description: '调用此接口，传入 mlog id，可获取 mlog 播放地址'
---

<!-- cSpell:ignore OVPTWKS -->

# 获取 mlog 播放地址

调用此接口，传入 mlog id，可获取 mlog 播放地址

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                         |
| ---------- | ------------------------------------------ |
| 接口地址   | `/mlog/url`                                |
| 请求方式   | `GET` / `POST`                             |
| 需要登录   | 否                                         |
| 对应模块   | `mlog_url`                                 |
| SDK 函数   | `mlogUrl`（`hana-music-api/api/mlog_url`） |
| 返回体类型 | `MlogUrlBody`（已建模返回体）              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { mlogUrl } from 'hana-music-api';

const result = await mlogUrl({
  id: 'a1qOVPTWKS1ZrK8',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/mlog/url' \
  --data-urlencode 'id=a1qOVPTWKS1ZrK8'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型     | 必填 | 默认值 | 说明                |
| ----- | -------- | ---- | ------ | ------------------- |
| `id`  | `string` | 是   | -      | mlog id             |
| `res` | `number` | 否   | `1080` | 分辨率，默认为 1080 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`MlogUrlBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/mlog_url`、`hana-music-api/schemas/mlog_url` 导入运行时校验器）。

```ts
type MlogLikeGuide = {
  afterViewSeconds?: number | null;
  hasGuide?: boolean | null;
};

type MlogOperate = {
  disShowCollectReason?: string | null;
  hasBiubiuComments?: boolean | null;
  playMode?: number | null;
  showCollect?: boolean | null;
  showMvTag?: boolean | null;
};

type MlogContentSong = Omit<
  MlogSong,
  'endTime' | 'isLiked' | 'privilege' | 'startTime'
> & {
  endTime?: number | null;
  isLiked?: boolean | null;
  privilege?: LooseSongPrivilege | null;
  startTime?: number | null;
};

type MlogCoverImage = {
  height?: number | null;
  imageUrl?: string | null;
  nosKey?: string | null;
  picKey?: string | null;
  width?: number | null;
};

type MlogCoverDetail = {
  horizontalCoverImage?: MlogCoverImage | null;
  verticalCoverImage?: MlogCoverImage | null;
};

type MlogUrlInfo = {
  id?: string | null;
  r?: number | null;
  resolution?: number | null;
  size?: number | null;
  url?: string | null;
  validityTime?: number | null;
};

type MlogPlaybackUrlInfo = Omit<MlogUrlInfo, 'url'> & {
  url: string;
};

type MlogVideoAreaInfo = {
  leftTopX?: number | null;
  leftTopY?: number | null;
  rightBottomX?: number | null;
  rightBottomY?: number | null;
};

type MlogVideo = {
  coverDetail?: MlogCoverDetail | null;
  coverImage?: MlogCoverImage | null;
  coverImageTime?: number | null;
  coverUrl?: string | null;
  duration?: number | null;
  frameImage?: MlogCoverImage | null;
  frameUrl?: string | null;
  height?: number | null;
  nosKey?: string | null;
  playCount?: number | null;
  r?: number | null;
  rcmdUrlInfo?: MlogUrlInfo | null;
  size?: number | null;
  urlInfo: MlogPlaybackUrlInfo;
  urlInfos?: Array<MlogUrlInfo> | null;
  videoAreaInfo?: MlogVideoAreaInfo | null;
  videoKey?: string | null;
  width?: number | null;
};

type MlogContent = {
  containAiContent?: boolean | null;
  coverColor?: number | null;
  coverExt?: string | null;
  creationEntranceDesc?: string | null;
  creationTagType?: number | null;
  eventId?: number | null;
  eventPinned?: boolean | null;
  interveneText?: string | null;
  privacySetting?: number | null;
  realateSongs?: Array<MlogContentSong> | null;
  relateSongs?: Array<MlogContentSong> | null;
  song?: MlogContentSong | null;
  songs?: Array<MlogContentSong> | null;
  text?: string | null;
  title?: string | null;
  video: MlogVideo;
  videoId?: string | null;
};

type MlogIpLocation = {
  location?: string | null;
};

type MlogProfile = {
  avatarDetail?: AvatarDetail | null;
  avatarUrl?: string | null;
  followed?: boolean | null;
  isAnchor?: boolean | null;
  nickname?: string | null;
  userId?: number | null;
  userType?: number | null;
};

type MlogResource = {
  id: string;
  audioStatus?: number | null;
  canShare?: boolean | null;
  commentCount?: number | null;
  content: MlogContent;
  ipLocation?: MlogIpLocation | null;
  liked?: boolean | null;
  likedCount?: number | null;
  maxCommentShowNum?: number | null;
  priorShowLive?: boolean | null;
  profile?: MlogProfile | null;
  pubTime?: number | null;
  shareCount?: number | null;
  shareUrl?: string | null;
  source?: string | null;
  status?: number | null;
  subed?: boolean | null;
  threadId?: string | null;
  type?: number | null;
  userId?: number | null;
};

type MlogUrlBody = {
  code: 200;
  data: {
    id: string;
    likeGuide?: MlogLikeGuide | null;
    operate?: MlogOperate | null;
    recmdType?: number | null;
    resource: MlogResource;
    squareFeedType?: number | null;
    type?: string | null;
  };
  message?: string | null;
};
```

- **公共类型**：[AvatarDetail](/api/shared-types#avatardetail)、[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[MlogSong](/api/shared-types#mlogsong)

| 字段                                | 类型            | 必填 | 说明                         |
| ----------------------------------- | --------------- | ---- | ---------------------------- |
| `code`                              | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`                              | `object`        | 是   | 接口返回的数据主体           |
| `data.id`                           | `string`        | 是   | 记录 ID                      |
| `data.likeGuide`                    | `MlogLikeGuide` | 否   | -                            |
| `data.likeGuide.afterViewSeconds`   | `number`        | 否   | -                            |
| `data.likeGuide.hasGuide`           | `boolean`       | 否   | -                            |
| `data.operate`                      | `MlogOperate`   | 否   | -                            |
| `data.operate.disShowCollectReason` | `string`        | 否   | -                            |
| `data.operate.hasBiubiuComments`    | `boolean`       | 否   | -                            |
| `data.operate.playMode`             | `number`        | 否   | -                            |
| `data.operate.showCollect`          | `boolean`       | 否   | -                            |
| `data.operate.showMvTag`            | `boolean`       | 否   | -                            |
| `data.recmdType`                    | `number`        | 否   | -                            |
| `data.resource`                     | `MlogResource`  | 是   | -                            |
| `data.squareFeedType`               | `number`        | 否   | -                            |
| `data.type`                         | `string`        | 否   | -                            |
| `message`                           | `string`        | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
