import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { mvid: NumberId };

const inputSchema = Schema.Struct({ mvid: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/comment/commentthread/info',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 通到 MV 评论线程计数的路径 `commentCount`/`shareCount`/`likedCount` 收紧；`liked` 是当前账号状态，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    commentCount: Schema.Finite,
    liked: Loose(Schema.Boolean),
    likedCount: Schema.Finite,
    shareCount: Schema.Finite,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvDetailInfo: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      threadid: `R_MV_5_${String(query.mvid)}`,
      composeliked: true,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'mv_detail_info',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * MV 点赞转发评论数数据
 */
export default mvDetailInfo;
