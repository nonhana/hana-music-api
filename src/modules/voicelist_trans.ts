import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/voice/workbench/radio/program/trans',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

// 电台和节目编号可选；原来的字符串默认值保持不变。
export type ModuleInput = {
  limit?: NaturalValue;
  offset?: NaturalValue;
  radioId?: NumberId;
  programId?: NumberId;
  position?: number;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  radioId: Schema.optional(NumberId),
  programId: Schema.optional(NumberId),
  position: Schema.optional(NaturalValue.check(Schema.isGreaterThan(0))),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const voicelistTrans: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const data = {
      limit: input.limit || '200', // 每页数量
      offset: input.offset || '0', // 偏移量
      radioId: input.radioId || null, // 电台id
      programId: input.programId || '0', // 节目id
      position: input.position || '1', // 排序编号
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default voicelistTrans;
