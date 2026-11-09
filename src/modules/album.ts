import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { AlbumSummary, Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到歌曲列表和专辑的路径、唱片自身的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(Song),
    album: AlbumSummary,
    resourceState: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: { prefix: '/api/v1/album/' },
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const album: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request('read', {
      data: {},
      path: `/api/v1/album/${query.id}`,
    });
    const body = yield* decodeUpstreamBody('album', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 专辑内容
 */
export default album;
