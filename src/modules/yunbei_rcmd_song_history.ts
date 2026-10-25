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

const Page = UpstreamObject({
  more: Loose(Schema.Boolean),
});

// 返回码和推歌历史路径 `data` 收紧；`data.records` 只录到空数组，元素类型未知，未声明并原样透传；
// 分页对象 `page` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      page: Loose(Page),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const yunbeiRcmdSongHistory: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      page: JSON.stringify({
        size: query.size || 20,
        cursor: query.cursor || '',
      }),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/yunbei/rcmd/song/history/list`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'yunbei_rcmd_song_history',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 云贝推歌历史记录
 */
export default yunbeiRcmdSongHistory;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
