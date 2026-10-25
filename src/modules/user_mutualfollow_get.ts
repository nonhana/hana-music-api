import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到互相关注结果的路径 `data` 收紧；接口就是为了拿这个布尔值，未登录时上游同样返回 false。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Boolean,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userMutualfollowGet: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      friendid: query.uid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/user/mutualfollow/get`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'user_mutualfollow_get',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户是否互相关注
 */
export default userMutualfollowGet;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
