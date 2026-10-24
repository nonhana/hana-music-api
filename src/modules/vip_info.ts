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

// 通到 VIP 信息的路径 `data` 收紧；会员权益对象是附带信息，字段全部宽松。
const VipRight = UpstreamObject({
  dynamicIconUrl: Loose(Schema.String),
  expireTime: Loose(Schema.Finite),
  iconUrl: Loose(Schema.String),
  isSign: Loose(Schema.Boolean),
  isSignDeduct: Loose(Schema.Boolean),
  isSignIap: Loose(Schema.Boolean),
  isSignIapDeduct: Loose(Schema.Boolean),
  vipCode: Loose(Schema.Finite),
  vipLevel: Loose(Schema.Finite),
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      associator: Loose(VipRight),
      familyVip: Loose(VipRight),
      musicPackage: Loose(VipRight),
      redVipAnnualCount: Loose(Schema.Finite),
      redVipLevel: Loose(Schema.Finite),
      redVipLevelIcon: Loose(Schema.String),
      redplus: Loose(VipRight),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const vipInfo: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/music-vip-membership/front/vip/info`,
        {
          userId: query.uid || '',
        },
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('vip_info', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取 VIP 信息
 */
export default vipInfo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
