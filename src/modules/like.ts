import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    playlistId: Schema.Finite,
    songs: Schema.Array(Schema.MutableJson),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const like: ModuleEffect<ModuleInput, ModuleBody> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.like !== undefined &&
      query.like !== null &&
      typeof query.like !== 'string' &&
      typeof query.like !== 'number' &&
      typeof query.like !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'like must be a primitive value',
      });
    }
    query.like = String(query.like ?? '') !== 'false';
    const data = {
      alg: 'itembased',
      trackId: query.id,
      like: query.like,
      time: '3',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/radio/like`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('like', ModuleBody, response),
    };
  });

/**
 * 红心与取消红心歌曲
 */
export default like;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
