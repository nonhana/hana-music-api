import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const scrobble: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      logs: JSON.stringify([
        {
          action: 'play',
          json: {
            download: 0,
            end: 'playend',
            id: query.id,
            sourceId: query.sourceid,
            time: query.time,
            type: 'song',
            wifi: 0,
            source: 'list',
            mainsite: 1,
            content: '',
          },
        },
      ]),
    };

    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/feedback/weblog`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 听歌打卡
 */
export default scrobble;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
