import { Effect } from 'effect';

import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const personalFmMode: ModuleEffect<ModuleInput> = (query, request) =>
  Effect.gen(function* () {
    const data = {
      mode: query.mode,
      subMode: query.submode,
      limit: query.limit || 3,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/v1/radio/get`, data, createOption(query)),
      ),
    );
  });

/**
 * 私人FM - 模式选择
 * aidj, DEFAULT, FAMILIAR, EXPLORE, SCENE_RCMD ( EXERCISE, FOCUS, NIGHT_EMO  )
 * 来不及解释这几个了
 */
export default personalFmMode;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
