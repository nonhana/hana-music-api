import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from './_input.ts';

export type ModuleInput = {
  uid: QueryIdentifier;
};

const inputSchema = Schema.Struct({
  uid: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userAudio: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      userId: query.uid,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/djradio/get/byuser`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 用户创建的电台
 */
export default userAudio;
