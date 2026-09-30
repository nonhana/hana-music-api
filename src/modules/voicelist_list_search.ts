import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const voicelistListSearch: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '200',
      offset: query.offset || '0',
      name: query.name || null,
      displayStatus: query.displayStatus || null,
      type: query.type || null,
      voiceFeeType: query.voiceFeeType || null,
      radioId: query.voiceListId,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          '/api/voice/workbench/voice/list',
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 声音搜索
 */
export default voicelistListSearch;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
