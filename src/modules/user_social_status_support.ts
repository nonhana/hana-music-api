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

const SupportStatus = UpstreamObject({
  type: Schema.String,
  iconUrl: Loose(Schema.String),
  content: Loose(Schema.String),
  actionUrl: Loose(Schema.String),
  vistorUrl: Loose(Schema.String),
  canEdit: Loose(Schema.Boolean),
  desc: Loose(Schema.String),
});

// 返回码、可设置状态列表 data 和每条状态的 type 收紧；列表就是接口要返回的东西，图标、文案和跳转地址宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SupportStatus),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userSocialStatusSupport: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/social/user/status/support`,
        {},
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'user_social_status_support',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户状态 - 支持设置的状态
 */
export default userSocialStatusSupport;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
