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

const playlistImportTaskStatus: ModuleEffect<ModuleInput, ModuleBody> = (
  query,
  request,
) =>
  Effect.gen(function* () {
    const response = yield* request(
      buildApiRequestIntent(
        `/api/playlist/import/task/status/v2`,
        {
          taskIds: JSON.stringify([query.id]),
        },
        createOption(query),
      ),
    );
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

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
