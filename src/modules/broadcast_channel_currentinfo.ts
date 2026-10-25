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

const CurrentInfo = UpstreamObject({
  id: Schema.Finite,
  channelCoverUrl: Loose(Schema.String),
  channelName: Loose(Schema.String),
  currentTime: Loose(Schema.Finite),
  duration: Loose(Schema.Finite),
  endTime: Loose(Schema.Finite),
  playUrl: Schema.String,
  programId: Loose(Schema.Finite),
  programName: Loose(Schema.String),
  regionName: Loose(Schema.String),
  startTime: Loose(Schema.Finite),
  thirdChannelId: Loose(Schema.String),
  thirdProgramId: Loose(Schema.String),
});

// 通到频道当前信息的路径 `data`、频道自己的编号 `data.id` 和播放地址 `data.playUrl` 收紧；节目与展示字段宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: CurrentInfo,
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const broadcastChannelCurrentinfo: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      channelId: query.id,
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/voice/broadcast/channel/currentinfo`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'broadcast_channel_currentinfo',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 广播电台 - 电台信息
 */
export default broadcastChannelCurrentinfo;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
