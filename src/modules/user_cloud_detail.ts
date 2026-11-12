import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NumberIdList,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';

const CloudDetailEntry = UpstreamObject({
  songId: Schema.Finite,
  addTime: Loose(Schema.Finite),
  album: Loose(Schema.String),
  artist: Loose(Schema.String),
  bitrate: Loose(Schema.Finite),
  cover: Loose(Schema.Finite),
  coverId: Loose(Schema.String),
  fileName: Loose(Schema.String),
  fileSize: Loose(Schema.Finite),
  lyricId: Loose(Schema.String),
  matchType: Loose(Schema.String),
  pcId: Loose(Schema.Finite),
  simpleSong: Loose(LooseSong),
  songName: Loose(Schema.String),
  version: Loose(Schema.Finite),
});

// 返回码、云盘歌曲列表 `data` 和每条记录自己的 `songId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(CloudDetailEntry),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export const moduleActions = {
  read: {
    target: '/api/v1/cloud/get/byids',
    profile: 'web',
    semantic: 'read',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

export type ModuleInput = {
  ids: NumberIdList;
};

const inputSchema = Schema.Struct({
  ids: NumberIdList,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

const userCloudDetail: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      songIds: query.ids.map(String),
    };
    const result = yield* request('read', { data });
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_cloud_detail', ModuleBody, result),
    };
  });

/**
 * 云盘数据详情
 */
export default userCloudDetail;
