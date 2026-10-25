import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 偏好文案里的占位符条目；`targetUrl` 在录制里只见过 `null`，没有声明。
const ReviewEntry = UpstreamObject({
  coverType: Loose(Schema.Finite),
  text: Loose(Schema.String),
  textType: Loose(Schema.Finite),
});

const ProfessionalReviews = UpstreamObject({
  pattern: Loose(Schema.Record(Schema.String, ReviewEntry)),
  templateContent: Loose(Schema.String),
});

const TagPortrait = UpstreamObject({
  dataTip: Loose(Schema.String),
  pattern: Loose(Schema.Record(Schema.String, ReviewEntry)),
  templateContent: Loose(Schema.String),
});

// 宽松容器里嵌着的歌曲：记录编号也宽松。`Song` 目前只有 `id` 收紧、已在下面覆盖；
// `Song` 新增收紧字段时这里要同步覆盖，否则整首歌会因为该字段被丢。
const LooseSong = UpstreamObject({
  ...Song.schema.fields,
  id: Loose(Schema.Finite),
});

const FavouriteSong = UpstreamObject({
  favouriteSong: Loose(LooseSong),
  markHeart: Loose(Schema.Finite),
});

// `playRate` 在录制里只见过 `null`，没有声明。
const StyleDetail = UpstreamObject({
  tagId: Schema.Finite,
  artistNum: Loose(Schema.String),
  colorDeep: Loose(Schema.String),
  colorShallow: Loose(Schema.String),
  cover: Loose(Schema.Array(Schema.String)),
  desc: Loose(Schema.String),
  enName: Loose(Schema.String),
  favouriteSong: Loose(FavouriteSong),
  level: Loose(Schema.Finite),
  name: Loose(Schema.String),
  parentNames: Loose(Schema.String),
  professionalReviews: Loose(ProfessionalReviews),
  songNum: Loose(Schema.String),
  tabs: Loose(Schema.Array(Schema.String)),
  tagPortrait: Loose(TagPortrait),
});

// 通到曲风详情的路径 `data` 可以没有（未知曲风 id 时是 `null`），曲风自己的编号 `data.tagId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Optional(StyleDetail),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const styleDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      tagId: query.tagId,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/style-tag/home/head`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'style_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风详情
 */
export default styleDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
