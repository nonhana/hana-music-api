---
title: '首页-发现'
description: '调用此接口，可获取 APP 首页信息'
---

<!-- cSpell:ignore nodata -->

# 首页-发现

调用此接口，可获取 APP 首页信息

<!-- api-doc:meta:start -->

## 接口信息

| 项目       | 值                                                              |
| ---------- | --------------------------------------------------------------- |
| 接口地址   | `/homepage/block/page`                                          |
| 请求方式   | `GET` / `POST`                                                  |
| 需要登录   | 否                                                              |
| 对应模块   | `homepage_block_page`                                           |
| SDK 函数   | `homepageBlockPage`（`hana-music-api/api/homepage_block_page`） |
| 返回体类型 | `HomepageBlockPageBody`（已建模返回体）                         |

<!-- api-doc:meta:end -->

## 调用示例

### SDK

```ts
import { homepageBlockPage } from 'hana-music-api';

const result = await homepageBlockPage({
  cursor: 'example',
});
console.log(result.body);
```

### HTTP

```bash
curl --get 'http://127.0.0.1:3021/homepage/block/page' \
  --data-urlencode 'cursor=example'
```

<!-- api-doc:params:start -->

## 请求参数

| 参数      | 类型      | 必填 | 默认值  | 说明                       |
| --------- | --------- | ---- | ------- | -------------------------- |
| `cursor`  | `string`  | 否   | -       | 上一条数据返回的 cursor    |
| `refresh` | `boolean` | 否   | `false` | 是否刷新数据，默认为 false |

<!-- api-doc:params:end -->

<!-- api-doc:response:start -->

## 返回值

返回体类型：`HomepageBlockPageBody`（可从 `hana-music-api` 导入类型，或从 `hana-music-api/api/homepage_block_page`、`hana-music-api/schemas/homepage_block_page` 导入运行时校验器）。

```ts
type Title = {
  title?: string | null;
  titleId?: string | null;
  titleType?: string | null;
  titleDesc?: string | null;
  titleImgUrl?: string | null;
  serialNum?: string | null;
  canShowTitleLogo?: boolean | null;
  action?: string | null;
  actionType?: string | null;
};

type Button = {
  action?: string | null;
  actionType?: string | null;
  text?: string | null;
  iconUrl?: string | null;
};

type SectionUiElement = {
  mainTitle?: Title | null;
  subTitle?: Title | null;
  button?: Button | null;
  rcmdShowType?: string | null;
  canRefresh?: boolean | null;
};

type Image = {
  imageUrl?: string | null;
  purePicture?: boolean | null;
  actionType?: string | null;
};

type ResourceUiElement = Omit<
  SectionUiElement,
  | 'image'
  | 'labelTexts'
  | 'labelType'
  | 'labelColor'
  | 'labelBgColor'
  | 'labelBorderColor'
  | 'description'
> & {
  image?: Image | null;
  labelTexts?: Array<string> | null;
  labelType?: string | null;
  labelColor?: string | null;
  labelBgColor?: string | null;
  labelBorderColor?: string | null;
  description?: string | null;
};

type PlayParams = {
  playerType?: string | null;
  resourceIds?: Array<string> | null;
  showUI?: boolean | null;
};

type Radio = {
  buyed?: boolean | null;
  category?: string | null;
  categoryId?: number | null;
  composeVideo?: boolean | null;
  createTime?: number | null;
  desc?: string | null;
  dynamic?: boolean | null;
  feeScope?: number | null;
  finished?: boolean | null;
  hightQuality?: boolean | null;
  id?: number | null;
  intervenePicId?: number | null;
  intervenePicUrl?: string | null;
  lastProgramCreateTime?: number | null;
  lastProgramId?: number | null;
  name?: string | null;
  originalPrice?: number | null;
  picId?: number | null;
  picUrl?: string | null;
  playCount?: number | null;
  price?: number | null;
  privacy?: boolean | null;
  programCount?: number | null;
  purchaseCount?: number | null;
  radioFeeType?: number | null;
  secondCategory?: string | null;
  secondCategoryId?: number | null;
  subCount?: number | null;
  subed?: boolean | null;
  taskId?: number | null;
  underShelf?: boolean | null;
  whiteList?: boolean | null;
};

type ResourceProgram = Omit<
  DjProgram,
  | 'id'
  | 'dj'
  | 'radio'
  | 'userId'
  | 'adjustedPlayCount'
  | 'publish'
  | 'category'
  | 'disPlayStatus'
  | 'secondCategory'
  | 'shortName'
  | 'updateTime'
> & {
  id?: number | null;
  dj?: ProgramDj | null;
  radio?: Radio | null;
  userId?: number | null;
  adjustedPlayCount?: number | null;
  publish?: boolean | null;
  category?: string | null;
  disPlayStatus?: string | null;
  secondCategory?: string | null;
  shortName?: string | null;
  updateTime?: number | null;
};

type CommentSimpleData = {
  content?: string | null;
  commentId?: number | null;
  userId?: number | null;
};

type ResourceExtInfo = {
  hasListened?: boolean | null;
  highQuality?: boolean | null;
  playCount?: number | null;
  specialType?: number | null;
  specialCover?: number | null;
  alias?: string | null;
  artists?: Array<Artist> | null;
  song?: LooseSong | null;
  songData?: ProgramMainSong | null;
  songDatas?: Array<ProgramMainSong> | null;
  songPrivilege?: LooseSongPrivilege | null;
  djProgram?: ResourceProgram | null;
  commentSimpleData?: CommentSimpleData | null;
  user?: PlaylistUser | null;
  users?: Array<PlaylistUser> | null;
  threadId?: string | null;
  eventId?: string | null;
  eventType?: string | null;
  eventMsg?: string | null;
  startTime?: number | null;
  endTime?: number | null;
  subed?: boolean | null;
  canSubscribe?: boolean | null;
  voiceRelatedSongName?: string | null;
  voiceRelatedSongNames?: Array<string> | null;
  voiceRelatedSongSize?: number | null;
};

type Resource = {
  uiElement?: ResourceUiElement | null;
  resourceType?: string | null;
  resourceId?: string | null;
  resourceUrl?: string | null;
  action?: string | null;
  actionType?: string | null;
  alg?: string | null;
  logInfo?: string | null;
  ctrp?: string | null;
  likedCount?: number | null;
  replyCount?: number | null;
  position?: number | null;
  valid?: boolean | null;
  playParams?: PlayParams | null;
  resourceExtInfo?: ResourceExtInfo | null;
};

type Creative = {
  creativeType?: string | null;
  creativeId?: string | null;
  creativeExtInfoVO?: Record<string, UnknownJson> | null;
  code?: string | null;
  algReason?: string | null;
  position?: number | null;
  resources?: Array<Resource> | null;
  uiElement?: ResourceUiElement | null;
  action?: string | null;
  actionType?: string | null;
  alg?: string | null;
};

type Block = {
  blockCode: string;
  showType?: string | null;
  creatives?: Array<Creative> | null;
  uiElement?: SectionUiElement | null;
  canClose?: boolean | null;
  canFeedback?: boolean | null;
  blockDemote?: boolean | null;
  blockStyle?: number | null;
  dislikeShowType?: number | null;
  sort?: number | null;
  resourceIdList?: Array<string> | null;
  action?: string | null;
  actionType?: string | null;
  alg?: string | null;
  logInfo?: string | null;
};

type PageConfig = {
  refreshToast?: string | null;
  nodataToast?: string | null;
  refreshInterval?: number | null;
  fullscreen?: boolean | null;
  abtest?: Array<string> | null;
  homepageMode?: string | null;
  orderInfo?: string | null;
  showModeEntry?: boolean | null;
  songLabelMarkLimit?: number | null;
  songLabelMarkPriority?: Array<string> | null;
};

type BlockData = {
  blocks: Array<Block>;
  cursor?: string | null;
  hasMore?: boolean | null;
  demote?: boolean | null;
  exposedResource?: string | null;
  pageConfig?: PageConfig | null;
  guideToast?: {
    hasGuideToast?: boolean | null;
  } | null;
};

type HomepageBlockPageBody = {
  code: 200;
  data: BlockData;
  message?: string | null;
  trp?: {
    rules?: Array<string> | null;
  } | null;
};
```

- **公共类型**：[Artist](/api/shared-types#artist)、[DjProgram](/api/shared-types#djprogram)、[LooseSong](/api/shared-types#loosesong)、[LooseSongPrivilege](/api/shared-types#loosesongprivilege)、[PlaylistUser](/api/shared-types#playlistuser)、[ProgramDj](/api/shared-types#programdj)、[ProgramMainSong](/api/shared-types#programmainsong)

| 字段                                    | 类型            | 必填 | 说明                         |
| --------------------------------------- | --------------- | ---- | ---------------------------- |
| `code`                                  | `200`           | 是   | 业务状态码（`200` 表示成功） |
| `data`                                  | `BlockData`     | 是   | 接口返回的数据主体           |
| `data.blocks`                           | `Array<Block>`  | 是   | 首页发现模块列表             |
| `data.cursor`                           | `string`        | 否   | 下一页分页游标               |
| `data.hasMore`                          | `boolean`       | 否   | 是否还有更多数据             |
| `data.demote`                           | `boolean`       | 否   | -                            |
| `data.exposedResource`                  | `string`        | 否   | -                            |
| `data.pageConfig`                       | `PageConfig`    | 否   | -                            |
| `data.pageConfig.refreshToast`          | `string`        | 否   | -                            |
| `data.pageConfig.nodataToast`           | `string`        | 否   | -                            |
| `data.pageConfig.refreshInterval`       | `number`        | 否   | -                            |
| `data.pageConfig.fullscreen`            | `boolean`       | 否   | -                            |
| `data.pageConfig.abtest`                | `Array<string>` | 否   | -                            |
| `data.pageConfig.homepageMode`          | `string`        | 否   | -                            |
| `data.pageConfig.orderInfo`             | `string`        | 否   | -                            |
| `data.pageConfig.showModeEntry`         | `boolean`       | 否   | -                            |
| `data.pageConfig.songLabelMarkLimit`    | `number`        | 否   | -                            |
| `data.pageConfig.songLabelMarkPriority` | `Array<string>` | 否   | -                            |
| `data.guideToast`                       | `object`        | 否   | -                            |
| `data.guideToast.hasGuideToast`         | `boolean`       | 否   | -                            |
| `message`                               | `string`        | 否   | 返回说明信息                 |
| `trp`                                   | `object`        | 否   | -                            |
| `trp.rules`                             | `Array<string>` | 否   | -                            |

<!-- api-doc:response:end -->
