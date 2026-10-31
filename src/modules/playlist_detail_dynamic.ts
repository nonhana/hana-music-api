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

// 接口就是为了拿这张歌单的评论数、收藏数、播放数和分享数，正文没有要收紧的路径，只有返回码收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    bookedCount: Loose(Schema.Finite),
    commentCount: Loose(Schema.Finite),
    followed: Loose(Schema.Boolean),
    gradeStatus: Loose(Schema.String),
    playCount: Loose(Schema.Finite),
    shareCount: Loose(Schema.Finite),
    subscribed: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistDetailDynamic: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      n: 100000,
      s: query.s || 8,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/detail/dynamic`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'playlist_detail_dynamic',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌单动态信息
 */
export default playlistDetailDynamic;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
