import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Category = UpstreamObject({
  activity: Schema.Boolean,
  category: Schema.Finite,
  hot: Schema.Boolean,
  imgId: Schema.Finite,
  imgUrl: Schema.NullOr(Schema.String),
  name: Schema.String,
  resourceCount: Schema.Finite,
  resourceType: Schema.Finite,
  type: Schema.Finite,
});

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    all: Category,
    categories: Schema.Record(Schema.String, Schema.String),
    sub: Schema.Array(Category),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistCatlist: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/catalogue`,
        {},
        createOption(query, 'eapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('playlist_catlist', ModuleBody, response),
    };
  });

/**
 * 全部歌单分类
 */
export default playlistCatlist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
