import { Effect, Schema } from 'effect';

import {
  decodeModuleInput as decodeInput,
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

const ImportTask = UpstreamObject({
  id: Schema.Finite,
  status: Schema.String,
  parentId: Loose(Schema.Finite),
  playlistId: Loose(Schema.Finite),
  createTime: Loose(Schema.Finite),
  msg: Loose(Schema.String),
  succCount: Loose(Schema.Finite),
  playlistStatus: Loose(Schema.Finite),
  playlistPrivacy: Loose(Schema.Finite),
  type: Loose(Schema.String),
});

// 返回码、`data.tasks` 和每条任务的编号/状态收紧；其余任务字段宽松，只见过 null 的字段不声明。
export const ModuleBody = Schema.toStandardSchemaV1(
  UpstreamObject({
    code: Schema.Literal(200),
    data: UpstreamObject({
      tasks: Schema.Array(ImportTask),
      taskProcess: Loose(Schema.String),
    }),
    msg: Loose(Schema.String),
    message: Loose(Schema.String),
  }),
);
export type ModuleBody = typeof ModuleBody.Type;

export type ModuleInput = { id: NumberId };

const inputSchema = Schema.Struct({ id: NumberId });

export const decodeModuleInput = (input: unknown) =>
  decodeInput(inputSchema, input);

export const moduleActions = {
  poll: {
    target: '/api/playlist/import/task/status/v2',
    profile: 'eapi',
    semantic: 'poll',
    cache: 'none',
    retry: 'never',
  },
} as const satisfies ModuleActions;

const playlistImportTaskStatus: ModuleEffect<
  ModuleInput,
  ModuleBody,
  typeof moduleActions
> = (query, request) =>
  Effect.gen(function* () {
    const response = yield* request('poll', {
      data: {
        taskIds: JSON.stringify([String(query.id)]),
      },
    });
    return {
      ...toModuleResponse(response),
      body: yield* decodeUpstreamBody(
        'playlist_import_task_status',
        ModuleBody,
        response,
      ),
    };
  });

/**
 * 歌单导入 - 任务状态
 */
export default playlistImportTaskStatus;
