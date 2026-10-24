import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierActionQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierActionQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
  t: Schema.Literals([0, 1, '0', '1']),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 返回码收紧；其余字段宽松（录到的 `data` 一直是 null）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(Schema.Null),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistSub: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const action = Number(query.t) === 1 ? 'sub' : 'unsub';
    const data = {
      artistId: query.id,
      artistIds: '[' + query.id + ']',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/${action}`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('artist_sub', ModuleBody, response),
    };
  });

/**
 * 收藏与取消收藏歌手
 */
export default artistSub;
