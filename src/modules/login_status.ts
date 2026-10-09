import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import { ModuleBody as AccountBody } from './user_account.ts';

// 与 user_account 是同一份账号数据，外面多包一层 `data`。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Struct({ data: AccountBody }),
);
export type ModuleBody = typeof ModuleBody.Type;

const loginStatus: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        '/api/w/nuser/account/get',
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('login_status', ModuleBody, result, {
      body: { data: result.body },
    });
    return { ...toModuleResponse(result), status: 200, body };
  });

export default loginStatus;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
