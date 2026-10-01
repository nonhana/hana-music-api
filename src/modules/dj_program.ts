import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { toBoolean } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const djProgram: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.asc !== undefined &&
      typeof query.asc !== 'boolean' &&
      typeof query.asc !== 'number' &&
      typeof query.asc !== 'string'
    ) {
      return yield* new InvalidModuleInput({
        message: 'asc must be a boolean, number or string',
      });
    }
    const data = {
      radioId: query.rid,
      limit: query.limit || 30,
      offset: query.offset || 0,
      asc: toBoolean(query.asc),
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/dj/program/byradio`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 电台节目列表
 */
export default djProgram;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
