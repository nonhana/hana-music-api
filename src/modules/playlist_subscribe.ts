import { Effect } from 'effect';

import { APP_CONF } from '../core/config.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistSubscribe: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const shouldSubscribe = Number(query.t) === 1;
    const path = shouldSubscribe ? 'subscribe' : 'unsubscribe';
    const data = {
      id: query.id,
      ...(shouldSubscribe
        ? { checkToken: query.checkToken || APP_CONF.checkToken }
        : {}),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/playlist/${path}`, data, {
          ...createOption(query, 'eapi'),
          checkToken: true,
        }),
      ),
    );
  });

export default playlistSubscribe;
export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
