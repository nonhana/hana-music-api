import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { APP_CONF } from '../core/config.ts';
import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
  QueryNumber,
} from '../core/module-input.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  LooseSongPrivilege,
  PlaylistSummary,
} from '../core/upstream-schemas.ts';
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

const Playlist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  trackIds: Schema.Array(
    UpstreamObject({
      id: Schema.Finite,
    }),
  ),
});

// 通到歌单的路径、歌单自身的编号和 `trackIds` 里的编号收紧；其余字段宽松，`tracks`、`privileges` 里的编号也宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    playlist: Playlist,
    fromUserCount: Loose(Schema.Finite),
    privileges: Loose(Schema.Array(LooseSongPrivilege)),
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
