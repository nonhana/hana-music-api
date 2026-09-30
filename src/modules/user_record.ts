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

  type?: 0 | 1 | '0' | '1';
};

const inputSchema = Schema.Struct({
  uid: Identifier,
  type: Schema.optional(Schema.Literals([0, 1, '0', '1'])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userRecord: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      uid: query.uid,
      type: query.type || 0, // 1: 最近一周, 0: 所有时间
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/play/record`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 听歌排行
 */
export default userRecord;
