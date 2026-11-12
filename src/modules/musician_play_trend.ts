import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/creator/musician/play/count/statistic/data/trend/get',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  startTime: string;
  endTime: string;
};

const inputSchema = Schema.Struct({
  startTime: Schema.String,
  endTime: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const PlayTrendPoint = UpstreamObject({
  dateTime: Schema.String,
  dataValue: Schema.String,
});

// 返回码、趋势列表 `data`、每天的日期键 `data[].dateTime` 和这条趋势要返回的播放数 `data[].dataValue` 收紧；
// 没有播放记录的区间返回空数组（`dateTime`/`dataValue` 都是字符串，播放数为 `"0"` 时也出现）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(PlayTrendPoint),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const musicianPlayTrend: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      startTime: query.startTime,
      endTime: query.endTime,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'musician_play_trend',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 音乐人歌曲播放趋势
 */
export default musicianPlayTrend;
