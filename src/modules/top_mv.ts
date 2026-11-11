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
import { Artist, MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  area?: string;
  limit?: NaturalValue;
  offset?: NaturalValue;
};

const inputSchema = Schema.Struct({
  area: Schema.optional(Schema.String),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const MvVideoTagSign = UpstreamObject({
  br: Loose(Schema.Finite),
  mvtype: Loose(Schema.String),
  resolution: Loose(Schema.Finite),
  tagSign: Loose(Schema.String),
  type: Loose(Schema.String),
});

const MvVideo = UpstreamObject({
  check: Loose(Schema.Boolean),
  container: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  height: Loose(Schema.Finite),
  md5: Loose(Schema.String),
  size: Loose(Schema.Finite),
  tag: Loose(Schema.String),
  tagSign: Loose(MvVideoTagSign),
  url: Loose(Schema.String),
  width: Loose(Schema.Finite),
});

const MvInfo = UpstreamObject({
  aliaName: Loose(Schema.String),
  appTitle: Loose(Schema.String),
  appword: Loose(Schema.String),
  area: Loose(Schema.String),
  artists: Loose(Schema.Array(Artist)),
  authId: Loose(Schema.Finite),
  caption: Loose(Schema.Finite),
  captionLanguage: Loose(Schema.String),
  dayplays: Loose(Schema.Finite),
  desc: Loose(Schema.String),
  fee: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  monthplays: Loose(Schema.Finite),
  mottos: Loose(Schema.String),
  neteaseonly: Loose(Schema.Finite),
  online: Loose(Schema.Finite),
  pic16v9: Loose(Schema.Finite),
  pic4v3: Loose(Schema.Finite),
  plays: Loose(Schema.Finite),
  publishTime: Loose(Schema.String),
  score: Loose(Schema.Finite),
  status: Loose(Schema.Finite),
  subTitle: Loose(Schema.String),
  subType: Loose(Schema.String),
  title: Loose(Schema.String),
  topWeeks: Loose(Schema.String),
  transName: Loose(Schema.String),
  type: Loose(Schema.String),
  upban: Loose(Schema.Finite),
  valid: Loose(Schema.Finite),
  videos: Loose(Schema.Array(MvVideo)),
  weekplays: Loose(Schema.Finite),
});

const TopMv = UpstreamObject({
  ...MvSummary.schema.fields,
  lastRank: Loose(Schema.Finite),
  mv: Loose(MvInfo),
  score: Loose(Schema.Finite),
});

// 通到 MV 排行榜的路径 `data` 和 MV 自己的编号 `data[].id` 收紧（记录共用 `MvSummary`，局部补 `lastRank`、`score`、嵌套 `mv` 等宽松字段）；`hasMore`、`updateTime` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(TopMv),
    hasMore: Loose(Schema.Boolean),
    updateTime: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/mv/toplist',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const topMv: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      area: query.area || '',
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('top_mv', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * MV排行榜
 */
export default topMv;
