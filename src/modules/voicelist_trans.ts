import { Effect } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
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

const voicelistTrans: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '200', // 每页数量
      offset: query.offset || '0', // 偏移量
      radioId: query.radioId || null, // 电台id
      programId: query.programId || '0', // 节目id
      position: query.position || '1', // 排序编号
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

export default voicelistTrans;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
