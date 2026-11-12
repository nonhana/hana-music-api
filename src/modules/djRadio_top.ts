import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
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

export type ModuleInput = {
  dataGapDays?: 7 | 30 | 90;
  dataType?: number;
  djRadioId?: NumberId;
  sortIndex?: 1 | 2 | 3 | 4 | 5;
};

const inputSchema = Schema.Struct({
  dataGapDays: Schema.optional(NumberLiterals([7, 30, 90])),
  dataType: Schema.optional(NaturalValue),
  djRadioId: Schema.optional(NumberId),
  sortIndex: Schema.optional(NumberLiterals([1, 2, 3, 4, 5])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'eapi',
    target: '/api/expert/worksdata/works/top/get',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

// 成功返回只收紧返回码 `code`；`message` 宽松。`data` 是通到电台作品榜的路径，但本账号的一次登录录制里
// 始终是空数组，元素类型无法确认，未声明并原样透传。非法参数时上游返回 HTTP 400，网易云把 400 归一成
// `status: 200` 且正文是空字符串，空字符串作为独立分支声明，避免把非对象正文误当成功对象。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      message: Loose(Schema.String),
    }),
    Schema.Literal(''),
  ]).annotate({ expected: 'object with code 200 or an empty string' }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djRadioTop: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      djRadioId: query.djRadioId || null, // 电台id
      sortIndex: query.sortIndex || 1, // 排序 1:播放数 2:点赞数 3：评论数 4：分享数 5：收藏数
      dataGapDays: query.dataGapDays || 7, // 天数 7:一周 30:一个月 90:三个月
      dataType: query.dataType || 3, // 未知
    };
    const response = yield* request('request', { data });
    const body = yield* decodeUpstreamBody('djRadio_top', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台排行榜获取
 */
export default djRadioTop;
