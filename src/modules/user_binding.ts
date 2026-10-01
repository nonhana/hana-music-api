import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const userBinding: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.uid !== undefined &&
      query.uid !== null &&
      typeof query.uid !== 'string' &&
      typeof query.uid !== 'number' &&
      typeof query.uid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'uid must be a primitive value',
      });
    }
    const data = {};
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/user/bindings/${String(query.uid)}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

export default userBinding;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
