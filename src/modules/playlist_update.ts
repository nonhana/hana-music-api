import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';

const playlistUpdate: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.id !== undefined &&
      query.id !== null &&
      typeof query.id !== 'string' &&
      typeof query.id !== 'number' &&
      typeof query.id !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'id must be a primitive value',
      });
    }
    if (
      query.name !== undefined &&
      query.name !== null &&
      typeof query.name !== 'string' &&
      typeof query.name !== 'number' &&
      typeof query.name !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'name must be a primitive value',
      });
    }
    if (
      query.desc !== undefined &&
      query.desc !== null &&
      typeof query.desc !== 'string' &&
      typeof query.desc !== 'number' &&
      typeof query.desc !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'desc must be a primitive value',
      });
    }
    if (
      query.tags !== undefined &&
      query.tags !== null &&
      typeof query.tags !== 'string' &&
      typeof query.tags !== 'number' &&
      typeof query.tags !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'tags must be a primitive value',
      });
    }
    query.desc = query.desc || '';
    query.tags = query.tags || '';
    const data = {
      '/api/playlist/desc/update': `{"id":${String(query.id)},"desc":"${String(query.desc)}"}`,
      '/api/playlist/tags/update': `{"id":${String(query.id)},"tags":"${String(query.tags)}"}`,
      '/api/playlist/update/name': `{"id":${String(query.id)},"name":"${String(query.name)}"}`,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(`/api/batch`, data, createOption(query)),
      ),
    );
  });

/**
 * 编辑歌单
 */
export default playlistUpdate;

export { decodeLegacyModuleInput as decodeModuleInput } from '../core/module-input.ts';

export type ModuleInput = LegacyModuleInput;
