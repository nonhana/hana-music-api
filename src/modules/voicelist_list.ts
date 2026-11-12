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
    target: '/api/voice/workbench/voices/by/voicelist',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 所属播客列表是这次调用必需的；分页沿用原来的字符串默认值。
export type ModuleInput = {
  voiceListId: NumberId;
  limit?: NaturalValue;
  offset?: NaturalValue;
};

const inputSchema = Schema.Struct({
  voiceListId: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const voicelistList: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const data = {
      limit: input.limit || '200',
      offset: input.offset || '0',
      voiceListId: input.voiceListId,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default voicelistList;
