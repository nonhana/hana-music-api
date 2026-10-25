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
import { UserProfile } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const VipRightEntry = UpstreamObject({
  iconUrl: Loose(Schema.String),
  rights: Loose(Schema.Boolean),
  vipCode: Loose(Schema.Finite),
});

const VipRights = UpstreamObject({
  associator: Loose(VipRightEntry),
  musicPackage: Loose(VipRightEntry),
  redplus: Loose(VipRightEntry),
  redVipAnnualCount: Loose(Schema.Finite),
  redVipLevel: Loose(Schema.Finite),
});

const Fan = UpstreamObject({
  userProfile: UserProfile,
  vipRights: Loose(VipRights),
});

// 通到粉丝列表的路径 `data` 和粉丝自己的编号 `userProfile.userId` 收紧；没有粉丝时 `data` 是 null。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: Optional(Schema.Array(Fan)),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistFans: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/fans/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('artist_fans', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手粉丝
 */
export default artistFans;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
