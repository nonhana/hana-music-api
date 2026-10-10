import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  QueryIdentifier as Identifier,
} from '../core/module-input.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { IdentifierQuery } from '../types/module-shared.ts';

export type ModuleInput = IdentifierQuery & {
  level?:
    | 'standard'
    | 'higher'
    | 'exhigh'
    | 'lossless'
    | 'hires'
    | 'jyeffect'
    | 'sky'
    | 'jymaster';
};

const inputSchema = Schema.Struct({
  id: Identifier,
  level: Schema.optional(
    Schema.Literals([
      'standard',
      'higher',
      'exhigh',
      'lossless',
      'hires',
      'jyeffect',
      'sky',
      'jymaster',
    ]),
  ),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 无版权时 url 和 level 是 null、code 不是 200；试听时 freeTrialInfo 标出片段在整首里的起止秒数，否则是 null。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(
      UpstreamObject({
        id: Schema.Finite,
        url: Schema.NullOr(Schema.String),
        code: Schema.Finite,
        level: Schema.NullOr(Schema.String),
        expi: Schema.Finite,
        freeTrialInfo: Schema.NullOr(
          UpstreamObject({ start: Schema.Finite, end: Schema.Finite }),
        ),
      }),
    ),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const songUrlV1: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data: Record<string, unknown> = {
      ids: '[' + query.id + ']',
      level: query.level,
      encodeType: 'flac',
    };
    if (data.level === 'sky') {
      data.immerseType = 'c51';
    }
    const response = yield* request(
      buildApiRequestIntent(
        `/api/song/enhance/player/url/v1`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody('song_url_v1', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲链接 - v1
 * 此版本不再采用 br 作为音质区分的标准
 * 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断
 */
export default songUrlV1;
