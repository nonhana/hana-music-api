import { Effect, Schema } from 'effect';

import type { ModuleActions } from '../core/request-actions.ts';
import { buildActionRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const SearchDefaultData = UpstreamObject({
  showKeyword: Schema.String,
  realkeyword: Schema.String,
  styleKeyword: Loose(
    UpstreamObject({
      keyWord: Loose(Schema.String),
    }),
  ),
  action: Loose(Schema.Finite),
  alg: Loose(Schema.String),
  bizQueryInfo: Loose(Schema.String),
  gap: Loose(Schema.Finite),
  searchType: Loose(Schema.Finite),
});

// 通到默认搜索关键词的路径 `data`；`showKeyword`（展示词）和 `realkeyword`（实际搜索词）是接口要返回的那一项。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SearchDefaultData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/search/defaultkeyword/get',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const searchDefault: ModuleEffect<ModuleInput, ModuleBody> = (
  _query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildActionRequestIntent('read', moduleActions.read, {}),
    );
    const body = yield* decodeUpstreamBody(
      'search_default',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 默认搜索关键词
 */
export default searchDefault;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
