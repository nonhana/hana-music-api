import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  Optional,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { tagId: NumberId };

const inputSchema = Schema.Struct({ tagId: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

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

export const moduleActions = {
  read: {
    target: '/api/style-tag/home/head',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const styleDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      tagId: query.tagId,
    };
    const response = yield* request('read', { data });
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
