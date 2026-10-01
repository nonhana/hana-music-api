import { Effect, Schema } from 'effect';

import { UnexpectedUpstreamShape } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from './_input.ts';

export type ModuleInput = IdentifierQuery & {
  br?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  br: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const checkMusic: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        '/api/song/enhance/player/url',
        {
          ids: '[' + parseInt(String(query.id ?? 0), 10) + ']',
          br: parseInt(String(query.br ?? 999000), 10),
        },
        createOption(query, 'weapi'),
      ),
    );
    const body = response.body;
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      typeof body.code !== 'number'
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'check_music',
        path: 'body.code',
        expected: 'number',
        actual: typeof body,
      });
    }
    if (body.data !== undefined && !Array.isArray(body.data)) {
      return yield* new UnexpectedUpstreamShape({
        module: 'check_music',
        path: 'body.data',
        expected: 'array',
        actual: typeof body.data,
      });
    }
    const first = body.data?.[0];
    if (
      first !== undefined &&
      (first === null ||
        typeof first !== 'object' ||
        Array.isArray(first) ||
        typeof first.code !== 'number')
    ) {
      return yield* new UnexpectedUpstreamShape({
        module: 'check_music',
        path: 'body.data[0].code',
        expected: 'number',
        actual: typeof first,
      });
    }
    const playable = body.code === 200 && first?.code === 200;
    return {
      ...toModuleResponse(response),
      body: {
        code: 200,
        success: playable,
        message: playable ? 'ok' : '亲爱的,暂无版权',
      },
    };
  });

export default checkMusic;
