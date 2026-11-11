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
import { LyricUser } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// `LyricPart` 只有本模块使用，按三模块门槛留在本地。
const LyricPart = UpstreamObject({
  lyric: Loose(Schema.String),
  version: Loose(Schema.Finite),
});

// 通到歌词的路径 `lrc` 和 `lrc.lyric` 收紧，没收录时 lyric 是“暂无歌词”；其余歌词形式、贡献者和标记全部宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    lrc: UpstreamObject({
      lyric: Schema.String,
      version: Loose(Schema.Finite),
    }),
    klyric: Loose(LyricPart),
    tlyric: Loose(LyricPart),
    romalrc: Loose(LyricPart),
    lyricUser: Loose(LyricUser),
    transUser: Loose(LyricUser),
    sgc: Loose(Schema.Boolean),
    sfy: Loose(Schema.Boolean),
    qfy: Loose(Schema.Boolean),
    pureMusic: Loose(Schema.Boolean),
    needDesc: Loose(Schema.Boolean),
    uncollected: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/song/lyric',
    profile: 'eapi',
    semantic: 'read',
    cache: 'shared',
    retry: 'read',
  },
} as const satisfies ModuleActions;

const lyric: ModuleEffect<ModuleInput, ModuleBody, typeof moduleActions> = (
  input,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request('read', {
      data: {
        id: input.id,
        tv: -1,
        lv: -1,
        rv: -1,
        kv: -1,
        _nmclfl: 1,
      },
    });
    const body = yield* decodeUpstreamBody('lyric', ModuleBody, response);
    return {
      ...toModuleResponse(response),
      body,
    };
  });

export default lyric;
