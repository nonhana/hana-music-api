import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const SimiArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  alg: Loose(Schema.String),
  fansCount: Loose(Schema.Finite),
});

// 通到相似歌手列表的路径 `artists` 和每个歌手的编号收紧；`alg`、`fansCount` 等其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    artists: Schema.Array(SimiArtist),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const simiArtist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      artistid: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/discovery/simiArtist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('simi_artist', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 相似歌手
 */
export default simiArtist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
