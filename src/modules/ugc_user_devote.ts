import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码、贡献计数的路径 `data` 和记录自己的编号 `data.userId` 收紧；贡献条目、积分和云贝数是附带计数，字段全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      userId: Schema.Finite,
      cloudShell: Loose(Schema.Finite),
      integration: Loose(Schema.Finite),
      ugcCount: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/rep/ugc/user/devote',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const ugcUserDevote: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (_query, request) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'ugc_user_devote',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户贡献条目、积分、云贝数量
 */
export default ugcUserDevote;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
