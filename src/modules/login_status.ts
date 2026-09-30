import { Effect } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const loginStatus: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/w/nuser/account/get',
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = result.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      typeof body.code !== 'number'
    ) {
      return yield* Effect.fail(
        new UnexpectedUpstreamShape({
          module: 'login_status',
          path: 'body.code',
          expected: 'number',
          actual: typeof body,
        }),
      );
    }
    return toModuleResponse(
      body.code === 200
        ? { ...result, status: 200, body: { data: body } }
        : result,
    );
  });

export default loginStatus;
export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
