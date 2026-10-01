import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryNumberLike } from '../types/module-shared.ts';

export type ModuleInput = {
  cursor?: QueryNumberLike;
  scene?: 0 | 1 | 2 | '0' | '1' | '2';
  size?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  cursor: Schema.optional(QueryNumber),
  scene: Schema.optional(Schema.Literals([0, 1, 2, '0', '1', '2'])),
  size: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userFollowMixed: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const size = query.size || 30;
    const cursor = query.cursor || 0;
    const scene = query.scene || 0; // 0: 所有关注 1: 关注的歌手 2: 关注的用户
    const data = {
      authority: 'false',
      page: JSON.stringify({
        size,
        cursor,
      }),
      scene,
      size,
      sortType: '0',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/user/follow/users/mixed/get/v2`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 当前账号关注的用户/歌手
 */
export default userFollowMixed;
