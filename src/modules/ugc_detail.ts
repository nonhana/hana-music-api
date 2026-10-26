import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 返回码和贡献内容的路径 `data` 收紧；总条数 `data.total` 宽松；当前账号没有贡献，`data.wikiDetailResultVoList` 只见过空数组，元素类型未知，不声明，原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      total: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const ugcDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      auditStatus: query.auditStatus || '',
      //待审核:0 未采纳:-5 审核中:1 部分审核通过:4 审核通过:5
      //WAIT:0 REJECT:-5 AUDITING:1 PARTLY_APPROVED:4 PASS:5
      limit: query.limit || 10,
      offset: query.offset || 0,
      order: query.order || 'desc', //asc
      sortBy: query.sortBy || 'createTime',
      type: query.type || 1,
      //曲库纠错 ARTIST:1 ALBUM:2 SONG:3 MV:4 LYRIC:5 TLYRIC:6
      //曲库补充 ALBUM:101 MV:103
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/rep/ugc/detail`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('ugc_detail', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户贡献内容
 */
export default ugcDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
