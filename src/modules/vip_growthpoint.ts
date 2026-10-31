import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const UserLevel = UpstreamObject({
  userId: Schema.Finite,
  growthPoint: Schema.Finite,
  expireTime: Loose(Schema.Finite),
  extJson: Loose(Schema.String),
  latestVipStatus: Loose(Schema.Finite),
  latestVipType: Loose(Schema.Finite),
  level: Loose(Schema.Finite),
  levelName: Loose(Schema.String),
  maxLevel: Loose(Schema.Boolean),
  normal: Loose(Schema.Boolean),
  vipType: Loose(Schema.Finite),
  yesterdayPoint: Loose(Schema.Finite),
});

const LevelCard = UpstreamObject({
  accountPageIconImgUrl: Loose(Schema.String),
  backgroundImageUrl: Loose(Schema.String),
  blurryBackgroundImageUrl: Loose(Schema.String),
  flashIconImgUrl: Loose(Schema.String),
  level: Loose(Schema.Finite),
  levelBackgroundCardExpireImageUrl: Loose(Schema.String),
  levelBackgroundCardImageUrl: Loose(Schema.String),
  levelMarkExpireImageUrl: Loose(Schema.String),
  levelMarkImageUrl: Loose(Schema.String),
  levelName: Loose(Schema.String),
  newUpgradeFireworksImageUrl: Loose(Schema.String),
  obtainLimitType: Loose(Schema.Finite),
  privilegeIconUrl: Loose(Schema.String),
  privilegeName: Loose(Schema.String),
  privilegeSubTitle: Loose(Schema.String),
  redVipBuckleImageUrl: Loose(Schema.String),
  redVipExpireBuckleImageUrl: Loose(Schema.String),
  redVipExpireImageUrl: Loose(Schema.String),
  redVipExpireWholeImageUrl: Loose(Schema.String),
  redVipImageUrl: Loose(Schema.String),
  redVipWholeImageUrl: Loose(Schema.String),
  resourceId: Loose(Schema.Finite),
  rightId: Loose(Schema.Finite),
  upgradeFireworksImageUrl: Loose(Schema.String),
  vipGiftRightBarImageUrl: Loose(Schema.String),
  vipLevelPageCardImgUrl: Loose(Schema.String),
  vipLevelPageExpireCardImgUrl: Loose(Schema.String),
});

// 返回码、成长值页的路径 `data`、当前用户记录 `data.userLevel` 及其 `userId` 和 `growthPoint` 收紧；等级卡是附带展示信息，字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      levelCard: Loose(LevelCard),
      userLevel: UserLevel,
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const vipGrowthpoint: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/vipnewcenter/app/level/growhpoint/basic`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'vip_growthpoint',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 会员成长值
 */
export default vipGrowthpoint;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
