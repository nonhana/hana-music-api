import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
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

const Creator = UpstreamObject({
  userId: Schema.Finite,
  nickname: Schema.String,
});

const Playlist = UpstreamObject({
  id: Schema.Finite,
  name: Schema.String,
  coverImgUrl: Schema.String,
  trackCount: Schema.Finite,
  updateTime: Schema.Finite,
  trackUpdateTime: Schema.Finite,
  subscribed: Schema.Boolean,
  creator: Creator,
  privacy: Schema.Finite,
  specialType: Schema.Finite,
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    more: Schema.Boolean,
    playlist: Schema.Array(Playlist),
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
