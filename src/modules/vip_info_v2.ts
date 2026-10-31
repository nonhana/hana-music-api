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

const VipRight = UpstreamObject({
  expireTime: Loose(Schema.Finite),
  isSign: Loose(Schema.Boolean),
  isSignDeduct: Loose(Schema.Boolean),
  isSignIap: Loose(Schema.Boolean),
  isSignIapDeduct: Loose(Schema.Boolean),
  vipCode: Loose(Schema.Finite),
  vipLevel: Loose(Schema.Finite),
});

// 通到 VIP 信息的路径 `data` 收紧；会员权益对象是附带信息，字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      albumVip: Loose(VipRight),
      associator: Loose(VipRight),
      musicPackage: Loose(VipRight),
      now: Loose(Schema.Finite),
      oldCacheProtocol: Loose(Schema.Boolean),
      redVipAnnualCount: Loose(Schema.Finite),
      redVipLevel: Loose(Schema.Finite),
      redplus: Loose(VipRight),
      relationOtherUserId: Loose(Schema.Finite),
      relationOtherUserRedVipExpireTime: Loose(Schema.Finite),
      relationType: Loose(Schema.Finite),
      userId: Loose(Schema.Finite),
      voiceBookVip: Loose(VipRight),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const vipInfoV2: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/music-vip-membership/client/vip/info`,
        {
          userId: query.uid || '',
        },
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('vip_info_v2', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取 VIP 信息
 */
export default vipInfoV2;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
