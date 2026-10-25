import { Effect, Schema } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const Channel = UpstreamObject({
  id: Schema.Finite,
  coverUrl: Loose(Schema.String),
  name: Loose(Schema.String),
  regionName: Loose(Schema.String),
  roomId: Loose(Schema.Finite),
  score: Loose(Schema.Finite),
  source: Loose(Schema.String),
  subed: Loose(Schema.Boolean),
});

// 通到电台列表的路径 `data.list` 和每个电台自己的编号 `data.list[].id` 收紧；分页计数和电台展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      list: Schema.Array(Channel),
      hasMore: Loose(Schema.Boolean),
      total: Loose(Schema.Finite),
    }),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const broadcastChannelList: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      categoryId: query.categoryId || '0',
      regionId: query.regionId || '0',
      limit: query.limit || '20',
      lastId: query.lastId || '0',
      score: query.score || '-1',
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/voice/broadcast/channel/list`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'broadcast_channel_list',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 广播电台 - 全部电台
 */
export default broadcastChannelList;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
