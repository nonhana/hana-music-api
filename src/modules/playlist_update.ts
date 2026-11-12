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
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

const RouteResult = UpstreamObject({
  code: Schema.Finite,
  message: Loose(Schema.String),
});

// `/api/batch` 的返回码和三条子路由的返回码收紧；子路由的说明宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    '/api/playlist/desc/update': RouteResult,
    '/api/playlist/tags/update': RouteResult,
    '/api/playlist/update/name': RouteResult,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

// 标签成员去掉分号分隔符后不能为空，空数组表示清空标签。
const Tag = Schema.declare<string>(
  (value): value is string =>
    typeof value === 'string' && value.length > 0 && !value.includes(';'),
);

export type ModuleInput = {
  id: NumberId;
  name: string;
  desc?: string;
  tags?: ReadonlyArray<string>;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  name: Schema.String,
  desc: Schema.optional(Schema.String),
  tags: Schema.optional(Schema.Array(Tag)),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  batch: {
    target: '/api/batch',
    profile: 'eapi',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistUpdate: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const id = String(query.id);
    const desc = query.desc || '';
    const tags = query.tags?.join(';') ?? '';
    const data = {
      '/api/playlist/desc/update': `{"id":${id},"desc":${JSON.stringify(desc)}}`,
      '/api/playlist/tags/update': `{"id":${id},"tags":${JSON.stringify(tags)}}`,
      '/api/playlist/update/name': `{"id":${id},"name":${JSON.stringify(query.name)}}`,
    };
    const response = yield* request('batch', { data });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody('playlist_update', ModuleBody, response),
    };
  });

/**
 * 编辑歌单
 */
export default playlistUpdate;
