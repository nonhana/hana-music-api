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
import { PlaylistUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  limit?: number;
  offset?: number;
  type?: 'hot' | 'new';
};

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  type: Schema.optional(Schema.Literals(['hot', 'new'])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/djradio/toplist',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const ToplistRadio = UpstreamObject({
  id: Schema.Finite,
  category: Loose(Schema.String),
  categoryId: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  creatorName: Loose(Schema.String),
  dj: Loose(PlaylistUser),
  feeScope: Loose(Schema.Finite),
  lastRank: Loose(Schema.Finite),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  programCount: Loose(Schema.Finite),
  rank: Loose(Schema.Finite),
  rcmdtext: Loose(Schema.String),
  radioFeeType: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  subCount: Loose(Schema.Finite),
});

// 通到榜单的路径 `toplist` 和榜上电台自己的编号 `toplist[].id` 收紧；排名、分数、主播记录（复用宽松的
// `PlaylistUser`）和 `updateTime` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    toplist: Schema.Array(ToplistRadio),
    updateTime: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djToplist: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
      offset: query.offset || 0,
      type: query.type === 'hot' ? 1 : 0, //0为新晋,1为热门
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('dj_toplist', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 新晋电台榜/热门电台榜
 */
export default djToplist;
