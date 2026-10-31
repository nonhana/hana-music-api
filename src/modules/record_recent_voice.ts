import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { DjProgram, MultiTerminalInfo } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 最近播放的声音：`pubDJProgramData` 复用节目结构并补上最近播放列表额外返回的统计和分类字段，
// 只收紧节目自己的 `id`；评论计数宽松；`replaceName`、`icon` 只见过 null，未声明。
const RecentVoiceProgram = UpstreamObject({
  ...DjProgram.schema.fields,
  adjustedPlayCount: Loose(Schema.Finite),
  updateTime: Loose(Schema.Finite),
  category: Loose(Schema.String),
  secondCategory: Loose(Schema.String),
  disPlayStatus: Loose(Schema.String),
  publish: Loose(Schema.Boolean),
  userId: Loose(Schema.Finite),
});

const RecentVoiceData = UpstreamObject({
  pubDJProgramData: RecentVoiceProgram,
  commentCount: Loose(Schema.Finite),
});

const RecentVoiceRecord = UpstreamObject({
  resourceId: Schema.String,
  playTime: Loose(Schema.Finite),
  resourceType: Loose(Schema.String),
  data: RecentVoiceData,
  os: Loose(Schema.String),
  multiTerminalInfo: Loose(MultiTerminalInfo),
});

// 通到最近播放声音列表的 `data.list` 和每条记录的 `resourceId`、节目 `data.pubDJProgramData.id` 收紧；
// `limit` 非数字时上游 HTTP 400 空正文被归一成 `status: 200`，空字符串作为独立分支保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      data: UpstreamObject({
        list: Schema.Array(RecentVoiceRecord),
        total: Loose(Schema.Finite),
      }),
      message: Loose(Schema.String),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

const recordRecentVoice: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/play-record/voice/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'record_recent_voice',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default recordRecentVoice;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
