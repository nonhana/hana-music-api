import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberLiterals,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

// auditStatus、type 的取值由模块原有的上游枚举注释穷举；sortBy 没有穷举，保留字符串。
export type ModuleInput = {
  auditStatus?: -5 | 0 | 1 | 4 | 5;
  limit?: NaturalValue;
  offset?: NaturalValue;
  order?: 'asc' | 'desc';
  sortBy?: string;
  type?: 1 | 2 | 3 | 4 | 5 | 6 | 101 | 103;
};

const inputSchema = Schema.Struct({
  auditStatus: Schema.optional(NumberLiterals([-5, 0, 1, 4, 5])),
  limit: Schema.optional(NaturalValue),
  offset: Schema.optional(NaturalValue),
  order: Schema.optional(Schema.Literals(['asc', 'desc'])),
  sortBy: Schema.optional(Schema.String),
  type: Schema.optional(NumberLiterals([1, 2, 3, 4, 5, 6, 101, 103])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

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

export const moduleActions = {
  read: {
    target: '/api/rep/ugc/detail',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const ugcDetail: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
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
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('ugc_detail', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 用户贡献内容
 */
export default ugcDetail;
