import { Effect } from 'effect';

import { InvalidModuleInput } from '../core/errors.ts';
import { createOption } from '../core/options.ts';
import { buildApiRequestIntent } from '../core/request-intent.ts';
import { toModuleResponse } from '../core/response.ts';
import type { ModuleEffect } from '../types/index.ts';
import type { LegacyModuleInput } from '../types/legacy.ts';
import { resolveResourceType } from './comment/resource-type.ts';

const commentHugList: ModuleEffect<ModuleInput> = (input, request) =>
  Effect.gen(function* () {
    const query = { ...input };
    if (
      query.sid !== undefined &&
      query.sid !== null &&
      typeof query.sid !== 'string' &&
      typeof query.sid !== 'number' &&
      typeof query.sid !== 'boolean'
    ) {
      return yield* new InvalidModuleInput({
        message: 'sid must be a primitive value',
      });
    }
    const resourceType = resolveResourceType(query.type);
    const threadId = `${resourceType}${String(query.sid ?? '')}`;
    const data = {
      targetUserId: query.uid,
      commentId: query.cid,
      cursor: query.cursor || '-1',
      threadId,
      pageNo: query.page || 1,
      idCursor: query.idCursor || -1,
      pageSize: query.pageSize || 100,
    };
    return toModuleResponse(
      yield* request(
        buildApiRequestIntent(
          `/api/v2/resource/comments/hug/list`,
          data,
          createOption(query),
        ),
      ),
    );
  });

export default commentHugList;

export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts';

export type ModuleInput = LegacyModuleInput;
