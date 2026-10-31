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
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const MedalResource = UpstreamObject({
  actionTitle: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  desUrl: Loose(Schema.String),
  resId: Loose(Schema.String),
  resStatus: Loose(Schema.Finite),
  resourceTip: Loose(Schema.String),
  resourceType: Loose(Schema.String),
  subTitle: Loose(Schema.String),
  title: Loose(Schema.String),
});

const MedalWearPic = UpstreamObject({
  height: Loose(Schema.Finite),
  url: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const Medal = UpstreamObject({
  medalCode: Schema.String,
  acceptCondition: Loose(Schema.String),
  artistName: Loose(Schema.String),
  backgroundLight: Loose(Schema.String),
  bizSceneId: Loose(Schema.String),
  canAcceptTimeEnd: Loose(Schema.Finite),
  canAcceptTimeStart: Loose(Schema.Finite),
  canWear: Loose(Schema.Boolean),
  centerBasePicUrl: Loose(Schema.String),
  descriptionText: Loose(Schema.String),
  entranceShowPicUrl: Loose(Schema.String),
  high: Loose(Schema.Finite),
  homeTable: Loose(Schema.String),
  levelTitle: Loose(Schema.String),
  levelTitleShort: Loose(Schema.String),
  lightImage: Loose(Schema.String),
  linearGradientBottomColor: Loose(Schema.String),
  linearGradientTopColor: Loose(Schema.String),
  low: Loose(Schema.Finite),
  medalLevel: Loose(Schema.Finite),
  medalLevelAll: Loose(Schema.Finite),
  medalName: Loose(Schema.String),
  medalPicText: Loose(Schema.String),
  medalPicUrl: Loose(Schema.String),
  newStyle: Loose(Schema.Boolean),
  obtainTime: Loose(Schema.Finite),
  particleImage: Loose(Schema.String),
  progress: Loose(Schema.String),
  progressSort: Loose(Schema.Finite),
  rankText: Loose(Schema.String),
  resource: Loose(MedalResource),
  sceneIds: Loose(Schema.Array(Schema.Finite)),
  shineEffect: Loose(Schema.Boolean),
  shouldNotice: Loose(Schema.Boolean),
  showAfterAcceptTimeIfNotObtain: Loose(Schema.Boolean),
  showProgress: Loose(Schema.Boolean),
  showWillObtain: Loose(Schema.Boolean),
  sideBarGuideText: Loose(Schema.String),
  skipLevel: Loose(Schema.Boolean),
  specialMedalType: Loose(Schema.String),
  status: Loose(Schema.String),
  timeAcceptMedal: Loose(Schema.Boolean),
  tips: Loose(Schema.String),
  wear: Loose(Schema.Boolean),
  wearPic: Loose(Schema.String),
  wearPicDto: Loose(MedalWearPic),
  wearPicV2: Loose(Schema.String),
});

// 分类块和子分组里套着的徽章是嵌套记录，编号也宽松。
const LooseMedal = UpstreamObject({
  ...Medal.schema.fields,
  medalCode: Loose(Schema.String),
});

const NextPage = UpstreamObject({
  hasMore: Loose(Schema.Boolean),
  pageSize: Loose(Schema.Finite),
});

const MedalSubGroup = UpstreamObject({
  medals: Schema.Array(LooseMedal),
  hasMore: Loose(Schema.Boolean),
  nextPage: Loose(NextPage),
  obtainedTotal: Loose(Schema.Finite),
  subGroupCode: Loose(Schema.String),
  subGroupId: Loose(Schema.String),
  subGroupTitle: Loose(Schema.String),
  total: Loose(Schema.Finite),
});

const MedalBlock = UpstreamObject({
  categoryCode: Loose(Schema.String),
  categoryId: Loose(Schema.String),
  categoryTitle: Loose(Schema.String),
  desc: Loose(Schema.String),
  medalVOS: Schema.Array(LooseMedal),
  subGroups: Optional(Schema.Array(MedalSubGroup)),
});

const MedalPage = UpstreamObject({
  obtainMedals: Schema.Array(Medal),
  categoryMedalBlockVos: Schema.Array(MedalBlock),
  avatar: Loose(Schema.String),
  canManageWear: Loose(Schema.Boolean),
  medalNum: Loose(Schema.Finite),
  newPageUIAb: Loose(Schema.Boolean),
  nickName: Loose(Schema.String),
  rankingPer: Loose(Schema.Finite),
  showGuide: Loose(Schema.Boolean),
  useMedalTabs: Loose(Schema.Boolean),
});

// 返回码、徽章页的路径 `data`、`obtainMedals` 及每条徽章自己的 `medalCode`、分类块 `categoryMedalBlockVos` 及其 `medalVOS`/`subGroups[].medals` 数组收紧；`subGroups` 可以没有；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: MedalPage,
    message: Loose(Schema.String),
    trp: Loose(
      UpstreamObject({
        rules: Loose(Schema.Array(Schema.String)),
      }),
    ),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userMedal: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        `/api/medal/user/page`,
        {
          uid: query.uid,
        },
        createOption(query),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_medal', ModuleBody, result),
    };
  });

/**
 * 用户徽章
 */
export default userMedal;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
