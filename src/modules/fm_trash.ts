import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

const fmTrash: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      alg: 'RT',
      time: query.time || 25,
    };
    const response = yield* request(
      buildActionRequestIntent('write', moduleActions.write, data),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('fm_trash', ModuleBody, response),
    };
  });

/**
 * 垃圾桶
 */
export default fmTrash;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
