import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djDifmAllStyleChannel: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      sources: query.sources || '[0]',
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/dj/difm/all/style/channel/v2`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * DIFM电台 - 分类
 */
export default djDifmAllStyleChannel;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
