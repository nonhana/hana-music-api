import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { SongUrlData } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到下载地址的路径 `data`、`data.id` / `data.url` / `data.code` 收紧；其余字段宽松。
// 拿不到地址时 `data.url` 是 null：`data.code` 为 -105 表示会员限制，-110 在本批无版权录制里出现；
// 这些码也会出现在可播放/免费歌曲上，不能当作稳定映射。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SongUrlData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songDownloadUrl: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (
      query.br !== undefined &&
      query.br !== null &&
      typeof query.br !== 'string' &&
      typeof query.br !== 'number' &&
      typeof query.br !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'br must be a primitive value',
      });
    }
    const data = {
      id: query.id,
      br: parseInt(String(query.br || 999000)),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/song/enhance/download/url`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_download_url',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取客户端歌曲下载链接
 */
export default songDownloadUrl;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
