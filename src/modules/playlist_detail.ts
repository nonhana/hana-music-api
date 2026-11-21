import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  LooseSongPrivilege,
  PlaylistSummary,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  s?: number;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  s: Schema.optional(NaturalValue),
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
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    playlist: Playlist,
    fromUserCount: Loose(Schema.Finite),
    privileges: LooseSongPrivilege.pipe(Schema.Array, Loose),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/v6/playlist/detail',
    profile: 'web',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const playlistDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const response = yield* request('read', {
      data: {
        id: input.id,
        n: 100000,
        s: input.s || 8,
      },
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
