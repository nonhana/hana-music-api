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
import {
  LooseSong,
  MultiTerminalInfo,
  PlaylistSummary,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/play-record/playlist/list',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const RecentPlaylistRecord = UpstreamObject({
  resourceId: Schema.String,
  playTime: Loose(Schema.Finite),
  resourceType: Loose(Schema.String),
  data: UpstreamObject({
    ...PlaylistSummary.schema.fields,
    lastSong: Loose(LooseSong),
  }),
  os: Loose(Schema.String),
  multiTerminalInfo: Loose(MultiTerminalInfo),
});

// 通到最近播放歌单列表的 `data.list` 和每条记录的 `resourceId`、歌单 `data.id` 收紧；
// `limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`，空字符串作为独立分支保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      data: UpstreamObject({
        list: Schema.Array(RecentPlaylistRecord),
        total: Loose(Schema.Finite),
      }),
      message: Loose(Schema.String),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

export type ModuleInput = {
  limit?: number;
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const recordRecentPlaylist: ModuleEffect<
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
      'record_recent_playlist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default recordRecentPlaylist;
