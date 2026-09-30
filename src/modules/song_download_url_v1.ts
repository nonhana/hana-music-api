import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const songDownloadUrlV1: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      immerseType: 'c51',
      level: query.level,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/song/enhance/download/url/v1`,
          data,
          createOption(query),
        ),
      ),
    );
  });

/**
 * 获取客户端歌曲下载链接 - v1
 * 此版本不再采用 br 作为音质区分的标准
 * 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断
 */
export default songDownloadUrlV1;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
