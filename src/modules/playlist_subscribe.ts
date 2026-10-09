import { Effect } from 'effect';

import { Call } from '../core/call.ts';
import { OS_PROFILES } from '../core/config.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 2026-10-09 真账号实测（#32）：设备身份是 pc，或带上写死的反作弊 token 时，
// 网易云对收藏、取消收藏一律回 405“操作过于频繁”；换成 iPhone 设备身份、请求体只带 id 才成功。
const { appver, channel, osver } = OS_PROFILES.iphone;

const playlistSubscribe: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const path = Number(query.t) === 1 ? 'subscribe' : 'unsubscribe';
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/playlist/${path}`,
          { id: query.id },
          createOption(query, 'eapi'),
        ),
      ).pipe(
        Effect.updateService(Call, (call) => ({
          ...call,
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
      ),
    );
  });

export default playlistSubscribe;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
