import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import { SongUrlData } from './song_url_v1.ts';

// 通到下载地址的路径、`id` / `url` / `code` 收紧；其余字段宽松。
// 匿名下载会员歌录到 -105，无版权录到 -110，均无地址；下载录制里 freeTrialInfo 都是 null，按宽松字段声明
// （与播放地址共用结构），不据此假定下载接口会给试听片段。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SongUrlData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songDownloadUrlV1: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      immerseType: 'c51',
      level: query.level,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/song/enhance/download/url/v1`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_download_url_v1',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 获取客户端歌曲下载链接 - v1
 * 此版本不再采用 br 作为音质区分的标准
 * 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断
 */
export default songDownloadUrlV1;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
