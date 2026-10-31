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
  PlaylistUser,
  ProgramMainSong,
  ProgramQuality,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Title = UpstreamObject({
  canShowTitleLogo: Loose(Schema.Boolean),
  serialNum: Loose(Schema.String),
  title: Loose(Schema.String),
  titleDesc: Loose(Schema.String),
});

const Image = UpstreamObject({
  imageUrl: Loose(Schema.String),
  purePicture: Loose(Schema.Boolean),
});

const Button = UpstreamObject({
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  text: Loose(Schema.String),
});

const SectionUiElement = UpstreamObject({
  mainTitle: Loose(Title),
  subTitle: Loose(Title),
  button: Loose(Button),
  rcmdShowType: Loose(Schema.String),
});

const ResourceUiElement = UpstreamObject({
  ...SectionUiElement.schema.fields,
  image: Loose(Image),
  labelTexts: Loose(Schema.Array(Schema.String)),
});

// 首页资源里的 songData 是旧版歌曲结构，`ProgramMainSong` 之外还带 `sqMusic`/`hrMusic` 两档音质。
const SongData = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  hrMusic: Loose(ProgramQuality),
  sqMusic: Loose(ProgramQuality),
});

const ResourceExtInfo = UpstreamObject({
  hasListened: Loose(Schema.Boolean),
  highQuality: Loose(Schema.Boolean),
  playCount: Loose(Schema.Finite),
  songData: Loose(SongData),
  specialType: Loose(Schema.Finite),
  threadId: Loose(Schema.String),
  users: Loose(Schema.Array(PlaylistUser)),
});

const Resource = UpstreamObject({
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  alg: Loose(Schema.String),
  likedCount: Loose(Schema.Finite),
  logInfo: Loose(Schema.String),
  replyCount: Loose(Schema.Finite),
  resourceExtInfo: Loose(ResourceExtInfo),
  resourceId: Loose(Schema.String),
  resourceType: Loose(Schema.String),
  uiElement: Loose(ResourceUiElement),
  valid: Loose(Schema.Boolean),
});

const Creative = UpstreamObject({
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  alg: Loose(Schema.String),
  algReason: Loose(Schema.String),
  creativeId: Loose(Schema.String),
  creativeType: Loose(Schema.String),
  logInfo: Loose(Schema.String),
  position: Loose(Schema.Finite),
  resources: Loose(Schema.Array(Resource)),
  uiElement: Loose(ResourceUiElement),
});

const CrossPlatformConfig = UpstreamObject({
  containerType: Loose(Schema.String),
  rnContent: Loose(
    UpstreamObject({
      component: Loose(Schema.String),
      engineId: Loose(Schema.String),
      estimatedHeight: Loose(Schema.Finite),
      estimatedRatio: Loose(Schema.String),
      moduleName: Loose(Schema.String),
    }),
  ),
});

const Block = UpstreamObject({
  blockCode: Schema.String,
  action: Loose(Schema.String),
  actionType: Loose(Schema.String),
  blockDemote: Loose(Schema.Boolean),
  blockStyle: Loose(Schema.Finite),
  canClose: Loose(Schema.Boolean),
  canFeedback: Loose(Schema.Boolean),
  creatives: Optional(Schema.Array(Creative)),
  crossPlatformConfig: Loose(CrossPlatformConfig),
  dislikeShowType: Loose(Schema.Finite),
  showType: Loose(Schema.String),
  sort: Loose(Schema.Finite),
  uiElement: Loose(SectionUiElement),
});

const PageConfig = UpstreamObject({
  abtest: Loose(Schema.Array(Schema.String)),
  fullscreen: Loose(Schema.Boolean),
  homepageMode: Loose(Schema.String),
  nodataToast: Loose(Schema.String),
  orderInfo: Loose(Schema.String),
  refreshInterval: Loose(Schema.Finite),
  refreshToast: Loose(Schema.String),
  showModeEntry: Loose(Schema.Boolean),
  songLabelMarkLimit: Loose(Schema.Finite),
  songLabelMarkPriority: Loose(Schema.Array(Schema.String)),
});

const GuideToast = UpstreamObject({
  hasGuideToast: Loose(Schema.Boolean),
});

const BlockData = UpstreamObject({
  blocks: Schema.Array(Block),
  demote: Loose(Schema.Boolean),
  exposedResource: Loose(Schema.String),
  guideToast: Loose(GuideToast),
  hasMore: Loose(Schema.Boolean),
  pageConfig: Loose(PageConfig),
});

// 返回码、首页 block 列表的路径 `data.blocks` 和每个 block 自己的编号 `blockCode` 收紧；
// 星评评论在 `creatives[].resources[]` 里；block 的 `extInfo` 未声明、原样保留，其余展示字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: BlockData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const starpickCommentsSummary: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      cursor: JSON.stringify({
        offset: 0,
        blockCodeOrderList: ['HOMEPAGE_BLOCK_NEW_HOT_COMMENT'],
        refresh: true,
      }),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/homepage/block/page`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'starpick_comments_summary',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 云村星评馆 - 简要评论列表
 */
export default starpickCommentsSummary;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
