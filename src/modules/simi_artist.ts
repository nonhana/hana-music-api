import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SimiArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  alg: Loose(Schema.String),
  fansCount: Loose(Schema.Finite),
});

// 通到相似歌手列表的路径 `artists` 和每个歌手的编号收紧；`alg`、`fansCount` 等其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artists: Schema.Array(SimiArtist),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/discovery/simiArtist',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const simiArtist: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      artistid: query.id,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('simi_artist', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似歌手
 */
export default simiArtist;
