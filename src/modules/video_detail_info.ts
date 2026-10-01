import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const videoDetailInfo: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.vid !== undefined &&
      query.vid !== null &&
      typeof query.vid !== 'string' &&
      typeof query.vid !== 'number' &&
      typeof query.vid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'vid must be a primitive value',
      });
    }
    const data = {
      threadid: `R_VI_62_${String(query.vid)}`,
      composeliked: true,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/comment/commentthread/info`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 视频点赞转发评论数数据
 */
export default videoDetailInfo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
