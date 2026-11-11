import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  cat?: string | ReadonlyArray<string>;
  limit?: NaturalValue;
  before?: NaturalValue;
};

const inputSchema = Schema.Struct({
  cat: Schema.optional(
    Schema.Union([Schema.String, Schema.Array(Schema.String)]),
  ),
  limit: Schema.optional(NaturalValue),
  before: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const HighQualityPlaylist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  copywriter: Loose(Schema.String),
  tag: Loose(Schema.String),
});

// 通到精品歌单列表的路径 `playlists` 和每个歌单的编号收紧；`total`、`lasttime`、`more` 是分页提示，`msg` 是状态信息，都宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    playlists: Schema.Array(HighQualityPlaylist),
    total: Loose(Schema.Finite),
    lasttime: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
    msg: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/playlist/highquality/list',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const topPlaylistHighquality: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cat: query.cat || '全部', // 全部,华语,欧美,韩语,日语,粤语,小语种,运动,ACG,影视原声,流行,摇滚,后摇,古风,民谣,轻音乐,电子,器乐,说唱,古典,爵士
      limit: query.limit || 50,
      lasttime: query.before || 0, // 歌单updateTime
      total: true,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'top_playlist_highquality',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 精品歌单
 */
export default topPlaylistHighquality;
