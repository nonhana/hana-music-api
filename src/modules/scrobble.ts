import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回 200 不代表计入了听歌排行（验证关卡①实测没有计入，见 nonhana/hana-music-api#31）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const scrobble: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      logs: JSON.stringify([
        {
          action: 'play',
          json: {
            download: 0,
            end: 'playend',
            id: query.id,
            sourceId: query.sourceid,
            time: query.time,
            type: 'song',
            wifi: 0,
            source: 'list',
            mainsite: 1,
            content: '',
          },
        },
      ]),
    };

    const response = yield* request(
      buildApiRequestIntent(
        `/api/feedback/weblog`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('scrobble', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 听歌打卡
 */
export default scrobble;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
