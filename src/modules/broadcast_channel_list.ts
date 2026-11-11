import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  IntegerValue,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  categoryId?: NaturalValue;
  regionId?: NaturalValue;
  limit?: NaturalValue;
  lastId?: NaturalValue;
  score?: IntegerValue;
};

const inputSchema = Schema.Struct({
  categoryId: Schema.optional(NaturalValue),
  regionId: Schema.optional(NaturalValue),
  limit: Schema.optional(NaturalValue),
  lastId: Schema.optional(NaturalValue),
  score: Schema.optional(IntegerValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/voice/broadcast/channel/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const Channel = UpstreamObject({
  id: Schema.Finite,
  coverUrl: Loose(Schema.String),
  name: Loose(Schema.String),
  regionName: Loose(Schema.String),
  roomId: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  source: Loose(Schema.String),
  subed: Loose(Schema.Boolean),
});

// 通到电台列表的路径 `data.list` 和每个电台自己的编号 `data.list[].id` 收紧；分页计数和电台展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      list: Schema.Array(Channel),
      hasMore: Loose(Schema.Boolean),
      total: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const broadcastChannelList: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      categoryId: String(query.categoryId || '0'),
      regionId: String(query.regionId || '0'),
      limit: query.limit || '20',
      lastId: String(query.lastId || '0'),
      score: query.score || '-1',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'broadcast_channel_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 广播电台 - 全部电台
 */
export default broadcastChannelList;
