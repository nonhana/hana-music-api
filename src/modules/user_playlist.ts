import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  QueryIdentifier,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = {
  uid: QueryIdentifier;

  limit?: QueryNumberLike;
  offset?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  uid: Identifier,
  limit: Schema.optional(QueryNumber),
  offset: Schema.optional(QueryNumber),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到歌单列表的路径、每个歌单的编号收紧；其余字段宽松（共用 `PlaylistSummary`）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    more: Loose(Schema.Boolean),
    playlist: Schema.Array(PlaylistSummary),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userPlaylist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      uid: query.uid,
      limit: query.limit || 30,
      offset: query.offset || 0,
      includeVideo: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/user/playlist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'user_playlist',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 用户歌单
 */
export default userPlaylist;
