import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/msg/private/send',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  userIds: NumberIdList;
  msg?: string;
};

const inputSchema = Schema.Struct({
  userIds: NumberIdList,
  msg: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const sendText: ModuleEffect<ModuleInput, UnknownJson, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      type: 'text',
      msg: query.msg,
      userIds: `[${query.userIds.map(String).join(',')}]`,
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 私信
 */
export default sendText;
