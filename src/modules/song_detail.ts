import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';

export type ModuleInput = { ids?: QueryIdentifier };

const inputSchema = Schema.Struct({
  ids: Schema.optional(Identifier),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const songDetail: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const ids = String(input.ids ?? '').split(/\s*,\s*/);
    return toModuleResponse(
      yield* request({
        target: '/api/v3/song/detail',
        protocol: call.config.crypto || 'weapi',
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          c: '[' + ids.map((id) => '{"id":' + id + '}').join(',') + ']',
        }),
        response: 'json',
        semantic: 'read',
      }),
    );
  });

export default songDetail;
