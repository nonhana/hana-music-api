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

const GrowthDetail = UpstreamObject({
  resourceId: Loose(Schema.Finite),
  descript: Loose(Schema.String),
  growthPoint: Loose(Schema.Finite),
  time: Loose(Schema.Finite),
});

// 返回码、领取记录页的路径 `data` 和记录列表 `data.details` 收紧；记录里的资源编号、描述、成长值和时间是宽松字段。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      details: Schema.Array(GrowthDetail),
      hasMore: Loose(Schema.Boolean),
      maxTaskScore: Loose(Schema.Finite),
      scoreDuration: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const vipGrowthpointDetails: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/vipnewcenter/app/level/growth/details`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'vip_growthpoint_details',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 会员成长值领取记录
 */
export default vipGrowthpointDetails;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
