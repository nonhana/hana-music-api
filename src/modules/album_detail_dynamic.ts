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

const AlbumNearbyProduct = UpstreamObject({
  subTitle: Loose(Schema.String),
  title: Loose(Schema.String),
  url: Loose(Schema.String),
});

// 接口就是为了拿这张专辑的收藏数、评论数和分享数，正文没有要收紧的路径，只有返回码收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    albumNearbyProduct: Loose(AlbumNearbyProduct),
    commentCount: Loose(Schema.Finite),
    displayType: Loose(Schema.Finite),
    isSub: Loose(Schema.Boolean),
    likedCount: Loose(Schema.Finite),
    onSale: Loose(Schema.Boolean),
    paid: Loose(Schema.Boolean),
    sales: Loose(Schema.Finite),
    shareCount: Loose(Schema.Finite),
    subCount: Loose(Schema.Finite),
    subTime: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const albumDetailDynamic: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/album/detail/dynamic`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'album_detail_dynamic',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 专辑动态信息
 */
export default albumDetailDynamic;
