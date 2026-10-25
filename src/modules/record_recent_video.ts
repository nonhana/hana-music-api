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
  Artist,
  MultiTerminalInfo,
  PlaylistUser,
} from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 同一次返回里混有 MLOG（`id` 是字符串，带 `title`、`creator`）和 MV（`id` 是数字，带 `name`、`artists`），
// 外层 `resourceType` 区分 MLOG 和 MV，但 `data` 内没有统一的区分字段，把两边的字段都声明成宽松、可以没有；只收紧记录自己的 `id`。
const RecentVideoData = UpstreamObject({
  id: Schema.Union([Schema.String, Schema.Finite]),
  title: Loose(Schema.String),
  name: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  creator: Loose(PlaylistUser),
  artists: Loose(Schema.Array(Artist)),
});

const RecentVideoRecord = UpstreamObject({
  resourceId: Schema.String,
  playTime: Loose(Schema.Finite),
  resourceType: Loose(Schema.String),
  data: RecentVideoData,
  os: Loose(Schema.String),
  multiTerminalInfo: Loose(MultiTerminalInfo),
});

// 通到最近播放视频列表的 `data.list` 和每条记录的 `resourceId`、视频/MLOG `data.id` 收紧；
// `limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`，空字符串作为独立分支保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      data: UpstreamObject({
        list: Schema.Array(RecentVideoRecord),
        total: Loose(Schema.Finite),
      }),
      message: Loose(Schema.String),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

const recordRecentVideo: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/play-record/newvideo/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'record_recent_video',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default recordRecentVideo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
