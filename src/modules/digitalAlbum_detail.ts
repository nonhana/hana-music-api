import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import { ModuleBody as AlbumDetailBody } from './album_detail.ts';

// 通到数字专辑商品详情（上游 `/api/vipmall/albumproduct/detail`）的路径 `album`、`product` 和专辑自己的编号 `album.albumId` 收紧，返回码为 200；与 `album_detail` 共用同一个上游接口和 `AlbumDetailBody`。
// 输入仍是 legacy，不做 id 本地校验。
export const ModuleBody = AlbumDetailBody;
export type ModuleBody = typeof ModuleBody.Type;

const digitalAlbumDetail: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/vipmall/albumproduct/detail`,
        data,
        createOption(query, 'weapi'),
      ),
    );
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
