import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { APP_CONF } from '../core/config.ts';
import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { PagedQuery, QueryNumberLike } from '../types/module-shared.ts';

export type ModuleInput = PagedQuery & {
  keywords: string;
  type?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  keywords: Schema.String,
  type: Schema.optional(QueryNumber),
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const search: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const voice = String(input.type ?? '') === '2000';
    const data = voice
      ? {
          keyword: input.keywords,
          scene: 'normal',
          limit: input.limit || 30,
          offset: input.offset || 0,
        }
      : {
          s: input.keywords,
          type: input.type || 1,
          limit: input.limit || 30,
          offset: input.offset || 0,
        };
    return toModuleResponse(
      yield* request({
        target: voice ? '/api/search/voice/get' : '/api/search/get',
        protocol: call.config.crypto || (APP_CONF.encrypt ? 'eapi' : 'api'),
        method: 'POST',
        headers: {},
        body: JSON.stringify(data),
        response: 'json',
        semantic: 'read',
      }),
    );
  });

export default search;
