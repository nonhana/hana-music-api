import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import {
  LooseSongPrivilege,
  ProgramMainSong,
  ProgramQuality,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  limit?: NaturalValue;
  offset?: NaturalValue;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 相似歌曲记录是旧版歌曲结构，复用 `ProgramMainSong`，另声明录制里非 null 的字段；只见过 null 或空数组的字段未声明。
const SimiSong = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  id: Schema.Finite,
  alg: Loose(Schema.String),
  alias: Loose(Schema.Array(Schema.String)),
  mp3Url: Loose(Schema.String),
  privilege: Loose(LooseSongPrivilege),
  recommendReason: Loose(Schema.String),
  sqMusic: Loose(ProgramQuality),
  transNames: Loose(Schema.Array(Schema.String)),
});

// 通到相似歌曲列表的路径 `songs` 和每首歌的编号收紧（复用 `SimiSong`）；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(SimiSong),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/v1/discovery/simiSong',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const simiSong: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      songid: query.id,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('simi_song', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似歌曲
 */
export default simiSong;
