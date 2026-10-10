import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 无版权时 url 和 level 是 null、code 不是 200（录制里是 -110）；录制里没有试听的返回，freeTrialInfo 不声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      id: Schema.Finite,
      url: Schema.NullOr(Schema.String),
      code: Schema.Finite,
      level: Schema.NullOr(Schema.String),
      size: Schema.Finite,
    }),
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
