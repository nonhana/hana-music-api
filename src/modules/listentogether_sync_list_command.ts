import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
  NaturalValue,
  NumberId,
} from '../core/module-input.ts';
import type { ModuleActions } from '../core/request-actions.ts';
import { toModuleResponse } from '../core/response.ts';
import {
  decodeUpstreamBody,
  Loose,
  UpstreamObject,
} from '../core/upstream-body.ts';
import type { ModuleEffect } from '../types/index.ts';

export type ModuleInput = {
  commandType: string;
  displayList: ReadonlyArray<NumberId>;
  randomList: ReadonlyArray<NumberId>;
  roomId: string;
  userId: NumberId;
  version: number;
};

const inputSchema = Schema.Struct({
  commandType: Schema.String,
  displayList: Schema.Array(NumberId),
  randomList: Schema.Array(NumberId),
  roomId: Schema.String,
  userId: NumberId,
  version: NaturalValue,
});

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  request: {
    profile: 'web',
    target: '/api/listen/together/sync/list/command/report',
    semantic: 'write',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

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

const listentogetherSyncListCommand: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
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
        randomList: query.randomList.map(String),
        displayList: query.displayList.map(String),
      }),
    };
    const response = yield* request('request', { data });
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
