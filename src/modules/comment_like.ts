import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  type: QueryNumberLike;

  cid: QueryIdentifier;
  t: 0 | 1 | '0' | '1';
  threadId?: string;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  type: QueryNumber,
  cid: Identifier,
  t: Schema.Literals([0, 1, '0', '1']),
  threadId: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 接口就是为了确认点赞/取消点赞评论成功：正文只带返回码 `code`，收紧。
// 正方向（点赞）在录制设备上被上游风控拒绝（code 250），成功正文只有反向（取消点赞）的证据。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const commentLike: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const action = Number(query.t) === 1 ? 'like' : 'unlike';
    const resourceType = resolveResourceType(query.type);
    const data: Record<string, unknown> = {
      threadId: `${resourceType}${String(query.id)}`,
      commentId: query.cid,
    };
    if (resourceType === 'A_EV_2_') {
      data.threadId = query.threadId;
    }
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/comment/${action}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('comment_like', ModuleBody, response),
    };
  });

/**
 * 点赞与取消点赞评论
 */
export default commentLike;
