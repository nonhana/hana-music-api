import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  Artist,
  DjProgram,
  LooseSong,
  LooseSongPrivilege,
  PlaylistUser,
  ProgramDj,
  ProgramMainSong,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Title = UpstreamObject({
  title: Loose(Schema.String),
  titleId: Loose(Schema.String),
  titleType: Loose(Schema.String),
  titleDesc: Loose(Schema.String),
  titleImgUrl: Loose(Schema.String),
  serialNum: Loose(Schema.String),
  canShowTitleLogo: Loose(Schema.Boolean),
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
});

const Image = UpstreamObject({
  imageUrl: Loose(Schema.String),
  purePicture: Loose(Schema.Boolean),
  actionType: Loose(Schema.String),
});

const Button = UpstreamObject({
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  text: Loose(Schema.String),
  iconUrl: Loose(Schema.String),
});

const SectionUiElement = UpstreamObject({
  mainTitle: Loose(Title),
  subTitle: Loose(Title),
  button: Loose(Button),
  rcmdShowType: Loose(Schema.String),
  canRefresh: Loose(Schema.Boolean),
});

const ResourceUiElement = UpstreamObject({
  ...SectionUiElement.schema.fields,
  image: Loose(Image),
  labelTexts: Loose(Schema.Array(Schema.String)),
  labelType: Loose(Schema.String),
  labelColor: Loose(Schema.String),
  labelBgColor: Loose(Schema.String),
  labelBorderColor: Loose(Schema.String),
  description: Loose(Schema.String),
});

const PlayParams = UpstreamObject({
  playerType: Loose(Schema.String),
  resourceIds: Loose(Schema.Array(Schema.String)),
  showUI: Loose(Schema.Boolean),
});

const CommentSimpleData = UpstreamObject({
  content: Loose(Schema.String),
  commentId: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
});

// 推荐流里嵌着的电台摘要：比节目详情里的 `radio` 多 `whiteList`、`hightQuality`，只声明出现过的字段。
const Radio = UpstreamObject({
  buyed: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  composeVideo: Loose(Schema.Boolean),
  createTime: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  dynamic: Loose(Schema.Boolean),
  feeScope: Loose(Schema.Finite),
  finished: Loose(Schema.Boolean),
  hightQuality: Loose(Schema.Boolean),
  id: Loose(Schema.Finite),
  intervenePicId: Loose(Schema.Finite),
  intervenePicUrl: Loose(Schema.String),
  lastProgramCreateTime: Loose(Schema.Finite),
  lastProgramId: Loose(Schema.Finite),
  name: Loose(Schema.String),
  originalPrice: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  price: Loose(Schema.Finite),
  privacy: Loose(Schema.Boolean),
  programCount: Loose(Schema.Finite),
  purchaseCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  secondCategory: Loose(Schema.String),
  secondCategoryId: Loose(Schema.Finite),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
  taskId: Loose(Schema.Finite),
  underShelf: Loose(Schema.Boolean),
  whiteList: Loose(Schema.Boolean),
});

// 推荐流里嵌着的电台节目：复用 `DjProgram` 的字段，补上个人电台和推荐流独有的键；节目编号宽松。
const ResourceProgram = UpstreamObject({
  ...DjProgram.schema.fields,
  id: Loose(Schema.Finite),
  dj: Loose(ProgramDj),
  radio: Loose(Radio),
  userId: Loose(Schema.Finite),
  adjustedPlayCount: Loose(Schema.Finite),
  publish: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  disPlayStatus: Loose(Schema.String),
  secondCategory: Loose(Schema.String),
  shortName: Loose(Schema.String),
  updateTime: Loose(Schema.Finite),
});

// 资源附加信息随 resourceType 变化，按出现过的键声明成宽松字段；全空的键没有声明。
const ResourceExtInfo = UpstreamObject({
  hasListened: Loose(Schema.Boolean),
  highQuality: Loose(Schema.Boolean),
  playCount: Loose(Schema.Finite),
  specialType: Loose(Schema.Finite),
  specialCover: Loose(Schema.Finite),
  alias: Loose(Schema.String),
  artists: Loose(Schema.Array(Artist)),
  song: Loose(LooseSong),
  songData: Loose(ProgramMainSong),
  songDatas: Loose(Schema.Array(ProgramMainSong)),
  songPrivilege: Loose(LooseSongPrivilege),
  djProgram: Loose(ResourceProgram),
  commentSimpleData: Loose(CommentSimpleData),
  user: Loose(PlaylistUser),
  users: Loose(Schema.Array(PlaylistUser)),
  threadId: Loose(Schema.String),
  eventId: Loose(Schema.String),
  eventType: Loose(Schema.String),
  eventMsg: Loose(Schema.String),
  startTime: Loose(Schema.Finite),
  endTime: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
  canSubscribe: Loose(Schema.Boolean),
  voiceRelatedSongName: Loose(Schema.String),
  voiceRelatedSongNames: Loose(Schema.Array(Schema.String)),
  voiceRelatedSongSize: Loose(Schema.Finite),
});

const Resource = UpstreamObject({
  uiElement: Loose(ResourceUiElement),
  resourceType: Loose(Schema.String),
  resourceId: Loose(Schema.String),
  resourceUrl: Loose(Schema.String),
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  alg: Loose(Schema.String),
  logInfo: Loose(Schema.String),
  ctrp: Loose(Schema.String),
  likedCount: Loose(Schema.Finite),
  replyCount: Loose(Schema.Finite),
  position: Loose(Schema.Finite),
  valid: Loose(Schema.Boolean),
  playParams: Loose(PlayParams),
  resourceExtInfo: Loose(ResourceExtInfo),
});

const Creative = UpstreamObject({
  creativeType: Loose(Schema.String),
  creativeId: Loose(Schema.String),
  creativeExtInfoVO: Loose(UpstreamObject({})),
  code: Loose(Schema.String),
  algReason: Loose(Schema.String),
  position: Loose(Schema.Finite),
  resources: Loose(Schema.Array(Resource)),
  uiElement: Loose(ResourceUiElement),
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  alg: Loose(Schema.String),
});

// 例如 banner 这类 block 用 `extInfo` 承载内容、没有 `creatives`，所以这条路径可以没有。
const Block = UpstreamObject({
  blockCode: Schema.String,
  showType: Loose(Schema.String),
  creatives: Optional(Schema.Array(Creative)),
  uiElement: Loose(SectionUiElement),
  canClose: Loose(Schema.Boolean),
  canFeedback: Loose(Schema.Boolean),
  blockDemote: Loose(Schema.Boolean),
  blockStyle: Loose(Schema.Finite),
  dislikeShowType: Loose(Schema.Finite),
  sort: Loose(Schema.Finite),
  resourceIdList: Loose(Schema.Array(Schema.String)),
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  alg: Loose(Schema.String),
  logInfo: Loose(Schema.String),
});

const PageConfig = UpstreamObject({
  refreshToast: Loose(Schema.String),
  nodataToast: Loose(Schema.String),
  refreshInterval: Loose(Schema.Finite),
  fullscreen: Loose(Schema.Boolean),
  abtest: Loose(Schema.Array(Schema.String)),
  homepageMode: Loose(Schema.String),
  orderInfo: Loose(Schema.String),
  showModeEntry: Loose(Schema.Boolean),
  songLabelMarkLimit: Loose(Schema.Finite),
  songLabelMarkPriority: Loose(Schema.Array(Schema.String)),
});

const BlockData = UpstreamObject({
  blocks: Schema.Array(Block),
  cursor: Loose(Schema.String),
  hasMore: Loose(Schema.Boolean),
  demote: Loose(Schema.Boolean),
  exposedResource: Loose(Schema.String),
  pageConfig: Loose(PageConfig),
  guideToast: Loose(UpstreamObject({ hasGuideToast: Loose(Schema.Boolean) })),
});

// 通到首页 block 列表的路径 `data`、`data.blocks` 和每个 block 自己的编号 `blockCode` 收紧；
// 例如 banner 这类 block 用 `extInfo` 承载内容、没有 `creatives`，按可以没有处理。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: BlockData,
    message: Loose(Schema.String),
    trp: Loose(UpstreamObject({ rules: Loose(Schema.Array(Schema.String)) })),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const homepageBlockPage: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = { refresh: query.refresh || false, cursor: query.cursor };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/homepage/block/page`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'homepage_block_page',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 首页-发现 block page
 * 这个接口为移动端接口，首页-发现页，数据结构可以参考 https://github.com/hcanyz/flutter-netease-music-api/blob/master/lib/src/api/uncategorized/bean.dart#L259 HomeBlockPageWrap
 * query.refresh 是否刷新数据
 */
export default homepageBlockPage;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
