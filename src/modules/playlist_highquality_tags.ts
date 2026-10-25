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

const Tag = UpstreamObject({
  id: Schema.Finite,
  name: Loose(Schema.String),
  type: Loose(Schema.Finite),
  category: Loose(Schema.Finite),
  hot: Loose(Schema.Boolean),
});

// 通到精品歌单标签列表的路径 `tags` 和每个标签的编号收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    tags: Schema.Array(Tag),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistHighqualityTags: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/highquality/tags`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'playlist_highquality_tags',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 精品歌单 tags
 */
export default playlistHighqualityTags;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
