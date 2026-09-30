import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const loginQrKey: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/login/qrcode/unikey',
        { type: 3 },
        createOption(query),
      ),
    );
    return toModuleResponse({
      ...result,
      status: 200,
      body: { data: result.body, code: 200 },
    });
  });

export default loginQrKey;
export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
