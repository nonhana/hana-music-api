import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { UnknownJson } from '../types/unknown.ts';

// 上游文档列出的资源类型；空串沿用模块原有的“取默认 song”行为。
const ShareType = Schema.Literals([
  'song',
  'playlist',
  'mv',
  'djradio',
  'djprogram',
  'album',
  'noresource',
  '',
]);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/share/friends/resource',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  id?: NumberId;
  type?: typeof ShareType.Type;
  msg?: string;
};

const inputSchema = Schema.Struct({
  id: Schema.optional(NumberId),
  type: Schema.optional(ShareType),
  msg: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const shareResource: ModuleEffect<
  ModuleInput,
  UnknownJson,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      type: query.type || 'song', // song,playlist,mv,djprogram,djradio,noresource
      msg: query.msg || '',
      id: query.id || '',
    };
    const response = yield* request('request', { data });
    return toModuleResponse(response);
  });

/**
 * 分享歌曲到动态
 */
export default shareResource;
