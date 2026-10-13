import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistOrderUpdate: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      ids: query.ids,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/order/update`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_order_update',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 编辑歌单顺序
 */
export default playlistOrderUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
