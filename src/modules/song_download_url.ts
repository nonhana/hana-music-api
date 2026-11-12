import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  IntegerValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { SongUrlData } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  br?: number;
  id: NumberId;
};

// 码率是正整数；旧实现把非法值 parseInt 成 NaN，这里直接拒绝。
const inputSchema = Schema.Struct({
  id: NumberId,
  br: Schema.optional(IntegerValue.check(Schema.isGreaterThan(0))),
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到下载地址的路径 `data`、`data.id` / `data.url` / `data.code` 收紧；其余字段宽松。
// 拿不到地址时 `data.url` 是 null：`data.code` 为 -105 表示会员限制，-110 在本批无版权录制里出现；
// 这些码也会出现在可播放/免费歌曲上，不能当作稳定映射。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SongUrlData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/song/enhance/download/url',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const songDownloadUrl: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      br: query.br ?? 999000,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'song_download_url',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 获取客户端歌曲下载链接
 */
export default songDownloadUrl;
