import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierActionQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierActionQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
  t: Schema.Literals([0, 1, '0', '1']),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const artistSub: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const action = Number(query.t) === 1 ? 'sub' : 'unsub';
    const data = {
      artistId: query.id,
      artistIds: '[' + query.id + ']',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/artist/${action}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 收藏与取消收藏歌手
 */
export default artistSub;
