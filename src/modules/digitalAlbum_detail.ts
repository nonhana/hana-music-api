import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import { ModuleBody as AlbumDetailBody } from './album_detail.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/vipmall/albumproduct/detail',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 通到数字专辑商品详情（上游 `/api/vipmall/albumproduct/detail`）的路径 `album`、`product` 和专辑自己的编号 `album.albumId` 收紧，返回码为 200；与 `album_detail` 共用同一个上游接口和 `AlbumDetailBody`。
export const ModuleBody = AlbumDetailBody;
export type ModuleBody = typeof ModuleBody.Type;

const digitalAlbumDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody(
      'digitalAlbum_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 数字专辑详情
 */
export default digitalAlbumDetail;
