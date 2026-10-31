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

// 独家放送条目：编号收紧，`url` 在录制里是空串，仍按 string 宽松声明。
const Privatecontent = UpstreamObject({
  id: Schema.Finite,
  alg: Loose(Schema.String),
  copywriter: Loose(Schema.String),
  name: Loose(Schema.String),
  picUrl: Loose(Schema.String),
  sPicUrl: Loose(Schema.String),
  type: Loose(Schema.Finite),
  url: Loose(Schema.String),
});

// 通到独家放送的路径 `result` 和每条内容自己的编号 `result[].id` 收紧；`name` 和条目其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    result: Schema.Array(Privatecontent),
    name: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const personalizedPrivatecontent: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/personalized/privatecontent`,
        {},
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'personalized_privatecontent',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 独家放送
 */
export default personalizedPrivatecontent;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
