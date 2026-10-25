import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
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
import type { LegacyModuleInput } from '../types/legacy.ts';

// 专辑记录里附带的歌曲数组（录制里长度等于专辑 size）：旧版歌曲结构，编号在宽松容器里，全部宽松。
const AlbumTrack = UpstreamObject({
  ...ProgramMainSong.schema.fields,
  alias: Loose(Schema.Array(Schema.String)),
  transName: Loose(Schema.String),
  transNames: Loose(Schema.Array(Schema.String)),
});

const RecentAlbumRecord = UpstreamObject({
  resourceId: Schema.String,
  playTime: Loose(Schema.Finite),
  resourceType: Loose(Schema.String),
  data: UpstreamObject({
    ...AlbumSummary.schema.fields,
    transName: Loose(Schema.String),
    songs: Loose(Schema.Array(AlbumTrack)),
    lastSong: Loose(LooseSong),
  }),
  os: Loose(Schema.String),
  multiTerminalInfo: Loose(MultiTerminalInfo),
});

// 通到最近播放专辑列表的 `data.list` 和每条记录的 `resourceId`、专辑 `data.id` 收紧；
// `limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`，空字符串作为独立分支保留。
export const ModuleBody = Schema.toStandardSchemaV1(
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
export type ModuleBody = typeof ModuleBody.Type;

const recordRecentAlbum: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/play-record/album/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'record_recent_album',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default recordRecentAlbum;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
