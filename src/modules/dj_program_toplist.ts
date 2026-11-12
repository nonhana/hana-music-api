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
import { DjProgram } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { limit?: number; offset?: number };

const inputSchema = Schema.Struct({
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/program/toplist/v1',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const ToplistEntry = UpstreamObject({
  program: DjProgram,
  lastRank: Loose(Schema.Finite),
  programFeeType: Loose(Schema.Finite),
  rank: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
});

// 通到节目榜的路径 `toplist` 和榜上节目自己的编号 `toplist[].program.id` 收紧；排名、分数、`programFeeType` 和 `updateTime` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    toplist: Schema.Array(ToplistEntry),
    updateTime: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djProgramToplist: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 100,
      offset: query.offset || 0,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'dj_program_toplist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台节目榜
 */
export default djProgramToplist;
