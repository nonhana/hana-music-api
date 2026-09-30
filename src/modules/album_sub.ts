import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierActionQuery } from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from './_input.ts';

export type ModuleInput = IdentifierActionQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
  t: Schema.Literals([0, 1, '0', '1']),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const albumSub: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const action = Number(query.t) === 1 ? 'sub' : 'unsub';
    const data = {
      id: query.id,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/album/${action}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 收藏/取消收藏专辑
 */
export default albumSub;
