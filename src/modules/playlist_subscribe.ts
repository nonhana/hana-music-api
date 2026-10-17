import { Effect, Schema } from 'effect';

import { defineModule } from '../core/module-metadata.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistSubscribe: ModuleEffect<ModuleInput, ModuleBody> = defineModule(
  { profile: 'web', checkToken: 'optional' },
  (query, request) =>
    Effect.gen(function* () {
      const subscribe = Number(query.t) === 1;
      const path = subscribe ? 'subscribe' : 'unsubscribe';
      const response = yield* request(
        buildApiRequestIntent(
          `/api/playlist/${path}`,
          { id: query.id },
          { ...createOption(query), checkToken: subscribe },
        ),
      );

      return {
        ...toModuleResponse(response),
        body: yield* decodeUpstreamBody(
          'playlist_subscribe',
          ModuleBody,
          response,
        ),
      };
    }),
);

export default playlistSubscribe;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
