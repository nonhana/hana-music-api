import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const banner: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.type !== undefined &&
      query.type !== null &&
      typeof query.type !== 'string' &&
      typeof query.type !== 'number' &&
      typeof query.type !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'type must be a primitive value',
      });
    }
    const clientTypeMap: Record<string, string> = {
      0: 'pc',
      1: 'android',
      2: 'iphone',
      3: 'ipad',
    };
    const type = clientTypeMap[String(query.type ?? 0)] || 'pc';
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v2/banner/get`,
          { clientType: type },
          createOption(query),
        ),
      ),
    );
  });

/**
 * 首页轮播图
 */
export default banner;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
