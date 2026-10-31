import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Playlist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  trackIds: Schema.Array(
    UpstreamObject({
      id: Schema.Finite,
    }),
  ),
});

const RejectedBody = UpstreamObject({
  code: Schema.Literal(500),
  msg: Loose(Schema.String),
});

// 通到榜单详情歌单的路径 `playlist`、歌单与 `trackIds` 的编号收紧；本地 `idx` 拒绝分支的返回码也在这里声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      playlist: Playlist,
    }),
    RejectedBody,
  ]),
);
export type ModuleBody = typeof ModuleBody.Type;

const topList: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    if (query.idx) {
      const body: ModuleBody = {
        code: 500,
        msg: '不支持此方式调用,只支持id调用',
      };
      return { status: 500, cookie: [], body };
    }
    const response = yield* request(
      buildApiRequestIntent(
        '/api/playlist/v4/detail',
        { id: query.id, n: '500', s: '0' },
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody('top_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default topList;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
