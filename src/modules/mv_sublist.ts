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

const VideoCreator = UpstreamObject({
  userId: Loose(Schema.Finite),
  userName: Loose(Schema.String),
});

const SubscribedVideo = UpstreamObject({
  aliaName: Loose(Schema.String),
  coverUrl: Loose(Schema.String),
  creator: Loose(Schema.Array(VideoCreator)),
  durationms: Loose(Schema.Finite),
  markTypes: Loose(Schema.Array(Schema.Finite)),
  playTime: Loose(Schema.Finite),
  title: Loose(Schema.String),
  transName: Loose(Schema.String),
  type: Loose(Schema.Finite),
  vid: Schema.String,
});

// 通到已收藏 MV 列表的路径 `data` 和视频自己的编号 `data[].vid` 收紧；匿名时是空数组，`count`/`hasMore` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    count: Loose(Schema.Finite),
    data: Schema.Array(SubscribedVideo),
    hasMore: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvSublist: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 25,
      offset: query.offset || 0,
      total: true,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/cloudvideo/allvideo/sublist`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('mv_sublist', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 已收藏MV列表
 */
export default mvSublist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
