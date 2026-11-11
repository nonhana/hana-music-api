import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  IntegerValue,
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
import { PlaylistUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  limit?: number;
  time?: number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  limit: Schema.optional(NaturalValue),
  time: Schema.optional(IntegerValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/djradio/subscriber',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const Subscriber = UpstreamObject({
  ...PlaylistUser.schema.fields,
  userId: Schema.Finite,
  subscribeTime: Loose(Schema.Finite),
});

// 通到订阅者列表的路径 `subscribers` 和每个订阅者自己的编号 `subscribers[].userId` 收紧；昵称、头像、认证、
// 关注状态、`subscribeTime`、`time` 和 `hasMore` 宽松。记录展开 `PlaylistUser`，其中 `expertTags`、`experts`
// 在本批录制里只见过 null，随共享结构保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    subscribers: Schema.Array(Subscriber),
    time: Loose(Schema.Finite),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djSubscriber: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      time: query.time || '-1',
      id: query.id,
      limit: query.limit || '20',
      total: 'true',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'dj_subscriber',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台详情
 */
export default djSubscriber;
