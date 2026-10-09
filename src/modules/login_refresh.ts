import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { isRecord } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 续期成功时新的 MUSIC_U 在 `cookie` 里；扫码和短信两种登录得到的 Cookie 都能续期。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200), cookie: Schema.String }),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginRefresh: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/login/token/refresh',
        {},
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'login_refresh',
      ModuleBody,
      result,
      {
        body: isRecord(result.body)
          ? { ...result.body, cookie: result.cookie.join(';') }
          : result.body,
      },
    );
    return { ...toModuleResponse(result), status: 200, body };
  });

export default loginRefresh;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
