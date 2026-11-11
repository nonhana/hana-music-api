import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

// 返回码、新歌单的路径和编号收紧；`playlist.tracks[].id` 是记录里套着的编号，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    id: Schema.Finite,
    playlist: PlaylistSummary,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export type ModuleInput = {
  name: string;
  privacy?: 0 | 10;
  type?: 'NORMAL' | 'VIDEO' | 'SHARED';
};

const inputSchema = Schema.Struct({
  name: Schema.String,
  privacy: Schema.optional(NumberLiterals([0, 10])),
  type: Schema.optional(Schema.Literals(['NORMAL', 'VIDEO', 'SHARED'])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  create: {
    target: '/api/playlist/create',
    profile: 'web',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistCreate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      name: query.name,
      privacy: query.privacy || '0', // 0 普通歌单, 10 隐私歌单
      type: query.type || 'NORMAL', // 默认 NORMAL, VIDEO 视频歌单, SHARED 共享歌单
    };
    const response = yield* request('create', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('playlist_create', ModuleBody, response),
    };
  });

/**
 * 创建歌单
 */
export default playlistCreate;
