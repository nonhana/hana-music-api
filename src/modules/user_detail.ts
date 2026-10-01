import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { renameAvatarField } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';

export type ModuleInput = {
  uid: QueryIdentifier;
};

const inputSchema = Schema.Struct({
  uid: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userDetail: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const result = yield* request(
      buildApiRequestIntent(
        `/api/v1/user/detail/${query.uid}`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: renameAvatarField(result.body),
    };
  });

export default userDetail;
