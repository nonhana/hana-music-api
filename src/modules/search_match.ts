import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

const searchMatch: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
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
    const response = yield* request(
      buildApiRequestIntent(`/api/search/match/new`, data, createOption(query)),
    );
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
