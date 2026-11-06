import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
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

const Binding = UpstreamObject({
  id: Schema.Finite,
  bindingTime: Loose(Schema.Finite),
  expired: Loose(Schema.Boolean),
  expiresIn: Loose(Schema.Finite),
  refreshTime: Loose(Schema.Finite),
  tokenJsonStr: Loose(Schema.String),
  type: Loose(Schema.Finite),
  url: Loose(Schema.String),
  userId: Loose(Schema.Finite),
});

// 返回码、绑定列表 `bindings` 和每条绑定自己的 `id` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    bindings: Schema.Array(Binding),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userBinding: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.uid !== undefined &&
      query.uid !== null &&
      typeof query.uid !== 'string' &&
      typeof query.uid !== 'number' &&
      typeof query.uid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'uid must be a primitive value',
      });
    }
    const data = {};
    const result = yield* request(
      buildApiRequestIntent(
        `/api/v1/user/bindings/${String(query.uid)}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_binding', ModuleBody, result),
    };
  });

export default userBinding;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
