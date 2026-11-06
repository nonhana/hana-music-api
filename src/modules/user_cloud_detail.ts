import { Effect, Schema } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { LooseSong } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

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

const userCloudDetail: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (typeof query.id !== 'string') {
      return yield* new InvalidModuleInput({ message: 'id must be a string' });
    }
    const id = query.id.replace(/\s/g, '').split(',');
    const data = {
      songIds: id,
    };
    const result = yield* request(
      buildApiRequestIntent(
        `/api/v1/cloud/get/byids`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    return {
      ...toModuleResponse(result),
      body: yield* decodeUpstreamBody('user_cloud_detail', ModuleBody, result),
    };
  });

/**
 * 云盘数据详情
 */
export default userCloudDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
