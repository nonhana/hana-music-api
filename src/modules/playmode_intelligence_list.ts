import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  count?: NaturalValue;
  id: NumberId;
  pid: NumberId;
  sid?: NumberId;
};

const inputSchema = Schema.Struct({
  count: Schema.optional(NaturalValue),
  id: NumberId,
  pid: NumberId,
  sid: Schema.optional(NumberId),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 心动模式条目：条目自己的 `id` 收紧，`songInfo` 是附带记录，歌曲编号也宽松。
const RecommendedSong = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  recommended: Loose(Schema.Boolean),
  songInfo: Loose(LooseSong),
});

// 通到心动模式列表的 `data` 和每条记录自己的编号 `data[].id` 收紧；缺少歌单 pid 时上游
// 返回 code 500，由 `decodeUpstreamBody` 按业务拒绝原样转交。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(RecommendedSong),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/playmode/intelligence/list',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const playmodeIntelligenceList: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songId: query.id,
      type: 'fromPlayOne',
      playlistId: query.pid,
      startMusicId: query.sid || query.id,
      count: query.count || 1,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'playmode_intelligence_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 智能播放
 */
export default playmodeIntelligenceList;
