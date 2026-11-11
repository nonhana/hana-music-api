import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
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

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/voice/workbench/voicelist/search',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 播客名是文本，不是编号；分页沿用原来的字符串默认值。
export type ModuleInput = {
  limit?: NaturalValue;
  offset?: NaturalValue;
  podcastName?: string;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  podcastName: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到播客列表的路径 `data` 收紧；`data.list` 的元素只在空结果里出现过，类型没有证据，未声明并原样保留，
// `data.total`、`data.hasMore` 是宽松的分页提示，`message` 只见过 `null`，也不声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      hasMore: Loose(Schema.Boolean),
      total: Loose(Schema.Finite),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const voicelistSearch: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const data = {
      fee: '-1',
      limit: input.limit || '200',
      offset: input.offset || '0',
      podcastName: input.podcastName || '',
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'voicelist_search',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 播客列表
 */
export default voicelistSearch;
