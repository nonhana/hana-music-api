import { Effect, Schema } from 'effect';

import { Call } from '../core/call.ts';
import { OS_PROFILES, USER_AGENT_MAP } from '../core/config.ts';
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

// 固定使用已通过真账号收藏及取消验证的 iPhone 身份；PC UA + os=pc 对照仍返回 405（#33）。
const { appver, channel, osver } = OS_PROFILES.iphone;
const iphoneUserAgent = USER_AGENT_MAP.api.iphone;

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
        createOption(query, 'eapi'),
      ),
    ).pipe(
      Effect.updateService(Call, (call) => ({
        ...call,
        config: { ...call.config, ua: iphoneUserAgent },
        identity: {
          ...call.identity,
          cookie: {
            ...call.identity.cookie,
            os: 'iphone',
            appver,
            channel,
            osver,
          },
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
