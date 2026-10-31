import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery;

const inputSchema = Schema.Struct({
  id: Identifier,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const Concert = UpstreamObject({
  onlineCount: Loose(Schema.Finite),
  view: Loose(Schema.Boolean),
});

const VideoNum = UpstreamObject({
  cat: Loose(Schema.Finite),
  num: Loose(Schema.Finite),
});

const RcmdResource = UpstreamObject({
  buttonName: Loose(Schema.String),
  description: Loose(Schema.String),
  resourceType: Loose(Schema.Finite),
  title: Loose(Schema.String),
  url: Loose(Schema.String),
});

// 只有返回码收紧；关注状态、演出、视频数和推荐资源都是宽松字段。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    concert: Loose(Concert),
    followed: Loose(Schema.Boolean),
    rcmdResource: Loose(RcmdResource),
    videoNum: Loose(Schema.Array(VideoNum)),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const artistDetailDynamic: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/artist/detail/dynamic`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'artist_detail_dynamic',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌手动态信息
 */
export default artistDetailDynamic;
