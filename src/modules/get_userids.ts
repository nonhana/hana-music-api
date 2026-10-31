import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码和昵称到 user id 的映射 `nicknames` 收紧；没有匹配的昵称时映射是空对象。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    nicknames: Schema.Record(Schema.String, Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const getUserids: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      nicknames: query.nicknames,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/user/getUserIds`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('get_userids', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default getUserids;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
