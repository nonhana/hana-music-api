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

// 接口就是为了确认收藏/取消收藏成功：正文顶层的返回码 `code` 收紧；`data` 是操作结果标志、
// `message` 是提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(Schema.Boolean),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const broadcastSub: ModuleEffect<ModuleInput, ModuleBody> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    query.t = Number(query.t) === 1 ? 'false' : 'true';
    const data = {
      contentType: 'BROADCAST',
      contentId: query.id,
      cancelCollect: query.t,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/content/interact/collect`,
        data,
        createOption(query),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('broadcast_sub', ModuleBody, response),
    };
  });

/**
 * 广播电台 - 收藏/取消收藏电台
 */
export default broadcastSub;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
