import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import type { ModuleEffect, UnknownJson } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  br?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  br: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const songUrl: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const ids = String(query.id).split(',');
    const response = yield* request(
      buildApiRequestIntent(
        '/api/song/enhance/player/url',
        {
          ids: JSON.stringify(ids),
          br: parseInt(String(query.br ?? 999000), 10),
        },
        createOption(query),
      ),
    );
    const body = response.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      (body.data !== undefined && !Array.isArray(body.data))
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'song_url',
        path: 'body.data',
        expected: 'array',
        actual: typeof body,
      });
    }
    const result: Array<{ id: string | number; value: UnknownJson }> = [];
    for (const entry of body.data ?? []) {
      if (
        entry === null ||
        typeof entry !== 'object' ||
        Array.isArray(entry) ||
        (typeof entry.id !== 'string' && typeof entry.id !== 'number')
      ) {
        return yield* new UnexpectedUpstreamShape({
          module: 'song_url',
          path: 'body.data[].id',
          expected: 'string or number',
          actual: typeof entry,
        });
      }
      result.push({ id: entry.id, value: entry });
    }
    result.sort(
      (left, right) =>
        ids.indexOf(String(left.id)) - ids.indexOf(String(right.id)),
    );
    return {
      status: 200,
      cookie: [],
      body: { code: 200, data: result.map((entry) => entry.value) },
    };
  });

export default songUrl;
