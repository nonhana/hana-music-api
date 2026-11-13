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
import { PlaylistSummary } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id?: NumberId;
  idx?: NaturalValue;
};

const inputSchema = Schema.Struct({
  id: Schema.optional(NumberId),
  idx: Schema.optional(NaturalValue),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const Playlist = UpstreamObject({
  ...PlaylistSummary.schema.fields,
  trackIds: Schema.Array(
    UpstreamObject({
      id: Schema.Finite,
    }),
  ),
});

const RejectedBody = UpstreamObject({
  code: Schema.Literal(500),
  msg: Loose(Schema.String),
});

// 通到榜单详情歌单的路径 `playlist`、歌单与 `trackIds` 的编号收紧；本地 `idx` 拒绝分支的返回码也在这里声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  Schema.Union([
    UpstreamObject({
      code: Schema.Literal(200),
      playlist: Playlist,
    }),
    RejectedBody,
  ]),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/playlist/v4/detail',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const topList: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (query.idx !== undefined) {
      const body: ModuleBody = {
        code: 500,
        msg: '不支持此方式调用,只支持id调用',
      };
      return { status: 500, cookie: [], body };
    }
    const response = yield* request('read', {
      data: {
        id: query.id,
        n: '500',
        s: '0',
      },
    });
    const body = yield* decodeUpstreamBody('top_list', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

export default topList;
