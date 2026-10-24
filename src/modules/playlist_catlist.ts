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

const Category = UpstreamObject({
  activity: Loose(Schema.Boolean),
  category: Loose(Schema.Finite),
  hot: Loose(Schema.Boolean),
  imgId: Loose(Schema.Finite),
  name: Schema.String,
  resourceCount: Loose(Schema.Finite),
  resourceType: Loose(Schema.Finite),
  type: Loose(Schema.Finite),
});

// 通到分类的路径收紧；分类没有编号，靠 `name` 来认，所以 `name` 也收紧。
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
