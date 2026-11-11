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
import { Song, StylePage } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  tagId: NumberId;
  cursor?: NaturalValue;
  size?: NaturalValue;
  sort?: 0 | 1;
};

const inputSchema = Schema.Struct({
  tagId: NumberId,
  cursor: Schema.optional(NaturalValue),
  size: Schema.optional(NaturalValue),
  sort: Schema.optional(NumberLiterals([0, 1])),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到曲风歌曲列表的路径 `data.songs` 和每首歌的编号 `data.songs[].id` 收紧；`data.page` 是分页提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      page: Loose(StylePage),
      songs: Schema.Array(Song),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/style-tag/home/song',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const styleSong: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      cursor: query.cursor || 0,
      size: query.size || 20,
      tagId: query.tagId,
      sort: query.sort || 0,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody('style_song', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * 曲风-歌曲
 */
export default styleSong;
