import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong, PrivateCloud } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const CloudEntry = UpstreamObject({
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
  privateCloud: Loose(PrivateCloud),
  simpleSong: Loose(LooseSong),
  songName: Loose(Schema.String),
  version: Loose(Schema.Finite),
});

// 返回码、云盘列表 `data` 和每条云盘记录自己的 `songId` 收紧；其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Schema.Array(CloudEntry),
    count: Loose(Schema.Finite),
    hasMore: Loose(Schema.Boolean),
    maxSize: Loose(Schema.Finite),
    size: Loose(Schema.Finite),
    updateTime: Loose(Schema.Finite),
    upgradeSign: Loose(Schema.Finite),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const userCloud: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || 30,
      offset: query.offset || 0,
    };
    const result = yield* request(
      buildApiRequestIntent(
        `/api/v1/cloud/get`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_cloud', ModuleBody, result),
    };
  });

/**
 * 云盘数据
 */
export default userCloud;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
