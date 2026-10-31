import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const MonthDownloadRecord = UpstreamObject({
  firstTime: Loose(Schema.Finite),
  id: Schema.Finite,
  song: Loose(LooseSong),
  type: Loose(Schema.Finite),
});

// 返回码、本月下载记录列表的路径 `info` 和每条记录自己的编号 `info[].id` 收紧；内嵌歌曲 `song` 和展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    info: Schema.Array(MonthDownloadRecord),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songMonthdownlist: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '20',
      offset: query.offset || '0',
      total: 'true',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/member/song/monthdownlist`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'song_monthdownlist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 会员本月下载歌曲记录
 */
export default songMonthdownlist;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
