import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from './_input.ts';

export type ModuleInput = IdentifierQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const album: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v1/album/${query.id}`,
          {},
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 专辑内容
 */
export default album;
