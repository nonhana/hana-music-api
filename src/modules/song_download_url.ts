import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songDownloadUrl: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.br !== undefined &&
      query.br !== null &&
      typeof query.br !== 'string' &&
      typeof query.br !== 'number' &&
      typeof query.br !== 'boolean'
    ) {
      return yield* Effect.fail(
        new InvalidModuleInput({ message: 'br must be a primitive value' }),
      );
    }
    const data = {
      id: query.id,
      br: parseInt(String(query.br || 999000)),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/song/enhance/download/url`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 获取客户端歌曲下载链接
 */
export default songDownloadUrl;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
