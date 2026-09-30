import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const voicelistTrans: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      limit: query.limit || '200', // 每页数量
      offset: query.offset || '0', // 偏移量
      radioId: query.radioId || null, // 电台id
      programId: query.programId || '0', // 节目id
      position: query.position || '1', // 排序编号
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/voice/workbench/radio/program/trans`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default voicelistTrans;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
