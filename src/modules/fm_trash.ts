import { Effect, Schema } from 'effect';

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
import type { ModuleEffect } from '../types/index.ts';

// 返回码收紧；`count` 是附带计数，宽松（`songs` 在录制里只出现过空数组，元素类型没有证据，
// 未声明并原样保留）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  write: {
    target: '/api/radio/trash/add',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  id: NumberId;
  time?: number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  time: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const fmTrash: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      alg: 'RT',
      time: query.time || 25,
    };
    const response = yield* request('write', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('fm_trash', ModuleBody, response),
    };
  });

/**
 * 垃圾桶
 */
export default fmTrash;
