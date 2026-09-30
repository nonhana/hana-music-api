import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { APP_CONF } from '../core/config.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from './_input.ts';

export type ModuleInput = { id?: QueryIdentifier };

const inputSchema = Schema.Struct({
  id: Schema.optional(Identifier),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const lyric: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const call = yield* Call;
    return toModuleResponse(
      yield* request({
        target: '/api/song/lyric',
        protocol: call.config.crypto || (APP_CONF.encrypt ? 'eapi' : 'api'),
        method: 'POST',
        headers: {},
        body: JSON.stringify({
          id: input.id,
          tv: -1,
          lv: -1,
          rv: -1,
          kv: -1,
          _nmclfl: 1,
        }),
        response: 'json',
        semantic: 'read',
      }),
    );
  });

export default lyric;
