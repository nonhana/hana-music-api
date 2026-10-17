import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { USER_AGENT_MAP } from '../core/config.ts';
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

// 固定用官网的 weapi 网页身份：自称 pc/iphone 客户端会被单独拒绝，SDK 也无法提供收藏所需的一次性反作弊令牌（#32、#77）。
const webUserAgent = USER_AGENT_MAP.weapi.pc;

const playlistSubscribe: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const path = Number(query.t) === 1 ? 'subscribe' : 'unsubscribe';
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/${path}`,
        { id: query.id },
        createOption(query, 'weapi'),
      ),
    ).pipe(
      Effect.updateService(Call, (call) => ({
        ...call,
        config: { ...call.config, crypto: 'weapi' as const, ua: webUserAgent },
        identity: {
          ...call.identity,
          cookie: { ...call.identity.cookie, os: 'web' },
        },
      })),
    );
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_subscribe',
        ModuleBody,
        response,
      ),
    };
  });

export default playlistSubscribe;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
