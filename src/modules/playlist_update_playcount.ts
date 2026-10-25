import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 成功返回只收紧返回码 `code`。缺少 `id` 时上游回 HTTP 400，网易云把 400 归一成 `status: 200`
// 且正文是空字符串，空字符串作为独立分支声明，避免把非对象正文误当成功对象。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({ code: Schema.Literal(200) }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistUpdatePlaycount: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/update/playcount`,
        data,
        createOption(query),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_update_playcount',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 歌单打卡
 */
export default playlistUpdatePlaycount;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
