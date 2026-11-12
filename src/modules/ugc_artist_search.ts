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
import type { ModuleEffect } from '../types/index.ts';

// 上游同一个 keyword 参数既接受文本关键字，也接受歌手 id。
export type ModuleInput = {
  keyword: NumberId | string;
  limit?: NaturalValue;
};

const inputSchema = Schema.Struct({
  keyword: Schema.Union([Schema.String, NumberId]),
  limit: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const SearchedArtist = UpstreamObject({
  artistId: Schema.Finite,
  artistAvatarPicUrl: Loose(Schema.String),
  artistName: Loose(Schema.String),
});

// 返回码、搜索结果 `data` 和结果列表 `data.list` 收紧，每条结果自己的编号 `data.list[].artistId` 也收紧；没有结果时 `list` 是空数组；总数和关键字回显宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      list: Schema.Array(SearchedArtist),
      totalCount: Loose(Schema.Finite),
    }),
    msg: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/rep/ugc/artist/search',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const ugcArtistSearch: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      keyword: query.keyword,
      limit: query.limit || 40,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'ugc_artist_search',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 搜索歌手
 * 可传关键字或者歌手id
 */
export default ugcArtistSearch;
