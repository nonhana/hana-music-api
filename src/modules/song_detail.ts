import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { Song, SongPrivilege } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryIdentifier } from '../types/module-shared.ts';

export type ModuleInput = { ids?: QueryIdentifier };

const inputSchema = Schema.Struct({
  ids: Schema.optional(Identifier),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到歌曲和权限列表的路径、每首歌和每条权限的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(Song),
    privileges: Schema.Array(SongPrivilege),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/v3/song/detail',
    profile: 'web',
    semantic: 'read',
    token: 'none',
    cache: 'shared',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const songDetail: ModuleEffect<ModuleInput, ModuleBody> = (input, request) =>
  Effect.gen(function* () {
    const ids = String(input.ids ?? '').split(/\s*,\s*/);
    const response = yield* request(
      buildActionRequestIntent('read', moduleActions.read, {
        c: '[' + ids.map((id) => '{"id":' + id + '}').join(',') + ']',
      }),
    );
    const body = yield* decodeUpstreamBody('song_detail', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

export default songDetail;
