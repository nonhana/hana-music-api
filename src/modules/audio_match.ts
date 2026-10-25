import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryNumber,
} from '../core/module-input.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { QueryNumberLike } from '../types/module-shared.ts';

export type ModuleInput = {
  audioFP: string;
  duration: QueryNumberLike;
};

const inputSchema = Schema.Struct({
  audioFP: Schema.String,
  duration: QueryNumber,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const Match = UpstreamObject({
  song: Song,
  startTime: Loose(Schema.Finite),
});

const MatchData = UpstreamObject({
  result: Optional(Schema.Array(Match)),
  moduleList: Loose(Schema.Array(Schema.String)),
  noMatchReason: Loose(Schema.Finite),
  queryId: Loose(Schema.String),
  type: Loose(Schema.Finite),
});

// 返回码和识别结果路径 `data` 收紧；`data.result` 在没识别到时是 `null`，按可以没有处理，
// 出现时每条记录的 `song.id` 收紧；`queryId`、`type`、`moduleList`、`noMatchReason` 和 `message` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: MatchData,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const audioMatch: ModuleEffect<ModuleInput, ModuleBody> = (input, request) =>
  Effect.gen(function* () {
    const response = yield* request({
      target: `https://interface.music.163.com/api/music/audio/match?sessionId=0123456789abcdef&algorithmCode=shazam_v2&duration=${input.duration}&rawdata=${encodeURIComponent(input.audioFP)}&times=1&decrypt=1`,
      protocol: 'plain',
      method: 'GET',
      headers: {},
      response: 'json',
      semantic: 'read',
    });
    const body = yield* decodeUpstreamBody('audio_match', ModuleBody, response);
    return { status: 200, cookie: [], body };
  });

export default audioMatch;
