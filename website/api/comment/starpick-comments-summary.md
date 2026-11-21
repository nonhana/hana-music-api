---
title: '云村星评馆 - 简要评论'
description: '调用此接口可以获取首页推荐的星评馆评论信息'
---

<!-- cSpell:ignore nodata -->

# 云村星评馆 - 简要评论

调用此接口可以获取首页推荐的星评馆评论信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| 接口地址   | `/starpick/comments/summary`                                                |
| 请求方式   | `GET` / `POST`                                                              |
| 需要登录   | 否                                                                          |
| 对应模块   | `starpick_comments_summary`                                                 |
| SDK 函数   | `starpickCommentsSummary`（`hana-music-api/api/starpick_comments_summary`） |
| 返回体类型 | `StarpickCommentsSummaryBody`（已建模返回体）                               |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { starpickCommentsSummary } from 'hana-music-api';

const result = await starpickCommentsSummary();
console.log(result.body);
```

### HTTP

```bash
curl 'http://127.0.0.1:3021/starpick/comments/summary'
```

<!-- api-doc:params:start -->

## 请求参数

无业务参数。

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`StarpickCommentsSummaryBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/starpick_comments_summary`、`hana-music-api/schemas/starpick_comments_summary` 导入运行时校验器）。

```ts
type SongData = Omit<ProgramMainSong, 'hrMusic' | 'sqMusic'> & {
  hrMusic?: ProgramQuality | null;
  sqMusic?: ProgramQuality | null;
};

type ResourceExtInfo = {
  hasListened?: boolean | null;
  highQuality?: boolean | null;
  playCount?: number | null;
  songData?: SongData | null;
  specialType?: number | null;
  threadId?: string | null;
  users?: Array<PlaylistUser> | null;
};

type Title = {
  canShowTitleLogo?: boolean | null;
  serialNum?: string | null;
  title?: string | null;
  titleDesc?: string | null;
};

type Button = {
  action?: string | null;
  actionType?: string | null;
  text?: string | null;
};

type SectionUiElement = {
  mainTitle?: Title | null;
  subTitle?: Title | null;
  button?: Button | null;
  rcmdShowType?: string | null;
};

type Image = {
  imageUrl?: string | null;
  purePicture?: boolean | null;
};

type ResourceUiElement = Omit<SectionUiElement, 'image' | 'labelTexts'> & {
  image?: Image | null;
  labelTexts?: Array<string> | null;
};

type Resource = {
  action?: string | null;
  actionType?: string | null;
  alg?: string | null;
  likedCount?: number | null;
  logInfo?: string | null;
  replyCount?: number | null;
  resourceExtInfo?: ResourceExtInfo | null;
  resourceId?: string | null;
  resourceType?: string | null;
  uiElement?: ResourceUiElement | null;
  valid?: boolean | null;
};

type Creative = {
  action?: string | null;
  actionType?: string | null;
  alg?: string | null;
  algReason?: string | null;
  creativeId?: string | null;
  creativeType?: string | null;
  logInfo?: string | null;
  position?: number | null;
  resources?: Array<Resource> | null;
  uiElement?: ResourceUiElement | null;
};

type CrossPlatformConfig = {
  containerType?: string | null;
  rnContent?: {
    component?: string | null;
    engineId?: string | null;
    estimatedHeight?: number | null;
    estimatedRatio?: string | null;
    moduleName?: string | null;
  } | null;
};

type Block = {
  blockCode: string;
  action?: string | null;
  actionType?: string | null;
  blockDemote?: boolean | null;
  blockStyle?: number | null;
  canClose?: boolean | null;
  canFeedback?: boolean | null;
  creatives?: Array<Creative> | null;
  crossPlatformConfig?: CrossPlatformConfig | null;
  dislikeShowType?: number | null;
  showType?: string | null;
  sort?: number | null;
  uiElement?: SectionUiElement | null;
};

type GuideToast = {
  hasGuideToast?: boolean | null;
};

type PageConfig = {
  abtest?: Array<string> | null;
  fullscreen?: boolean | null;
  homepageMode?: string | null;
  nodataToast?: string | null;
  orderInfo?: string | null;
  refreshInterval?: number | null;
  refreshToast?: string | null;
  showModeEntry?: boolean | null;
  songLabelMarkLimit?: number | null;
  songLabelMarkPriority?: Array<string> | null;
};

type BlockData = {
  blocks: Array<Block>;
  demote?: boolean | null;
  exposedResource?: string | null;
  guideToast?: GuideToast | null;
  hasMore?: boolean | null;
  pageConfig?: PageConfig | null;
};

type StarpickCommentsSummaryBody = {
  code: 200;
  data: BlockData;
  message?: string | null;
};
```

- **公共类型**：[PlaylistUser](/api/shared-types#playlistuser)、[ProgramMainSong](/api/shared-types#programmainsong)、[ProgramQuality](/api/shared-types#programquality)

| 字段                                    | 类型            | 必填 | 说明                         |
| --------------------------------------- | --------------- | ---- | ---------------------------- |
| `code`                                  | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`                                  | `BlockData`     | 是   | 接口返回的数据主体           |
| `data.blocks`                           | `Array<Block>`  | 是   | 首页发现模块列表             |
| `data.demote`                           | `boolean`       | 否   | -                            |
| `data.exposedResource`                  | `string`        | 否   | -                            |
| `data.guideToast`                       | `GuideToast`    | 否   | -                            |
| `data.guideToast.hasGuideToast`         | `boolean`       | 否   | -                            |
| `data.hasMore`                          | `boolean`       | 否   | 是否还有更多数据             |
| `data.pageConfig`                       | `PageConfig`    | 否   | -                            |
| `data.pageConfig.abtest`                | `Array<string>` | 否   | -                            |
| `data.pageConfig.fullscreen`            | `boolean`       | 否   | -                            |
| `data.pageConfig.homepageMode`          | `string`        | 否   | -                            |
| `data.pageConfig.nodataToast`           | `string`        | 否   | -                            |
| `data.pageConfig.orderInfo`             | `string`        | 否   | -                            |
| `data.pageConfig.refreshInterval`       | `number`        | 否   | -                            |
| `data.pageConfig.refreshToast`          | `string`        | 否   | -                            |
| `data.pageConfig.showModeEntry`         | `boolean`       | 否   | -                            |
| `data.pageConfig.songLabelMarkLimit`    | `number`        | 否   | -                            |
| `data.pageConfig.songLabelMarkPriority` | `Array<string>` | 否   | -                            |
| `message`                               | `string`        | 否   | 返回说明信息                 |

<!-- api-doc:response:end -->
