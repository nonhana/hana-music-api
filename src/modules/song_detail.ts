import * as Effect from 'effect/Effect';
import * as Schema from 'effect/Schema';

import {
  decodeModuleInput as decodeInput,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import type { BodyType } from '../core/upstream-body.ts';
import {
  decodeUpstreamBody,
  defineModuleBody,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Song, SongPrivilege } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { ids: NumberIdList };

const inputSchema = Schema.Struct({ ids: NumberIdList });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到歌曲和权限列表的路径、每首歌和每条权限的编号收紧；其余字段宽松。
export const ModuleBody = /* @__PURE__ */ defineModuleBody(
  UpstreamObject({
    code: Schema.Literal(200),
    songs: Schema.Array(Song),
    privileges: Schema.Array(SongPrivilege),
  }),
);
export type ModuleBody = BodyType<typeof ModuleBody>;

export const moduleActions = {
  read: {
    target: '/api/v3/song/detail',
    profile: 'web',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const songDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (input, request) =>
  Effect.gen(function* () {
    const response = yield* request('read', {
      data: {
        c: `[${input.ids.map((id) => `{"id":${String(id)}}`).join(',')}]`,
      },
    });
    const body = yield* decodeUpstreamBody('song_detail', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

export default songDetail;
