import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import { resolveResourceType } from './comment/resource-type.ts';

const resourceLike: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.id !== undefined &&
      query.id !== null &&
      typeof query.id !== 'string' &&
      typeof query.id !== 'number' &&
      typeof query.id !== 'boolean'
    ) {
      return yield* Effect.fail(
        new InvalidModuleInput({ message: 'id must be a primitive value' }),
      );
    }
    const action = Number(query.t) === 1 ? 'like' : 'unlike';
    const resourceType = resolveResourceType(query.type);
    const data: Record<string, unknown> = {
      threadId: `${resourceType}${String(query.id ?? '')}`,
    };
    if (resourceType === 'A_EV_2_') {
      data.threadId = query.threadId;
    }
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/resource/${action}`,
          data,
          createOption(query, 'weapi'),
        ),
      ),
    );
  });

/**
 * 点赞与取消点赞资源
 */
export default resourceLike;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
