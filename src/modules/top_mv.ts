import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist, MvSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

const topMv: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      area: query.area || '',
      limit: query.limit || 30,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/mv/toplist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('top_mv', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * MV排行榜
 */
export default topMv;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
