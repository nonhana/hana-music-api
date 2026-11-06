import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 成功返回只承诺返回码，收紧的是返回码；401/404 业务拒绝原样转交。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({ code: Schema.Literal(200) }),
);
export type ModuleBody = typeof ModuleBody.Type;

const playlistTrackAdd: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (
      query.ids !== undefined &&
      query.ids !== null &&
      typeof query.ids !== 'string' &&
      typeof query.ids !== 'number' &&
      typeof query.ids !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'ids must be a primitive value',
      });
    }
    const ids = String(query.ids ?? '');
    const data = {
      id: query.pid,
      tracks: JSON.stringify(
        ids.split(',').map((item: string) => ({ type: 3, id: item })),
      ),
    };

    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/track/add`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_track_add',
        ModuleBody,
        response,
      ),
    };
  });

export default playlistTrackAdd;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
