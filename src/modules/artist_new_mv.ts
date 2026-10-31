import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const NewMv = UpstreamObject({
  artistId: Loose(Schema.Finite),
  artistImgUrl: Loose(Schema.String),
  artistName: Loose(Schema.String),
  artisAlias: Loose(Schema.String),
  artisTransName: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  mvCoverUrl: Loose(Schema.String),
  mvId: Schema.Finite,
  mvName: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  publishDate: Loose(Schema.String),
  publishTime: Loose(Schema.Finite),
});

// 通到新 MV 列表的路径 `data.newWorks` 和 MV 自己的编号 `newWorks[].mvId` 收紧；匿名时返回空数组，空数组是正常结果。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    message: Loose(Schema.String),
    data: UpstreamObject({
      hasMore: Loose(Schema.Boolean),
      newWorks: Schema.Array(NewMv),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistNewMv: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 20,
      startTimestamp: query.before || Date.now(),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/sub/artist/new/works/mv/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'artist_new_mv',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

export default artistNewMv;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
