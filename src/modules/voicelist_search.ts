import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const voicelistSearch: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      fee: '-1',
      limit: query.limit || '200',
      offset: query.offset || '0',
      podcastName: query.podcastName || '',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/voice/workbench/voicelist/search`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default voicelistSearch;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
