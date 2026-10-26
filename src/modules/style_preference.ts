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

const TagPreference = UpstreamObject({
  tagId: Schema.Finite,
  tagName: Loose(Schema.String),
  ratio: Loose(Schema.String),
  picUrl: Loose(Schema.String),
});

const styleTagFields = {
  tagId: Loose(Schema.Finite),
  tagName: Loose(Schema.String),
  enName: Loose(Schema.String),
  level: Loose(Schema.Finite),
  picUrl: Loose(Schema.String),
  colorDeep: Loose(Schema.String),
  colorShallow: Loose(Schema.String),
  link: Loose(Schema.String),
  showText: Loose(Schema.String),
  tabs: Loose(Schema.Array(Schema.String)),
};

const StyleTagChild = UpstreamObject(styleTagFields);
const StyleTagMiddle = UpstreamObject({
  ...styleTagFields,
  childrenTags: Loose(Schema.Array(StyleTagChild)),
});
const StyleTag = UpstreamObject({
  ...styleTagFields,
  childrenTags: Loose(Schema.Array(StyleTagMiddle)),
});

// 返回码、曲风偏好列表 data.tagPreferenceVos 及其 tagId 收紧；偏好列表就是接口要返回的东西，data.tags 曲风树和比例等展示信息宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      tagPreferenceVos: Schema.Array(TagPreference),
      tags: Loose(Schema.Array(StyleTag)),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const stylePreference: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {};
    const response = yield* request(
      buildApiRequestIntent(
        `/api/tag/my/preference/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'style_preference',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风偏好
 */
export default stylePreference;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
