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

export type ModuleInput = {
  id: NumberId;
  reason?: string;
  yunbeiNum?: NaturalValue;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  reason: Schema.optional(Schema.String),
  yunbeiNum: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/yunbei/rcmd/song/submit',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const yunbeiRcmdSong: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      reason: query.reason || '好歌献给你',
      scene: '',
      fromUserId: -1,
      yunbeiNum: query.yunbeiNum || 10,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 云贝推歌
 */
export default yunbeiRcmdSong;
