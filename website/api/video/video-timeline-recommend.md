---
title: '获取推荐视频'
description: '调用此接口，可获取推荐视频，分页参数只能传入 offset'
---

# 获取推荐视频

调用此接口，可获取推荐视频，分页参数只能传入 offset

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| 接口地址   | `/video/timeline/recommend`                                               |
| 请求方式   | `GET` / `POST`                                                            |
| 需要登录   | 否                                                                        |
| 对应模块   | `video_timeline_recommend`                                                |
| SDK 函数   | `videoTimelineRecommend`（`hana-music-api/api/video_timeline_recommend`） |
| 返回体类型 | `VideoTimelineRecommendBody`（已建模返回体）                              |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { videoTimelineRecommend } from 'hana-music-api';

const result = await videoTimelineRecommend({
  offset: 10,
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/video/timeline/recommend' \
  --data-urlencode 'offset=10'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数     | 类型     | 必填 | 默认值 | 说明   |
| -------- | -------- | ---- | ------ | ------ |
| `offset` | `number` | 否   | `0`    | 默认 0 |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`VideoTimelineRecommendBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/video_timeline_recommend`、`hana-music-api/schemas/video_timeline_recommend` 导入运行时校验器）。

```ts
type VideoPlayback = {
  id?: string | null;
  needPay?: boolean | null;
  r?: number | null;
  size?: number | null;
  url?: string | null;
  validityTime?: number | null;
};

type TimelineVideo = {
  vid: string;
  alg?: string | null;
  commentCount?: number | null;
  coverUrl?: string | null;
  creator?: PlaylistUser | null;
  description?: string | null;
  durationms?: number | null;
  hasRelatedGameAd?: boolean | null;
  height?: number | null;
  markTypes?: Array<number> | null;
  playTime?: number | null;
  praised?: boolean | null;
  praisedCount?: number | null;
  previewDurationms?: number | null;
  relateSong?: Array<LooseSong> | null;
  resolutions?: Array<VideoResolutionEntry> | null;
  scm?: string | null;
  shareCount?: number | null;
  subscribed?: boolean | null;
  threadId?: string | null;
  title?: string | null;
  urlInfo?: VideoPlayback | null;
  videoGroup?: Array<VideoGroupRef> | null;
  width?: number | null;
};

type TimelineEntry = {
  alg?: string | null;
  data: TimelineVideo;
  displayed?: boolean | null;
  type?: number | null;
};

type VideoTimelineRecommendBody = {
  code: 200;
  datas: Array<TimelineEntry>;
  hasmore?: boolean | null;
  msg?: string | null;
};
```

- **公共类型**：[LooseSong](/api/shared-types#loosesong)、[PlaylistUser](/api/shared-types#playlistuser)、[VideoGroupRef](/api/shared-types#videogroupref)、[VideoResolutionEntry](/api/shared-types#videoresolutionentry)

| 字段                | 类型                   | 必填 | 说明                         |
| ------------------- | ---------------------- | ---- | ---------------------------- |
| `code`              | `200`                  | 是   | 业务状态码（`200` 表示成功） |
| `datas`             | `Array<TimelineEntry>` | 是   | -                            |
| `datas[].alg`       | `string`               | 否   | 推荐算法标识                 |
| `datas[].data`      | `TimelineVideo`        | 是   | 接口返回的数据主体           |
| `datas[].displayed` | `boolean`              | 否   | -                            |
| `datas[].type`      | `number`               | 否   | -                            |
| `hasmore`           | `boolean`              | 否   | -                            |
| `msg`               | `string`               | 否   | 提示信息                     |

<!-- api-doc:response:end -->
