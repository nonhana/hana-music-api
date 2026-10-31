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

const Country = UpstreamObject({
  code: Schema.String,
  en: Loose(Schema.String),
  locale: Loose(Schema.String),
  zh: Loose(Schema.String),
});

const CountryGroup = UpstreamObject({
  label: Loose(Schema.String),
  countryList: Schema.Array(Country),
});

// 返回码、国家分组 `data`、每组国家记录 `countryList` 和国家记录自己的编码 `code` 收紧；分组名 `label`、`zh`、`en`、`locale` 和 `message` 宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(CountryGroup),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const countriesCodeList: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(`/api/lbs/countries/v1`, data, createOption(query)),
    );
    const body = yield* decodeUpstreamBody(
      'countries_code_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 国家编码列表
 */
export default countriesCodeList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
