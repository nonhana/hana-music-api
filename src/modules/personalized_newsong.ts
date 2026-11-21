import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
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
  ProgramMainSong,
  ProgramQuality,
  SimpleAlbum,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

// `limit` 省略时取 10，`areaId` 省略时取 0（全部地区）。
export type ModuleInput = {
  areaId?: NaturalValue;
  limit?: NaturalValue;
};

const inputSchema = Schema.Struct({
  areaId: Schema.optional(NaturalValue),
  limit: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 推荐新歌的专辑比 `SimpleAlbum` 多一个单数 `transName`；`songs` 只见过空数组，未声明。
const NewsongAlbum = UpstreamObject({
  ...SimpleAlbum.schema.fields,
  transName: Loose(Schema.String),
});

const NewsongSong = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  album: Loose(NewsongAlbum),
  alias: Schema.String.pipe(Schema.Array, Loose),
  exclusive: Loose(Schema.Boolean),
  hrMusic: Loose(ProgramQuality),
  privilege: Loose(LooseSongPrivilege),
  sqMusic: Loose(ProgramQuality),
  transName: Loose(Schema.String),
  transNames: Schema.String.pipe(Schema.Array, Loose),
});

// 推荐新歌条目：条目自己的 `id` 收紧，`song` 是附带记录，整体宽松。
const NewsongItem = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  canDislike: Loose(Schema.Boolean),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  song: Loose(NewsongSong),
  type: Loose(Schema.Finite),
});

// 通到推荐新歌的路径 `result` 和每条记录自己的编号 `result[].id` 收紧；歌曲记录、`trp` 和其余字段宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(NewsongItem),
    category: Loose(Schema.Finite),
    trp: Loose(
      UpstreamObject({ rules: Schema.String.pipe(Schema.Array, Loose) }),
    ),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/personalized/newsong',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const personalizedNewsong: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: 'recommend',
      limit: query.limit || 10,
      areaId: query.areaId || 0,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'personalized_newsong',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 推荐新歌
 */
export default personalizedNewsong;
