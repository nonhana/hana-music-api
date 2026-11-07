import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
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

// 返回码收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    playlistId: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  like: {
    target: '/api/radio/like',
    profile: 'weapiPc',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
  unlike: {
    target: '/api/radio/like',
    profile: 'weapiPc',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const like: ModuleEffect<ModuleInput, ModuleBody> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.like !== undefined &&
      query.like !== null &&
      typeof query.like !== 'string' &&
      typeof query.like !== 'number' &&
      typeof query.like !== 'boolean'
    ) {
      return yield* InvalidModuleInput.make({
        message: 'like must be a primitive value',
      });
    }
    query.like = String(query.like ?? '') !== 'false';
    const data = {
      alg: 'itembased',
      trackId: query.id,
      like: query.like,
      time: '3',
    };
    const action = query.like ? 'like' : 'unlike';
    const response = yield* request(
      buildActionRequestIntent(action, moduleActions[action], data),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('like', ModuleBody, response),
    };
  });

/**
 * 红心与取消红心歌曲
 */
export default like;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
