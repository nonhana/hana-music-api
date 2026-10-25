import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { ProgramDj, ProgramMainSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 推荐电台条目里的电台摘要：比节目记录里的 `radio` 多 `whiteList`、`hightQuality`，少简介图文。
const Radio = UpstreamObject({
  buyed: Loose(Schema.Boolean),
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  composeVideo: Loose(Schema.Boolean),
  createTime: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  feeScope: Loose(Schema.Finite),
  finished: Loose(Schema.Boolean),
  hightQuality: Loose(Schema.Boolean),
  id: Loose(Schema.Finite),
  lastProgramCreateTime: Loose(Schema.Finite),
  lastProgramId: Loose(Schema.Finite),
  name: Loose(Schema.String),
  originalPrice: Loose(Schema.Finite),
  picId: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  price: Loose(Schema.Finite),
  programCount: Loose(Schema.Finite),
  purchaseCount: Loose(Schema.Finite),
  radioFeeType: Loose(Schema.Finite),
  rcmdText: Loose(Schema.String),
  subCount: Loose(Schema.Finite),
  subed: Loose(Schema.Boolean),
  underShelf: Loose(Schema.Boolean),
  whiteList: Loose(Schema.Boolean),
});

// 推荐电台条目里嵌着的节目：比 `DjProgram` 多 `publish`、`subscribed`、`userId` 等个人电台字段。
const RecommendedProgram = UpstreamObject({
  adjustedPlayCount: Loose(Schema.Finite),
  auditStatus: Loose(Schema.Finite),
  bdAuditStatus: Loose(Schema.Finite),
  blurCoverUrl: Loose(Schema.String),
  buyed: Loose(Schema.Boolean),
  canReward: Loose(Schema.Boolean),
  channels: Loose(Schema.Array(Schema.String)),
  commentCount: Loose(Schema.Finite),
  commentThreadId: Loose(Schema.String),
  coverId: Loose(Schema.Finite),
  coverUrl: Loose(Schema.String),
  createTime: Loose(Schema.Finite),
  description: Loose(Schema.String),
  dj: Loose(ProgramDj),
  duration: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  isPublish: Loose(Schema.Boolean),
  likedCount: Loose(Schema.Finite),
  listenerCount: Loose(Schema.Finite),
  mainSong: Loose(ProgramMainSong),
  mainTrackId: Loose(Schema.Finite),
  name: Loose(Schema.String),
  programFeeType: Loose(Schema.Finite),
  pubStatus: Loose(Schema.Finite),
  publish: Loose(Schema.Boolean),
  radio: Loose(Radio),
  reward: Loose(Schema.Boolean),
  serialNum: Loose(Schema.Finite),
  shareCount: Loose(Schema.Finite),
  subscribed: Loose(Schema.Boolean),
  subscribedCount: Loose(Schema.Finite),
  trackCount: Loose(Schema.Finite),
  userId: Loose(Schema.Finite),
});

const RecommendItem = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  canDislike: Loose(Schema.Boolean),
  copywriter: Loose(Schema.String),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  program: Loose(RecommendedProgram),
  type: Loose(Schema.Finite),
});

// 通到推荐电台的路径 `result` 和条目自己的编号 `result[].id` 收紧；节目、电台摘要和其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(RecommendItem),
    category: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const personalizedDjprogram: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/personalized/djprogram`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'personalized_djprogram',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 推荐电台
 */
export default personalizedDjprogram;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
