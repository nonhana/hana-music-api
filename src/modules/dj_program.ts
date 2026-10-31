import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { DjProgram } from '../core/upstream-schemas.ts';
import { toBoolean } from '../core/utils.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 通到节目列表的路径 `programs` 和每个节目自己的编号 `programs[].id` 收紧；总数、`more` 和节目其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    programs: Schema.Array(DjProgram),
    count: Loose(Schema.Finite),
    more: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const djProgram: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    if (
      query.asc !== undefined &&
      typeof query.asc !== 'boolean' &&
      typeof query.asc !== 'number' &&
      typeof query.asc !== 'string'
    ) {
      return yield* new InvalidModuleInput({
        message: 'asc must be a boolean, number or string',
      });
    }
    const data = {
      radioId: query.rid,
      limit: query.limit || 30,
      offset: query.offset || 0,
      asc: toBoolean(query.asc),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/dj/program/byradio`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('dj_program', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 电台节目列表
 */
export default djProgram;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
