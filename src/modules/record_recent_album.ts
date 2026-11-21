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
  AlbumSummary,
  LooseSong,
  MultiTerminalInfo,
  ProgramMainSong,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/play-record/album/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 专辑记录里附带的歌曲数组（录制里长度等于专辑 size）：旧版歌曲结构，编号在宽松容器里，全部宽松。
const AlbumTrack = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  alias: Schema.String.pipe(Schema.Array, Loose),
  transName: Loose(Schema.String),
  transNames: Schema.String.pipe(Schema.Array, Loose),
});

const RecentAlbumRecord = UpstreamObject({
  resourceId: Schema.String,
  playTime: Loose(Schema.Finite),
  resourceType: Loose(Schema.String),
  data: UpstreamObject({
    ...AlbumSummary.schema.fields,
    transName: Loose(Schema.String),
    songs: AlbumTrack.pipe(Schema.Array, Loose),
    lastSong: Loose(LooseSong),
  }),
  os: Loose(Schema.String),
  multiTerminalInfo: Loose(MultiTerminalInfo),
});

// 通到最近播放专辑列表的 `data.list` 和每条记录的 `resourceId`、专辑 `data.id` 收紧；
// `limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`，空字符串作为独立分支保留。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      data: UpstreamObject({
        list: Schema.Array(RecentAlbumRecord),
        total: Loose(Schema.Finite),
      }),
      message: Loose(Schema.String),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export type ModuleInput = {
  limit?: number;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const recordRecentAlbum: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'record_recent_album',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default recordRecentAlbum;
