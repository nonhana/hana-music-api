import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { UserProfile, VipRights } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

export const moduleActions = {
  read: {
    target: '/api/artist/fans/get',
    profile: 'weapiPc',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const artistFans: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildActionRequestIntent('read', moduleActions.read, data),
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
