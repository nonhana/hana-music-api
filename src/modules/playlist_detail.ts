import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { APP_CONF } from '../core/config.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  s?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  s: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const playlistDetail: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const call = yield* Call;
    return toModuleResponse(
      yield* request({
        target: '/api/v6/playlist/detail',
        protocol: call.config.crypto || (APP_CONF.encrypt ? 'eapi' : 'api'),
        method: 'POST',
        headers: {},
        body: JSON.stringify({ id: input.id, n: 100000, s: input.s || 8 }),
        response: 'json',
        semantic: 'read',
      }),
    );
  });

export default playlistDetail;
