import { Effect } from 'effect';

import { Call } from '../core/call.ts';
import { OS_PROFILES, USER_AGENT_MAP } from '../core/config.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 局限（#32 落地、#33 跟进）：网易云拒绝以 pc 设备身份或带写死的反作弊 token 发出的收藏，一律回 405“操作过于频繁”，
// 所以这里不论调用方配置如何，都固定用 iPhone 客户端的 os、appver、osver、channel 和 User-Agent，请求体只带 id。
// 这套写法 2026-10-09 只成功过一次收藏和一次取消，之后同一账号所有收藏都回 405、原因未查清；
// 取消收藏没有在 pc 身份下测过，收藏自己的歌单时网易云的说明也没有录到。
const { appver, channel, osver } = OS_PROFILES.iphone;
const iphoneUserAgent = USER_AGENT_MAP.api.iphone;

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
      ),
    );
  });

export default playlistSubscribe;
export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
