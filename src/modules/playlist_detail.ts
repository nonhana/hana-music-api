import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { APP_CONF } from '../core/config.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type {
  IdentifierQuery,
  QueryNumberLike,
} from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  s?: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  id: Identifier,
  s: Schema.optional(QueryNumber),
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
  trackIds: Schema.Array(
    UpstreamObject({
      id: Schema.Finite,
    }),
  ),
  creator: Creator,
  subscribed: Schema.Boolean,
  updateTime: Schema.Finite,
  trackUpdateTime: Schema.Finite,
  description: Schema.NullOr(Schema.String),
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    playlist: Playlist,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistDetail: ModuleEffect<ModuleInput, ModuleBody> = (
  input,
  request,
) =>
  Effect.gen(function* () {
    const call = yield* Call;
    const response = yield* request({
      target: '/api/v6/playlist/detail',
      protocol: call.config.crypto || (APP_CONF.encrypt ? 'eapi' : 'api'),
      method: 'POST',
      headers: {},
      body: JSON.stringify({ id: input.id, n: 100000, s: input.s || 8 }),
      response: 'json',
      semantic: 'read',
    });
    const body = yield* decodeUpstreamBody(
      'playlist_detail',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

export default playlistDetail;
