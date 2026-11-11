import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist, StylePage } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  tagId: NumberId;
  cursor?: NaturalValue;
  size?: NaturalValue;
};

const inputSchema = Schema.Struct({
  tagId: NumberId,
  cursor: Schema.optional(NaturalValue),
  size: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 曲风歌手列表里的歌迷数只是附带信息；`awardTags` 在录制里只见过 `null`，没有声明。
const StyleArtist = UpstreamObject({
  ...Artist.schema.fields,
  id: Schema.Finite,
  fansCount: Loose(Schema.Finite),
});

// 通到曲风歌手列表的路径 `data.artists` 和每个歌手的编号 `data.artists[].id` 收紧；`data.page` 是分页提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      artists: Schema.Array(StyleArtist),
      page: Loose(StylePage),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/style-tag/home/artist',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const styleArtist: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      cursor: query.cursor || 0,
      size: query.size || 20,
      tagId: query.tagId,
      sort: 0,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'style_artist',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风-歌手
 */
export default styleArtist;
