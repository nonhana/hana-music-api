import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({ unikey: Schema.String }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginQrKey: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/login/qrcode/unikey',
        { type: 3 },
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody('login_qr_key', ModuleBody, result, {
      body: { data: result.body, code: 200 },
    });
    return { ...toModuleResponse(result), status: 200, body };
  });

export default loginQrKey;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
