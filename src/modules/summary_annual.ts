import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const summaryAnnual: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.year !== undefined &&
      query.year !== null &&
      typeof query.year !== 'string' &&
      typeof query.year !== 'number' &&
      typeof query.year !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'year must be a primitive value',
      });
    }
    const data = {};
    const key = ['2017', '2018', '2019'].includes(String(query.year))
      ? 'userdata'
      : 'data';
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/activity/summary/annual/${String(query.year)}/${key}`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 年度听歌报告2017-2024
 */
export default summaryAnnual;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
