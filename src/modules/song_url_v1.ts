import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { SongUrlData } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

const AudioLevel = Schema.Literals([
  'standard',
  'higher',
  'exhigh',
  'lossless',
  'hires',
  'jyeffect',
  'sky',
  'jymaster',
]);

export type ModuleInput = {
  ids: NumberIdList;
  level: typeof AudioLevel.Type;
};

const inputSchema = Schema.Struct({
  ids: NumberIdList,
  level: AudioLevel,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到播放地址的路径，以及 `id` / `url` / `code` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(SongUrlData),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/song/enhance/player/url/v1',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
  sky: {
    target: '/api/song/enhance/player/url/v1',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const songUrlV1: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data: Record<string, unknown> = {
      ids: JSON.stringify(query.ids.map(String)),
      level: query.level,
      encodeType: 'flac',
    };
    if (data.level === 'sky') {
      data.immerseType = 'c51';
    }
    const action = query.level === 'sky' ? 'sky' : 'read';
    const response = yield* request(action, { data });
    const body = yield* decodeUpstreamBody('song_url_v1', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 歌曲链接 - v1
 * 此版本不再采用 br 作为音质区分的标准
 * 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断
 */
export default songUrlV1;
