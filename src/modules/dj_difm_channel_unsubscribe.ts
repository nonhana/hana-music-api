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

// 接口就是为了确认取消收藏频道成功：正文顶层返回码 `code` 收紧；`message` 是附带提示，宽松
// （`data` 在已收藏和重复取消的录制里都只有空对象，内部字段没有证据，未声明并原样保留）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djDifmChannelUnsubscribe: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/dj/difm/channel/unsubscribe`,
        data,
        createOption(query),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'dj_difm_channel_unsubscribe',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * DIFM电台 - 取消收藏频道
 */
export default djDifmChannelUnsubscribe;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
