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

const artistTopSong: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/artist/top/song`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 歌手热门 50 首歌曲
 */
export default artistTopSong;
