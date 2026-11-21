---
title: '电台 - 详情'
description: '登录后调用此接口，传入`rid`，可获得对应电台的详情介绍'
---

# 电台 - 详情

登录后调用此接口，传入`rid`，可获得对应电台的详情介绍

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                           |
| ---------- | -------------------------------------------- |
| 接口地址   | `/dj/detail`                                 |
| 请求方式   | `GET` / `POST`                               |
| 需要登录   | 是                                           |
| 对应模块   | `dj_detail`                                  |
| SDK 函数   | `djDetail`（`hana-music-api/api/dj_detail`） |
| 返回体类型 | `DjDetailBody`（已建模返回体）               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { djDetail } from 'hana-music-api';

const result = await djDetail(
  {
    rid: '336355127',
  },
  { cookie: 'MUSIC_U=your-cookie' },
);
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/dj/detail' \
  -H 'Cookie: MUSIC_U=your-cookie' \
  --data-urlencode 'rid=336355127'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数  | 类型               | 必填 | 默认值 | 说明       |
| ----- | ------------------ | ---- | ------ | ---------- |
| `rid` | `number \| string` | 是   | -      | 电台 的 id |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`DjDetailBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/dj_detail`、`hana-music-api/schemas/dj_detail` 导入运行时校验器）。

```ts
type CommentData = {
  commentId?: number | null;
  content?: string | null;
  programId?: number | null;
  programName?: string | null;
  userProfile?: PlaylistUser | null;
};

type RadioDj = Omit<PlaylistUser, 'canReward' | 'rewardCount'> & {
  canReward?: boolean | null;
  rewardCount?: number | null;
};

type FeeModuleDetailItem = {
  content?: string | null;
  id?: number | null;
  type?: number | null;
};

type FeeModuleDetail = {
  detail?: Array<FeeModuleDetailItem> | null;
  title?: string | null;
  type?: number | null;
};

type LegacyQuality = {
  bitrate?: number | null;
  dfsId?: number | null;
  extension?: string | null;
  id?: number | null;
  playTime?: number | null;
  size?: number | null;
  sr?: number | null;
  volumeDelta?: number | null;
};

type LegacySong = {
  album?: SimpleAlbum | null;
  artists?: Array<Artist> | null;
  bMusic?: LegacyQuality | null;
  commentThreadId?: string | null;
  copyFrom?: string | null;
  copyright?: number | null;
  copyrightId?: number | null;
  dayPlays?: number | null;
  disc?: string | null;
  duration?: number | null;
  fee?: number | null;
  ftype?: number | null;
  hMusic?: LegacyQuality | null;
  hearTime?: number | null;
  id?: number | null;
  lMusic?: LegacyQuality | null;
  mMusic?: LegacyQuality | null;
  mark?: number | null;
  mvid?: number | null;
  name?: string | null;
  no?: number | null;
  playedNum?: number | null;
  position?: number | null;
  popularity?: number | null;
  publishTime?: number | null;
  ringtone?: string | null;
  rtype?: number | null;
  score?: number | null;
  starred?: boolean | null;
  starredNum?: number | null;
  status?: number | null;
};

type Program = {
  auditDisPlayStatus?: number | null;
  auditStatus?: number | null;
  bdAuditStatus?: number | null;
  blurCoverUrl?: string | null;
  buyed?: boolean | null;
  buyedNew?: boolean | null;
  canReward?: boolean | null;
  categoryId?: number | null;
  channels?: Array<string> | null;
  code?: number | null;
  commentCount?: number | null;
  commentThreadId?: string | null;
  coverId?: number | null;
  coverUrl?: string | null;
  createEventId?: number | null;
  createTime?: number | null;
  description?: string | null;
  dj?: ProgramDj | null;
  duration?: number | null;
  existLyric?: boolean | null;
  feeScope?: number | null;
  id?: number | null;
  isPublish?: boolean | null;
  likedCount?: number | null;
  listenerCount?: number | null;
  mainSong?: LegacySong | null;
  mainTrackId?: number | null;
  name?: string | null;
  privacy?: boolean | null;
  programFeeType?: number | null;
  pubStatus?: number | null;
  recommended?: boolean | null;
  replaceVoiceId?: number | null;
  reward?: boolean | null;
  scheduledPublishTime?: number | null;
  score?: number | null;
  secondCategoryId?: number | null;
  serialNum?: number | null;
  shareCount?: number | null;
  smallLanguageAuditStatus?: number | null;
  specialType?: number | null;
  subscribedCount?: number | null;
  trackCount?: number | null;
};

type FeeModule = {
  data?: FeeModuleDetail | Array<Program> | null;
  type?: number | null;
};

type FeeInfo = {
  buyed?: boolean | null;
  finished?: boolean | null;
  modules?: Array<FeeModule> | null;
  originalPrice?: number | null;
  price?: number | null;
  purchaseCount?: number | null;
  slogan?: string | null;
  undershelf?: boolean | null;
  videos?: Record<string, UnknownJson> | null;
};

type RadioIcon = {
  color?: string | null;
  type?: string | null;
  value?: string | null;
};

type RadioDetail = {
  id: number;
  category?: string | null;
  categoryId?: number | null;
  commentCount?: number | null;
  commentDatas?: Array<CommentData> | null;
  createTime?: number | null;
  desc?: string | null;
  detailRcmdTabOrpheus?: string | null;
  disableShare?: boolean | null;
  dj?: RadioDj | null;
  dynamic?: boolean | null;
  feeInfo?: FeeInfo | null;
  feeScope?: number | null;
  icon?: RadioIcon | null;
  lastProgramCreateTime?: number | null;
  lastProgramId?: number | null;
  likedCount?: number | null;
  name?: string | null;
  original?: boolean | null;
  picId?: number | null;
  picUrl?: string | null;
  playCount?: number | null;
  privacy?: boolean | null;
  programCount?: number | null;
  radioFeeType?: number | null;
  rcmdText?: string | null;
  secondCategory?: string | null;
  secondCategoryId?: number | null;
  shareCount?: number | null;
  subCount?: number | null;
  subed?: boolean | null;
};

type DjDetailBody = {
  code: 200;
  data: RadioDetail;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)、[PlaylistUser](/api/shared-types#playlistuser)、[ProgramDj](/api/shared-types#programdj)、[SimpleAlbum](/api/shared-types#simplealbum)

| 字段   | 类型          | 必填 | 说明                         |
| ------ | ------------- | ---- | ---------------------------- |
| `code` | `200`         | 是   | 业务状态码（`200` 表示成功） |
| `data` | `RadioDetail` | 是   | 接口返回的数据主体           |

<!-- api-doc:response:end -->
