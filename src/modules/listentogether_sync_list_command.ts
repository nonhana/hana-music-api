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
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

// 接口就是为了确认列表同步成功：正文顶层的返回码 `code` 收紧；`data.result` 和
// `data.message`、`message` 是附带提示，宽松。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: Loose(
      UpstreamObject({
        message: Loose(Schema.String),
        result: Loose(Schema.Boolean),
      }),
    ),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

const listentogetherSyncListCommand: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    if (
      typeof query.randomList !== 'string' ||
      typeof query.displayList !== 'string'
    ) {
      return yield* new InvalidModuleInput({
        message: 'randomList and displayList must be strings',
      });
    }
    const data = {
      roomId: query.roomId,
      playlistParam: JSON.stringify({
        commandType: query.commandType,
        version: [
          {
            userId: query.userId,
            version: query.version,
          },
        ],
        anchorSongId: '',
        anchorPosition: -1,
        randomList: query.randomList.split(','),
        displayList: query.displayList.split(','),
      }),
    };
    const response = yield* request(
      buildApiRequestIntent(
        `/api/listen/together/sync/list/command/report`,
        data,
        createOption(query),
      ),
    );
    const body = yield* decodeUpstreamBody(
      'listentogether_sync_list_command',
      ModuleBody,
      response,
    );
    return { ...toModuleResponse(response), body };
  });

/**
 * 一起听 更新播放列表
 */
export default listentogetherSyncListCommand;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
