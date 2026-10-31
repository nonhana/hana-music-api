import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import { Artist } from '../core/upstream-schemas.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const MvBitrate = UpstreamObject({
  br: Loose(Schema.Finite),
  point: Loose(Schema.Finite),
  size: Loose(Schema.Finite),
});

const MvDetail = UpstreamObject({
  artistId: Loose(Schema.Finite),
  artistName: Loose(Schema.String),
  artists: Loose(Schema.Array(Artist)),
  briefDesc: Loose(Schema.String),
  brs: Loose(Schema.Array(MvBitrate)),
  commentCount: Loose(Schema.Finite),
  commentThreadId: Loose(Schema.String),
  cover: Loose(Schema.String),
  coverId: Loose(Schema.Finite),
  coverId_str: Loose(Schema.String),
  desc: Loose(Schema.String),
  duration: Loose(Schema.Finite),
  id: Schema.Finite,
  nType: Loose(Schema.Finite),
  name: Loose(Schema.String),
  playCount: Loose(Schema.Finite),
  publishTime: Loose(Schema.String),
  shareCount: Loose(Schema.Finite),
  subCount: Loose(Schema.Finite),
});

const MvPlayback = UpstreamObject({
  cp: Loose(Schema.Finite),
  dl: Loose(Schema.Finite),
  fee: Loose(Schema.Finite),
  id: Loose(Schema.Finite),
  mvFee: Loose(Schema.Finite),
  normal: Loose(Schema.Boolean),
  payed: Loose(Schema.Finite),
  pl: Loose(Schema.Finite),
  sid: Loose(Schema.Finite),
  st: Loose(Schema.Finite),
  unauthorized: Loose(Schema.Boolean),
});

// 通到 MV 详情的路径 `data` 和 MV 自己的编号 `data.id` 收紧；`mp` 播放信息和详情其余字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    bufferPic: Loose(Schema.String),
    bufferPicFS: Loose(Schema.String),
    code: Schema.Literal(200),
    data: MvDetail,
    loadingPic: Loose(Schema.String),
    loadingPicFS: Loose(Schema.String),
    mp: Loose(MvPlayback),
    subed: Loose(Schema.Boolean),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const mvDetail: ModuleEffect<ModuleInput, ModuleBody> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      id: query.mvid,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/v1/mv/detail`,
        data,
        createOption(query, 'weapi'),
      ),
    );
    const body = yield* decodeUpstreamBody('mv_detail', ModuleBody, response);
    return { ...toModuleResponse(response), body };
  });

/**
 * MV详情
 */
export default mvDetail;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
