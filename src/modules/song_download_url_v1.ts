import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import { decodeUpstreamBody, UpstreamObject } from '../core/upstream-body.ts';
import { SongUrlData } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  id: NumberId;
  // 文档列出 standard 到 jymaster 的音质名，但模块不按 level 分支，保留不透明字符串。
  level: string;
};

const inputSchema = Schema.Struct({
  id: NumberId,
  level: Schema.String,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

// 通到下载地址的路径、`id` / `url` / `code` 收紧；其余字段宽松。
// 匿名下载会员歌录到 -105，无版权录到 -110，均无地址；下载录制里 freeTrialInfo 都是 null，按宽松字段声明
// （与播放地址共用结构），不据此假定下载接口会给试听片段。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: SongUrlData,
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/song/enhance/download/url/v1',
    profile: 'eapi',
    semantic: 'read',
    cache: 'none',
    retry: 'connect',
  },
} as const satisfies ModuleActions;

const songDownloadUrlV1: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.id,
      immerseType: 'c51',
      level: query.level,
    };
    const response = yield* request('read', { data });
    const body = yield* decodeUpstreamBody(
      'song_download_url_v1',
      ModuleBody,
      response,
    );
    return {
      ...toModuleResponse(response),
      body,
    };
  });

/**
 * 获取客户端歌曲下载链接 - v1
 * 此版本不再采用 br 作为音质区分的标准
 * 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断
 */
export default songDownloadUrlV1;
