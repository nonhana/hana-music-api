import { Effect, Schema } from 'effect';

import { decodeModuleInput as decodeInput } from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

// 通到某天历史每日推荐的 `data.songs` 和每首歌的 `id` 收紧；`data.dates` 只见过空数组、
// `data.description` 只见过 null，未声明并原样保留。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      songs: Schema.Array(Song),
      purchaseUrl: Loose(Schema.String),
      noHistoryMessage: Loose(Schema.String),
    }),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/discovery/recommend/songs/history/detail',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  date?: string;
};

const inputSchema = Schema.Struct({
  date: Schema.optional(Schema.String),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const historyRecommendSongsDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      date: query.date || '',
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'history_recommend_songs_detail',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 历史每日推荐歌曲详情
 */
export default historyRecommendSongsDetail;
