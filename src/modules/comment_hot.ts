import { Effect, Schema } from 'effect';

import { resolveResourceType } from '../core/comment-thread.ts';
import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { CommentRecord } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: { prefix: '/api/v1/resource/hotcomments/' },
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  before?: NaturalValue;
  id: NumberId;
  limit?: NaturalValue;
  offset?: NaturalValue;
  type: number;
};

const inputSchema = Schema.Struct({
  before: Schema.optional(NaturalValue),
  id: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  type: NaturalValue,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到热门评论列表的路径 `hotComments` 和每条评论的编号 `hotComments[].commentId` 收紧；资源没有评论时 `hotComments` 是空数组，其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    hotComments: Schema.Array(CommentRecord),
    hasMore: Loose(Schema.Boolean),
    total: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const commentHot: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const resourceType = resolveResourceType(query.type);
    const data = {
      rid: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
      beforeTime: query.before || 0,
    };
    const response = yield* request('request', {
      data,
      path: `/api/v1/resource/hotcomments/${resourceType}${String(query.id)}`,
    });
    const body = yield* decodeUpstreamBody('comment_hot', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 热门评论
 */
export default commentHot;
