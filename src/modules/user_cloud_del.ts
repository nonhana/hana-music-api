import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  delete: {
    target: '/api/cloud/del',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  id: NumberId;
};

const inputSchema = Schema.Struct({
  id: NumberId,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userCloudDel: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songIds: [String(query.id)],
    };
    const response = yield* request('delete', { data });
    return toModuleResponse(response);
  });

/**
 * 云盘歌曲删除
 */
export default userCloudDel;
