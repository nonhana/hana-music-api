import { Effect } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const loginRefresh: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/login/token/refresh',
        {},
        createOption(query),
      ),
    );
    const body = result.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      typeof body.code !== 'number'
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'login_refresh',
        path: 'body.code',
        expected: 'number',
        actual: typeof body,
      });
    }
    return toModuleResponse(
      body.code === 200
        ? {
            ...result,
            status: 200,
            body: { ...body, cookie: result.cookie.join(';') },
          }
        : result,
    );
  });

export default loginRefresh;
export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
