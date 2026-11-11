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
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/voice/workbench/voice/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 工作台筛选条件都是可选的；录制里不带 voiceListId 也能成功返回空列表。
// 文档没有穷举 displayStatus、type 的字符串值，保留字符串。
export type ModuleInput = {
  voiceListId?: NumberId;
  limit?: NaturalValue;
  offset?: NaturalValue;
  name?: string;
  displayStatus?: string;
  type?: string;
  voiceFeeType?: IntegerValue;
};

const inputSchema = Schema.Struct({
  voiceListId: Schema.optional(NumberId),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  name: Schema.optional(Schema.String),
  displayStatus: Schema.optional(Schema.String),
  type: Schema.optional(Schema.String),
  voiceFeeType: Schema.optional(IntegerValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到声音列表的路径 `data` 收紧；`data.list` 的元素只在空结果里出现过，类型没有证据，未声明并原样保留，
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

const voicelistListSearch: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const data = {
      limit: input.limit || '200',
      offset: input.offset || '0',
      name: input.name || null,
      displayStatus: input.displayStatus || null,
      type: input.type || null,
      voiceFeeType: input.voiceFeeType ?? null,
      radioId: input.voiceListId,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'voicelist_list_search',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 声音搜索
 */
export default voicelistListSearch;
