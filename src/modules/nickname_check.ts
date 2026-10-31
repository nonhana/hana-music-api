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
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码和昵称是否重复的 `duplicated` 收紧；`candidateNicknames` 只在昵称重复时提供，按“可以没有”处理。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    duplicated: Schema.Boolean,
    candidateNicknames: Optional(Schema.Array(Schema.String)),
    nickname: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const nicknameCheck: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      nickname: query.nickname,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/nickname/duplicated`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'nickname_check',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default nicknameCheck;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
