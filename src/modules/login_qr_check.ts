import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import { decodeModuleInput as decodeInput } from './_input.ts';

export type ModuleInput = {
  key: string;
};

const inputSchema = Schema.Struct({
  key: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const loginQrCheck: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/login/qrcode/client/login',
        { key: query.key, type: 3 },
        createOption(query),
      ),
    );
    const body = result.body;
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'login_qr_check',
        path: 'body',
        expected: 'object',
        actual: typeof body,
      });
    }
    return toModuleResponse({
      ...result,
      status: 200,
      body: { ...body, cookie: result.cookie.join(';') },
    });
  });

export default loginQrCheck;
