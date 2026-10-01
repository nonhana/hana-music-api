import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const voicelistList: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '200',
      offset: query.offset || '0',
      voiceListId: query.voiceListId,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/voice/workbench/voices/by/voicelist`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default voicelistList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
