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

// 接口就是为了确认播放指令上报成功：正文顶层的返回码 `code` 收紧；`data.result` 和
// `message` 是附带提示，宽松（`data.message` 只见过 `null`，不声明）。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(
      UpstreamObject({
        result: Loose(Schema.Boolean),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherPlayCommand: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const data = {
      roomId: query.roomId,
      commandInfo: JSON.stringify({
        commandType: query.commandType,
        progress: query.progress || 0,
        playStatus: query.playStatus,
        formerSongId: query.formerSongId,
        targetSongId: query.targetSongId,
        clientSeq: query.clientSeq,
      }),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/listen/together/play/command/report`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'listentogether_play_command',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 一起听 发送播放状态
 */
export default listentogetherPlayCommand;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
