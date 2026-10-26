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

// 返回码收紧；`data` 是设置成功后的展示提示（录制里是字符串“将展示7天”），`message` 是附带
// 提示，都宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(Schema.String),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userSocialStatusEdit: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/social/user/status/edit`,
        {
          content: JSON.stringify({
            type: query.type,
            iconUrl: query.iconUrl,
            content: query.content,
            actionUrl: query.actionUrl,
          }),
        },
        createOption(query),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'user_social_status_edit',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 用户状态 - 编辑
 */
export default userSocialStatusEdit;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
