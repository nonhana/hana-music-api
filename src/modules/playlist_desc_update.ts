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

const playlistDescUpdate: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      desc: query.desc,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/desc/update`,
        data,
        createOption(query),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_desc_update',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 更新歌单描述
 */
export default playlistDescUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
