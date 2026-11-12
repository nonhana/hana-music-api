import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberValue,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

// 本地文件元数据：`md5` 是匹配依据，其余字段省略时仍按空文本/0 发送。
export type ModuleInput = {
  album?: string;
  artist?: string;
  duration?: NumberValue;
  md5: string;
  title?: string;
};

const inputSchema = Schema.Struct({
  album: Schema.optional(Schema.String),
  artist: Schema.optional(Schema.String),
  duration: Schema.optional(NumberValue),
  md5: Schema.String,
  title: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const MatchedQuality = UpstreamObject({
  id: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
  extension: Loose(Schema.String),
  sr: Loose(Schema.Finite),
  dfsId: Loose(Schema.Finite),
  bitrate: Loose(Schema.Finite),
  playTime: Loose(Schema.Finite),
  volumeDelta: Loose(Schema.Finite),
});

const MatchedSong = UpstreamObject({
  ...Song.schema.fields,
  disc: Loose(Schema.String),
  position: Loose(Schema.Finite),
  popularity: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  starred: Loose(Schema.Boolean),
  starredNum: Loose(Schema.Finite),
  playedNum: Loose(Schema.Finite),
  dayPlays: Loose(Schema.Finite),
  hearTime: Loose(Schema.Finite),
  ringtone: Loose(Schema.String),
  copyFrom: Loose(Schema.String),
  commentThreadId: Loose(Schema.String),
  hMusic: Loose(MatchedQuality),
  mMusic: Loose(MatchedQuality),
  lMusic: Loose(MatchedQuality),
  bMusic: Loose(MatchedQuality),
});

// 通到匹配结果的路径 `result`、本地文件映射项 `result.ids` 和每首匹配歌曲的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: UpstreamObject({
      songs: Schema.Array(MatchedSong),
      ids: Schema.Array(Schema.String),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/search/match/new',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const searchMatch: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const songs = [
      {
        title: query.title || '',
        album: query.album || '',
        artist: query.artist || '',
        duration: query.duration || 0,
        persistId: query.md5,
      },
    ];
    const data = {
      songs: JSON.stringify(songs),
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'search_match',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 本地歌曲匹配音乐信息
 */
export default searchMatch;
