import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 收藏者就是接口要返回的记录，`userId` 在这里收紧；其余字段沿用 `PlaylistUser` 的宽松写法（`avatarDetail`、`experts` 在收藏者录制里只见过 `null`，仍保留在共享结构里）。
const Subscriber = UpstreamObject({
  ...PlaylistUser.schema.fields,
  userId: Schema.Finite,
  subscribeTime: Loose(Schema.Finite),
});

// 通到歌单收藏者列表的路径 `subscribers` 和每个收藏者自己的编号收紧；`total`、`more`、`reason` 是分页和降级提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    subscribers: Schema.Array(Subscriber),
    total: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
    reason: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistSubscribers: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/subscribers`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'playlist_subscribers',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 歌单收藏者
 */
export default playlistSubscribers;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
